import React, { useState } from "react";
import {
  Button,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tooltip,
  Upload,
  UploadProps,
} from "antd";
import {
  getEncoding,
  parseSrt,
  Node,
  nodesToSrtText,
  checkIsSrtFile,
  nodesToTransNodes,
  convertToSrt,
} from "@/lib/srt";
import { commonLangZh, suportedLangZh } from "@/lib/lang";
import { DEFAULT_BASE_URL_HOST, getCustomConfigCache } from "@/utils/constants";
import { isDev } from "@/utils/env";
import { getPayload, parse_gpt_resp } from "@/lib/openai/prompt";
import { OpenAIResult } from "@/lib/openai/OpenAIResult";
import SubtitlesNew from "@/components/new/SubtitlesNew";

const MAX_FILE_SIZE = 512 * 1024; // 512KB
const PAGE_SIZE = 10;
const MAX_RETRY = 5;

/**
 * 转换文件时的状态
 */
type TranslateFileStatus = {
  isTranslating: boolean;
  transCount: number;
};

const downItems = [
  {
    key: "downTrans",
    label: "下载译文",
  },
  {
    key: "downTransAndoriginal",
    label: "下载双语字幕",
  },
];

//sleep
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 下载文件
 * @param filename 文件名
 * @param text 文本内容
 */
function download(filename: string, text: string) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/**
 * 按照节点列表翻译
 * @param nodes 待翻译节点列表
 * @param targetLang 目标语言
 * @returns
 */
async function translate_one_batch(nodes: Node[], targetLang: string) {
  const sentences = nodes.map((node) => node.content);
  // if last sentence ends with ",", remove it
  const lastSentence = sentences[sentences.length - 1];
  if (lastSentence.endsWith(",") || lastSentence.endsWith("，")) {
    sentences[sentences.length - 1] = lastSentence.substring(
      0,
      lastSentence.length - 1
    );
  }

  const currentConfig = getCustomConfigCache();
  //获取请求体
  const payload = getPayload(
    sentences,
    targetLang,
    undefined,
    currentConfig.promptTemplate,
    currentConfig.customModel
  );

  const { res_keys } = payload;

  try {
    isDev && currentConfig.apiKey && console.log("=====use user api key=====");
    isDev &&
      currentConfig.customHost &&
      console.log("=====use user custom host=====");
    isDev && console.log("payload", payload);
    const result = await OpenAIResult(
      payload,
      currentConfig.apiKey,
      currentConfig.customHost ?? DEFAULT_BASE_URL_HOST
    );
    const resp = parse_gpt_resp(result, res_keys!);
    return nodesToTransNodes(nodes, resp);
  } catch (error: any) {
    console.log("API error", error, error.message);
    throw new Error("翻译异常" + error.message);
  }
}

/**
 * 翻译文件
 * @param nodes 待翻译节点列表
 * @param lang 目标语言
 * @param notifyResult 翻译完 结果通知回调
 * @returns
 */
async function traslate_file(nodes: Node[], lang: string, notifyResult?: any) {
  const batches: Node[][] = [];
  for (let i = 0; i < nodes.length; i += PAGE_SIZE) {
    batches.push(nodes.slice(i, i + PAGE_SIZE));
  }
  // for now, just use sequential execution
  const results: Node[] = [];
  let batch_num = 0;
  for (const batch of batches) {
    let success = false;
    for (let i = 0; i < MAX_RETRY && !success; i++) {
      try {
        const r = await translate_one_batch(batch, lang);
        results.push(...r);
        success = true;
        if (notifyResult) {
          notifyResult(batch_num, r);
        }
        console.log(`Translated ${results.length} of ${nodes.length}`);
      } catch (e) {
        console.error(e);
        await sleep(3000); // may exceed rate limit, sleep for a while
      }
    }
    batch_num++;
    if (!success) {
      console.error(`translate_all failed for ${batch}`);
      throw new Error(`translate file ${batch} failed`);
    }
  }
  return results;
}

/**
 * 根据页数获取当前页待翻译列表
 * @param nodes 所有节点
 * @param curPage 当前页
 * @returns
 */
function curPageNodes(nodes: Node[], curPage: number) {
  let res = nodes.slice(curPage * PAGE_SIZE, (curPage + 1) * PAGE_SIZE);
  if (res.findIndex((n) => n) === -1) {
    res = [];
  }
  return res;
}

const SrtNew: React.FC = () => {
  const [modal] = Modal.useModal();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [transNodes, setTransNodes] = useState<Node[]>([]); // make transNode the same structure as nodes
  const [curPage, setCurPage] = useState(0);
  const [lang, setLang] = useState("中文");
  const [loading, setLoading] = useState(false);
  const [transFileStatus, setTransFileStatus] = useState<TranslateFileStatus>({
    isTranslating: false,
    transCount: 0,
  });
  const [showAllLang, setShowAllLang] = useState(false);
  const langs = showAllLang ? suportedLangZh : commonLangZh;

  /**
   * 添加字幕并渲染
   * @param text 文本内容
   * @returns
   */
  const onNewSubtitleText = (text: string) => {
    if (!checkIsSrtFile(text)) {
      const converted = convertToSrt(text);
      if (converted) {
        text = converted;
      } else {
        message.error("转为Srt失败，请重新选择文件");
        return;
      }
    }
    const nodes = parseSrt(text);
    setNodes(nodes);
    setTransNodes([]);
    setCurPage(0);
  };

  //Upload配置
  const props: UploadProps = {
    maxCount: 1,
    name: "file",
    accept: ".srt,.ass,.txt",
    beforeUpload: async function (file) {
      const f: File = file;
      if (!f) return;
      if (f.size > MAX_FILE_SIZE) {
        message.error("最大只支持大小512kb");
        return Upload.LIST_IGNORE;
      }

      const encoding = await getEncoding(f);
      if (!encoding) {
        message.error("无法以文本打开");
        return Upload.LIST_IGNORE;
      }

      const data = await f.arrayBuffer();
      let text = new TextDecoder(encoding!).decode(data);
      // onNewSubtitleText(text, f.name);
      //     console.log("file", file);
      //     console.log("txet", text);
      onNewSubtitleText(text);
      return false;
    },
  };

  //翻页
  const toPage = (delta: number) => {
    const newPage = curPage + delta;
    if (newPage < 0 || newPage >= nodes.length / PAGE_SIZE) return;
    setCurPage(newPage);
  };

  //语言选择
  const onLangChange = (value: string) => {
    setLang(value);
  };

  /**
   * 翻译当前页面
   */
  const onTranslatePage = async () => {
    if (nodes.length == 0) {
      message.warning("无翻译内容，请选择文件");
      return;
    }

    setLoading(true);
    setTransFileStatus({ isTranslating: true, transCount: 0 });
    try {
      const newnodes = await translate_one_batch(
        curPageNodes(nodes, curPage),
        lang
      );
      setTransNodes((nodes) => {
        const nodesCopy = [...nodes];
        for (let i = 0; i < PAGE_SIZE; i++) {
          nodesCopy[curPage * PAGE_SIZE + i] = newnodes[i];
        }
        return nodesCopy;
      });
    } catch (e: any) {
      console.error("translate failed", e);
      message.error("翻译失败" + String(e.message));
    } finally {
      setLoading(false);
      setTransFileStatus({ isTranslating: false, transCount: 0 });
    }
  };

  //文件翻译时 翻译完回调
  const on_trans_result = (batch_num: number, tnodes: Node[]) => {
    setTransFileStatus((old) => {
      return { ...old, transCount: batch_num + 1 };
    });
    setTransNodes((nodes) => {
      const nodesCopy = [...nodes];
      for (let i = 0; i < PAGE_SIZE; i++) {
        nodesCopy[batch_num * PAGE_SIZE + i] = tnodes[i];
      }
      return nodesCopy;
    });
  };

  /**
   * 翻译整个文件
   */
  const onTranslateFile = async () => {
    if (nodes.length == 0) {
      message.warning("无翻译内容，请选择文件");
      return;
    }

    setLoading(true);
    setTransFileStatus({ isTranslating: true, transCount: 0 });
    try {
      const newnodes = await traslate_file(nodes, lang, on_trans_result);
      //download("output.srt", nodesToSrtText(newnodes));
      message.success("翻译字幕文件成功,使用下载功能吧");
    } catch (e) {
      message.error("翻译字幕文件失败" + String(e));
    } finally {
      setLoading(false);
      setTransFileStatus((old) => {
        return { ...old, isTranslating: false };
      });
    }
  };

  //所有页数
  const get_page_count = () => Math.ceil(nodes.length / PAGE_SIZE);

  const downCall = {
    downTrans: function () {
      const nodes = transNodes.filter((n) => n);
      if (nodes.length == 0) {
        message.error("暂无可下载内容");
        return;
      }

      download("译文.srt", nodesToSrtText(nodes));
    },
    downTransAndoriginal: function () {
      const filterTransNodes = JSON.parse(JSON.stringify(transNodes)).filter(
        (n: any) => n
      );
      if (filterTransNodes.length == 0) {
        message.error("暂无可下载内容");
        return;
      }

      const tempTransNodes = filterTransNodes;

      tempTransNodes.forEach((it: any) => {
        const currentOriginal = nodes.filter((item) => item?.pos == it?.pos);
        if (currentOriginal.length == 1) {
          //译 上 源下
          it.content = `${it.content}\n${currentOriginal[0].content}`;
        }
      });

      download("译文_双语.srt", nodesToSrtText(tempTransNodes));
    },
  };
  //下载点击
  const onDownClick: MenuProps["onClick"] = (e) => {
    if (e.key == "downTransAndoriginal") {
      downCall.downTransAndoriginal();
      return;
    }

    downCall.downTrans();
  };
  return (
    <Space direction="vertical" size="middle" style={{ height: "550px" }}>
      <div style={{ display: "flex" }}>
        <Upload {...props}>
          <Button>选择字幕文件</Button>
        </Upload>
      </div>
      <div>
        <Button onClick={() => toPage(-1)}>上一页</Button>
        <p
          style={{
            display: "inline-block",
            textAlign: "center",
            width: "65px",
          }}
        >
          {curPage + 1} / {Math.ceil(nodes.length / PAGE_SIZE)}
        </p>
        <Button onClick={() => toPage(1)}>下一页</Button>

        <label style={{ marginRight: "10px", marginLeft: "110px" }}>
          目标语言
        </label>
        <Select
          showSearch
          disabled={loading}
          value={lang}
          style={{ width: 200 }}
          placeholder="搜索目标语言"
          onChange={onLangChange}
          options={langs.map((it) => {
            return {
              value: it,
              label: it,
            };
          })}
        />

        <Switch
          disabled={loading}
          checkedChildren="所有语言"
          unCheckedChildren="默认语言"
          onChange={(checked) => setShowAllLang(checked)}
        />

        <Tooltip title="页数较多时，建议先翻译当前页，作为参考和预览">
          <Button
            onClick={onTranslatePage}
            loading={loading}
            style={{ marginLeft: "50px" }}
          >
            {loading ? "翻译中,请稍等" : "翻页本页"}
          </Button>
        </Tooltip>

        <Tooltip title="翻译整个文件需要耗时较长，请确认配置项都正确">
          <Popconfirm
            title="确认翻译"
            description="翻译整个文件将花费很长时间，是否确认？"
            onConfirm={onTranslateFile}
            okText="是"
            cancelText="否"
          >
            <Button type="primary" loading={transFileStatus.isTranslating}>
              {transFileStatus.isTranslating
                ? `进度：${transFileStatus.transCount}/${get_page_count()}`
                : "翻译整个文件"}
            </Button>
          </Popconfirm>
        </Tooltip>

        <div style={{ display: "inline-block", marginLeft: "20px" }}>
          <Dropdown.Button
            menu={{ items: downItems, onClick: onDownClick }}
            disabled={loading}
          >
            译文下载
          </Dropdown.Button>
        </div>
      </div>

      <div>
        <SubtitlesNew
          nodes={curPageNodes(nodes, curPage)}
          transNodes={curPageNodes(transNodes, curPage)}
        />
      </div>
    </Space>
  );
};

export default SrtNew;

import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import {
  getEncoding,
  parseSrt,
  Node,
  nodesToSrtText,
  checkIsSrtFile,
  nodesToTransNodes,
  convertToSrt,
} from "@/lib/srt";
import Subtitles from "@/components/Subtitles";
import { toast, Toaster } from "react-hot-toast";
import styles from "@/styles/Srt.module.css";
import { suportedLangZh, commonLangZh, langBiMap } from "@/lib/lang";
import { CacheKey, ENABLE_SHOP } from "@/utils/constants";
import { getPayload, parse_gpt_resp } from "@/lib/openai/prompt";
import { isDev } from "@/utils/env";
import { OpenAIResult } from "@/lib/openai/OpenAIResult";

const MAX_FILE_SIZE = 512 * 1024; // 512KB
const PAGE_SIZE = 10;
const MAX_RETRY = 5;

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

function curPageNodes(nodes: Node[], curPage: number) {
  let res = nodes.slice(curPage * PAGE_SIZE, (curPage + 1) * PAGE_SIZE);
  if (res.findIndex((n) => n) === -1) {
    res = [];
  }
  return res;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 翻译所有
 * @param nodes 待翻译节点列表
 * @param lang 目标语言
 * @param apiKey apiKey
 * @param notifyResult 翻译完 结果通知回调
 * @param useGoogle 是否启用谷歌翻译
 * @param promptTemplate 提示语模板
 * @param customHost 自定义Host
 * @param gptModel Gpt模型
 * @returns
 */
async function traslate_all(
  nodes: Node[],
  lang: string,
  apiKey?: string,
  notifyResult?: any,
  useGoogle?: boolean,
  promptTemplate?: string,
  customHost?: string,
  gptModel?: string
) {
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
        const r = await translate_one_batch(
          batch,
          lang,
          apiKey,
          useGoogle,
          promptTemplate,
          customHost,
          gptModel
        );
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
 * 按照节点列表翻译
 * @param nodes 待翻译节点列表
 * @param lang 目标语言
 * @param apiKey apiKey
 * @param useGoogle 是否启用谷歌翻译
 * @param promptTemplate 提示语模板
 * @param customHost 自定义Host
 * @param gptModel gpt模型
 * @returns
 */
async function translate_one_batch(
  nodes: Node[],
  lang: string,
  apiKey?: string,
  useGoogle?: boolean,
  promptTemplate?: string,
  customHost?: string,
  gptModel?: string
) {
  const sentences = nodes.map((node) => node.content);
  // if last sentence ends with ",", remove it
  const lastSentence = sentences[sentences.length - 1];
  if (lastSentence.endsWith(",") || lastSentence.endsWith("，")) {
    sentences[sentences.length - 1] = lastSentence.substring(
      0,
      lastSentence.length - 1
    );
  }

  // let options = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     targetLang: lang,
  //     sentences: sentences,
  //     apiKey: apiKey,
  //     promptTemplate: promptTemplate,
  //     baseHost: customHost,
  //     gptModel: gptModel,
  //   }),
  // };

  // console.time("request /api/translate");
  // const url = useGoogle ? "/api/googleTran" : "/api/translate";
  // const res = await fetch(url, options);

  //获取请求体
  const payload = getPayload(
    sentences,
    lang,
    undefined,
    promptTemplate,
    gptModel
  );

  const { res_keys } = payload;

  try {
    isDev && apiKey && console.log("=====use user api key=====");
    isDev && customHost && console.log("=====use user custom host=====");
    isDev && console.log("payload", payload);
    const result = await OpenAIResult(payload, apiKey, customHost);
    const resp = parse_gpt_resp(result, res_keys!);

    // let rkey = `${targetLang}_${srcLang}_${sentences}}`;
    // rkey = "tranres_" + await digestMessage(rkey);
    // const data = await redis.set(rkey, JSON.stringify(resp));
    // console.log("cached data", data);

    //return NextResponse.json(resp);
    //todo:
    console.log("resp", resp);
    // console.timeEnd("request /api/translate");

    // if (res.redirected) {
    //   throw new Error(" rate limited. Please enter you OpenAI key");
    // }

    //const jres = await resp.json();
    // if (jres.errorMessage) {
    //   throw new Error(jres.errorMessage);
    // }
    return nodesToTransNodes(nodes, resp);
  } catch (error: any) {
    console.log("API error", error, error.message);
    // return NextResponse.json({
    //   errorMessage: error.message,
    // });
    throw new Error("翻译异常" + error.message);
  }
}

/**
 * 清空文件
 */
function clearFileInput() {
  const finput = document.getElementById("file") as HTMLInputElement;
  if (finput) {
    finput.value = "";
  }
}

/**
 * 转换文件时的状态
 */
type TranslateFileStatus = {
  isTranslating: boolean;
  transCount: number;
};

export default function Srt() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [transNodes, setTransNodes] = useState<Node[]>([]); // make transNode the same structure as nodes
  const [curPage, setCurPage] = useState(0);
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [transFileStatus, setTransFileStatus] = useState<TranslateFileStatus>({
    isTranslating: false,
    transCount: 0,
  });
  const [showAllLang, setShowAllLang] = useState(false);
  const langs = showAllLang ? suportedLangZh : commonLangZh;
  const isEnglish = false;
  const modleOptions = [
    "gpt-3.5-turbo-0613",
    "gpt-3.5-turbo-16k-0613",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0301",
    "gpt-3.5-turbo-16k",
  ];

  const getUseGoogle = () => {
    const res = localStorage.getItem("translate-engine");
    if (res) {
      return JSON.parse(res) === "google";
    }
    return false;
  };

  const getUserKey = () => {
    const res = localStorage.getItem(CacheKey.UserApikeyWithOpenAi);
    if (res) return JSON.parse(res) as string;
  };

  const getUserCustomHost = () => {
    const res = localStorage.getItem(CacheKey.UserBaseHostWithOpenAi);
    if (res) return JSON.parse(res) as string;
  };

  //提示语
  const getUserPrompt = () => {
    return (document.getElementById("txt_promptTemplate") as HTMLSelectElement)
      .value;
    // const res = localStorage.getItem("user-prompt-template");
    // if (res) return res;
  };

  //多语言
  const getLang = () => {
    return (document.getElementById("langSelect") as HTMLSelectElement).value;
  };

  //模型
  const getModel = () => {
    return (document.getElementById("modelSelect") as HTMLSelectElement).value;
  };

  /**
   * 添加字幕并渲染
   * @param text 文本内容
   * @param fname 文件名
   * @returns
   */
  const onNewSubtitleText = (text: string, fname: string) => {
    if (!checkIsSrtFile(text)) {
      const converted = convertToSrt(text);
      if (converted) {
        text = converted;
      } else {
        toast.error("Cannot convert to a valid SRT file");
        clearFileInput();
        return;
      }
    }
    const nodes = parseSrt(text);
    setNodes(nodes);
    setTransNodes([]);
    setCurPage(0);
    setFilename(fname);
  };

  //默认列表
  //   useEffect(() => {
  //     (async () => {
  //       const resp = await fetch("/1900s.srt");
  //       const text = await resp.text();
  //       onNewSubtitleText(text, "1900 (Movie) example");
  //     })();
  //   }, []);

  /**
   *  选择字幕文件
   * @returns
   */
  const onChooseFile = async (e: any) => {
    const input = e.target;
    const f: File = input.files[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      toast.error("最大只支持大小512kb");
      clearFileInput();
      return;
    }
    const encoding = await getEncoding(f);
    if (!encoding) {
      toast.error("无法以文本打开");
      clearFileInput();
      return;
    }
    const data = await f.arrayBuffer();
    let text = new TextDecoder(encoding!).decode(data);
    onNewSubtitleText(text, f.name);
  };

  const toPage = (delta: number) => {
    const newPage = curPage + delta;
    if (newPage < 0 || newPage >= nodes.length / PAGE_SIZE) return;
    setCurPage(newPage);
  };

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
  const translateFile = async () => {
    setTransFileStatus({ isTranslating: true, transCount: 0 });
    try {
      const newnodes = await traslate_all(
        nodes,
        getLang(),
        getUserKey(),
        on_trans_result,
        getUseGoogle(),
        getUserPrompt(),
        getUserCustomHost(),
        getModel()
      );
      //download("output.srt", nodesToSrtText(newnodes));
      toast.success("翻译字幕文件成功");
    } catch (e) {
      toast.error("翻译字幕文件失败" + String(e));
    }
    setTransFileStatus((old) => {
      return { ...old, isTranslating: false };
    });
  };

  /**
   * 翻译当前页面
   */
  const translate = async () => {
    setLoading(true);
    try {
      const newnodes = await translate_one_batch(
        curPageNodes(nodes, curPage),
        getLang(),
        getUserKey(),
        getUseGoogle(),
        getUserPrompt(),
        getUserCustomHost(),
        getModel()
      );
      setTransNodes((nodes) => {
        const nodesCopy = [...nodes];
        for (let i = 0; i < PAGE_SIZE; i++) {
          nodesCopy[curPage * PAGE_SIZE + i] = newnodes[i];
        }
        return nodesCopy;
      });
    } catch (e) {
      console.error("translate failed", e);
      toast.error("翻译失败" + String(e));
    }
    setLoading(false);
  };

  /**
   * 下载源文件
   */
  const download_original = () => {
    if (nodes.length == 0) {
      toast.error("暂无可下载内容");
      return;
    }

    download("original.srt", nodesToSrtText(nodes));
  };

  /**
   * 下载翻译字幕
   */
  const download_translated = () => {
    const nodes = transNodes.filter((n) => n);
    if (nodes.length == 0) {
      toast.error("暂无可下载内容");
      return;
    }

    download("translated.srt", nodesToSrtText(nodes));
  };

  /**
   * 下载双语字幕
   */
  const download_translated_retain_original = () => {
    const filterTransNodes = transNodes.filter((n) => n);
    if (filterTransNodes.length == 0) {
      toast.error("暂无可下载内容");
      return;
    }

    const tempTransNodes = filterTransNodes;

    tempTransNodes.forEach((it) => {
      const currentOriginal = nodes.filter((item) => item?.pos == it?.pos);
      if (currentOriginal.length == 1) {
        //源文件在上 翻译在下
        it.content = `${currentOriginal[0].content}\n${it.content}`;
      }
    });

    download("translated_双语.srt", nodesToSrtText(tempTransNodes));
  };

  const get_page_count = () => Math.ceil(nodes.length / PAGE_SIZE);

  return (
    <>
      <Head>
        <title>{"AI字幕助手 Powered by OpenAI "}</title>
      </Head>
      <main style={{ minHeight: "90vh" }}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 4000 }}
        />
        <div className={styles.welcomeMessage}>
          {"支持翻译本地SRT/ASS格式字幕\nPowered by OpenAI GPT-3.5"}
        </div>
        <div
          style={{
            color: "red",
            display: "block",
            fontSize: "23px",
            fontWeight: "bold",
          }}
        >
          ***
          注：尽量使用自建代理或者社区公开代理，如需直连请自行本地准备好【环境】
        </div>

        <div
          style={{
            display: "flex",
            margin: "0 auto",
            paddingTop: "30px",
            justifyContent: "center",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div>
              <label style={{ marginRight: "10px", marginLeft: "120px" }}>
                模板信息
              </label>
              <textarea
                id="txt_promptTemplate"
                placeholder="提示语模板信息"
                defaultValue={
                  "你是一个专业的翻译。请逐行翻译下面的文本到{{target_lang}}，注意保留数字和换行符，请勿自行创建内容，除了翻译，不要输出任何其他文本。"
                }
                rows={3}
                cols={80}
              ></textarea>
              <abbr style={{ color: "red" }}>* 非必要可不用改</abbr>
            </div>
            <div style={{ display: "flex" }}>
              <a
                href="#!"
                className={styles.file}
                style={{ marginLeft: "50px" }}
              >
                {"选择字幕文件"}
                <input
                  onChange={onChooseFile}
                  type="file"
                  accept=".srt,.ass,.txt"
                  id="file"
                />
              </a>

              <label style={{ marginRight: "10px", marginLeft: "120px" }}>
                选择模型
              </label>
              <select id="modelSelect">
                {modleOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                className={styles.navButton}
                onClick={() => toPage(-1)}
                type="button"
              >
                {"上一页"}
              </button>
              <p
                style={{
                  display: "inline-block",
                  textAlign: "center",
                  width: "65px",
                }}
              >
                {curPage + 1} / {Math.ceil(nodes.length / PAGE_SIZE)}
              </p>
              <button
                className={styles.navButton}
                onClick={() => toPage(1)}
                type="button"
              >
                {"下一页"}
              </button>

              <label style={{ marginRight: "10px", marginLeft: "120px" }}>
                {"目标语言"}
              </label>
              <select className={styles.selectLang} id="langSelect">
                {langs.map((lang) => (
                  <option key={lang} value={lang}>
                    {isEnglish ? langBiMap.get(lang) : lang}
                  </option>
                ))}
              </select>
              <input
                type="checkbox"
                title={"显示所有语言"}
                style={{ marginLeft: "5px" }}
                checked={showAllLang}
                onChange={(e) => setShowAllLang(e.target.checked)}
              ></input>
              {!loading ? (
                <button
                  onClick={translate}
                  type="button"
                  title={"OpenAI接口可能较慢，请耐心等待"}
                  className={styles.genButton}
                  style={{ marginLeft: "5px", height: "30px", width: "80px" }}
                >
                  {"翻译本页"}
                </button>
              ) : (
                <button
                  disabled
                  type="button"
                  className={styles.genButton}
                  style={{ marginLeft: "20px", height: "30px", width: "80px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src="/loading.svg"
                      alt="Loading..."
                      width={20}
                      height={20}
                    />
                  </div>
                </button>
              )}
            </div>
            <div style={{ color: "gray" }}>
              {filename ? filename : "未选择字幕"}
            </div>
            <Subtitles
              nodes={curPageNodes(nodes, curPage)}
              transNodes={curPageNodes(transNodes, curPage)}
            />
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
                marginRight: "50px",
              }}
            >
              {!transFileStatus.isTranslating ? (
                <button
                  onClick={translateFile}
                  className={styles.genButton}
                  style={{
                    height: "30px",
                    marginRight: "20px",
                    width: "120px",
                  }}
                >
                  {"翻译整个文件"}
                </button>
              ) : (
                <button
                  onClick={translateFile}
                  disabled
                  className={styles.genButton}
                  style={{
                    height: "30px",
                    marginRight: "20px",
                    width: "120px",
                  }}
                >
                  <Image
                    src="/loading.svg"
                    alt="Loading..."
                    width={20}
                    height={20}
                  />
                  {"进度"}
                  {transFileStatus.transCount}/{get_page_count()}
                </button>
              )}
              <button
                onClick={download_original}
                className={styles.genButton}
                style={{ height: "30px", marginRight: "20px" }}
              >
                {"下载原文字幕"}
              </button>
              <button
                onClick={download_translated}
                className={styles.genButton}
                style={{ height: "30px", marginRight: "20px" }}
              >
                {"下载译文字幕"}
              </button>

              <button
                onClick={download_translated_retain_original}
                className={styles.genButton}
                style={{ height: "30px" }}
              >
                下载双语字幕
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

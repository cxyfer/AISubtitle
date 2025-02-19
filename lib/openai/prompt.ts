import { getRandomInt } from "../../utils/fp";
import { Node } from "../srt";
import { OpenAIStreamPayload } from "./OpenAIResult";
import { DEFAULT_PROMPT } from "../../utils/constants";

// gpt返回格式为： '1\n我仍然在问自己，当我离开这个漂浮的城市时，我是否做了正确的事情。\n\n2\n我不仅指工作。'
export function parse_gpt_resp(content: string, res_keys: number[]) {
  console.log(content);
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const positions = res_keys.map((i) => lines.indexOf(String(i)));
  const res: string[] = [];
  for (let i = 0; i < positions.length; i++) {
    const p1 = positions[i];
    if (p1 === -1) {
      res.push("");
    } else {
      let next_pos = positions.slice(i + 1).find((p2) => p2 !== -1);
      res.push(lines.slice(p1 + 1, next_pos).join("\n"));
    }
  }
  console.log(res);
  return res;
}

// 1\nhello\n\n
export function nodesToQueryText(nodes: Node[]) {
  return nodes.map((n) => n.pos + "\n" + n.content + "\n").join("\n");
}

/**
 * 生成gpt system role消息
 * @param targetLang 目标语言
 * @param srcLang 源语言
 * @param promptTemplate 提示语模板内容
 * @returns
 */
function systemMessage(
  targetLang: string,
  srcLang?: string,
  promptTemplate?: string
) {
  let prompt = (promptTemplate || DEFAULT_PROMPT).replace(
    "{{target_lang}}",
    targetLang
  );
  if (srcLang) {
    prompt = prompt.replace("{{src_lang}}", srcLang);
  }
  return prompt;
}

const rand4 = () => getRandomInt(1000, 9999);

function rand4_n(n: number) {
  const res: number[] = [];
  for (let i = 0; i < n; i++) {
    let r = rand4();
    while (res.indexOf(r) != -1) r = rand4();
    res.push(rand4());
  }
  return res;
}

function sentences_to_nodes(sentences: string[], rands: number[]): Node[] {
  return sentences.map((sentence, idx) => {
    return { pos: rands[idx].toString(), content: sentence };
  });
}

/**
 * 生成gpt 请求信息
 * @param sentences 待翻译字幕列表
 * @param targetLang 目标语言
 * @param srcLang 原语言
 * @param promptTemplate 提示语模板内容
 * @param gptModel gpt模型
 * @returns
 */
export function getPayload(
  sentences: string[],
  targetLang: string,
  srcLang?: string,
  promptTemplate?: string,
  gptModel?: string
) {
  const rands = rand4_n(sentences.length);
  const nodes = sentences_to_nodes(sentences, rands);

  //暂时根据模型来 默认4k gpt4或者16k为 8k
  let defaultMaxTokens = 4000;
  if (
    gptModel &&
    (gptModel.indexOf("16k") != -1 || gptModel.indexOf("gpt4") != -1)
  ) {
    defaultMaxTokens = 8000;
  }

  const payload: OpenAIStreamPayload = {
    model: gptModel ?? "gpt-3.5-turbo",
    messages: [
      {
        role: "system" as const,
        content: systemMessage(targetLang, srcLang, promptTemplate),
      },
      { role: "user" as const, content: nodesToQueryText(nodes) },
    ],
    temperature: 0, // translate task temperature 0?
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: defaultMaxTokens,
    stream: false,
    n: 1,
    res_keys: rands,
  };
  return payload;
}

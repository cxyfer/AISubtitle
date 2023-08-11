// TODO: maybe chat with video?
export type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}
export interface OpenAIStreamPayload {
  api_key?: string;
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
  res_keys?: number[];
}
import { checkOpenaiApiKeys } from "./openai";
import { sample } from "../../utils/fp";
import { DEFAULT_BASE_URL_HOST } from "@/utils/constants";

function formatResult(result: any) {
  const answer = result.choices[0].message?.content || "";
  if (answer.startsWith("\n\n")) {
    return answer.substring(2);
  }
  return answer;
}

function selectApiKey(apiKey: string | undefined) {
  if (apiKey && checkOpenaiApiKeys(apiKey)) {
    const userApiKeys = apiKey.split(",");
    return sample(userApiKeys);
  }

  // don't need to validate anymore, already verified in middleware?
  const myApiKeyList = process.env.OPENAI_API_KEY;
  const luckyApiKey = sample(myApiKeyList?.split(","));
  return luckyApiKey || "";
}

/**
 * 请求OpenAI
 * @param payload 请求内容
 * @param apiKey ApiKey
 * @param customBaseHost 自定义Host
 * @returns
 */
export async function OpenAIResult(
  payload: OpenAIStreamPayload,
  apiKey?: string,
  customBaseHost?: string
) {
  const openai_api_key = selectApiKey(apiKey);
  payload.res_keys = undefined;
  const baseHost = customBaseHost ?? DEFAULT_BASE_URL_HOST;
  const res = await fetch(baseHost + "/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openai_api_key ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorResult = await res.json();
    throw new Error(
      JSON.stringify({
        code: errorResult.error.code ?? errorResult.error.type,
        msg: errorResult.error.message,
      })
    );
  }

  if (!payload.stream) {
    const result = await res.json();
    return formatResult(result);
  }
}

export const RATE_LIMIT_COUNT = 5;
export const CHECKOUT_URL =
  "https://coolapps.lemonsqueezy.com/checkout/buy/f53d875a-4424-4ea3-8398-f3559dfaef98";
export const ENABLE_SHOP = process.env.NEXT_PUBLIC_ENABLE_SHOP === "true";
export const DEFAULT_PROMPT =
  "你是一个专业的翻译。请逐行翻译下面的文本到{{target_lang}}，注意保留数字和换行符，请勿自行创建内容，除了翻译，不要输出任何其他文本。";
export const DEFAULT_BASE_URL_HOST = "https://api.openai.com";

//cache key
export const CacheKey = {
  UserApikeyWithOpenAi: "user-openai-apikey-trans",
  UserBaseHostWithOpenAi: "user-openai-host",
  UserCustomSetting: "user-custom-setting",
};

/**
 * 缓存Item
 */
export interface CustomConfigItem {
  customHost?: string;
  customModel: string;
  apiKey?: string;
  promptTemplate: string;
}

/**
 * 获取自定义配置缓存
 * @returns
 */
export const getCustomConfigCache = (): CustomConfigItem => {
  const res = localStorage.getItem(CacheKey.UserCustomSetting);
  if (res) return JSON.parse(res) as CustomConfigItem;
  return {
    customModel: "gpt-3.5-turbo-16k",
    promptTemplate:
      "你是一个专业的翻译。请逐行翻译下面的文本到{{target_lang}}，注意保留数字和换行符，请勿自行创建内容，除了翻译，不要输出任何其他文本。",
  } as CustomConfigItem;
};

export const openAiErrorCode = {
  context_length_exceeded: "当前内容太多,请调整分页大小",
  account_deactivated: "ApiKey已封禁",
  invalid_request_error: "ApiKey已失效或已被删除",
};

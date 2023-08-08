import Image from "next/image";
import Github from "./Github";
import { useLocalStorage } from "react-use";
import { checkOpenaiApiKey } from "@/lib/openai/openai";
import { toast } from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CacheKey } from "@/utils/constants";

export default function Header() {
  const [userKey, setUserKey] = useLocalStorage<string>(
    CacheKey.UserApikeyWithOpenAi
  );
  const [userHost, setUserHost] = useLocalStorage<string>(
    CacheKey.UserBaseHostWithOpenAi
  );

  // note: Hydration error when use SSR, do not use localStorage for display now
  const [translateEngine, setTranslateEngine] = useState("");
  const [translateEngineStore, setTranslateEngineStore] =
    useLocalStorage<string>("translate-engine");

  const { t } = useTranslation("common");
  const { i18n } = useTranslation();
  const router = useRouter();
  const tooltip =
    "当前使用： " +
    (translateEngine === "google" ? "google翻译" : "ChatGPT") +
    ", 点击切换";

  useEffect(() => {
    setTranslateEngine(translateEngineStore || "");
  }, [translateEngineStore]);

  /**
   * 切换语言
   */
  const changeLang = () => {
    const newLang = i18n.language === "en" ? "zh-CN" : "en";

    router.push(
      {
        pathname: router.pathname,
        query: router.query,
      },
      router.asPath,
      { locale: newLang }
    );
  };

  /**
   * 切换翻译引擎
   */
  const changeEngine = () => {
    const newEngine = translateEngine === "google" ? "openai" : "google";
    //setTranslateEngine(newEngine);
    setTranslateEngineStore(newEngine);
  };

  /**
   * 设置OpenAIKey
   */
  const setOpenAIKey = () => {
    const key = prompt("你的Key");
    if (key && checkOpenaiApiKey(key)) {
      setUserKey(key);
      toast.success(t("ApiKey 设置成功"));
    } else {
      toast.error(t("ApiKey 设置失败"));
    }
  };

  /**
   * 设置OpenAi代理
   */
  const setOpenAIBaseHost = () => {
    const baseHost = prompt("你的代理");
    if (baseHost) {
      setUserHost(baseHost);
      toast.success(t("代理地址 设置成功"));
    } else {
      toast.error(t("代理地址 设置失败"));
    }
  };

  return (
    <div
      style={{
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "850px",
      }}
    >
      <div style={{ marginLeft: "10px", marginTop: "10px" }}>
        <a
          href="https://github.com/jkhcc11/AISubtitle"
          rel="noreferrer noopener"
          target="_blank"
          className=""
        >
          <Github width="33" height="33"></Github>
        </a>
        <Image
          title={tooltip}
          onClick={changeEngine}
          style={{ marginLeft: "20px" }}
          alt="settings"
          width={33}
          height={33}
          src={translateEngine === "google" ? "/googletran.png" : "/openai.png"}
        />
      </div>
      <div style={{ marginRight: "10px", marginTop: "10px" }}>
        {/* <Image
          title={"Change site display language"}
          onClick={changeLang}
          style={{ marginRight: "20px" }}
          alt="settings"
          width={33}
          height={33}
          src="/trans.png"
        /> */}
        <Image
          title={"设置你的OpenAi Key"}
          onClick={setOpenAIKey}
          alt="settings"
          style={{ marginRight: "20px" }}
          width={33}
          height={33}
          src="/set1.png"
        />

        <Image
          title={"设置你的OpenAi代理"}
          onClick={setOpenAIBaseHost}
          alt="settings"
          width={33}
          height={33}
          src="/set1.png"
        />
      </div>
    </div>
  );
}

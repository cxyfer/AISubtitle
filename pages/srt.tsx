import React from "react";
import {
  TranslationOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Tabs } from "antd";
import Setting from "@/components/srt/Setting";
import About from "@/components/srt/About";
import SrtNew from "@/components/srt/SrtNew";
// import SubtitleLineNew from "@/components/new/SubtitleLineNew";

const tabItems = [
  {
    label: (
      <span>
        <TranslationOutlined rev={undefined} />
        翻译
      </span>
    ),
    key: "main",
    children: <SrtNew />,
  },
  {
    label: (
      <span>
        <SettingOutlined rev={undefined} />
        设置
      </span>
    ),
    key: "setting",
    children: <Setting />,
  },
  {
    label: (
      <span>
        <InfoCircleOutlined rev={undefined} />
        关于说明
      </span>
    ),
    key: "about",
    children: <About />,
  },
  // {
  //   label: <span>Test</span>,
  //   key: "test",
  //   children: <SubtitleLineNew />,
  // },
];

const Srt: React.FC = () => (
  <div style={{ fontSize: "20px" }}>
    <span
      style={{
        fontSize: "larger",
        textAlign: "center",
        display: "block",
      }}
    >
      支持翻译本地SRT/ASS格式字幕 Powered by OpenAI GPT-3.5
    </span>

    <Tabs defaultActiveKey="main" size={"large"} items={tabItems} />
  </div>
);

export default Srt;

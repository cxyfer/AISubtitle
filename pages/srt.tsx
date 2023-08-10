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

    <Tabs
      defaultActiveKey="1"
      size={"large"}
      items={[TranslationOutlined, SettingOutlined, InfoCircleOutlined].map(
        (Icon, i) => {
          const id = String(i + 1);
          return {
            label: (
              <span>
                <Icon rev={undefined} />
                {i == 0 ? "翻译" : i == 2 ? "关于说明" : "设置"}
              </span>
            ),
            key: id,
            children: i == 1 ? <Setting /> : i == 2 ? <About /> : <SrtNew />,
          };
        }
      )}
    />
  </div>
);

export default Srt;

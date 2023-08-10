import React from "react";
import { Space } from "antd";
const About: React.FC = () => {
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ display: "flex", height: "750px" }}
    >
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
    </Space>
  );
};

export default About;

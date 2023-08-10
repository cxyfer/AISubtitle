import { Col, Row } from "antd";

export default function Footer() {
  return (
    <footer>
      <Row>
        <Col span={8}>企鹅交流群：812561075</Col>
        <Col span={8} offset={8}>
          Thanks to{" "}
          <a
            href="https://github.com/cgsvv/AISubtitle"
            target="_blank"
            rel="noreferrer"
          >
            <b>AISubtitle </b>
          </a>
          、{" "}
          <a href="https://openai.com/" target="_blank" rel="noreferrer">
            <b>OpenAI </b>
          </a>
          、{" "}
          <a href="https://vercel.com/" target="_blank" rel="noreferrer">
            <b>Vercel Edge Functions.</b>
          </a>
        </Col>
      </Row>
    </footer>
  );
}

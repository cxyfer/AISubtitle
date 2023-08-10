import Github from "../Github";
import { Col, Row } from "antd";

export default function Header() {
  return (
    <>
      <Row>
        <Col span={8}>
          <a
            href="https://github.com/jkhcc11/AISubtitle"
            rel="noreferrer noopener"
            target="_blank"
          >
            <Github width="33" height="33"></Github>
          </a>
        </Col>
      </Row>
    </>
  );
}

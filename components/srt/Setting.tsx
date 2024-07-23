import React from "react";
import { useLocalStorage } from "react-use";
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Space,
  Slider,
  InputNumber,
} from "antd";
import {
  CacheKey,
  CustomConfigItem,
  getCustomConfigCache,
} from "@/utils/constants";
const { TextArea } = Input;

const Setting: React.FC = () => {
  const [setting, setCustomSetting] = useLocalStorage<any>(
    CacheKey.UserCustomSetting
  );
  const [form] = Form.useForm();
  const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 14 } };
  const buttonItemLayout = { wrapperCol: { span: 14, offset: 4 } };
  const modleOptions = [
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-4o-mini",
    "claude-3-5-sonnet-20240620",
    "claude-3-haiku-20240307",
    "deepseek-chat",
    "deepseek-coder",
    "chatglm_lite",
    "chatglm_std",
    "chatglm_pro",
  ];

  // type FieldType = {
  //   customHost?: string;
  //   customModel?: string;
  //   apiKey?: string;
  //   promptTemplate?: string;
  //   customPageSize: Number;
  // };

  let defaultValue = getCustomConfigCache();

  //校验成功
  const onFinish = (values: any) => {
    setCustomSetting(values);
    message.success("操作成功,前往翻译吧");
    //console.log("Success:", values);
  };

  const onClear = () => {
    localStorage.removeItem(CacheKey.UserCustomSetting);
    message.success("重置成功,请刷新页面");
  };
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ display: "flex", height: "550px" }}
    >
      <Form
        {...formItemLayout}
        layout={"horizontal"}
        form={form}
        initialValues={defaultValue}
        onFinish={onFinish}
      >
        <Form.Item<CustomConfigItem> label="代理地址" name="customHost">
          <Input placeholder="http://xxx.xxx.com 如不填默认为https://api.openai.com" />
        </Form.Item>
        <Form.Item<CustomConfigItem> label="ApiKey" name="apiKey">
          <Input placeholder="自有Api Key" />
        </Form.Item>
        <Form.Item<CustomConfigItem> label="延迟" name="delaySecond">
          <InputNumber addonAfter="秒" placeholder="非满速Api，请设置延迟" />
        </Form.Item>

        <Form.Item<CustomConfigItem> label="模型" name="customModel">
          <Select
            options={modleOptions.map((it) => {
              return {
                value: it,
                label: it,
              };
            })}
          />
        </Form.Item>
        <Form.Item<CustomConfigItem>
          label="Prompt"
          name="promptTemplate"
          rules={[{ required: true, message: "请输入系统提示语" }]}
        >
          <TextArea rows={4} placeholder="系统提示语" />
        </Form.Item>

        <Form.Item {...buttonItemLayout}>
          <Button type="primary" htmlType="submit">
            保存
          </Button>

          <Space>
            <Button type="default" onClick={onClear}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Space>
  );
};

export default Setting;

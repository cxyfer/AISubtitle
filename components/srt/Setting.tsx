import React from "react";
import { useLocalStorage } from "react-use";
import { Button, Form, Input, message, Select, Space } from "antd";
import { CacheKey, getCustomConfigCache } from "@/utils/constants";
const { TextArea } = Input;

const Setting: React.FC = () => {
  const [setting, setCustomSetting] = useLocalStorage<any>(
    CacheKey.UserCustomSetting
  );
  const [form] = Form.useForm();
  const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 14 } };
  const buttonItemLayout = { wrapperCol: { span: 14, offset: 4 } };
  const modleOptions = [
    "gpt-3.5-turbo-16k",
    "gpt-3.5-turbo-16k-0613",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0301",
    "gpt-3.5-turbo-0613",
    "gpt-4-0314",
    "gpt-4-0613",
  ];

  type FieldType = {
    customHost?: string;
    customModel?: string;
    apiKey?: string;
    promptTemplate?: string;
  };

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
        <Form.Item<FieldType> label="代理地址" name="customHost">
          <Input placeholder="http://xxx.xxx.com 如不填默认为https://api.openai.com" />
        </Form.Item>
        <Form.Item<FieldType> label="ApiKey" name="apiKey">
          <Input placeholder="自有Api Key" />
        </Form.Item>
        <Form.Item<FieldType> label="模型" name="customModel">
          <Select
            options={modleOptions.map((it) => {
              return {
                value: it,
                label: it,
              };
            })}
          />
        </Form.Item>
        <Form.Item<FieldType>
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

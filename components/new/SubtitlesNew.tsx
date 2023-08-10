import SubTitleLineNew from "./SubtitleLineNew";
import { Node } from "@/lib/srt";
import { Form, FormInstance, Table } from "antd";
import React from "react";

/**
 * 新增行
 */
export default function SubtitlesNew({
  nodes,
  transNodes,
}: {
  nodes: Node[];
  transNodes?: Node[];
}) {
  const tempDataSource = nodes.map((it) => {
    const currentTransNodes = transNodes?.filter((item) => item.pos == it.pos);
    let transContext = "";
    if (currentTransNodes?.length == 1) {
      transContext = currentTransNodes[0].content;
    }
    return {
      key: it.pos,
      timestamp: it.timestamp?.trim().slice(0, 12),
      sourceContext: it.content,
      transContext: transContext,
    };
  });

  // const dataSource = [
  //   {
  //     key: "1",
  //     timestamp: "xxxxxxxxxxxxxx",
  //     sourceContext: "胡彦斌",
  //     transContext:
  //       "西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号",
  //   },
  // ];

  const defaultColumns: any[] = [
    {
      title: "时间戳",
      dataIndex: "timestamp",
      key: "timestamp",
    },
    {
      title: "原文",
      dataIndex: "sourceContext",
      key: "sourceContext",
      // width: 200,
      // ellipsis: true,
    },
    {
      title: "译文",
      dataIndex: "transContext",
      key: "transContext",
      // width: 200,
      // ellipsis: true,
    },
  ];

  return (
    <Table
      bordered
      dataSource={tempDataSource}
      columns={defaultColumns}
      pagination={false}
    />
  );
}

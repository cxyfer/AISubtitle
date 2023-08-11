import { Node } from "@/lib/srt";
import { EditableCell, EditableRow } from "@/utils/editTableHook";
import { Table } from "antd";
import React, { useEffect, useState } from "react";

/**
 * 新增行
 */
export default function SubtitlesNew({
  nodes,
  transNodes,
  onUpdateNode,
}: {
  nodes: Node[];
  transNodes?: Node[];
  onUpdateNode: (updatedNodeItem: Node) => void;
}) {
  const [dataSource, setDataSource] = useState<any[]>([]);

  // const tempDataSource = nodes.map((it) => {
  //   const currentTransNodes = transNodes?.filter((item) => item.pos == it.pos);
  //   let transContext = "";
  //   if (currentTransNodes?.length == 1) {
  //     transContext = currentTransNodes[0].content;
  //   }
  //   return {
  //     key: it.pos,
  //     timestamp: it.timestamp?.trim().slice(0, 12),
  //     sourceContext: it.content,
  //     transContext: transContext,
  //   };
  // });

  useEffect(() => {
    //生成dataSoucre
    const tempDataSource = nodes.map((it) => {
      const currentTransNodes = transNodes?.filter(
        (item) => item.pos === it.pos
      );
      let transContext = "";
      if (currentTransNodes?.length === 1) {
        transContext = currentTransNodes[0].content;
      }

      return {
        key: it.pos,
        timestamp: it.timestamp?.trim().slice(0, 12),
        sourceContext: it.content,
        transContext: transContext,
      };
    });
    setDataSource(tempDataSource);
  }, [nodes, transNodes]);

  const defaultColumns: any[] = [
    {
      title: "序号",
      dataIndex: "key",
      key: "key",
      width: 100,
    },
    {
      title: "时间戳",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 150,
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
      editable: true,
      // width: 200,
      // ellipsis: true,
    },
  ];

  //编辑 需要的组件
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleSave = (row: any) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);

    //回调
    if (onUpdateNode) {
      onUpdateNode({
        pos: row.key,
        content: row.transContext,
      } as Node);
    }
  };

  const editColumns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <Table
      scroll={{ y: "350px" }}
      bordered
      components={components}
      dataSource={dataSource}
      columns={editColumns}
      pagination={false}
    />
  );
}

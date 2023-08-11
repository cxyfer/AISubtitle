import React, { useContext, useEffect, useRef, useState } from "react";
import type { InputRef } from "antd";
import { Button, Form, Input, Popconfirm, Table } from "antd";
import { ColumnTypes, EditableCell, EditableRow } from "@/utils/editTableHook";

const Test: React.FC = () => {
  // //监听dataSource状态
  // const [dataSource, setDataSource] = useState<any[]>([
  //   {
  //     key: "0",
  //     name: "Edward King 0",
  //     age: "32",
  //     address: "London, Park Lane no. 0",
  //   },
  //   {
  //     key: "1",
  //     name: "Edward King 1",
  //     age: "32",
  //     address: "London, Park Lane no. 1",
  //   },
  // ]);

  // //删除
  // const handleDelete = (key: React.Key) => {
  //   const newData = dataSource.filter((item) => item.key !== key);
  //   setDataSource(newData);
  // };

  // //列
  // const defaultColumns: (ColumnTypes[number] & {
  //   editable?: boolean;
  //   dataIndex: string;
  // })[] = [
  //   {
  //     title: "name",
  //     dataIndex: "name",
  //     // width: "30%",
  //     editable: true,
  //   },
  //   {
  //     title: "age",
  //     dataIndex: "age",
  //   },
  //   {
  //     title: "address",
  //     dataIndex: "address",
  //   },
  //   {
  //     title: "operation",
  //     dataIndex: "operation",
  //     render: (_, record: { key: React.Key }) =>
  //       dataSource.length >= 1 ? (
  //         <Popconfirm
  //           title="Sure to delete?"
  //           onConfirm={() => handleDelete(record.key)}
  //         >
  //           <a>Delete</a>
  //         </Popconfirm>
  //       ) : null,
  //   },
  // ];

  // const handleAdd = () => {
  //   console.log("data", dataSource);
  // };

  // const handleSave = (row: any) => {
  //   const newData = [...dataSource];
  //   const index = newData.findIndex((item) => row.key === item.key);
  //   const item = newData[index];
  //   newData.splice(index, 1, {
  //     ...item,
  //     ...row,
  //   });
  //   setDataSource(newData);
  // };

  // const components = {
  //   body: {
  //     row: EditableRow,
  //     cell: EditableCell,
  //   },
  // };

  // const columns = defaultColumns.map((col) => {
  //   if (!col.editable) {
  //     return col;
  //   }
  //   return {
  //     ...col,
  //     onCell: (record: any) => ({
  //       record,
  //       editable: col.editable,
  //       dataIndex: col.dataIndex,
  //       title: col.title,
  //       handleSave,
  //     }),
  //   };
  // });

  return (
    <div>
      {/* <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
      <Table
        components={components}
        //rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
      /> */}
    </div>
  );
};

export default Test;

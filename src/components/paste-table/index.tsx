import React, { useState, useRef, useEffect } from 'react';
import { Table, Input, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './EditablePasteTable.css'; // 只放一些补充样式

const { Text } = Typography;

interface CellPosition {
  row: number;
  col: number;
}

const EditablePasteTable: React.FC = () => {
  const [tableData, setTableData] = useState<string[][]>([]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('Text') || '';
      if (!text) return;

      const delimiter = text.includes('\t') ? '\t' : ',';
      const rows = text.split(/\r?\n/).filter(line => line.trim() !== '');
      const data = rows.map(row => row.split(delimiter).map(cell => cell.trim()));
      setTableData(data);
      message.success('粘贴成功！');
    };

    document.addEventListener('paste', handlePaste);
    return () =>{
      document.removeEventListener('paste', handlePaste);
    }
  }, []);

 
  return (
   <>
   
    {JSON.stringify(tableData)}
   </>
  );
};

export default EditablePasteTable;

import type { ColumnsType } from 'antd/es/table';
import Papa from 'papaparse';
import { DataType } from '../interface/import';

export const tableDataTranslator = () => {};

export const parseCsv = (file: any, sliceNum?: number) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      complete: results => {
        if (sliceNum) {
          resolve(results.data?.slice(0, sliceNum)); // 历史支持取前5条数据
        } else {
          resolve(results.data);
        }
      },
      error: error => {
        reject(error);
      },
    });
  });
};

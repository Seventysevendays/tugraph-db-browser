import { Driver } from 'neo4j-driver';
import { request } from './request';

import { upsertEdge, upsertVertex } from '@/queries/schema';
import { FileSchema } from './interface';
import { parseCsv } from '@/components/studio/utils/parseCsv';

/* 创建模版数据导入 */
const mapUpload = async (params: {
  schema: FileSchema[];
  idx?: number;
  driver: Driver;
  graphName: string;
  type: string;
  delimiter: string;
}) => {
  const { schema, idx = 0, driver, graphName, type, delimiter } = params;
  if (schema?.length === 0) {
    return {
      success: true,
    };
  }
  const fileItem = schema[idx];

  let csvData: any = [];
  if (fileItem?.file) {
    csvData = await parseCsv(fileItem?.file, delimiter);
  } else {
    csvData = await fetch(`${window.location.origin}${fileItem.path}`)
      .then(res => res.blob())
      .then(res => parseCsv(res));
  }

  const head = fileItem?.header ? fileItem?.header - 1 : 0;

  const list = csvData
    ?.splice(head)
    ?.filter(item => item[0])
    ?.map(itemList => {
      let itemVal = {};
      let columns = fileItem.columns;
      if (type === 'edge') {
        const { SRC_ID, DST_ID } = fileItem;
        columns = fileItem.columns?.map(item => {
          if (item === 'SRC_ID') {
            return `${SRC_ID}_id`;
          } else if (item === 'DST_ID') {
            return `${DST_ID}_id`;
          } else {
            return item;
          }
        });
      }

      columns?.forEach((keys, index) => {
        const itemContent = itemList[index];
        itemVal[keys] = isNaN(itemContent) ? itemContent : +itemContent;
      });

      return itemVal;
    });
console.log(list)
  const cypher =
    type === 'vertex'
      ? upsertVertex(fileItem.label)
      : upsertEdge(fileItem.label);
  const param = {
    driver,
    cypher,
    graphName,
    parameters: { data: list },
  };
  if (type === 'edge') {
    const { SRC_ID, DST_ID } = fileItem;
    const SRC = { type: SRC_ID, key: `${SRC_ID}_id` };
    const DST = { type: DST_ID, key: `${DST_ID}_id` };
    param.parameters = {
      data: list,
      SRC,
      DST,
    };
  }

  const result = await request(param);

  if (result?.success && idx <= schema.length - 2) {
    return mapUpload({
      schema,
      idx: idx + 1,
      driver,
      graphName,
      type,
      delimiter,
    });
  } else {
    return result;
  }
};

/* 导入数据 */
export const importData = async (params: {
  driver: Driver;
  graphName: string;
  files: FileSchema[];
  delimiter?: string;
}) => {
  const { driver, graphName, files, delimiter = ',' } = params;
  const vertexList: FileSchema[] = [];
  const edgeList: FileSchema[] = [];

  files.forEach(item => {
    if (/edge_/g.test(item.path)) {
      edgeList.push(item);
    } else if (/vertex_/g.test(item.path)) {
      vertexList.push(item);
    }
  });

  const vertexResult = await mapUpload({
    schema: vertexList,
    driver,
    graphName,
    type: 'vertex',
    delimiter,
  });

  if (!vertexResult?.success || !edgeList.length) {
    return vertexResult;
  }

  const edgeResult = await mapUpload({
    schema: edgeList,
    driver,
    graphName,
    type: 'edge',
    delimiter,
  });
  return edgeResult;
};


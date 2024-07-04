import { Driver } from 'neo4j-driver';
import { request } from './request';
import { responseFormatter } from '@/utils/schema';
// TODO 测试本地引用
import user from '@/constants/demo_data/movie/vertex_user.csv';
import person from '@/constants/demo_data/movie/vertex_person.csv';
import genre from '@/constants/demo_data/movie/vertex_genre.csv';
import keyword from '@/constants/demo_data/movie/vertex_keyword.csv';
import movie from '@/constants/demo_data/movie/vertex_movie.csv';

import acted_in from '@/constants/demo_data/movie/edge_acted_in.csv';
import directed from '@/constants/demo_data/movie/edge_directed.csv';
import has_genre from '@/constants/demo_data/movie/edge_has_genre.csv';
import has_keyword from '@/constants/demo_data/movie/edge_has_keyword.csv';
import is_friend from '@/constants/demo_data/movie/edge_is_friend.csv';
import produce from '@/constants/demo_data/movie/edge_produce.csv';
import rate from '@/constants/demo_data/movie/edge_rate.csv';
import write from '@/constants/demo_data/movie/edge_write.csv';

import { upsertEdge, upsertVertex } from '@/queries/schema';
import { FileSchema } from './interface';
import { parseCsv } from '@/components/studio/utils/parseCsv';

const vertexCsv = {
  user: user,
  person: person,
  genre: genre,
  keyword: keyword,
  movie: movie,
};

const edgeCsv = {
  acted_in: acted_in,
  directed: directed,
  has_genre: has_genre,
  has_keyword: has_keyword,
  is_friend: is_friend,
  produce: produce,
  rate: rate,
  write: write,
};

/* 创建模版数据导入 */
const mapUpload = async (
  arr: FileSchema[],
  idx = 0,
  driver: Driver,
  graphName: string,
  type: string,
) => {
  const fileItem = arr[idx];

  const csvData = await fetch(`${window.location.origin}${fileItem.path}`)
    .then(res => res.blob())
    .then(res => parseCsv(res));

  const list = csvData
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

  if (result?.success && idx <= arr.length - 2) {
    return mapUpload(arr, idx + 1, driver, graphName, type);
  } else {
    return result;
  }
};

/* 导入数据 */
export const importData = async (
  driver: Driver,
  graphName: string,
  files: FileSchema[],
) => {
  const vertexList: FileSchema[] = [];
  const edgeList: FileSchema[] = [];

  files.forEach(item => {
    if (/edge_/g.test(item.path)) {
      edgeList.push(item);
    } else if (/vertex_/g.test(item.path)) {
      vertexList.push(item);
    }
  });

  const vertexResult = await mapUpload(
    vertexList,
    0,
    driver,
    graphName,
    'vertex',
  );

  if (!res?.success) {
    return vertexResult;
  }
  const edgeResult = await mapUpload(edgeList, 0, driver, graphName, 'edge');
  return edgeResult;
};

export const checkFile = async (driver: Driver, params: any) => {
  const cypher = '';
  const result = await request({ driver, cypher });
  return responseFormatter(result);
};

export const uploadFile = async (driver: Driver, params: any) => {
  //   const file = this.ctx.request.files[0];
  //   const buffer = fs.readFileSync(file.filepath);
  const cypher = '';
  const result = await request({ driver, cypher });
  return responseFormatter(result);
};

/**
 * file: procedure types
 * author: Allen
*/

/** procedure list */
interface IProcedureListParams {
  graphName: string;
  procedureType: 'cpp' | 'python';
  version: string;
}

/** procedure upload */
interface IProcedureUploadParams {
  graphName: string;
  procedureType: 'cpp' | 'python';
  procedureName: string;
  content: string;
  codeType: string;
  description: string;
  readonly: string;
  version: string;
}

/** procedure code */
interface IProcedureCodeParams {
  graphName: string;
  procedureType: string;
  procedureName: string;
}

/** delete procedure */
interface IProcedureDeleteParams {
  graphName: string;
  procedureType: string;
  procedureName: string;
}

/** execute procedure */
interface IProcedureExecuteParams {
  graphName: string;
  procedureType: string;
  procedureName: string;
  timeout: number;
  inProcess: boolean;
  param: string;
  version: 'v1' | 'v2';
}

/** procedure demo */
interface IProcedureDemoParams {
  type: string;
}

export {
  IProcedureListParams,
  IProcedureUploadParams,
  IProcedureCodeParams,
  IProcedureDeleteParams,
  IProcedureExecuteParams,
  IProcedureDemoParams
};

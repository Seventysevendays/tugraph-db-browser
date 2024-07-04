import { useRequest } from 'ahooks';
import { importProgress } from '../services/ImportController';
import { importSchemaMod } from '@/services/schema';
import { useModel } from 'umi';
import { InitialState } from '@/app';
import { importData } from '@/services/info';

export const useImport = (params?: {
  onImportProgressSuccess?: (data: any, success: any) => void;
}) => {
  const { initialState } = useModel('@@initialState');
  const { driver } = initialState as InitialState;

  const { onImportProgressSuccess } = params || {};
  const {
    runAsync: onImportData,
    loading: importDataLoading,
    error: importDataError,
  } = useRequest(params => importData({ driver, ...params }), { manual: true });

  const {
    runAsync: onImportProgress,
    loading: importProgressLoading,
    error: importProgressError,
    cancel: importProgressCancel,
  } = useRequest(importProgress, {
    manual: true,
    pollingInterval: 3000,
    onSuccess: onImportProgressSuccess,
  });

  const {
    runAsync: onImportGraphSchema,
    loading: ImportGraphSchemaLoading,
    error: ImportGraphSchemaError,
  } = useRequest(params => importSchemaMod(driver, params), { manual: true });

  return {
    useImport,
    importDataLoading,
    onImportData,
    importDataError,
    onImportProgress,
    importProgressLoading,
    importProgressError,
    importProgressCancel,
    onImportGraphSchema,
    ImportGraphSchemaLoading,
    ImportGraphSchemaError,
  };
};

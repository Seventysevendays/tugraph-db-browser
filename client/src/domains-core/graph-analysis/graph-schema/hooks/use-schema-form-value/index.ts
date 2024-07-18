import { useForm } from '@formily/react';
import { SchemaFormValue } from '@/domains-core/graph-analysis/graph-schema/interfaces';

export const useSchemaFormValue = () => {
  const form = useForm();
  const values: SchemaFormValue = form.getValuesIn('*');
  const {
    graphSchemaStyle,
    graphSchema,
    graphProjectInfo,
    htapOrderDetail,
    graphEngineType,
    graphLanguageList,
  } = values;
  return {
    graphSchema,
    graphSchemaStyle,
    graphProjectInfo,
    form,
    htapOrderDetail,
    graphEngineType,
    graphLanguageList,
  };
};

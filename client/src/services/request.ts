import { dbRecordsTranslator } from '@/translator';
import { Driver } from 'neo4j-driver';

export const request = async (params: {
  driver: Driver;
  cypher: string;
  graphName?: string;
  parameters?: any;
}) => {
  
  const { driver, cypher, graphName = 'default', parameters = {} } = params;
  console.log(cypher,parameters)
  if (!cypher) {
    return {};
  }

  const session = driver.session({
    database: graphName,
  });
  return session
    .run(cypher,parameters)
    .then(result => {
      return {
        success: true,
        ...dbRecordsTranslator(result),
      };
    })
    .catch(e => {
      return {
        success: false,
        errorMessage: e,
      };
    })
    .finally(() => {
      session.close();
    });
 

};

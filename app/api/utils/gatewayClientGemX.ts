import { GraphQLClient } from 'graphql-request';

const requestMiddlewareGemX: any = async (request: any) => {
  const requestBody = JSON.parse(request.body || '{}');
  const operationName = requestBody.operationName;
  const urlWithOperation = `${request.url}?operation=${operationName}&type=shopify`;
  return {
    ...request,
    url: urlWithOperation,
  };
};
export const clientGemX = new GraphQLClient('/api/graphql/query', {
  fetch,
  requestMiddleware: requestMiddlewareGemX,
});

export function appFetcherGemX<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => clientGemX.request<TData, any>(query, variables);
}

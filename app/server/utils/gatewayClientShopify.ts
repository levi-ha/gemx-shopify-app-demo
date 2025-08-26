import { getSessionByShopForLocal } from '../auth/shopify/helpers/derive-api';
import { SHOPIFY_APP_LOCAL } from '~/server/auth/shopify/config';
import { GraphQLClient } from 'graphql-request';
import { apiVersion } from '~/shopify.server';

const SHOPIFY_STORE_URL = `${SHOPIFY_APP_LOCAL.HOST}/admin/api/${apiVersion}/graphql.json`;

let ACCESS_TOKEN: string | undefined;
const requestMiddlewareShopify: any = async (request: any) => {
  if (!ACCESS_TOKEN) {
    const offlineSession = await getSessionByShopForLocal(SHOPIFY_APP_LOCAL.SHOP, false);
    ACCESS_TOKEN = offlineSession?.accessToken;
  }

  const requestBody = JSON.parse(request.body || '{}');
  const operationName = requestBody.operationName;
  const urlWithOperation = `${request.url}?operation=${operationName}&type=shopify`;

  const headers: Record<string, any> = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': ACCESS_TOKEN,
  };

  return {
    ...request,
    headers,
    url: urlWithOperation,
  };
};
export const clientShopify = new GraphQLClient(SHOPIFY_STORE_URL, {
  requestMiddleware: requestMiddlewareShopify,
});

export function appFetcherShopify<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => clientShopify.request<TData, any>(query, variables);
}

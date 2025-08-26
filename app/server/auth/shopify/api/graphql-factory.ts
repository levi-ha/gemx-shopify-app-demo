import { clientShopify } from '~/server/utils/gatewayClientShopify';
import { sentryCaptureException } from '~/exceptions/sentry';
import { HttpResponseError } from '@shopify/shopify-api';
import { json } from '@remix-run/node';

export function graphqlClientFactory() {
  return async function query(operation: any, options: any) {
    try {
      const apiResponse = await clientShopify.request(operation, options?.variables);
      return json({
        data: apiResponse,
      });
    } catch (error) {
      if (handleClientError) {
        throw await handleClientError({ error });
      }
      throw error;
    }
  };
}

async function handleClientError({ error }: { error: any }) {
  if (error instanceof HttpResponseError !== true) {
    sentryCaptureException(`Got a response error from the API`, error.message, error);
    throw error;
  }
  sentryCaptureException(`Got an HTTP response error from the API:`, error.message, {
    code: error.response.code,
    statusText: error.response.statusText,
    body: JSON.stringify(error.response.body),
  });
  // forward a minimal copy of the upstream HTTP response instead of an Error:
  throw new Response(JSON.stringify(error.response.body), {
    status: error.response.code,
    headers: {
      'Content-Type': error.response.headers['Content-Type'],
    },
  });
}

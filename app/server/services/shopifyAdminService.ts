import type { Session } from '@prisma/client';

import { sentryCaptureException } from '~/exceptions/sentry';
import { HttpResponseError } from '@shopify/shopify-api';
import { apiVersion } from '~/shopify.server';

/**
 * Options for a GraphQL request
 */
export interface GraphQLRequestOptions<TVariables> {
  query: string;
  variables?: TVariables;
}

export interface GraphQLResponse<T = any> {
  json(): unknown;
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
  extensions?: { throttleStatus?: { restoreRate?: number } };
}

/**
 * Client for interacting with Shopify's Admin GraphQL API using fetch
 */
export class ShopifyAdminService {
  private readonly offlineSessionToken: string;
  private readonly shopifyStoreUrl: string;

  constructor(session: Session) {
    this.shopifyStoreUrl = `https://${session.shop}/admin/api/${apiVersion}/graphql.json`;
    this.offlineSessionToken = session.accessToken;
  }

  graphqlClientFactory() {
    return async <TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
      query: string,
      options?: { variables?: TVariables },
    ): Promise<GraphQLResponse<TData>> => {
      try {
        const requestInit = this.configureRequest({ query, variables: options?.variables });
        const response = await fetch(this.shopifyStoreUrl, requestInit);

        if (!response.ok) {
          let body: any = {};
          try {
            body = await response.json();
          } catch (parseError) {
            console.warn('Failed to parse error response body:', parseError);
          }

          throw new HttpResponseError({
            message: response.statusText || 'Shopify API request failed',
            code: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body,
          });
        }
        return response as unknown as GraphQLResponse<TData>;
      } catch (error) {
        throw await this.handleClientError(error);
      }
    };
  }

  private configureRequest<TVariables extends Record<string, unknown> = Record<string, unknown>>(
    options: GraphQLRequestOptions<TVariables>,
  ): RequestInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.offlineSessionToken,
    };

    const body: { query: string; variables?: TVariables } = { query: options.query };
    if (options.variables) {
      body.variables = options.variables;
    }

    return {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    };
  }

  private async handleClientError(error: unknown): Promise<Response> {
    if (!(error instanceof HttpResponseError)) {
      sentryCaptureException(
        'Got a response error from the API',
        error instanceof Error ? error.message : 'Unknown error',
        error as object,
      );
      throw error;
    }

    sentryCaptureException('Got an HTTP response error from the API', error.message, {
      code: error.response.code,
      statusText: error.response.statusText,
      body: JSON.stringify(error.response.body),
    });

    return new Response(JSON.stringify(error.response.body), {
      status: error.response.code,
      headers: {
        'Content-Type': error.response.headers['Content-Type'] || 'application/json',
      },
    });
  }
}

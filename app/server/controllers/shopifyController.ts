import type { AdminContext, AdminApiContext } from '@shopify/shopify-app-remix/server';

import { serviceProvider } from '../providers/ServiceProvider';
import { responseError, responseSuccess } from '../utils/api';
import { sentryCaptureException } from '~/exceptions/sentry';
import { graphqlWrapper } from '../helpers/graphql';

export class ShopifyController {
  private readonly graphql: AdminApiContext['graphql'];

  constructor() {
    const shopify = serviceProvider.resolve<AdminContext>('ShopifyContext');
    this.graphql = shopify.admin.graphql;
  }

  async queryShopify({ request }: { request: Request }): Promise<Response> {
    try {
      const { variables, query, operationName } = await request.json();
      if (!operationName || !query) {
        return responseError({ message: 'No variables or query provided', status: 400 });
      }

      const response = await this.graphql(
        graphqlWrapper(query),
        variables ? { variables } : undefined,
      );
      const responseJson = await response.json();

      return responseSuccess({ data: responseJson.data }, { status: 200 });
    } catch (error) {
      sentryCaptureException('ShopifyController - queryShopify', 'Error', error as Error, {
        level: 'error',
      });
      return responseError({ message: (error as Error).message, status: 500 });
    }
  }
}

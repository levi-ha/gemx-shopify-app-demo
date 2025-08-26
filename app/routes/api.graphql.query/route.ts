import { type ActionFunctionArgs } from '@remix-run/node';

import { ShopifyController } from '~/server/controllers/shopifyController';
import { withAdminAuth } from '~/server/middleware/auth';

export const action = withAdminAuth(handleGraphqlQuery);

async function handleGraphqlQuery({ request }: ActionFunctionArgs): Promise<Response> {
  const shopify = new ShopifyController();
  return shopify.queryShopify({ request });
}

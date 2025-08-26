import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { AdminContext } from '@shopify/shopify-app-remix/server';
import type { Session } from '@prisma/client';

import { getSessionTokenContextForLocal } from '../auth/shopify/helpers/derive-api';
import { ShopifyAdminService } from '../services/shopifyAdminService';
import { getShopifyAuthenticate } from '../auth/shopify/authenticate';
import { registerServices } from '../providers/AppServiceProvider';
import { serviceProvider } from '../providers/ServiceProvider';
import { sentryCaptureException } from '~/exceptions/sentry';
import { isGemXDevMode } from '../auth/shopify/helpers';
import { authenticate } from '~/shopify.server';
import { responseError } from '../utils/api';

import prisma from '~/db.server';

export async function requireAdminAuth({
  request,
}: LoaderFunctionArgs | ActionFunctionArgs): Promise<AdminContext> {
  try {
    if (isGemXDevMode()) {
      const context = await getSessionTokenContextForLocal();
      if (!context.offlineSession || !context.onlineSession) {
        throw new Error('No online session token found');
      }

      const offlineSession = context.offlineSession;
      if (!offlineSession.accessToken) {
        throw new Error('Invalid offline session token');
      }

      const shopify = await getShopifyAuthenticate();
      shopify.admin.graphql = graphqlClient(offlineSession) as AdminContext['admin']['graphql'];
      serviceProvider.register<AdminContext>('ShopifyContext', shopify);
      return shopify;
    }

    const shopify: any = await authenticate.admin(request);
    if (!shopify?.session?.shop) {
      throw new Error('Invalid offline session token');
    }

    const offlineSession = await getSessionByShop(shopify.session.shop, false);
    if (offlineSession) {
      shopify.admin.graphql = graphqlClient(offlineSession) as AdminContext['admin']['graphql'];
    }

    serviceProvider.register<AdminContext>('ShopifyContext', shopify);
    return shopify;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown authentication error');
    sentryCaptureException('requireAdminAuth', err.message, err);
    throw err;
  }
}

export function withAdminAuth(
  handler: (args: LoaderFunctionArgs | ActionFunctionArgs) => Promise<Response>,
) {
  return async (args: LoaderFunctionArgs | ActionFunctionArgs): Promise<Response> => {
    try {
      const shopify = await requireAdminAuth(args);
      if (!shopify) {
        return responseError({ message: 'Authentication failed', status: 401 });
      }

      registerServices();

      const result = await handler(args);
      if (!(result instanceof Response)) {
        throw new Error('Handler did not return a valid Response');
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error in withAdminAuth');
      sentryCaptureException('withAdminAuth', err.message, err);
      return responseError({ message: err.message, status: 500 });
    }
  };
}

// ===================================== PRIVATE =====================================
const graphqlClient = (session: Session) => {
  const abc = new ShopifyAdminService(session);
  return abc.graphqlClientFactory();
};

const getSessionByShop = async (shop: string, isOnline: boolean): Promise<Session | null> => {
  if (!shop) return null;

  try {
    const session = await prisma.session.findFirst({
      where: {
        shop,
        isOnline,
      },
    });
    return session;
  } catch (error) {
    sentryCaptureException('getSessionByShop', (error as Error).message, error as Error);
    return null;
  }
};

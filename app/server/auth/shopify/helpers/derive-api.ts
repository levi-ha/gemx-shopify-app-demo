import type { Session } from '@prisma/client';

import { SHOPIFY_APP_LOCAL } from '../config';

import prisma from '~/db.server';

export async function getSessionTokenContextForLocal() {
  try {
    const shop = SHOPIFY_APP_LOCAL.SHOP;
    const onlineSession = await getSessionByShopForLocal(shop, false);
    const offlineSession = await getSessionByShopForLocal(onlineSession?.shop, false);
    const sessionId = onlineSession?.id;
    const sessionToken = onlineSession?.accessToken;
    return { shop, sessionToken, sessionId, onlineSession, offlineSession };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function getSessionByShopForLocal(
  shop: string | undefined,
  isOnline: boolean,
): Promise<Session | null> {
  const session = await prisma.session.findFirst({
    where: {
      ...(shop && { shop }),
      isOnline,
    },
  });
  return session;
}

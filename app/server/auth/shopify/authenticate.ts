import type { AdminContext } from '@shopify/shopify-app-remix/server';

import { getSessionTokenContextForLocal } from './helpers/derive-api';
import { graphqlClientFactory } from './api/graphql-factory';

export async function getShopifyAuthenticate(): Promise<AdminContext> {
  try {
    const context = await getSessionTokenContextForLocal();
    const onlineSession = context?.onlineSession;
    if (!onlineSession) throw new Error('No online session token found');

    const offlineSession = context?.offlineSession;
    if (!offlineSession) throw new Error('No offline session token found');

    const session = {
      id: onlineSession.id,
      shop: onlineSession.shop,
      state: onlineSession.state,
      isOnline: onlineSession.isOnline,
      scope: onlineSession.scope,
      expires: onlineSession.expires,
      accessToken: onlineSession.accessToken,
      onlineAccessInfo: {
        associated_user: {
          id: Number(onlineSession.userId),
          account_owner: onlineSession.accountOwner,
          collaborator: onlineSession.collaborator,
          email: onlineSession.email,
          email_verified: onlineSession.emailVerified,
          first_name: onlineSession.firstName,
          last_name: onlineSession.lastName,
          locale: onlineSession.locale,
        },
      },
    } as AdminContext['session'];

    return {
      session: session,
      admin: {
        graphql: graphqlClientFactory(),
      },
    } as AdminContext;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

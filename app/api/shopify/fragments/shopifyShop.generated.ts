import type * as Types from '../../../schemas/shopify/admin.types';

export type ShopifyShopSelectFragment = Pick<
  Types.Shop,
  'currencyCode' | 'enabledPresentmentCurrencies' | 'ianaTimezone'
> & { primaryDomain: Pick<Types.Domain, 'host' | 'url'> };

export const ShopifyShopSelectFragmentDoc = `
    fragment ShopifyShopSelect on Shop {
  primaryDomain {
    host
    url
  }
  currencyCode
  enabledPresentmentCurrencies
  ianaTimezone
}
    `;

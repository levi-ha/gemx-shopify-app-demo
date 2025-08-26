import type * as Types from '../../../schemas/shopify/admin.types';

import { ShopifyShopSelectFragmentDoc } from '../fragments/shopifyShop.generated';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { appFetcherGemX } from '../../utils/gatewayClientGemX';
export type ShopifyShopQueryVariables = Types.Exact<{ [key: string]: never }>;

export type ShopifyShopQueryResponse = {
  shop: Pick<Types.Shop, 'currencyCode' | 'enabledPresentmentCurrencies' | 'ianaTimezone'> & {
    primaryDomain: Pick<Types.Domain, 'host' | 'url'>;
  };
};

export const ShopifyShopDocument = `
    query ShopifyShop {
  shop {
    ...ShopifyShopSelect
  }
}
    ${ShopifyShopSelectFragmentDoc}`;

export const useShopifyShopQuery = <TData = ShopifyShopQueryResponse, TError = unknown>(
  variables?: ShopifyShopQueryVariables,
  options?: UseQueryOptions<ShopifyShopQueryResponse, TError, TData>,
) => {
  return useQuery<ShopifyShopQueryResponse, TError, TData>(
    variables === undefined ? ['ShopifyShop'] : ['ShopifyShop', variables],
    appFetcherGemX<ShopifyShopQueryResponse, ShopifyShopQueryVariables>(
      ShopifyShopDocument,
      variables,
    ),
    options,
  );
};

useShopifyShopQuery.getKey = (variables?: ShopifyShopQueryVariables) =>
  variables === undefined ? ['ShopifyShop'] : ['ShopifyShop', variables];

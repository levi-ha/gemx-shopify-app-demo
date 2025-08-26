import { isBrowser } from '~/utils';
export const ENV_VARIABLE_MAPPING = [
  'NODE_ENV',
  'SHOPIFY_API_KEY',
  'SHOPIFY_ADMIN_DOMAIN',
  'GEMPAGES_APP_HANDLE',
  'GEMX_APP_HANDLE',
  'SHOPIFY_THEME_EXTENSION_ID',
  'SHOPIFY_CART_TRANSFORMER_ID',
  'SHOPIFY_THEME_EXTENSION_HANDLE',
  'GP_V7_API_URL',
  'WEBSOCKET_URL',
  'SENTRY_DSN',
  'SENTRY_TRACES_SAMPLE_RATE',
  'SENTRY_ENVIRONMENT',
  'APP_GTM',
  'APP_GA_MEASUREMENT_ID',
  'GEMX_APP_ENV',
  'SHOPIFY_APP_SHOP',
] as const;

export type EnvVariableKey = (typeof ENV_VARIABLE_MAPPING)[number];

export type EnvVariableMapping = Record<EnvVariableKey, string>;

export interface IConfig {
  NODE_ENV: string;
  GEMX_APP_ENV: string;
  APP: {
    SHOPIFY_API_KEY: string;
    SHOPIFY_APP_SHOP: string;
    SHOPIFY_ADMIN_DOMAIN: string;
    GEMPAGES_APP_HANDLE: string;
    GEMX_APP_HANDLE: string;
    SHOPIFY_THEME_EXTENSION_ID: string;
    SHOPIFY_CART_TRANSFORMER_ID: string;
    SHOPIFY_THEME_EXTENSION_HANDLE: string;
  };
  INTEGRATION: {
    APP_GTM: string;
    APP_GA_MEASUREMENT_ID: string;
  };
  URL: {
    GP_V7_API_URL: string;
    WEBSOCKET_URL: string;
  };
  SENTRY: {
    DNS: string;
    TRACES_SAMPLE_RATE: string;
    ENVIRONMENT: string;
  };
}

/**
 * Get config for client
 * @param key - @type keyof IConfig
 * @returns string | undefined
 */
export const getConfig = <T extends keyof IConfig>(key: T): IConfig[T] | undefined => {
  if (!isBrowser()) return;

  const getEnv: EnvVariableMapping = (window as any).__GEMX_ENVIRONMENT__;

  if (!getEnv?.NODE_ENV) {
    throw new Error('Miss env: NODE_ENV');
  }

  if (!getEnv?.SHOPIFY_API_KEY) {
    throw new Error('Miss env: SHOPIFY_API_KEY');
  }

  const dataConfig: IConfig = {
    NODE_ENV: getEnv.NODE_ENV,
    GEMX_APP_ENV: getEnv.GEMX_APP_ENV,
    APP: {
      SHOPIFY_API_KEY: getEnv.SHOPIFY_API_KEY,
      SHOPIFY_APP_SHOP: getEnv.SHOPIFY_APP_SHOP,
      SHOPIFY_ADMIN_DOMAIN: getEnv.SHOPIFY_ADMIN_DOMAIN,
      GEMPAGES_APP_HANDLE: getEnv.GEMPAGES_APP_HANDLE,
      GEMX_APP_HANDLE: getEnv.GEMX_APP_HANDLE,
      SHOPIFY_THEME_EXTENSION_ID: getEnv.SHOPIFY_THEME_EXTENSION_ID,
      SHOPIFY_CART_TRANSFORMER_ID: getEnv.SHOPIFY_CART_TRANSFORMER_ID,
      SHOPIFY_THEME_EXTENSION_HANDLE: getEnv.SHOPIFY_THEME_EXTENSION_HANDLE,
    },
    INTEGRATION: {
      APP_GTM: getEnv.APP_GTM,
      APP_GA_MEASUREMENT_ID: getEnv.APP_GA_MEASUREMENT_ID,
    },
    URL: {
      GP_V7_API_URL: getEnv.GP_V7_API_URL,
      WEBSOCKET_URL: getEnv.WEBSOCKET_URL,
    },
    SENTRY: {
      DNS: getEnv.SENTRY_DSN,
      TRACES_SAMPLE_RATE: getEnv.SENTRY_TRACES_SAMPLE_RATE,
      ENVIRONMENT: getEnv.SENTRY_ENVIRONMENT,
    },
  };

  return dataConfig[key];
};

import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';

dotenv.config();

const GATEWAY_URL = process.env.SHOPIFY_CODEGEN_GATEWAY_API_URL as string;
const ACCESS_TOKEN = process.env.SHOPIFY_CODEGEN_ACCESS_TOKEN as string;

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [GATEWAY_URL]: {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
        },
      },
    },
  ],
  generates: {
    'app/types/admin-2025-07.schema.json': {
      plugins: ['introspection'],
    },
    'app/schemas/shopify/schema.graphql': {
      plugins: ['schema-ast'],
    },
    'app/schemas/shopify/admin.types.d.ts': {
      plugins: ['typescript'],
      config: {
        arrayInputCoercion: false,
        constEnums: true,
        enumsAsTypes: true,
        numericEnums: false,
        futureProofEnums: false,
        enumsAsConst: false,
      },
    },
  },
  config: {
    enumPrefix: true,
    noExport: false,
    immutableTypes: false,
    onlyOperationTypes: false,
    useTypeImports: true,
    wrapFieldDefinitions: false,
    skipTypename: true,
    nonOptionalTypename: false,
    dedupeFragments: true,
    fieldWrapperValue: 'T',
    maybeValue: 'T | undefined',
    inputMaybeValue: 'Maybe<T>',
    scalars: {
      DateTime: 'string',
      Time: 'string',
      JSON: 'any',
      Upload: 'any',
      URL: 'string',
      Uint: 'string',
      Uint64: 'string',
      Any: 'any',
      Map: 'any',
      Cursor: 'string',
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;

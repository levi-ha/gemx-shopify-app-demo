import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: ["app/types/admin-2025-07.schema.json"],
  documents: ["app/api/shopify/**/*.gql"],
  generates: {
    "app/api/shopify/graphql/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.ts",
        baseTypesPath: "../../../schemas/shopify/admin.types.d",
      },
      plugins: [
        "typescript-operations",
        "@graphql-codegen/typescript-react-query",
      ],
      config: {
        fetcher: {
          func: "../../utils/gatewayClientGemX#appFetcherGemX",
        },
        arrayInputCoercion: false,
        exposeQueryKeys: true,
        exposeMutationKeys: true,
        preResolveTypes: false,
        skipTypeNameForRoot: false,
        dedupeOperationSuffix: false,
        omitOperationSuffix: false,
        operationResultSuffix: "Response",
        declarationKind: {
          type: "interface",
          input: "interface",
        },
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
    fieldWrapperValue: "T",
    maybeValue: "T | undefined",
    scalars: {
      DateTime: "string",
      Time: "string",
      JSON: "any",
      Upload: "any",
      URL: "string",
      Uint: "string",
      Uint64: "string",
      Any: "any",
      Map: "any",
      Cursor: "string",
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write", "eslint --fix"],
  },
};

export default config;

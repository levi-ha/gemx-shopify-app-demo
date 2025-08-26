/* eslint-disable max-params */
import type { SeverityLevel } from '@sentry/remix';

import * as Sentry from '@sentry/remix';

export const sentryCaptureException = (
  funcName: string,
  message: string,
  data: object,
  options?: {
    level: SeverityLevel;
    tag?: {
      key: string;
      value: string;
    };
  },
) => {
  Sentry.withScope((scope) => {
    scope.setLevel(options?.level ?? 'log');
    if (options?.tag) {
      scope.setTag(options?.tag.key, options?.tag.value);
    }
    scope.setExtra('function', funcName);
    scope.setExtra('data', JSON.stringify(data));
    Sentry.captureMessage(`${funcName}: ${message}`);
  });
};

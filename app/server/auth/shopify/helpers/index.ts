import { getConfig } from '~/config/environment';
import { isBrowser } from '~/utils';

export const isGemXDevMode = () => {
  if (isBrowser()) {
    return !!getConfig('GEMX_APP_ENV');
  }
  return !!process.env.GEMX_APP_ENV;
};

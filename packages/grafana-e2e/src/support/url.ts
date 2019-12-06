import { e2eConfig, e2eEnv } from '../index';

export interface UrlApi {
  fromBaseUrl: (url: string | undefined) => string;
  getDashboardUid: (url: string) => string;
}

const uidRegex = '\\/d\\/(.*)\\/';
const getBaseUrl = () => e2eEnv('BASE_URL') || e2eConfig().baseUrl || 'http://localhost:3000';

export const Url: UrlApi = {
  fromBaseUrl: (url: string | undefined) => {
    url = url || '';
    const strippedUrl = url.replace('^/', '');
    return `${getBaseUrl()}${strippedUrl}`;
  },
  getDashboardUid: (url: string) => {
    const matches = url.match(uidRegex);
    if (!matches) {
      throw new Error(`Couldn't parse uid from ${url}`);
    }

    return matches[1];
  },
};

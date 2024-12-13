export interface Config {
  isProduction: boolean;
  serverUrl: string;
  apiKey: string;
}

export const CONFIG = (): Config => {
  const { BOT_URL, PASSWORD } = process.env;
  if (!BOT_URL || !PASSWORD) {
    throw new Error('BOT_URL or PASSWORD are missing');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isProduction,
    serverUrl: new URL('/sse', BOT_URL).toString(),
    apiKey: PASSWORD,
  };
};

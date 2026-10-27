import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mantri777.app',
  appName: 'Mantri777',
  webDir: 'out',
  server: {
    url: 'https://mantri777.com',
    cleartext: true
  }
};

export default config;

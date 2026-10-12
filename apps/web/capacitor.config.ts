import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucky777.app',
  appName: 'Mantri777',
  webDir: 'out',
  server: {
    url: 'https://lucky777.com',
    cleartext: true
  }
};

export default config;

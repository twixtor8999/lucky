import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mantri777.app',
  appName: 'Mantri777',
  webDir: 'www',
  server: {
    url: 'http://10.65.15.96:3000',
    cleartext: true
  }
};

export default config;

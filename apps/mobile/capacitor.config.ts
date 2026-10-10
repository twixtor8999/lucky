import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucky777.app',
  appName: 'Lucky 777',
  webDir: 'www',
  server: {
    url: 'http://10.65.15.96:3000',
    cleartext: true
  }
};

export default config;

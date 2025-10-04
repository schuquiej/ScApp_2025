import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schuleta.creations',
  appName: 'SCApp',
  webDir: 'dist',        
  server: {
    androidScheme: 'http' 
  }
};
export default config;
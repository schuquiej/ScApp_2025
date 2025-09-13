import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schuleta.creations',
  appName: 'SCApp',
  webDir: 'dist',        
  server: {
    androidScheme: 'https' 
  }
};
export default config;
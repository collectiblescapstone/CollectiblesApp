import type { CapacitorConfig } from '@capacitor/cli';
import dotenv from 'dotenv';
dotenv.config();

const liveReloadUrl = process.env.CAPACITOR_LIVE_RELOAD_URL;

const config: CapacitorConfig = {
  appId: 'com.collectibles.app',
  appName: 'collectiblesApp',
  webDir: 'out',
  server: {
    url: liveReloadUrl ?? undefined,
    cleartext: true,
  },
};

export default config;

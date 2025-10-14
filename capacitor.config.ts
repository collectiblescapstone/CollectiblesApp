import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.collectibles.app',
  appName: 'collectiblesApp',
  webDir: 'out',
  server: {
    url: `${process.env.LOCAL_NEXT_SERVER_URL}`,
    cleartext: true,
  },
}

export default config

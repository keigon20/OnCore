import { TestIds } from 'react-native-google-mobile-ads';
import { APP_VARIANT } from './env';

// Use test IDs in staging/dev so ads always fill on emulators and dev devices
// without risking policy violations from clicking your own production ads.
// Switch to the real unit ID only in production builds.
export const NATIVE_AD_UNIT_ID =
  APP_VARIANT === 'production'
    ? 'ca-app-pub-1590191309979352/1893322708'
    : TestIds.NATIVE;

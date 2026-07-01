export type AppVariant = 'staging' | 'production';

export const APP_VARIANT: AppVariant =
  process.env.EXPO_PUBLIC_APP_VARIANT === 'staging' ? 'staging' : 'production';

export const isStaging = APP_VARIANT === 'staging';

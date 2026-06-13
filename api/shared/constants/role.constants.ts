export const ROLE_NAMES = {
  STAFF: 'staff',
  SUPPER_ADMIN: 'supper_admin',
  DEALER_MANAGER: 'dealer_manager',
} as const;

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];

export const DEFAULT_CURRENCY = 'USD';

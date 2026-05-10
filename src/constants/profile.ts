export const PROFILE_MENU_KEYS = {
  OVERVIEW: "overview",
  NETWORK: "network",
  ACCOUNT: "account",
  ACKNOWLEDGEMENTS: "acknowledgements",
} as const;

export type ProfileMenuKey = (typeof PROFILE_MENU_KEYS)[keyof typeof PROFILE_MENU_KEYS];

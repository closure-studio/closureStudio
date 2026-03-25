import { ref } from "vue";

export const PROFILE_MENU_KEYS = {
  OVERVIEW: "overview",
  NETWORK: "network",
  ACCOUNT: "account",
  ACKNOWLEDGEMENTS: "acknowledgements",
} as const;

export type ProfileMenuKey = (typeof PROFILE_MENU_KEYS)[keyof typeof PROFILE_MENU_KEYS];

const activeProfileMenuKey = ref<ProfileMenuKey>(PROFILE_MENU_KEYS.OVERVIEW);

export const useProfileMenuState = () => {
  const setActiveProfileMenuKey = (menuKey: ProfileMenuKey) => {
    activeProfileMenuKey.value = menuKey;
  };

  return {
    activeProfileMenuKey,
    setActiveProfileMenuKey,
  };
};

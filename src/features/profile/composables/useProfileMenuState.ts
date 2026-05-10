import { ref } from "vue";
import { PROFILE_MENU_KEYS, type ProfileMenuKey } from "@/constants/profile";

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

import { ref } from "vue";
import { DEFAULT_THEME } from "@/constants/ui";
import { loadTheme, setTheme, getTheme } from "@/utils/theme";

/**
 * 主题管理 composable
 */
export function useTheme() {
  const currentTheme = ref(getTheme() || DEFAULT_THEME);

  function applyTheme(name: string) {
    setTheme(name);
    currentTheme.value = name;
  }

  function initTheme() {
    loadTheme();
    currentTheme.value = getTheme() || DEFAULT_THEME;
  }

  return { currentTheme, applyTheme, initTheme };
}

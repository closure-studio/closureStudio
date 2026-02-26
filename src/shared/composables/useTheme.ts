import { ref, onMounted } from "vue";
import { loadTheme, setTheme, getTheme } from "@/shared/utils/theme";

/**
 * 主题管理 composable
 */
export function useTheme() {
  const currentTheme = ref(getTheme() || "halloween");

  function applyTheme(name: string) {
    setTheme(name);
    currentTheme.value = name;
  }

  function initTheme() {
    loadTheme();
    currentTheme.value = getTheme() || "halloween";
  }

  return { currentTheme, applyTheme, initTheme };
}

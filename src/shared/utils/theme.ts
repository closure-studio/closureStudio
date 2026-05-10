import { STORAGE_KEYS } from "@/constants/storage";
import { DEFAULT_THEME, THEME_ATTRIBUTE } from "@/constants/ui";

export function loadTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_THEME;
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}

export function setTheme(name: string) {
  localStorage.setItem(STORAGE_KEYS.THEME, name);
  document.documentElement.setAttribute(THEME_ATTRIBUTE, name);
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME);
}

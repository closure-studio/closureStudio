export function loadTheme() {
  const theme = localStorage.getItem("theme") || "halloween";
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(name: string) {
  localStorage.setItem("theme", name);
  document.documentElement.setAttribute("data-theme", name);
}

export function getTheme() {
  return localStorage.getItem("theme");
}

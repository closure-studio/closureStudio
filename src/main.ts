import { createPinia } from "pinia";
import { persist } from "pinia-persists";
import "./assets/main.css";
import "./assets/style.css";
import BaseLayout from "./components/layout/BaseLayout.vue";
import "./plugins/hook";
// @ts-ignore
import { createApp } from "vue";
import VueClickAway from "vue3-click-away";
import App from "./App.vue";
import { initSW } from "./swloader";
import { router } from "./router";
const pinia = createPinia();
pinia.use(
  persist({
    prefix: "closureV3",
  })
);

const app = createApp(App);

app.component("layout", BaseLayout);
app.use(VueClickAway).use(router).use(pinia).mount("#app");

if (import.meta.env.MODE !== "development") {
  initSW();
}

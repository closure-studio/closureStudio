import { createPinia } from "pinia";
import { persist } from "pinia-persists";
import "./assets/main.css";
import "./assets/style.css";
import BaseLayout from "./components/layout/BaseLayout.vue";
import "./plugins/hook";
// @ts-ignore
import * as Sentry from "@sentry/vue";
import { createApp } from "vue";
import VueClickAway from "vue3-click-away";
import App from "./App.vue";
import "./plugins/captcha/gt.0.4.8";
import { router } from "./plugins/router";
import { initSW } from "./swloader";
const pinia = createPinia();
pinia.use(
  persist({
    prefix: "closureV3",
  })
);

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://9affc989cb8aac22fb1f446c1a737bfd@o4508101763334144.ingest.us.sentry.io/4508101777883136",
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /closure\.ltsc\.vip$/,        // 匹配 closure.ltsc.vip 的域名
    /www\.arknights\.host$/,      // 匹配 www.arknights.host 的域名
    /arknights\.host$/            // 匹配 arknights.host 的域名
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

app.component("layout", BaseLayout);
app.use(VueClickAway).use(router).use(pinia).mount("#app");

myUndefinedFunction();

if (import.meta.env.MODE !== "development") {
  initSW();
}

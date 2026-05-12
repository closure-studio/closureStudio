import { createRouter, createWebHistory } from "vue-router";
import { ROUTES } from "@/constants/app";
import { useUserStore } from "@/stores/useUserStore";
import { useGamesStore } from "@/stores/useGamesStore";
declare module "vue-router" {
  interface RouteMeta {
    noAuth?: boolean;
    title?: string;
  }
}

export const checkAuth = () => {
  const user = useUserStore();
  if (!user) {
    return false;
  }
  if (!user.isLogin) {
    return false;
  }
  if (user.info && user.info.exp < Math.floor(Date.now() / 1000)) {
    user.logout();
    window.location.reload();
    return false;
  }
  return true;
};

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: ROUTES.OAUTH_CALLBACK_LINUXDO.path,
      name: ROUTES.OAUTH_CALLBACK_LINUXDO.name,
      component: () => import("../views/auth/callback/LinuxDoOAuthCallbackView.vue"),
      meta: { noAuth: true },
    },
    {
      path: "/",
      component: () => import("../components/layout/BaseLayout.vue"),
      children: [
        {
          path: ROUTES.HOME.path,
          name: ROUTES.HOME.name,
          component: () => import("../views/home/HomeView.vue"),
        },
        {
          path: ROUTES.TERMS_POLICIES.path,
          name: ROUTES.TERMS_POLICIES.name,
          component: () => import("../views/blog/terms-policies/TermsPoliciesView.vue"),
        },
        {
          path: ROUTES.FAQ.path,
          name: ROUTES.FAQ.name,
          component: () => import("../views/blog/faq/FaqView.vue"),
        },
        {
          path: ROUTES.PROFILE.path,
          name: ROUTES.PROFILE.name,
          component: () => import("../views/profile/ProfileLayout.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next(); // 用户已认证
            } else {
              next({ name: ROUTES.HOME.name }); // 跳转到首页或其他未认证的页面
            }
          },
          children: [
            {
              path: ROUTES.PROFILE_NETWORK.path,
              name: ROUTES.PROFILE_NETWORK.name,
              component: () => import("../views/profile/network/NetworkView.vue"),
            },
            {
              path: ROUTES.PROFILE_ACCOUNT.path,
              name: ROUTES.PROFILE_ACCOUNT.name,
              component: () => import("../views/profile/account/AccountView.vue"),
            },
            {
              path: ROUTES.PROFILE_SMS_VERIFY.path,
              name: ROUTES.PROFILE_SMS_VERIFY.name,
              component: () => import("../views/profile/sms-verify/SmsVerifyView.vue"),
            },
            {
              path: ROUTES.PROFILE_ACKNOWLEDGEMENTS.path,
              name: ROUTES.PROFILE_ACKNOWLEDGEMENTS.name,
              component: () => import("../views/profile/acknowledgements/AcknowledgementsView.vue"),
            },
          ],
        },
        {
          path: ROUTES.DASHBOARD.path,
          name: ROUTES.DASHBOARD.name,
          component: () => import("../views/dashboard/DashboardView.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next();
            } else {
              next({ name: ROUTES.HOME.name });
            }
          },
        },
        {
          path: ROUTES.GAME_DETAIL.path,
          name: ROUTES.GAME_DETAIL.name,
          component: () => import("../views/dashboard/game/GameDetailView.vue"),
          beforeEnter: (to, from, next) => {
            if (!checkAuth()) {
              next({ name: ROUTES.HOME.name });
              return;
            }
            // 验证账号存在
            const store = useGamesStore();
            const account = to.params.account as string;
            if (!store.findGame(account)) {
              next({ name: ROUTES.DASHBOARD.name });
              return;
            }
            next();
          },
        },
        {
          path: ROUTES.REPLAY_HUB.path,
          name: ROUTES.REPLAY_HUB.name,
          component: () => import("../views/replay/ReplayHubView.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next();
            } else {
              next({ name: ROUTES.HOME.name });
            }
          },
        },
      ],
    },
  ],
});

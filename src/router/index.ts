import { createRouter, createWebHistory } from "vue-router";
import { ROUTES } from "@/shared/constants/routes";
import { useUserStore } from "@/stores/useUserStore";
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
      component: () => import("../views/auth/OAuthCallback.vue"),
      meta: { noAuth: true },
    },
    {
      path: "/",
      component: () => import("../shared/components/layout/BaseLayout.vue"),
      children: [
        {
          path: ROUTES.HOME.path,
          name: ROUTES.HOME.name,
          component: () => import("../views/Index.vue"),
        },
        {
          path: ROUTES.TERMS_POLICIES.path,
          name: ROUTES.TERMS_POLICIES.name,
          component: () => import("../views/blog/TermsPolicies.vue"),
        },
        {
          path: ROUTES.FAQ.path,
          name: ROUTES.FAQ.name,
          component: () => import("../views/blog/FAQ.vue"),
        },
        {
          path: ROUTES.PROFILE.path,
          name: ROUTES.PROFILE.name,
          component: () => import("../views/user/Profile.vue"),
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
              component: () => import("../views/user/ProfileNetwork.vue"),
            },
            {
              path: ROUTES.PROFILE_ACCOUNT.path,
              name: ROUTES.PROFILE_ACCOUNT.name,
              component: () => import("../views/user/ProfileAccount.vue"),
            },
            {
              path: ROUTES.PROFILE_SMS_VERIFY.path,
              name: ROUTES.PROFILE_SMS_VERIFY.name,
              component: () => import("../views/user/ProfileSMS.vue"),
            },
            {
              path: ROUTES.PROFILE_ACKNOWLEDGEMENTS.path,
              name: ROUTES.PROFILE_ACKNOWLEDGEMENTS.name,
              component: () => import("../views/user/ProfileAcknowledgements.vue"),
            },
          ],
        },
        {
          path: ROUTES.DASHBOARD.path,
          name: ROUTES.DASHBOARD.name,
          component: () => import("../views/Dashboard.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next();
            } else {
              next({ name: ROUTES.HOME.name });
            }
          },
        },
        {
          path: ROUTES.REPLAY_HUB.path,
          name: ROUTES.REPLAY_HUB.name,
          component: () => import("../views/replay/Replay.vue"),
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

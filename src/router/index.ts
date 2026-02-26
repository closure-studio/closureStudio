import { createRouter, createWebHistory } from "vue-router";
import { ROUTE_NAMES } from "@/shared/constants/routes";
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
      path: "/",
      component: () => import("../shared/components/layout/BaseLayout.vue"),
      children: [
        {
          path: "/",
          name: ROUTE_NAMES.HOME,
          component: () => import("../views/Index.vue"),
        },
        {
          path: "/blog/Terms&Policies",
          name: ROUTE_NAMES.TERMS_POLICIES,
          component: () => import("../views/blog/TermsPolicies.vue"),
        },
        {
          path: "/blog/FAQ",
          name: ROUTE_NAMES.FAQ,
          component: () => import("../views/blog/FAQ.vue"),
        },
        {
          path: "/profile",
          name: ROUTE_NAMES.PROFILE,
          component: () => import("../views/user/Profile.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next(); // 用户已认证
            } else {
              next({ name: ROUTE_NAMES.HOME }); // 跳转到首页或其他未认证的页面
            }
          },
          children: [
            {
              path: "/profile/network",
              name: ROUTE_NAMES.PROFILE_NETWORK,
              component: () => import("../views/user/ProfileNetwork.vue"),
            },
            {
              path: "/profile/account",
              name: ROUTE_NAMES.PROFILE_ACCOUNT,
              component: () => import("../views/user/ProfileAccount.vue"),
            },
            {
              path: "/profile/smsVerify",
              name: ROUTE_NAMES.PROFILE_SMS_VERIFY,
              component: () => import("../views/user/ProfileSMS.vue"),
            },
          ],
        },
        {
          path: "/dashboard",
          name: ROUTE_NAMES.DASHBOARD,
          component: () => import("../views/user/Dashboard.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next();
            } else {
              next({ name: ROUTE_NAMES.HOME });
            }
          },
        },
      ],
    },
  ],
});

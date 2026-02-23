import { createRouter, createWebHistory } from "vue-router";
import { userStore } from "../store/user";
declare module "vue-router" {
  interface RouteMeta {
    noAuth?: boolean;
    title?: string;
  }
}

export const checkAuth = () => {
  const user = userStore();
  if (!user) {
    return false;
  }
  if (!user.isLogin) {
    return false;
  }
  if (user.user.Info && user.user.Info.exp < Math.floor(Date.now() / 1000)) {
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
      component: () => import("../components/layout/BaseLayout.vue"),
      children: [
        {
          path: "/",
          name: "首页",
          component: () => import("../views/Index.vue"),
        },
        {
          path: "/blog/Terms&Policies",
          name: "用户条款及隐私政策",
          component: () => import("../views/blog/TermsPolicies.vue"),
        },
        {
          path: "/blog/FAQ",
          name: "常见问题",
          component: () => import("../views/blog/FAQ.vue"),
        },
        {
          path: "/profile",
          name: "个人设置",
          component: () => import("../views/user/Profile.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next(); // 用户已认证
            } else {
              next({ name: "首页" }); // 跳转到首页或其他未认证的页面
            }
          },
          children: [
            {
              path: "/profile/network",
              name: "网络设置",
              component: () => import("../views/user/ProfileNetwork.vue"),
            },
            {
              path: "/profile/account",
              name: "账号安全",
              component: () => import("../views/user/ProfileAccount.vue"),
            },
            {
              path: "/profile/smsVerify",
              name: "账号认证",
              component: () => import("../views/user/ProfileSMS.vue"),
            },
          ],
        },
        {
          path: "/dashboard",
          name: "控制面板",
          component: () => import("../views/user/Dashboard.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next();
            } else {
              next({ name: "首页" });
            }
          },
        },
        {
          path: "/ticket",
          name: "在线工单",
          component: () => import("../views/ticket/ticket.vue"),
          beforeEnter: (to, from, next) => {
            if (checkAuth()) {
              next();
            } else {
              next({ name: "首页" });
            }
          },
        },
      ],
    },
  ],
});

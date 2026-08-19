import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { ApiUserInfo } from "@/shared/types/api";
import apiClient from "@/services/apiClient";
import authClient from "@/services/authClient";
import { Permission } from "@/constants/auth";
import { hasPermission } from "@/utils/permission";
import { decodeJwtPayload } from "@/utils/jwt";

interface UserState {
  isLogin: boolean;
  Token: string;
  Info: ApiUserInfo;
}

const initialUserState = (): UserState => ({
  isLogin: false,
  Token: "",
  Info: {
    createdAt: 0,
    uuid: "",
    email: "",
    permission: 0,
    status: -1,
    isAdmin: false,
    exp: 0,
    slot: 0,
  },
});

export const useUserStore = defineStore("user", () => {
  const user = ref<UserState>(initialUserState());

  const isLogin = computed(() => user.value.isLogin);
  const token = computed(() => user.value.Token);
  const info = computed(() => user.value.Info);
  const isAdmin = computed(() => hasPermission(user.value.Info.permission, Permission.SuperAdmin));

  function login(tokenValue: string) {
    user.value.isLogin = true;
    user.value.Token = tokenValue;
    user.value.Info = decodeJwtPayload<ApiUserInfo>(tokenValue);

    apiClient.setJWT(tokenValue);
    authClient.setJWT(tokenValue);
  }

  function logout() {
    user.value = initialUserState();
  }

  return {
    user,
    isLogin,
    token,
    info,
    isAdmin,
    login,
    logout,
  };
});

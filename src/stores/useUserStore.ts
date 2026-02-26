import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { ApiUserInfo } from "@/shared/types/api";
import apiClient from "@/shared/services/apiClient";
import authClient from "@/shared/services/authClient";
import registryClient from "@/shared/services/registryClient";
import { hasPermission, Permission } from "@/plugins/permission/permission";
import { decodeJwtPayload } from "@/shared/utils/jwt";

interface UserState {
  isLogin: boolean;
  max_slot: number;
  Token: string;
  Info: ApiUserInfo;
}

const initialUserState = (): UserState => ({
  isLogin: false,
  max_slot: 0,
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
  const isVerify = computed(() => user.value.Info.status === 1 || user.value.Info.status === 2);

  function login(tokenValue: string) {
    user.value.isLogin = true;
    user.value.Token = tokenValue;
    user.value.Info = decodeJwtPayload<ApiUserInfo>(tokenValue);

    apiClient.setJWT(tokenValue);
    authClient.setJWT(tokenValue);
    registryClient.setJWT(tokenValue);
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
    isVerify,
    login,
    logout,
  };
});

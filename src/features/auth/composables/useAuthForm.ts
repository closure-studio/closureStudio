import { ref } from "vue";
import { GAME_PLATFORM_CODE } from "@/constants/game";
import { AuthModelType } from "@/constants/auth";

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  code: string;
  noise: string;
  sign: string;
}

export interface ForgetParams {
  email: string;
  code: string;
  newPasswd: string;
}

export interface FindAccountParams {
  gameAccount: string;
  platform: number;
}

export function useAuthForm() {
  const modelType = ref<AuthModelType>(AuthModelType.Login);
  const loginParams = ref<LoginParams>({
    email: "",
    password: "",
  });
  const forgetParams = ref<ForgetParams>({
    email: "",
    code: "",
    newPasswd: "",
  });
  const regParams = ref<RegisterParams>({
    email: "",
    password: "",
    code: "",
    noise: "",
    sign: "",
  });
  const findAccountParams = ref<FindAccountParams>({
    gameAccount: "",
    platform: GAME_PLATFORM_CODE.OFFICIAL,
  });
  const agreeTerms = ref(false);
  const findAccountRespData = ref("");

  return {
    modelType,
    loginParams,
    forgetParams,
    regParams,
    findAccountParams,
    agreeTerms,
    findAccountRespData,
  };
}

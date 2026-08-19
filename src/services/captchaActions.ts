import { startCaptcha } from "@/services/captcha";
import apiClient from "@/services/apiClient";
import { API_RESPONSE_CODE } from "@/constants/api";
import type { GameAccountForm } from "@/shared/types/api";
import { buildGameAccount } from "@/utils/account";

/**
 * 封装验证码包装工厂，统一 captcha + API 调用模式
 */
export function useCaptcha() {
  /** 创建游戏托管（带验证码） */
  function createGame(data: GameAccountForm) {
    return startCaptcha((captchaToken: string) => apiClient.createGame(captchaToken, data));
  }

  /** 删除游戏托管（带验证码） */
  function deleteGame(account: string) {
    return startCaptcha((captchaToken: string) => apiClient.deleteGame(captchaToken, account));
  }

  /** 登录游戏（带验证码） */
  function loginGame(gameAccount: string) {
    return startCaptcha((captchaToken: string) => apiClient.doGameLogin(captchaToken, gameAccount));
  }

  /** 删除并重新创建游戏托管（创建阶段带验证码） */
  async function updateGamePassword(data: GameAccountForm) {
    const form = {
      ...data,
      account: data.account.trim(),
    };
    const gameAccount = buildGameAccount(form.account, form.platform);

    // Arkhost's DELETE /game/:account does not require captcha. Keep it outside
    // startCaptcha so a captcha fallback cannot repeat a destructive delete.
    const deleteResponse = await apiClient.deleteGame("", gameAccount);
    if (deleteResponse.code !== API_RESPONSE_CODE.SUCCESS) {
      return deleteResponse;
    }

    return createGame(form);
  }

  return { createGame, deleteGame, loginGame, updateGamePassword };
}

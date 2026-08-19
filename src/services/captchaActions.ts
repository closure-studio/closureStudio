import { startCaptcha } from "@/services/captcha";
import apiClient from "@/services/apiClient";
import type { GameAccountForm } from "@/shared/types/api";

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

  /** 修改游戏密码（带验证码） */
  function updateGamePassword(data: GameAccountForm) {
    return startCaptcha((captchaToken: string) => apiClient.updateGamePassword(captchaToken, data));
  }

  return { createGame, deleteGame, loginGame, updateGamePassword };
}

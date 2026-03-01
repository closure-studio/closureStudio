import { startCaptcha } from "@/shared/services/captcha";
import apiClient from "@/shared/services/apiClient";
import registryClient from "@/shared/services/registryClient";
import type { RegistryAddGameForm } from "@/shared/types/api";

/**
 * 封装验证码包装工厂，统一 captcha + API 调用模式
 */
export function useCaptcha() {
  /** 创建游戏托管（带验证码） */
  function createGame(slotUUID: string, data: RegistryAddGameForm) {
    return startCaptcha((captchaToken: string) =>
      registryClient.doAddGame(slotUUID, captchaToken, data)
    );
  }

  /** 删除游戏托管（带验证码） */
  function deleteGame(slotUUID: string) {
    return startCaptcha((captchaToken: string) => registryClient.doDelGame(captchaToken, slotUUID));
  }

  /** 登录游戏（带验证码） */
  function loginGame(gameAccount: string) {
    return startCaptcha((captchaToken: string) => apiClient.doGameLogin(captchaToken, gameAccount));
  }

  /** 修改游戏密码（带验证码） */
  function updateGamePasswd(slotUUID: string, data: RegistryAddGameForm) {
    return startCaptcha((captchaToken: string) =>
      registryClient.doUpdateGamePasswd(slotUUID, captchaToken, data)
    );
  }

  /** 查找账号（带验证码） */
  function findAccount(gameAccount: string) {
    return startCaptcha((captchaToken: string) =>
      registryClient.doFindAccount(gameAccount, captchaToken)
    );
  }

  return { createGame, deleteGame, loginGame, updateGamePasswd, findAccount };
}

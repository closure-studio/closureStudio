import { LINUXDO_OAUTH_CONFIG, getRedirectUri } from "@/shared/config/oauth";
import type { OAuthState } from "@/shared/types/oauth";

const OAUTH_STATE_KEY = "oauth_state";

class OAuthClient {
  /**
   * 生成随机 state 字符串
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  /**
   * 保存 OAuth state 到 sessionStorage
   */
  private saveState(state: OAuthState): void {
    sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(state));
  }

  /**
   * 从 sessionStorage 获取并验证 OAuth state
   */
  getAndValidateState(stateParam: string): OAuthState | null {
    const stateJson = sessionStorage.getItem(OAUTH_STATE_KEY);
    if (!stateJson) {
      return null;
    }

    try {
      const state: OAuthState = JSON.parse(stateJson);

      // 验证 state 是否匹配
      if (state.state !== stateParam) {
        console.error("State mismatch");
        return null;
      }

      // 验证 state 是否过期（10分钟）
      const now = Date.now();
      if (now - state.timestamp > 10 * 60 * 1000) {
        console.error("State expired");
        return null;
      }

      return state;
    } catch (error) {
      console.error("Failed to parse state:", error);
      return null;
    } finally {
      // 清除已使用的 state
      sessionStorage.removeItem(OAUTH_STATE_KEY);
    }
  }

  /**
   * 发起 Linux.do OAuth 登录
   */
  initiateLinuxDoLogin(): void {
    const redirectUri = getRedirectUri();
    const state = this.generateState();

    // 保存 state
    const oauthState: OAuthState = {
      state,
      redirectUri,
      timestamp: Date.now(),
    };
    this.saveState(oauthState);

    // 构造授权 URL
    const params = new URLSearchParams({
      client_id: LINUXDO_OAUTH_CONFIG.clientId,
      redirect_uri: redirectUri,
      response_type: LINUXDO_OAUTH_CONFIG.responseType,
      scope: LINUXDO_OAUTH_CONFIG.scopes.join(" "),
      state,
    });

    const authUrl = `${LINUXDO_OAUTH_CONFIG.authorizationEndpoint}?${params.toString()}`;

    // 跳转到 Linux.do 授权页面
    window.location.href = authUrl;
  }
}

const oauthClient = new OAuthClient();
export default oauthClient;

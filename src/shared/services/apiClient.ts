import { API_HOST_CLOUDFLARE, type IHostServer } from "@/constants/hosts";
import { STORAGE_KEYS } from "@/constants/storage";
import { AxiosServer } from "./server";
import type {
  ApiGameLogs,
  ApiGameGame,
  ApiGameDetail,
  ApiGameConfig,
  ApiGameChars,
  ApiSystemConfig,
  ApiSystemHall,
} from "@/shared/types/api";

export class APIClient extends AxiosServer {
  constructor(hostServer: IHostServer) {
    super(hostServer);
  }

  saveLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.API_HOST, JSON.stringify(this.hostServer));
  }
  fetchGameLogs(account: string, id: number) {
    return this.get<ApiGameLogs>(`/game/log/${account}/${id}`);
  }
  fetchGameLogsAdmin(account: string, uuid: string, id: number) {
    return this.get<ApiGameLogs>(`/game/log/${account}/${id}?uuid=${uuid}`);
  }
  fetchGameList() {
    return this.get<ApiGameGame[]>(`/game`);
  }
  fetchGameDetails(account: string) {
    return this.get<ApiGameDetail>(`/game/${account}`);
  }

  fetchGameChars(account: string) {
    return this.get<ApiGameChars>(`/game/chars/${account}`);
  }

  fetchSystemConfig() {
    return this.get<ApiSystemConfig>("/system/config");
  }

  fetchSystemList() {
    return this.get<ApiSystemHall[]>("/system/apCostList");
  }
  doGameLogin(token: string, account: string) {
    return this.captchaPost<void>(`/game/login/${account}`, token, null);
  }

  fetchGameListBySSE() {
    return this.sse<ApiGameGame[]>("/sse/game");
  }

  doUpdateGameConf(account: string, game: ApiGameConfig) {
    return this.post(`/game/config/${account}`, {
      config: game,
    });
  }
  doUpdateCaptcha(account: string, captcha: Record<string, unknown>) {
    return this.post(`/game/config/${account}`, {
      captcha_info: captcha,
    });
  }
  getHostServer(): IHostServer {
    return this.hostServer;
  }
}

let hostServer: IHostServer;

const apiHost = localStorage.getItem(STORAGE_KEYS.API_HOST);
if (!apiHost) {
  hostServer = API_HOST_CLOUDFLARE;
  localStorage.setItem(STORAGE_KEYS.API_HOST, JSON.stringify(hostServer));
} else {
  const tempHost = JSON.parse(apiHost);
  if (!tempHost.baseURL) {
    hostServer = API_HOST_CLOUDFLARE;
    localStorage.setItem(STORAGE_KEYS.API_HOST, JSON.stringify(hostServer));
  } else {
    hostServer = tempHost;
  }
}

const apiClient = new APIClient(hostServer);
export default apiClient;

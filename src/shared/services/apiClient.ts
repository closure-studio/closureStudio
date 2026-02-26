import { APIHostCloudflare, IHostServer } from "./host";
import { AxiosServer } from "./server";
import type {
  ApiGameLogs,
  ApiGameGame,
  ApiGameDetail,
  ApiGameConfig,
  ApiSystemConfig,
  ApiSystemHall,
} from "@/shared/types/api";

export class APIClient extends AxiosServer {
  constructor(hostServer: IHostServer) {
    super(hostServer);
  }

  saveLocalStorage() {
    localStorage.setItem("apiHost", JSON.stringify(this.hostServer));
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
  doUpdateCaptcha(account: string, captcha: any) {
    return this.post(`/game/config/${account}`, {
      captcha_info: captcha,
    });
  }
  getHostServer(): IHostServer {
    return this.hostServer;
  }
}

let hostServer: IHostServer;

const apiHost = localStorage.getItem("apiHost");
if (!apiHost) {
  hostServer = APIHostCloudflare;
  localStorage.setItem("apiHost", JSON.stringify(hostServer));
} else {
  const tempHost = JSON.parse(apiHost);
  if (!tempHost.baseURL) {
    hostServer = APIHostCloudflare;
    localStorage.setItem("apiHost", JSON.stringify(hostServer));
  } else {
    hostServer = tempHost;
  }
}

const apiClient = new APIClient(hostServer);
export default apiClient;

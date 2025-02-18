import { APIHostCloudflare, IHostServer } from "./host";
import { AxiosServer } from "./server";

export class APIClient extends AxiosServer {
  constructor(hostServer: IHostServer) {
    super(hostServer);
  }

  saveLocalStorage() {
    localStorage.setItem("apiHost", JSON.stringify(this.hostServer));
  }
  fetchGameLogs(account: string, id: number) {
    return this.get<ApiGame.GameLogs>(`/game/log/${account}/${id}`);
  }
  fetchGameLogsAdmin(account: string, uuid: string, id: number) {
    return this.get<ApiGame.GameLogs>(
      `/game/log/${account}/${id}?uuid=${uuid}`
    );
  }
  fetchGameList() {
    return this.get<ApiGame.Game[]>(`/game`); // GameList
  }
  fetchGameDetails(account: string) {
    return this.get<ApiGame.Detail>(`/game/${account}`);
  }

  fetchSystemConfig() {
    return this.get<ApiSystem.Config>("/system/config");
  }

  fetchSystemList() {
    return this.get<ApiSystem.Hall[]>("/system/apCostList");
  }
  doGameLogin(token: string, account: string) {
    return this.captchaPost<void>(`/game/login/${account}`, token, null); // GameLogin
  }

  fetchGameListBySSE() {
    return this.sse<ApiGame.Game[]>("/sse/game"); // 实验性获取 GameList
  }

  doUpdateGameConf(account: string, game: ApiGame.Config) {
    return this.post(`/game/config/${account}`, {
      config: game,
    });
  }
  doUpdateCaptcha(account: string, captcha: any) {
    return this.post(`/game/config/${account}`, {
      captcha_info: captcha,
    });
  }
}

let hostServer: IHostServer;

const apiHost = localStorage.getItem("apiHost");
if (!apiHost) {
  hostServer = APIHostCloudflare;
  // save to localStorage
  localStorage.setItem("apiHost", JSON.stringify(hostServer));
} else {
  const tempHost = JSON.parse(apiHost);
  if (!tempHost.baseURL) {
    hostServer = APIHostCloudflare;
    // save to localStorage
    localStorage.setItem("apiHost", JSON.stringify(hostServer));
  } else {
    hostServer = tempHost;
  }
}

const apiClient = new APIClient(hostServer);
export default apiClient;

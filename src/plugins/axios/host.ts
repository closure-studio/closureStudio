export interface IHostServer {
  label: string;
  description: string;
  baseURL: string;
}

export const APIHostLTSC: IHostServer = {
  label: "国内镜像",
  description: "LTSC API Server",
  baseURL: "https://api.ltsc.vip",
};

export const APIHostCloudflare: IHostServer = {
  label: "海外镜像",
  description: "Cloudflare API Server",
  baseURL: "https://api-tunnel.arknights.app",
};

export const AuthServer: IHostServer = {
  label: "认证系统",
  description: "Auth Server",
  baseURL: "https://passport.ltsc.vip/api/v1",
};

export const RegistryServer: IHostServer = {
  label: "授权系统",
  description: "Registry Server",
  baseURL: "https://registry.ltsc.vip",
};

export const TicketsServer: IHostServer = {
  label: "工单系统",
  description: "Tickets Server",
  baseURL: "https://ticket.arknights.app",
};

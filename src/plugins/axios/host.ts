export interface HostServer {
  label: string;
  description: string;
  baseURL: string;
}

export const APIHostLTSC: HostServer = {
  label: "国内镜像",
  description: "LTSC API Server",
  baseURL: "https://api.ltsc.vip",
};

export const APIHostCloudflare: HostServer = {
  label: "海外镜像",
  description: "Cloudflare API Server",
  baseURL: "https://api-tunnel.arknights.app",
};

export const AuthServer: HostServer = {
  label: "认证系统",
  description: "Auth Server",
  baseURL: "https://passport.ltsc.vip/api/v1",
};

export const RegistryServer: HostServer = {
  label: "授权系统",
  description: "Registry Server",
  baseURL: "https://registry.ltsc.vip",
};

export interface IHostServer {
  label: string;
  description: string;
  baseURL: string;
}

export const ASSET_HOST = "https://assets.ltsc.vip";
export const ARK_RESOURCE_DOMAIN = "https://ark-resource.arknights.app";
export const VERSION_API_URL = "https://closure-studio-version-api.arknights.app";

export const API_HOST_LTSC: IHostServer = {
  label: "国内镜像",
  description: "LTSC API Server",
  baseURL: "https://api.ltsc.vip",
};

export const API_HOST_CLOUDFLARE: IHostServer = {
  label: "海外镜像",
  description: "Cloudflare API Server",
  baseURL: "https://api-tunnel.arknights.app",
};

export const AUTH_SERVER: IHostServer = {
  label: "认证系统",
  description: "Auth Server",
  baseURL: "https://passport.ltsc.vip/api/v1",
};

export const REGISTRY_SERVER: IHostServer = {
  label: "授权系统",
  description: "Registry Server",
  baseURL: "https://arkquota-tunnel.arknights.app",
};

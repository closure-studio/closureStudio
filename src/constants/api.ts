import type { HealthRecord } from "@/shared/types/api";

export interface IHostServer {
  label: string;
  description: string;
  baseURL: string;
}

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

export const QQBOT_SERVER: IHostServer = {
  label: "QQ机器人",
  description: "QQ Bot Server",
  baseURL: "http://qqbot.arknights.app",
};

export const API_RESPONSE_CODE = {
  FAILURE: 0,
  SUCCESS: 1,
  ALREADY_BOUND: 2,
} as const;

export const DEFAULT_REQUEST_ERROR_CODE = "DEFAULT";
export const DEFAULT_REQUEST_ERROR_MSG = "请求错误~";

export const REQUEST_TIMEOUT_CODE = "ECONNABORTED";
export const REQUEST_TIMEOUT_MSG = "请求超时~";

export const NETWORK_ERROR_CODE = "NETWORK_ERROR";
export const NETWORK_ERROR_MSG = "网络不可用~";

export const ERROR_STATUS = {
  400: "400: 请求出现语法错误~",
  401: "401: 用户未授权~",
  403: "403: 服务器拒绝访问~",
  404: "404: 请求的资源不存在~",
  405: "405: 请求方法未允许~",
  408: "408: 网络请求超时~",
  500: "500: 服务器内部错误~",
  501: "501: 服务器未实现请求功能~",
  502: "502: 错误网关~",
  503: "503: 服务不可用~",
  504: "504: 网关超时~",
  505: "505: http版本不支持该请求~",
  [DEFAULT_REQUEST_ERROR_CODE]: DEFAULT_REQUEST_ERROR_MSG,
};

const GAME_MANAGEMENT_HEALTH_BADGE_URL =
  "https://status.ltsc.vip/monitor/clnzoxcy10001vy2ohi4obbi0/cm50pgv0r01fc38mwr7zski3d/badge.svg";

export const API_HEALTH_RECORDS: HealthRecord = {
  游戏管理: GAME_MANAGEMENT_HEALTH_BADGE_URL,
  主控中心:
    "https://status.ltsc.vip/monitor/clnzoxcy10001vy2ohi4obbi0/cm4zsgrx4000138mwl7ukyby9/badge.svg",
  智能问答:
    "https://status.ltsc.vip/monitor/clnzoxcy10001vy2ohi4obbi0/cm26f9i8q00jl12my7b07xgql/badge.svg",
  工单系统:
    "https://status.ltsc.vip/monitor/clnzoxcy10001vy2ohi4obbi0/cm26dqjw3001d12myw9rdumtk/badge.svg",
  消息推送:
    "https://status.ltsc.vip/monitor/clnzoxcy10001vy2ohi4obbi0/cm2alu1bv00dr7x57sl8933m5/badge.svg",
  QQ机器人:
    "https://status.ltsc.vip/monitor/clnzoxcy10001vy2ohi4obbi0/cm50sb1hg01oe38mwpfhg4sza/badge.svg",
  授权服务: GAME_MANAGEMENT_HEALTH_BADGE_URL,
};

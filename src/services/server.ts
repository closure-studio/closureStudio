import type { AxiosInstance } from "axios";
import axios from "axios";
import type { IHostServer } from "@/constants/api";
import { STORAGE_KEYS } from "@/constants/app";
import type { RequestResult } from "@/shared/types/service";

const version = import.meta.env.VITE_APP_VERSION;

type RequestMethod = "get" | "post" | "put" | "delete" | "patch";
interface RequestParam {
  url: string;
  method: RequestMethod;
  data?: unknown;
  token?: string;
  isSSE?: boolean;
}

export class AxiosServer {
  service: AxiosInstance;
  hostServer: IHostServer;

  constructor(hostServer: IHostServer) {
    this.hostServer = hostServer;
    this.service = axios.create({
      baseURL: this.hostServer.baseURL,
    });

    // 懒加载 token，避免模块顶层读取 localStorage
    const token = this.getStoredToken();
    if (token) {
      this.service.defaults.headers.common["Authorization"] = "Bearer " + token;
    }

    this.service.interceptors.response.use((response) => response.data);
  }

  private getStoredToken(): string | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      if (!raw) return null;
      return JSON.parse(raw)?.user?.Token ?? null;
    } catch {
      return null;
    }
  }

  setJWT(token: string) {
    this.service.defaults.headers.common["Authorization"] = "Bearer " + token;
  }

  getHostServer() {
    return this.hostServer;
  }

  setHostServer(hostServer: IHostServer) {
    this.hostServer = hostServer;
    this.service.defaults.baseURL = hostServer.baseURL;
  }

  async asyncRequest<T>(param: RequestParam): Promise<RequestResult<T>> {
    const { url } = param;

    if (param.token) {
      this.service.defaults.headers["X-Platform"] = "postman";
      this.service.defaults.headers["token"] = param.token;
    } else {
      delete this.service.defaults.headers["X-Platform"];
      delete this.service.defaults.headers["token"];
    }
    if (param.isSSE) {
      this.service.defaults.headers["Accept"] = "text/event-stream";
    } else {
      delete this.service.defaults.headers["Accept"];
    }
    const method = param.method || "get";

    let res: unknown;
    if (method === "get") {
      res = await this.service.get(url);
    } else if (method === "delete") {
      res = await this.service.delete(url, { data: param.data });
    } else {
      res = await this.service[method](url, param.data);
    }

    return res as RequestResult<T>;
  }

  put<T>(url: string, data?: unknown) {
    return this.asyncRequest<T>({ url, method: "put", data });
  }
  post<T>(url: string, data?: unknown) {
    return this.asyncRequest<T>({ url, method: "post", data });
  }
  patch<T>(url: string, data?: unknown) {
    return this.asyncRequest<T>({ url, method: "patch", data });
  }
  get<T>(url: string) {
    return this.asyncRequest<T>({ url, method: "get" });
  }
  async load<T>(fileName: string): Promise<T> {
    const url = `/data/${fileName}.json?v=${version}`;
    const response = await axios.get(url);
    return response.data as T;
  }

  captchaGet<T>(url: string, token: string, data?: unknown) {
    return this.asyncRequest<T>({ url, method: "get", token, data });
  }
  captchaPost<T>(url: string, token: string, data?: unknown) {
    return this.asyncRequest<T>({ url, method: "post", token, data });
  }
  captchaDelete<T>(url: string, token: string, data?: unknown) {
    return this.asyncRequest<T>({ url, method: "delete", token, data });
  }
}

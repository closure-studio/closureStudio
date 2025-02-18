import type { AxiosInstance } from "axios";
import axios from "axios";
import { HostServer, RegistryServer } from "./host";

const user = localStorage.getItem("closureV3_user");

type RequestMethod = "get" | "post" | "put" | "delete" | "patch";
interface RequestParam {
  url: string;
  method: RequestMethod;
  data?: any;
  token?: string;
  isSSE?: boolean;
}

export class AxiosServer {
  service: AxiosInstance;
  hostServer: HostServer;
  constructor(hostServer: HostServer) {
    this.hostServer = hostServer;
    this.service = axios.create({
      baseURL: this.hostServer.baseURL,
    });
    if (user != null) {
      this.service.defaults.headers.common["Authorization"] =
        "Bearer " + JSON.parse(user)?.user?.Token;
    }

    this.service.interceptors.response.use((response) => {
      const requestUrl = response.config?.baseURL
        ? new URL(response.config.url!, response.config.baseURL)
        : new URL(response.config.url!);

      switch (this.hostServer.baseURL) {
        case RegistryServer.baseURL:
          const code = this.buildCodeFromRegisterResp(response);
          const data: any = {
            message:
              code === 0
                ? response.data.err
                  ? response.data.err
                  : "大失败"
                : "成功",
            code: this.buildCodeFromRegisterResp(response),
            data: response.data,
          };
          return data;
        default:
          return response.data;
      }
    });
  }
  setHostServer(hostServer: HostServer) {
    this.hostServer = hostServer;
    this.service.defaults.baseURL = hostServer.baseURL;
  }

  buildCodeFromRegisterResp(resp: any): number {
    if (!resp.data.err && !resp.data.code) return 1;
    return resp.data.err || resp.data.code != 1
      ? 0 // If there is an error, code is 0
      : resp.data.available &&
        resp.data.results !== undefined &&
        resp.data.results !== null
      ? 1 // If available is true and results are valid, code is 1
      : resp.data.code ?? 0; // Otherwise, use the provided code or default to 0
  }

  async getRequestResponse(params: {
    instance: AxiosInstance;
    method: RequestMethod;
    url: string;
    data?: any;
  }) {
    const { instance, method, url, data } = params;
    let res: any;
    if (method === "get" || method === "delete") {
      res = await instance[method](url);
    } else {
      res = await instance[method](url, data);
    }
    return res;
  }

  async asyncRequest<T>(
    param: RequestParam
  ): Promise<Service.RequestResult<T>> {
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
    const res = (await this.getRequestResponse({
      instance: this.service,
      method,
      url,
      data: param.data,
    })) as Service.RequestResult<T>;

    return res;
  }

  put<T>(url: string, data?: any) {
    return this.asyncRequest<T>({ url, method: "put", data });
  }
  post<T>(url: string, data?: any) {
    return this.asyncRequest<T>({ url, method: "post", data });
  }
  patch<T>(url: string, data?: any) {
    return this.asyncRequest<T>({ url, method: "patch", data });
  }
  get<T>(url: string) {
    return this.asyncRequest<T>({ url, method: "get" });
  }
  del(url: string, params: any) {
    return new Promise((resolve) => {
      this.service.delete(url, { data: params }).then((res) => {
        resolve(res);
      });
    });
  }

  captchaGet<T>(url: string, token: string, data?: any) {
    return this.asyncRequest<T>({ url, method: "get", token, data });
  }
  captchaPost<T>(url: string, token: string, data?: any) {
    return this.asyncRequest<T>({ url, method: "post", token, data });
  }
  sse<T>(url: string) {
    return this.asyncRequest<T>({ url, method: "get", isSSE: true });
  }
}

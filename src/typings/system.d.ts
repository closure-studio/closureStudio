/** 请求的相关类型 */

declare namespace Service {
  /**
   * 请求的错误类型：
   * - axios: axios错误：网络错误, 请求超时, 默认的兜底错误
   * - http: 请求成功，响应的http状态码非200的错误
   * - backend: 请求成功，响应的http状态码为200，由后端定义的业务错误
   */
  type RequestErrorType = "axios" | "http" | "backend";

  /** 请求错误 */
  interface RequestError {
    /** 请求服务的错误类型 */
    type: RequestErrorType;
    /** 错误码 */
    code: string | number;
    /** 错误信息 */
    msg: string;
  }

  interface AxiosResult<T> {
    error?: null;
    data: T;
    message: string;
    code: number;
  }
  
  type RequestResult<T> = AxiosResult<T>;
  
}

declare namespace Gamedata {
  interface Stage {
    name: string;
    code: string;
    ap: number;
    items: string[];
  }

  interface Stages {
    [key: string]: Stage;
  }

  interface Items {
    [key: string]: Item;
  }

  interface Item {
    name: string;
    icon: string;
  }
}
interface Window {
  grecaptcha: {
    ready: (callback: () => void) => void;
    execute: (sitekey: string, options: { action: string }) => Promise<string>;
    render: (
      id: string,
      options: { sitekey: string; callback: (token: string) => void }
    ) => void;
    reset: (id: string) => void;
  };
  initGeetest4: (options: any, handle: any) => void;
  initGeetest: (options: any, handle: any) => void;
  captchaObj: {
    verify: () => void;
    onReady: (callback: () => void) => void;
    onRefresh: (callback: () => void) => void;
    onError: (callback: () => void) => void;
    onSuccess: (callback: () => void) => void;
    appendTo: (id: string) => any;
    getValidate: () => any;
    showCaptcha: () => void;
  };
}

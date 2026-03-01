// ============================================================
// 请求/服务 类型定义 — 从 src/typings/system.d.ts 迁移
// ============================================================

/**
 * 请求的错误类型：
 * - axios: axios错误：网络错误, 请求超时, 默认的兜底错误
 * - http: 请求成功，响应的http状态码非200的错误
 * - backend: 请求成功，响应的http状态码为200，由后端定义的业务错误
 */
export type RequestErrorType = "axios" | "http" | "backend";

/** 请求错误 */
export interface RequestError {
  /** 请求服务的错误类型 */
  type: RequestErrorType;
  /** 错误码 */
  code: string | number;
  /** 错误信息 */
  msg: string;
}

export interface AxiosResult<T> {
  error?: null;
  data: T;
  message: string;
  code: number;
}

export type RequestResult<T> = AxiosResult<T>;

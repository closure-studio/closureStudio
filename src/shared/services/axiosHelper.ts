import type { AxiosError } from "axios";
import type { RequestError } from "@/shared/types/service";
import {
  DEFAULT_REQUEST_ERROR_CODE,
  DEFAULT_REQUEST_ERROR_MSG,
  ERROR_STATUS,
  NETWORK_ERROR_CODE,
  NETWORK_ERROR_MSG,
  REQUEST_TIMEOUT_CODE,
  REQUEST_TIMEOUT_MSG,
} from "@/shared/constants/config";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";

type ErrorStatus = keyof typeof ERROR_STATUS;

type StrategyAction = [boolean, () => void];

export function exeStrategyActions(actions: StrategyAction[]) {
  actions.some((item) => {
    const [flag, action] = item;
    if (flag) action();
    return flag;
  });
}

export function handleAxiosError(axiosError: AxiosError) {
  const error: RequestError = {
    type: "axios",
    code: DEFAULT_REQUEST_ERROR_CODE,
    msg: DEFAULT_REQUEST_ERROR_MSG,
  };
  const actions: StrategyAction[] = [
    [
      !window.navigator.onLine || axiosError.message === "Network Error",
      () => {
        Object.assign(error, {
          code: NETWORK_ERROR_CODE,
          msg: NETWORK_ERROR_MSG,
        });
      },
    ],
    [
      axiosError.code === REQUEST_TIMEOUT_CODE && axiosError.message.includes("timeout"),
      () => {
        Object.assign(error, {
          code: REQUEST_TIMEOUT_CODE,
          msg: REQUEST_TIMEOUT_MSG,
        });
      },
    ],
    [
      Boolean(axiosError.response),
      () => {
        const errorCode: ErrorStatus = (axiosError.response?.status as ErrorStatus) || "DEFAULT";
        const msg = ERROR_STATUS[errorCode];
        Object.assign(error, { code: errorCode, msg });
      },
    ],
  ];
  exeStrategyActions(actions);
  setMsg(error.msg, Type.Warning);
  return error;
}

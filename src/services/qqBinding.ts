import { API_RESPONSE_CODE } from "@/constants/api";
import authClient from "@/services/authClient";

export const QQ_BINDING_STATUS = {
  UNBOUND: "unbound",
  BOUND: "bound",
} as const;

export type QQBindingState =
  | {
      status: typeof QQ_BINDING_STATUS.UNBOUND;
      verificationCode: string;
    }
  | {
      status: typeof QQ_BINDING_STATUS.BOUND;
      verificationCode: null;
    };

export const fetchQQBindingState = async (): Promise<QQBindingState> => {
  const response = await authClient.fetchQQBindCode();

  if (response.code === API_RESPONSE_CODE.SUCCESS) {
    return {
      status: QQ_BINDING_STATUS.UNBOUND,
      verificationCode: `verifyCode:${response.data}`,
    };
  }

  if (response.code === API_RESPONSE_CODE.ALREADY_BOUND) {
    return {
      status: QQ_BINDING_STATUS.BOUND,
      verificationCode: null,
    };
  }

  throw new Error(response.message || "获取 QQ 绑定状态失败");
};

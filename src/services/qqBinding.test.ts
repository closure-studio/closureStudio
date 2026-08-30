jest.mock("@/services/authClient", () => ({
  __esModule: true,
  default: {
    fetchQQBindCode: jest.fn(),
  },
}));

import authClient from "@/services/authClient";
import { fetchQQBindingState, QQ_BINDING_STATUS } from "@/services/qqBinding";

const mockedFetchQQBindCode = authClient.fetchQQBindCode as jest.MockedFunction<
  typeof authClient.fetchQQBindCode
>;

describe("QQ binding state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("未绑定时返回带 verifyCode 前缀的验证码", async () => {
    mockedFetchQQBindCode.mockResolvedValue({
      code: 1,
      data: "abc123",
      message: "ok",
    });

    await expect(fetchQQBindingState()).resolves.toEqual({
      status: QQ_BINDING_STATUS.UNBOUND,
      verificationCode: "verifyCode:abc123",
    });
  });

  test("已绑定时返回绑定完成状态", async () => {
    mockedFetchQQBindCode.mockResolvedValue({
      code: 2,
      data: "",
      message: "already bound",
    });

    await expect(fetchQQBindingState()).resolves.toEqual({
      status: QQ_BINDING_STATUS.BOUND,
      verificationCode: null,
    });
  });

  test("业务失败时抛出后端错误信息", async () => {
    mockedFetchQQBindCode.mockResolvedValue({
      code: 0,
      data: "",
      message: "request failed",
    });

    await expect(fetchQQBindingState()).rejects.toThrow("request failed");
  });

  test("网络错误向调用方透传", async () => {
    mockedFetchQQBindCode.mockRejectedValue(new Error("network error"));

    await expect(fetchQQBindingState()).rejects.toThrow("network error");
  });
});

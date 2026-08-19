const mockStartCaptcha = jest.fn();
const mockCreateGame = jest.fn();
const mockDeleteGame = jest.fn();

jest.mock("@/services/captcha", () => ({
  __esModule: true,
  startCaptcha: mockStartCaptcha,
}));

jest.mock("@/services/apiClient", () => ({
  __esModule: true,
  default: {
    createGame: mockCreateGame,
    deleteGame: mockDeleteGame,
    doGameLogin: jest.fn(),
  },
}));

import { useCaptcha } from "./captchaActions";

const successResponse = { code: 1, data: undefined, message: "ok" };

describe("captchaActions game password update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStartCaptcha.mockImplementation(async (callback: (token: string) => unknown) =>
      callback("captcha-token")
    );
    mockDeleteGame.mockResolvedValue(successResponse);
    mockCreateGame.mockResolvedValue(successResponse);
  });

  test("先删除完整账号，再通过验证码重新创建", async () => {
    const captcha = useCaptcha();
    const form = { account: " 123456 ", password: "new-secret", platform: 1 };

    await expect(captcha.updateGamePassword(form)).resolves.toEqual(successResponse);

    expect(mockDeleteGame).toHaveBeenCalledWith("", "G123456");
    expect(mockStartCaptcha).toHaveBeenCalledTimes(1);
    expect(mockCreateGame).toHaveBeenCalledWith("captcha-token", {
      account: "123456",
      password: "new-secret",
      platform: 1,
    });
  });

  test("删除失败时不重新创建游戏", async () => {
    const deleteResponse = { code: 0, data: undefined, message: "delete failed" };
    mockDeleteGame.mockResolvedValue(deleteResponse);
    const captcha = useCaptcha();

    await expect(
      captcha.updateGamePassword({ account: "123456", password: "new-secret", platform: 2 })
    ).resolves.toEqual(deleteResponse);

    expect(mockStartCaptcha).not.toHaveBeenCalled();
    expect(mockCreateGame).not.toHaveBeenCalled();
  });
});

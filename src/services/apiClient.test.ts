const mockCaptchaPost = jest.fn();
const mockCaptchaDelete = jest.fn();

jest.mock("./server", () => ({
  __esModule: true,
  AxiosServer: class {
    hostServer: unknown;
    captchaPost = mockCaptchaPost;
    captchaDelete = mockCaptchaDelete;

    constructor(hostServer: unknown) {
      this.hostServer = hostServer;
    }
  },
}));

import { APIClient } from "./apiClient";

const hostServer = {
  label: "Arkhost",
  description: "test",
  baseURL: "https://arkhost.example",
};

describe("APIClient Arkhost game mutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createGame 使用 POST /game 和原始账号表单", async () => {
    const response = { code: 1, data: undefined, message: "ok" };
    mockCaptchaPost.mockResolvedValue(response);
    const client = new APIClient(hostServer);
    const form = { account: "123456", password: "secret", platform: 1 };

    await expect(client.createGame("captcha-token", form)).resolves.toEqual(response);

    expect(mockCaptchaPost).toHaveBeenCalledWith("/game", "captcha-token", form);
  });

  test("deleteGame 使用 DELETE /game/:account", async () => {
    const response = { code: 1, data: undefined, message: "ok" };
    mockCaptchaDelete.mockResolvedValue(response);
    const client = new APIClient(hostServer);

    await expect(client.deleteGame("captcha-token", "G123456")).resolves.toEqual(response);

    expect(mockCaptchaDelete).toHaveBeenCalledWith("/game/G123456", "captcha-token");
  });
});

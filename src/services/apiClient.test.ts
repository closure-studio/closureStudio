const mockCaptchaPost = jest.fn();
const mockCaptchaDelete = jest.fn();
const mockPost = jest.fn();

jest.mock("./server", () => ({
  __esModule: true,
  AxiosServer: class {
    hostServer: unknown;
    captchaPost = mockCaptchaPost;
    captchaDelete = mockCaptchaDelete;
    post = mockPost;

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

  test("doUpdateGameConf 使用 config 包裹配置 patch", async () => {
    const response = { code: 1, data: null, message: "ok" };
    mockPost.mockResolvedValue(response);
    const client = new APIClient(hostServer);
    const config = {
      battle_tasks: [],
      keeping_ap: 0,
      recruit_reserve: 0,
      recruit_ignore_robot: false,
      enable_building_arrange: false,
      is_auto_battle: false,
    };

    await expect(client.doUpdateGameConf("G123456", config)).resolves.toEqual(response);

    expect(mockPost).toHaveBeenCalledWith("/game/config/G123456", { config });
  });
});

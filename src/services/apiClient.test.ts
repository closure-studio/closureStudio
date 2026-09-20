const mockCaptchaPost = jest.fn();
const mockCaptchaDelete = jest.fn();
const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock("./server", () => ({
  __esModule: true,
  AxiosServer: class {
    hostServer: unknown;
    captchaPost = mockCaptchaPost;
    captchaDelete = mockCaptchaDelete;
    post = mockPost;
    get = mockGet;

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

  test("createGame 使用 POST /game/ 和原始账号表单", async () => {
    const response = { code: 1, data: undefined, message: "ok" };
    mockCaptchaPost.mockResolvedValue(response);
    const client = new APIClient(hostServer);
    const form = { account: "123456", password: "secret", platform: 1 };

    await expect(client.createGame("captcha-token", form)).resolves.toEqual(
      response,
    );

    expect(mockCaptchaPost).toHaveBeenCalledWith(
      "/game/",
      "captcha-token",
      form,
    );
  });

  test("deleteGame 使用 DELETE /game/:account", async () => {
    const response = { code: 1, data: undefined, message: "ok" };
    mockCaptchaDelete.mockResolvedValue(response);
    const client = new APIClient(hostServer);

    await expect(
      client.deleteGame("captcha-token", "G123456"),
    ).resolves.toEqual(response);

    expect(mockCaptchaDelete).toHaveBeenCalledWith(
      "/game/G123456",
      "captcha-token",
    );
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

    await expect(client.doUpdateGameConf("G123456", config)).resolves.toEqual(
      response,
    );

    expect(mockPost).toHaveBeenCalledWith("/game/config/G123456", { config });
  });

  test("登录仅提交任务，暂停使用无 Body 的独立接口", async () => {
    const client = new APIClient(hostServer);
    await client.doGameLogin("captcha-token", "Guser/name");
    await client.doGamePause("Guser/name");
    expect(mockCaptchaPost).toHaveBeenCalledWith(
      "/game/login/Guser%2Fname",
      "captcha-token",
    );
    expect(mockPost).toHaveBeenCalledWith("/game/pause/Guser%2Fname");
  });

  test("培养计划提交完整数组并保留 config 外层，清空传 []", async () => {
    const client = new APIClient(hostServer);
    const task = {
      char_id: "char_103_angel",
      target: { evolve_phase: 2 as const, level: 80, skill_level: 7 as const, masteries: [] },
    };
    await client.doUpdateGameConf("Guser/name", { operator_development_tasks: [task] });
    expect(mockPost).toHaveBeenLastCalledWith("/game/config/Guser%2Fname", {
      config: { operator_development_tasks: [task] },
    });
    await client.doUpdateGameConf("Guser/name", { operator_development_tasks: [] });
    expect(mockPost).toHaveBeenLastCalledWith("/game/config/Guser%2Fname", {
      config: { operator_development_tasks: [] },
    });
  });

  test("干员来自详情中以实例 ID 为 key 的 troop.chars", async () => {
    const char = {
      charId: "char_103_angel",
      level: 80,
      evolvePhase: 2,
      potentialRank: 1,
      currentTmpl: "template",
      skills: [{ skillId: "skill", unlock: true, specializeLevel: 3 }],
    };
    mockGet.mockResolvedValue({
      code: 1,
      data: { troop: { chars: { "42": char } } },
      message: "ok",
    });
    const response = await new APIClient(hostServer).fetchGameChars(
      "Guser/name",
    );
    expect(mockGet).toHaveBeenCalledWith("/game/Guser%2Fname");
    expect(response).toEqual({
      code: 1,
      data: { chars: [char], total: 1 },
      message: "ok",
    });
  });

  test("无干员返回空列表，业务失败保留 code 和 message", async () => {
    const client = new APIClient(hostServer);
    mockGet.mockResolvedValue({
      code: 1,
      data: { troop: { chars: {} } },
      message: "ok",
    });
    expect((await client.fetchGameChars("G123")).data).toEqual({
      chars: [],
      total: 0,
    });
    mockGet.mockResolvedValue({ code: 0, data: null, message: "forbidden" });
    expect(await client.fetchGameChars("G123")).toMatchObject({
      code: 0,
      message: "forbidden",
    });
  });

  test("配置 patch 仅包含传入字段，空作战数组保持清空语义", async () => {
    const client = new APIClient(hostServer);
    await client.doUpdateGameConf("G123", { accelerate_slot: "slot_14" });
    expect(mockPost).toHaveBeenLastCalledWith("/game/config/G123", {
      config: { accelerate_slot: "slot_14" },
    });
    await client.doUpdateGameConf("G123", { battle_tasks: [] });
    expect(mockPost).toHaveBeenLastCalledWith("/game/config/G123", {
      config: { battle_tasks: [] },
    });
  });

  test.each([undefined, null, "", "  "])(
    "验证码 challenge %p 不发送请求",
    async (challenge) => {
      await expect(
        new APIClient(hostServer).doUpdateCaptcha("G123", { challenge }),
      ).rejects.toThrow("challenge");
      expect(mockPost).not.toHaveBeenCalled();
    },
  );

  test("验证码只提交 captcha_info 外层", async () => {
    const captcha = { challenge: "challenge", geetest_validate: "validated" };
    await new APIClient(hostServer).doUpdateCaptcha("G123", captcha);
    expect(mockPost).toHaveBeenCalledWith("/game/config/G123", {
      captcha_info: captcha,
    });
  });
});

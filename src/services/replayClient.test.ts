jest.mock("./apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    doUpdateGameConf: jest.fn(),
  },
}));

import apiClient from "./apiClient";
import { replayApi } from "./replayClient";

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("replayClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listReplays 拼装 query 参数", async () => {
    mockedApiClient.get.mockResolvedValue({
      code: 1,
      data: [],
      message: "ok",
    });

    await replayApi.listReplays({
      page: 2,
      limit: 10,
      stage_id: "main_01-07",
      mine: true,
      account: "demo-account",
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      "/game/replays?page=2&limit=10&stage_id=main_01-07&mine=true&account=demo-account"
    );
  });

  test("appendReplayActions 通过游戏配置接口追加动作", async () => {
    mockedApiClient.doUpdateGameConf.mockResolvedValue({
      code: 1,
      data: null,
      message: "ok",
    });

    await replayApi.appendReplayActions("demo-account", [
      {
        stage_id: "main_01-07",
        uuid: "",
        action_type: "SHARE",
      },
    ]);

    expect(mockedApiClient.doUpdateGameConf).toHaveBeenCalledWith("demo-account", {
      battle_replay_actions: [
        {
          stage_id: "main_01-07",
          uuid: "",
          action_type: "SHARE",
        },
      ],
    });
  });

  test("listAutoResults 使用账号路径和分页参数", async () => {
    mockedApiClient.get.mockResolvedValue({
      code: 1,
      data: [],
      message: "ok",
    });

    await replayApi.listAutoResults("demo-account", {
      page: 3,
      limit: 5,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      "/game/replays/autoResults/demo-account?page=3&limit=5"
    );
  });
});

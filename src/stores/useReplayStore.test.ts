jest.mock("@/services/replayClient", () => ({
  __esModule: true,
  replayApi: {
    listReplays: jest.fn(),
    updateReplay: jest.fn(),
    appendReplayActions: jest.fn(),
    listAutoResults: jest.fn(),
  },
}));

jest.mock("@/utils/toast", () => ({
  __esModule: true,
  setMsg: jest.fn(),
}));

import { createPinia, setActivePinia } from "pinia";
import { replayApi } from "@/services/replayClient";
import { setMsg } from "@/utils/toast";
import { useReplayStore } from "./useReplayStore";
import type { ReplayAutoResult, ReplayRecord } from "@/shared/types/replay";

const mockedReplayApi = replayApi as jest.Mocked<typeof replayApi>;
const mockedSetMsg = setMsg as jest.MockedFunction<typeof setMsg>;

function createReplay(overrides: Partial<ReplayRecord> = {}): ReplayRecord {
  return {
    uuid: "replay-1",
    stage_id: "main_01-07",
    title: "测试录像",
    description: "测试描述",
    avatar: {
      type: "ICON",
      id: "char_1001_amiya2",
    },
    validation_status: "PASSED",
    validation_message: "执行成功",
    audit_status: "APPROVED",
    audit_message: "审核通过",
    is_hidden: false,
    created_at: 1710000000,
    updated_at: 1710000000,
    validated_at: 1710000000,
    audited_at: 1710000000,
    ...overrides,
  };
}

function createAutoResult(overrides: Partial<ReplayAutoResult> = {}): ReplayAutoResult {
  return {
    id: 1,
    user_uuid: "user-1",
    account: "demo-account",
    replay_record_id: 10,
    replay_uuid: "replay-1",
    stage_id: "main_01-07",
    result: "SUCCESS",
    message: "执行成功",
    created_at: 1710000000,
    ...overrides,
  };
}

describe("useReplayStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  test("公开列表支持加载更多并按返回条数更新 hasMore", async () => {
    mockedReplayApi.listReplays
      .mockResolvedValueOnce({
        code: 1,
        data: [createReplay(), createReplay({ uuid: "replay-2" })],
        message: "ok",
      })
      .mockResolvedValueOnce({
        code: 1,
        data: [createReplay({ uuid: "replay-3" })],
        message: "ok",
      });

    const store = useReplayStore();

    await store.fetchPublicReplays("main_01-07", 2);
    await store.fetchMorePublicReplays(2);

    expect(store.publicReplays.map((item) => item.uuid)).toEqual([
      "replay-1",
      "replay-2",
      "replay-3",
    ]);
    expect(store.publicPage).toBe(2);
    expect(store.publicHasMore).toBe(false);
    expect(mockedReplayApi.listReplays).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 2,
      stage_id: "main_01-07",
    });
    expect(mockedReplayApi.listReplays).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 2,
      stage_id: "main_01-07",
    });
  });

  test("updateReplay 会回写我的列表，并在隐藏时从公开列表移除", async () => {
    mockedReplayApi.updateReplay.mockResolvedValue({
      code: 1,
      data: createReplay({
        title: "更新后的标题",
        is_hidden: true,
      }),
      message: "ok",
    });

    const store = useReplayStore();
    store.myReplays = [createReplay()];
    store.publicReplays = [createReplay()];

    await store.updateReplay("replay-1", {
      title: "更新后的标题",
      is_hidden: true,
    });

    expect(store.myReplays[0]?.title).toBe("更新后的标题");
    expect(store.myReplays[0]?.is_hidden).toBe(true);
    expect(store.publicReplays).toEqual([]);
    expect(mockedSetMsg).toHaveBeenCalledWith("录像信息已更新", expect.anything());
  });

  test("enqueueAutoBattleAction 会追加动作并刷新自动作战结果", async () => {
    mockedReplayApi.appendReplayActions.mockResolvedValue({
      code: 1,
      data: null,
      message: "ok",
    });
    mockedReplayApi.listAutoResults.mockResolvedValue({
      code: 1,
      data: [createAutoResult()],
      message: "ok",
    });

    const store = useReplayStore();
    const replay = createReplay();

    await store.enqueueAutoBattleAction("demo-account", replay);

    expect(mockedReplayApi.appendReplayActions).toHaveBeenCalledWith("demo-account", [
      {
        stage_id: "main_01-07",
        uuid: "replay-1",
        action_type: "AUTO_BATTLE",
      },
    ]);
    expect(mockedReplayApi.listAutoResults).toHaveBeenCalledWith("demo-account", {
      page: 1,
      limit: 20,
    });
    expect(store.autoResults).toHaveLength(1);
    expect(mockedSetMsg).toHaveBeenCalledWith("自动作战动作已追加", expect.anything());
  });
});

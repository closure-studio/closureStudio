jest.mock("@/services/apiClient", () => ({
  __esModule: true,
  default: {
    fetchGameList: jest.fn(),
    fetchGameChars: jest.fn(),
    doUpdateGameConf: jest.fn(),
    doGamePause: jest.fn(),
    getHostServer: jest.fn(),
  },
}));

jest.mock("@/services/captcha", () => ({
  __esModule: true,
  arknightsGameCaptcha: jest.fn(),
  resetCaptchaOperations: jest.fn(),
}));

jest.mock("@/utils/toast", () => ({
  __esModule: true,
  setMsg: jest.fn(),
}));

jest.mock("@/shared/components/dialog/dialog", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/components/dashboard/dialogs/NewSSRNotice.vue", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/stores/useUserStore", () => ({
  __esModule: true,
  useUserStore: jest.fn(() => ({ token: "test-token" })),
}));

import { createPinia, setActivePinia } from "pinia";
import type { ApiGameGame } from "@/shared/types/api";
import { MAX_GAME_SLOTS } from "@/constants/game";
import { useGamesStore } from "./useGamesStore";
import apiClient from "@/services/apiClient";
import { arknightsGameCaptcha } from "@/services/captcha";
import { reactive } from "vue";
import { useUserStore } from "@/stores/useUserStore";
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

function createGame(account: string): ApiGameGame {
  return {
    status: {
      account,
      password: "secret",
      platform: 1,
      uuid: `${account}-uuid`,
      code: 0,
      text: "",
      nick_name: "",
      level: 1,
      avatar: { type: "", id: "" },
      created_at: 0,
      is_verify: false,
      ap: 0,
    },
    captcha_info: { created: 0, captcha_type: "" },
    game_config: {
      account,
      accelerate_slot: "slot_14",
      battle_tasks: [],
      current_map: "",
      enable_building_arrange: false,
      is_auto_battle: false,
      is_stopped: false,
      keeping_ap: 0,
      recruit_ignore_robot: false,
      recruit_reserve: 0,
      allow_login_assist: false,
    },
  };
}

describe("验证码会话与状态", () => {
  beforeEach(() => { jest.clearAllMocks(); setActivePinia(createPinia()); });
  test("会话切换立即清理SDK与尚未建立的SSE及其定时器", async () => {
    jest.useFakeTimers();
    const user = reactive({ token: "before" });
    jest.mocked(useUserStore).mockReturnValue(user as ReturnType<typeof useUserStore>);
    const close = jest.fn();
    Object.defineProperty(globalThis, "EventSource", { configurable: true, value: jest.fn(() => ({ close })) });
    jest.mocked(apiClient.getHostServer).mockReturnValue({ baseURL: "https://example.invalid" } as ReturnType<typeof apiClient.getHostServer>);
    const store = useGamesStore();
    const pending = store.startSSE();
    user.token = "after";
    expect(close).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
    await expect(pending).resolves.toBe(false);
    store.$dispose(); Reflect.deleteProperty(globalThis, "EventSource"); jest.useRealTimers();
  });
  test("旧列表晚到不能覆盖新列表或退出后的状态", async () => {
    let finish!: (value: Awaited<ReturnType<typeof apiClient.fetchGameList>>) => void;
    jest.mocked(apiClient.fetchGameList).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const store = useGamesStore(); const old = store.queryGameList();
    jest.mocked(apiClient.fetchGameList).mockResolvedValueOnce({ code: 1, message: "", data: [createGame("new")] });
    await store.queryGameList(); finish({ code: 1, message: "", data: [createGame("old")] }); await old;
    expect(store.gameList[0].status.account).toBe("new");
    jest.mocked(apiClient.fetchGameList).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const late = store.queryGameList(); store.$reset(); finish({ code: 1, message: "", data: [createGame("old")] }); await late;
    expect(store.gameList).toEqual([]);
  });
  test("新鲜列表才确认运行中，reset释放等待计时器", async () => {
    jest.useFakeTimers();
    const game = createGame("A"); game.captcha_info = { created: 1, captcha_type: "", gt: "gt", challenge: "challenge" }; game.status.code = 2;
    jest.mocked(arknightsGameCaptcha).mockResolvedValue(undefined);
    jest.mocked(apiClient.fetchGameList).mockResolvedValue({ code: 1, data: [game], message: "" });
    const store = useGamesStore(); await store.queryGameList(); await flush();
    expect(store.captchaStates.A.phase).toBe("awaiting-status");
    await store.queryGameList(); expect(store.captchaStates.A.phase).toBe("server-running");
    store.$reset(); expect(store.captchaStates).toEqual({}); expect(jest.getTimerCount()).toBe(0); jest.useRealTimers();
  });
});

describe("useGamesStore Arkhost capacity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
  });

  test("暂停不再写入游戏配置，业务失败原样返回", async () => {
    const response = { code: 0, data: undefined, message: "pause failed" };
    jest.mocked(apiClient.doGamePause).mockResolvedValue(response);
    await expect(useGamesStore().gameSuspend("G123")).resolves.toEqual(response);
    expect(apiClient.doGamePause).toHaveBeenCalledWith("G123");
    expect(apiClient.doUpdateGameConf).not.toHaveBeenCalled();
  });

  test("干员业务失败不缓存伪造的空列表", async () => {
    jest.mocked(apiClient.fetchGameChars).mockResolvedValue({
      code: 0, data: { chars: [], total: 0 }, message: "forbidden",
    });
    const store = useGamesStore();
    await expect(store.fetchChars("G123")).resolves.toBeNull();
    expect(store.charsCache.G123).toBeUndefined();
    expect(store.isLoadingChars).toBe(false);
  });

  test("uses Arkhost game count as occupied slots and keeps games above capacity", () => {
    const store = useGamesStore();
    const games = Array.from({ length: MAX_GAME_SLOTS + 1 }, (_, index) =>
      createGame(`G${index}`)
    );

    store.updateGameList(games.slice(0, MAX_GAME_SLOTS - 1));
    expect(store.occupiedSlotCount).toBe(MAX_GAME_SLOTS - 1);
    expect(store.canCreateGame).toBe(true);

    store.updateGameList(games);
    expect(store.occupiedSlotCount).toBe(MAX_GAME_SLOTS + 1);
    expect(store.canCreateGame).toBe(false);
    expect(store.gameList).toHaveLength(MAX_GAME_SLOTS + 1);
  });
});

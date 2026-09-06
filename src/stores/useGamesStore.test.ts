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

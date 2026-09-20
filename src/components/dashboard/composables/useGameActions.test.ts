jest.mock("@/services/apiClient", () => ({ __esModule: true, default: {
  fetchGameList: jest.fn(), doUpdateCaptcha: jest.fn(), doGameLogin: jest.fn(),
} }));
jest.mock("@/utils/toast", () => ({ setMsg: jest.fn() }));
jest.mock("@/shared/components/dialog/dialog", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/components/dashboard/dialogs/CreateGame.vue", () => ({}));
jest.mock("@/components/dashboard/dialogs/GeeTestNotify.vue", () => ({}));
jest.mock("@/components/dashboard/dialogs/UpdateGamePasswd.vue", () => ({}));
jest.mock("@/components/dashboard/dialogs/NewSSRNotice.vue", () => ({}));
jest.mock("@/stores/useUserStore", () => ({ useUserStore: () => ({ token: "test" }) }));
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";
import apiClient from "@/services/apiClient";
import { setMsg } from "@/utils/toast";
import { useGamesStore } from "@/stores/useGamesStore";
import { useCaptcha } from "@/services/captchaActions";
import { useGameActions } from "./useGameActions";
import type { ApiGameGame, GameAccountForm } from "@/shared/types/api";

const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
const game = (challenge = "one"): ApiGameGame => ({
  status: { account: "A", password: "secret", platform: 1, uuid: "uuid", code: 1, text: "", nick_name: "", level: 1,
    avatar: { type: "", id: "" }, created_at: 0, is_verify: false, ap: 0 },
  captcha_info: { created: 1, captcha_type: "", gt: "gt", challenge },
  game_config: { account: "A", accelerate_slot: "slot_14", battle_tasks: [], current_map: "", enable_building_arrange: false,
    is_auto_battle: false, is_stopped: false, keeping_ap: 0, recruit_ignore_robot: false, recruit_reserve: 0, allow_login_assist: false },
});
const ok = { code: 1, message: "ok", data: undefined };
let store: ReturnType<typeof useGamesStore>;
let events: Record<string, () => void>[];
let init: jest.Mock;
let login: (account: string) => Promise<void>;
beforeEach(() => {
  jest.resetAllMocks(); setActivePinia(createPinia()); events = [];
  init = jest.fn((_config, cb) => {
    const callbacks: Record<string, () => void> = {}; events.push(callbacks);
    const attempt = events.length;
    cb({
      onReady: (fn: () => void) => { callbacks.ready = fn; }, onSuccess: (fn: () => void) => { callbacks.success = fn; },
      onClose: (fn: () => void) => { callbacks.close = fn; }, onError: (fn: () => void) => { callbacks.error = fn; },
      verify: jest.fn(), destroy: jest.fn(),
      getValidate: () => ({ geetest_challenge: "sdk", geetest_validate: `fresh-${attempt}`, geetest_seccode: "sec" }),
    });
  });
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    removeEventListener: jest.fn(), initGeetest: init, grecaptcha: { execute: jest.fn(async () => "google-token") },
  } });
  jest.mocked(apiClient.doGameLogin).mockResolvedValue(ok);
  jest.mocked(apiClient.doUpdateCaptcha).mockResolvedValue(ok);
  jest.mocked(apiClient.fetchGameList).mockResolvedValue({ code: 1, message: "ok", data: [game()] });
  store = useGamesStore();
  login = useGameActions({ gamesStore: store, captcha: useCaptcha(), isLoading: ref(false),
    selectedRegisterForm: ref<GameAccountForm>({ account: "", password: "", platform: 1 }),
  }).gameLogin;
});
afterEach(async () => { store.$reset(); await flush(); Reflect.deleteProperty(globalThis, "window"); jest.useRealTimers(); });
async function finishFirst() {
  await store.queryGameList(); await flush(); events[0].success(); await flush();
  expect(apiClient.doUpdateCaptcha).toHaveBeenCalledTimes(1);
}
test("原登录入口先重新GET，同挑战重开SDK并提交全新凭据", async () => {
  await finishFirst();
  let fetched!: (value: Awaited<ReturnType<typeof apiClient.fetchGameList>>) => void;
  jest.mocked(apiClient.fetchGameList).mockImplementationOnce(() => new Promise(resolve => { fetched = resolve; }));
  const pending = login("A"); await flush();
  expect(apiClient.doGameLogin).toHaveBeenCalledWith("google-token", "A"); expect(init).toHaveBeenCalledTimes(1);
  fetched({ code: 1, message: "ok", data: [game()] }); await pending; await flush();
  expect(init).toHaveBeenCalledTimes(2); events[1].success(); await flush();
  expect(apiClient.doUpdateCaptcha).toHaveBeenLastCalledWith("A", {
    challenge: "one", geetest_challenge: "sdk", geetest_validate: "fresh-2", geetest_seccode: "sec",
  });
});
test("GET业务失败不重新验证", async () => {
  await finishFirst(); jest.mocked(apiClient.fetchGameList).mockResolvedValueOnce({ code: 0, data: [game()], message: "failed" });
  await login("A"); await flush(); expect(init).toHaveBeenCalledTimes(1); expect(apiClient.doUpdateCaptcha).toHaveBeenCalledTimes(1);
});
test("GET网络失败不重新验证", async () => {
  await finishFirst(); const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    jest.mocked(apiClient.fetchGameList).mockRejectedValueOnce(new Error("offline"));
    await login("A"); await flush(); expect(init).toHaveBeenCalledTimes(1);
  } finally { log.mockRestore(); }
});
test("刷新得到新挑战只展示一次且只提交新challenge", async () => {
  await finishFirst(); jest.mocked(apiClient.fetchGameList).mockResolvedValueOnce({ code: 1, data: [game("new")], message: "ok" });
  await login("A"); await flush(); expect(init).toHaveBeenCalledTimes(2);
  events[1].success(); events[1].success(); await flush();
  expect(apiClient.doUpdateCaptcha).toHaveBeenCalledTimes(2);
  expect(jest.mocked(apiClient.doUpdateCaptcha).mock.calls[1][1].challenge).toBe("new");
});
test("正常轮询同挑战不重弹且提交后不新增确认GET", async () => {
  jest.useFakeTimers(); await finishFirst(); jest.advanceTimersByTime(65_000); await flush();
  expect(apiClient.fetchGameList).toHaveBeenCalledTimes(1);
  await store.queryGameList(); await flush(); expect(init).toHaveBeenCalledTimes(1);
});
test.each(["close", "error"])("SDK %s后保留必要反馈且轮询不会重弹", async (event) => {
  await store.queryGameList(); await flush(); events[0][event](); await flush();
  expect(setMsg).toHaveBeenCalledTimes(event === "error" ? 1 : 0);
  await store.queryGameList(); await flush(); expect(init).toHaveBeenCalledTimes(1);
  await login("A"); await flush(); expect(init).toHaveBeenCalledTimes(2);
});
test("reset后迟到SDK回调不能提交", async () => {
  await store.queryGameList(); await flush(); store.$reset(); events[0].success(); await flush();
  expect(apiClient.doUpdateCaptcha).not.toHaveBeenCalled();
});
test("账号移除释放当前展示并跳过已移除的排队任务", async () => {
  const b = game(); b.status.account = "B";
  store.updateCaptcha([game(), b]); await flush(); store.updateCaptcha([]); await flush();
  events[0].success(); await flush(); expect(init).toHaveBeenCalledTimes(1); expect(apiClient.doUpdateCaptcha).not.toHaveBeenCalled();
});

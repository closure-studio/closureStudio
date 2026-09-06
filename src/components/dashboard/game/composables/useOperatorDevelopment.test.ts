jest.mock("@/services/apiClient", () => ({
  __esModule: true,
  default: { fetchGameDetails: jest.fn(), doUpdateGameConf: jest.fn() },
}));

import { effectScope, ref, type EffectScope } from "vue";
import apiClient from "@/services/apiClient";
import type {
  ApiGameChar,
  ApiGameDetail,
  OperatorDevelopmentTask,
} from "@/shared/types/api";
import { defaultDevelopmentTarget } from "@/utils/operatorDevelopment";
import { useOperatorDevelopment } from "./useOperatorDevelopment";

const char: ApiGameChar = {
  charId: "char_103_angel",
  evolvePhase: 1,
  level: 50,
  potentialRank: 0,
  skills: [{ skillId: "skchr_angel_1", unlock: true, specializeLevel: 0 }],
};
const task = (charId = char.charId): OperatorDevelopmentTask => ({
  char_id: charId,
  target: defaultDevelopmentTarget(char),
});
const response = (tasks: OperatorDevelopmentTask[] = [], current = char) => ({
  code: 1,
  message: "ok",
  data: {
    config: { operator_development_tasks: tasks },
    troop: { chars: { "123": current } },
  } as unknown as ApiGameDetail,
});
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const fetchDetails = jest.mocked(apiClient.fetchGameDetails);
const updateConfig = jest.mocked(apiClient.doUpdateGameConf);
let scopes: EffectScope[];

function setup() {
  const account = ref("account-a");
  const selected = ref(char);
  const scope = effectScope();
  scopes.push(scope);
  const state = scope.run(() =>
    useOperatorDevelopment(
      () => account.value,
      () => selected.value,
    ),
  )!;
  return { state, account, selected, scope };
}

beforeEach(() => {
  scopes = [];
  jest.resetAllMocks();
  fetchDetails.mockResolvedValue(response());
  updateConfig.mockResolvedValue({ code: 1, message: "ok", data: undefined });
});
afterEach(() => scopes.forEach((scope) => scope.stop()));

test("loads saved targets and clones the editable draft", async () => {
  const saved = task();
  saved.target.level = 85;
  fetchDetails.mockResolvedValue(response([saved]));
  const { state } = setup();
  await flush();
  expect(state.isAdded.value).toBe(true);
  expect(state.target.value.level).toBe(85);
  state.draft.value.level = 90;
  expect(state.target.value.level).toBe(85);
});

test("load failures disable writes and allow retry", async () => {
  fetchDetails.mockRejectedValueOnce(new Error("offline"));
  const { state } = setup();
  await flush();
  expect(state.error.value).toBe("offline");
  expect(state.isReady.value).toBe(false);
  await state.submit();
  expect(updateConfig).not.toHaveBeenCalled();
  await state.load();
  expect(state.isReady.value).toBe(true);
});

test("adds against fresh FIFO data and changes state only after POST succeeds", async () => {
  const { state } = setup();
  await flush();
  fetchDetails.mockResolvedValue(response([task("another")]));
  const post = deferred<{ code: number; message: string; data: undefined }>();
  updateConfig.mockReturnValue(post.promise);
  const saving = state.submit();
  await flush();
  expect(state.isAdded.value).toBe(false);
  expect(state.isSaving.value).toBe(true);
  expect(updateConfig).toHaveBeenCalledWith("account-a", {
    operator_development_tasks: [task("another"), task()],
  });
  await state.submit();
  expect(updateConfig).toHaveBeenCalledTimes(1);
  post.resolve({ code: 1, message: "ok", data: undefined });
  await saving;
  expect(state.isAdded.value).toBe(true);
  expect(state.isSaving.value).toBe(false);
});

test("removes the last task with [] and retains its targets for re-adding", async () => {
  const saved = task();
  saved.target.masteries = [{ skill_id: "skchr_angel_1", target_level: 3 }];
  fetchDetails.mockResolvedValue(response([saved]));
  const { state } = setup();
  await flush();
  await state.submit();
  expect(updateConfig).toHaveBeenCalledWith("account-a", {
    operator_development_tasks: [],
  });
  expect(state.isAdded.value).toBe(false);
  expect(state.draft.value).toEqual(saved.target);
  fetchDetails.mockResolvedValue(response([task("another")]));
  await state.submit();
  expect(updateConfig).toHaveBeenLastCalledWith("account-a", {
    operator_development_tasks: [task("another"), saved],
  });
});

test.each([false, true])(
  "server rejection preserves saved state and draft (added=%s)",
  async (added) => {
    fetchDetails.mockResolvedValue(response(added ? [task()] : []));
    const { state } = setup();
    await flush();
    updateConfig.mockResolvedValue({
      code: 0,
      message: "server rejected",
      data: undefined,
    });
    await state.submit();
    expect(state.isAdded.value).toBe(added);
    expect(state.target.value.level).toBe(80);
    expect(state.error.value).toBe("server rejected");
    expect(state.isSaving.value).toBe(false);
  },
);

test("pre-submit read failures do not POST or discard drafts", async () => {
  const { state } = setup();
  await flush();
  state.draft.value.level = 85;
  fetchDetails.mockRejectedValue(new Error("offline"));
  await state.submit();
  expect(updateConfig).not.toHaveBeenCalled();
  expect(state.draft.value.level).toBe(85);
  expect(state.error.value).toBe("offline");
});

test("refreshes an externally added task without adding a duplicate", async () => {
  const { state } = setup();
  await flush();
  fetchDetails.mockResolvedValue(response([task()]));
  await state.submit();
  expect(updateConfig).not.toHaveBeenCalled();
  expect(state.isAdded.value).toBe(true);
});

test("validates against current progress refreshed before submission", async () => {
  const { state } = setup();
  await flush();
  fetchDetails.mockResolvedValue(
    response([], { ...char, evolvePhase: 2, level: 90 }),
  );
  await state.submit();
  expect(updateConfig).not.toHaveBeenCalled();
  expect(state.error.value).toContain("90");
});

test("account changes ignore late load responses", async () => {
  const first = deferred<ReturnType<typeof response>>();
  fetchDetails.mockReturnValueOnce(first.promise);
  const { state, account } = setup();
  account.value = "account-b";
  await flush();
  first.resolve(response([task()]));
  await flush();
  expect(state.isAdded.value).toBe(false);
  expect(state.isReady.value).toBe(true);
});

test("closing during the refresh cancels the not-yet-issued POST", async () => {
  const { state, scope } = setup();
  await flush();
  const read = deferred<ReturnType<typeof response>>();
  fetchDetails.mockReturnValueOnce(read.promise);
  const saving = state.submit();
  scope.stop();
  read.resolve(response());
  await saving;
  expect(updateConfig).not.toHaveBeenCalled();
});

test("late POST responses cannot overwrite a different account", async () => {
  const { state, account } = setup();
  await flush();
  const post = deferred<{ code: number; message: string; data: undefined }>();
  updateConfig.mockReturnValueOnce(post.promise);
  const saving = state.submit();
  await flush();
  account.value = "account-b";
  await flush();
  post.resolve({ code: 1, message: "ok", data: undefined });
  await saving;
  expect(state.isAdded.value).toBe(false);
  expect(state.error.value).toBe("");
});

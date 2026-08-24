import { BATTLE_TASK_MODE, type BattleTask } from "@/shared/types/battle";
import {
  addLoopBattleTask,
  cloneBattleTasks,
  getLoopBattleTasks,
  prepareBattleTasksForSubmit,
  removeLoopBattleTask,
} from "./battleTasks";

const existingTasks = (): BattleTask[] => [
  {
    stage_id: "main_08-01",
    mode: BATTLE_TASK_MODE.ADOPT,
    uuid: "adopt-record",
  },
  {
    stage_id: "main_01-07",
    mode: BATTLE_TASK_MODE.LOOP,
    uuid: "",
  },
  {
    stage_id: "main_05-01",
    mode: BATTLE_TASK_MODE.SHARE,
    uuid: "share-record",
  },
];

describe("battle task helpers", () => {
  test("缺少 battle_tasks 时回退为空队列", () => {
    expect(cloneBattleTasks(undefined)).toEqual([]);
    expect(cloneBattleTasks(null)).toEqual([]);
  });

  test("复制任务列表时不复用服务端对象", () => {
    const tasks = existingTasks();
    const cloned = cloneBattleTasks(tasks);

    expect(cloned).toEqual(tasks);
    expect(cloned).not.toBe(tasks);
    expect(cloned[0]).not.toBe(tasks[0]);
  });

  test("只返回 LOOP 任务供地图 UI 展示", () => {
    expect(getLoopBattleTasks(existingTasks())).toEqual([
      {
        stage_id: "main_01-07",
        mode: BATTLE_TASK_MODE.LOOP,
        uuid: "",
      },
    ]);
  });

  test("新增 LOOP 任务到队首且不会重复添加", () => {
    const tasks = existingTasks();
    const added = addLoopBattleTask(tasks, "wk_kc_5");

    expect(added[0]).toEqual({
      stage_id: "wk_kc_5",
      mode: BATTLE_TASK_MODE.LOOP,
    });
    expect(addLoopBattleTask(added, "wk_kc_5")).toBe(added);
  });

  test("删除 LOOP 任务时保留 SHARE 和 ADOPT 的内容与顺序", () => {
    expect(removeLoopBattleTask(existingTasks(), "main_01-07")).toEqual([
      {
        stage_id: "main_08-01",
        mode: BATTLE_TASK_MODE.ADOPT,
        uuid: "adopt-record",
      },
      {
        stage_id: "main_05-01",
        mode: BATTLE_TASK_MODE.SHARE,
        uuid: "share-record",
      },
    ]);
  });

  test("提交时移除 LOOP uuid 并保留其他任务", () => {
    expect(prepareBattleTasksForSubmit(existingTasks())).toEqual([
      {
        stage_id: "main_08-01",
        mode: BATTLE_TASK_MODE.ADOPT,
        uuid: "adopt-record",
      },
      {
        stage_id: "main_01-07",
        mode: BATTLE_TASK_MODE.LOOP,
      },
      {
        stage_id: "main_05-01",
        mode: BATTLE_TASK_MODE.SHARE,
        uuid: "share-record",
      },
    ]);
  });
});

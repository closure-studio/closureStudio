import { BATTLE_TASK_MODE, type BattleTask } from "@/shared/types/battle";

export const cloneBattleTasks = (tasks?: BattleTask[] | null): BattleTask[] =>
  (tasks ?? []).map((task) => ({ ...task }));

export const getLoopBattleTasks = (tasks: BattleTask[]) =>
  tasks.filter((task) => task.mode === BATTLE_TASK_MODE.LOOP);

export const addLoopBattleTask = (tasks: BattleTask[], stageId: string) => {
  const alreadyExists = tasks.some(
    (task) => task.mode === BATTLE_TASK_MODE.LOOP && task.stage_id === stageId
  );
  if (alreadyExists) return tasks;

  return [{ stage_id: stageId, mode: BATTLE_TASK_MODE.LOOP }, ...tasks];
};

export const removeLoopBattleTask = (tasks: BattleTask[], stageId: string) =>
  tasks.filter(
    (task) => task.mode !== BATTLE_TASK_MODE.LOOP || task.stage_id !== stageId
  );

export const prepareBattleTasksForSubmit = (tasks: BattleTask[]): BattleTask[] =>
  tasks.map((task) => {
    if (task.mode === BATTLE_TASK_MODE.LOOP) {
      return { stage_id: task.stage_id, mode: task.mode };
    }
    return { ...task };
  });

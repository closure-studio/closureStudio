export const BATTLE_TASK_MODE = {
  LOOP: "LOOP",
  SHARE: "SHARE",
  ADOPT: "ADOPT",
} as const;

export type BattleTaskMode = (typeof BATTLE_TASK_MODE)[keyof typeof BATTLE_TASK_MODE];

export interface BattleTask {
  stage_id: string;
  mode: BattleTaskMode;
  uuid?: string;
}

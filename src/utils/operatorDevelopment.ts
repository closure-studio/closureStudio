import type { ApiGameChar, OperatorDevelopmentTask } from "@/shared/types/api";

export type DevelopmentTarget = OperatorDevelopmentTask["target"];

// The roster currently exposes six-star operators only.
export const DEVELOPMENT_LEVEL_CAPS = [50, 80, 90] as const;

export const cloneDevelopmentTarget = (
  target: DevelopmentTarget,
): DevelopmentTarget => ({
  ...target,
  masteries: target.masteries.map((mastery) => ({ ...mastery })),
});

export const defaultDevelopmentTarget = (
  char: ApiGameChar,
): DevelopmentTarget => ({
  evolve_phase: 2,
  level: Math.max(80, char.evolvePhase === 2 ? char.level : 1),
  skill_level: 7,
  masteries: [],
});

export const developmentLevelMin = (char: ApiGameChar, phase: number) =>
  phase === char.evolvePhase ? char.level : 1;

export const canDevelopMasteries = (target: DevelopmentTarget) =>
  target.evolve_phase === 2 && target.skill_level === 7;

export function validateDevelopmentTarget(
  char: ApiGameChar,
  target: DevelopmentTarget,
): string {
  if (
    !Number.isInteger(target.evolve_phase) ||
    target.evolve_phase < char.evolvePhase ||
    target.evolve_phase > 2
  ) {
    return "目标精英阶段不能低于当前阶段";
  }
  const min = developmentLevelMin(char, target.evolve_phase);
  const max = DEVELOPMENT_LEVEL_CAPS[target.evolve_phase];
  if (
    !Number.isInteger(target.level) ||
    target.level < min ||
    target.level > max
  ) {
    return `目标等级应为 ${min} 至 ${max} 的整数`;
  }
  const skillMax = target.evolve_phase === 0 ? 4 : 7;
  if (
    !Number.isInteger(target.skill_level) ||
    target.skill_level < 1 ||
    target.skill_level > skillMax
  ) {
    return `目标技能等级应为 1 至 ${skillMax} 的整数`;
  }
  if (target.masteries.length && !canDevelopMasteries(target)) {
    return "技能专精需要目标精英阶段为 2，技能等级为 7";
  }
  const seen = new Set<string>();
  for (const mastery of target.masteries) {
    const skill = char.skills.find((item) => item.skillId === mastery.skill_id);
    if (!skill || seen.has(mastery.skill_id)) return "专精技能无效或重复";
    seen.add(mastery.skill_id);
    if (
      !Number.isInteger(mastery.target_level) ||
      mastery.target_level < 1 ||
      mastery.target_level > 3
    ) {
      return "专精目标应为 I 至 III";
    }
    if (mastery.target_level < skill.specializeLevel)
      return "专精目标不能低于当前等级";
  }
  return "";
}

export function updateDevelopmentTasks(
  tasks: OperatorDevelopmentTask[],
  charId: string,
  target: DevelopmentTarget | null,
): OperatorDevelopmentTask[] {
  if (target === null) return tasks.filter((task) => task.char_id !== charId);
  if (tasks.some((task) => task.char_id === charId))
    throw new Error("该干员已加入培养计划，请刷新后查看");
  return [
    ...tasks,
    { char_id: charId, target: cloneDevelopmentTarget(target) },
  ];
}

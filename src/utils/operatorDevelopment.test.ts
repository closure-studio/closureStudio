import type { ApiGameChar } from "@/shared/types/api";
import {
  cloneDevelopmentTarget,
  defaultDevelopmentTarget,
  updateDevelopmentTasks,
  validateDevelopmentTarget,
  type DevelopmentTarget,
} from "./operatorDevelopment";

const char: ApiGameChar = {
  charId: "char_103_angel",
  evolvePhase: 1,
  level: 50,
  potentialRank: 0,
  skills: [{ skillId: "skchr_angel_1", unlock: true, specializeLevel: 0 }],
};

describe("operator development targets", () => {
  test("defaults to E2 80/7 without mastery, retaining higher E2 levels", () => {
    expect(defaultDevelopmentTarget(char)).toEqual({
      evolve_phase: 2,
      level: 80,
      skill_level: 7,
      masteries: [],
    });
    expect(
      defaultDevelopmentTarget({ ...char, evolvePhase: 2, level: 90 }).level,
    ).toBe(90);
  });

  test.each([
    [{ evolve_phase: 0 }, "精英阶段"],
    [{ evolve_phase: 1, level: 49 }, "目标等级"],
    [{ level: 91 }, "目标等级"],
    [{ level: 2.5 }, "目标等级"],
    [{ skill_level: 8 }, "技能等级"],
  ])("rejects invalid target %j", (patch, message) => {
    expect(
      validateDevelopmentTarget(char, {
        ...defaultDevelopmentTarget(char),
        ...patch,
      } as DevelopmentTarget),
    ).toContain(message);
  });

  test("level can restart at 1 after promotion, E0 skills cap at 4", () => {
    expect(
      validateDevelopmentTarget(char, {
        ...defaultDevelopmentTarget(char),
        level: 1,
      }),
    ).toBe("");
    const unpromoted = { ...char, evolvePhase: 0, level: 1 };
    expect(
      validateDevelopmentTarget(unpromoted, {
        evolve_phase: 0,
        level: 50,
        skill_level: 7,
        masteries: [],
      }),
    ).toContain("1 至 4");
  });

  test("validates mastery prerequisites, IDs, duplicates and existing progress", () => {
    const target = defaultDevelopmentTarget(char);
    target.masteries = [{ skill_id: "skchr_angel_1", target_level: 3 }];
    expect(validateDevelopmentTarget(char, target)).toBe("");
    expect(
      validateDevelopmentTarget(char, { ...target, skill_level: 6 }),
    ).toContain("技能专精需要");
    expect(
      validateDevelopmentTarget(char, {
        ...target,
        masteries: [...target.masteries, ...target.masteries],
      }),
    ).toContain("重复");
    expect(
      validateDevelopmentTarget(char, {
        ...target,
        masteries: [{ skill_id: "other", target_level: 3 }],
      }),
    ).toContain("无效");
    const mastered = {
      ...char,
      skills: [{ ...char.skills[0], specializeLevel: 3 }],
    };
    expect(
      validateDevelopmentTarget(mastered, {
        ...target,
        masteries: [{ skill_id: "skchr_angel_1", target_level: 1 }],
      }),
    ).toContain("不能低于");
  });

  test("appends to FIFO without changing other tasks or retaining mutable drafts", () => {
    const original = [
      { char_id: "other", target: defaultDevelopmentTarget(char) },
    ];
    const target = defaultDevelopmentTarget(char);
    target.masteries = [{ skill_id: "skchr_angel_1", target_level: 3 }];
    const next = updateDevelopmentTasks(original, char.charId, target);
    target.masteries[0].target_level = 1;
    expect(next.map((task) => task.char_id)).toEqual(["other", char.charId]);
    expect(next[0]).toEqual(original[0]);
    expect(next[1].target.masteries[0].target_level).toBe(3);
    expect(original).toHaveLength(1);
    expect(() => updateDevelopmentTasks(next, char.charId, target)).toThrow(
      "已加入",
    );
    expect(cloneDevelopmentTarget(next[1].target)).toEqual(next[1].target);
  });

  test("removes only the selected operator, including the final task", () => {
    const tasks = ["first", char.charId, "last"].map((char_id) => ({
      char_id,
      target: defaultDevelopmentTarget(char),
    }));
    expect(
      updateDevelopmentTasks(tasks, char.charId, null).map(
        (task) => task.char_id,
      ),
    ).toEqual(["first", "last"]);
    expect(updateDevelopmentTasks([tasks[1]], char.charId, null)).toEqual([]);
  });
});

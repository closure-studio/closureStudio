import { ACCELERATE_SLOTS, DEFAULT_GAME_CONFIG } from "./game";

describe("ACCELERATE_SLOTS", () => {
  test("按 B1 到 B3、每层从左到右排列槽位及位置标签", () => {
    expect(ACCELERATE_SLOTS).toEqual([
      { id: "slot_24", label: "顶层左" },
      { id: "slot_25", label: "顶层中" },
      { id: "slot_26", label: "顶层右" },
      { id: "slot_14", label: "中层左" },
      { id: "slot_15", label: "中层中" },
      { id: "slot_16", label: "中层右" },
      { id: "slot_5", label: "底层左" },
      { id: "slot_6", label: "底层中" },
      { id: "slot_7", label: "底层右" },
    ]);
  });
});

describe("DEFAULT_GAME_CONFIG", () => {
  test("加工站自动加工默认开启", () => {
    expect(DEFAULT_GAME_CONFIG.enable_workshop).toBe(true);
  });
});

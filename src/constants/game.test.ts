import { DEFAULT_GAME_CONFIG } from "./game";

describe("DEFAULT_GAME_CONFIG", () => {
  test("加工站自动加工默认开启", () => {
    expect(DEFAULT_GAME_CONFIG.enable_workshop).toBe(true);
  });
});

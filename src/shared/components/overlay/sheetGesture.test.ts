import {
  SHEET_DISMISS_VELOCITY,
  getSheetDragDistance,
  shouldDismissSheet,
} from "./sheetGesture";

describe("sheet gesture", () => {
  test("only tracks downward movement", () => {
    expect(getSheetDragDistance(200, 260)).toBe(60);
    expect(getSheetDragDistance(200, 140)).toBe(0);
  });

  test("dismisses after moving a quarter of a short sheet", () => {
    expect(
      shouldDismissSheet({ distance: 100, height: 400, velocity: 0 }),
    ).toBe(true);
    expect(shouldDismissSheet({ distance: 99, height: 400, velocity: 0 })).toBe(
      false,
    );
  });

  test("caps the distance threshold at 120 pixels", () => {
    expect(
      shouldDismissSheet({ distance: 120, height: 800, velocity: 0 }),
    ).toBe(true);
    expect(
      shouldDismissSheet({ distance: 119, height: 800, velocity: 0 }),
    ).toBe(false);
  });

  test("dismisses a short fast swipe", () => {
    expect(
      shouldDismissSheet({
        distance: 24,
        height: 600,
        velocity: SHEET_DISMISS_VELOCITY,
      }),
    ).toBe(true);
  });
});

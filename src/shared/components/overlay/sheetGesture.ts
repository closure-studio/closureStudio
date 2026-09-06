export const SHEET_DISMISS_DISTANCE = 120;
export const SHEET_DISMISS_RATIO = 0.25;
export const SHEET_DISMISS_VELOCITY = 0.5;

interface SheetDismissInput {
  distance: number;
  height: number;
  velocity: number;
}

export const getSheetDragDistance = (startY: number, currentY: number) =>
  Math.max(0, currentY - startY);

export const shouldDismissSheet = ({
  distance,
  height,
  velocity,
}: SheetDismissInput) => {
  const distanceThreshold = Math.min(
    SHEET_DISMISS_DISTANCE,
    height * SHEET_DISMISS_RATIO,
  );
  return distance >= distanceThreshold || velocity >= SHEET_DISMISS_VELOCITY;
};

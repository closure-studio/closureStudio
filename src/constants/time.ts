export const TIME_ZONES = {
  BEIJING: "Asia/Shanghai",
} as const;

export type AppTimeZone = (typeof TIME_ZONES)[keyof typeof TIME_ZONES];

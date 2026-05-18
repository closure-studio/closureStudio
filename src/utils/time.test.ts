import { TIME_ZONES } from "@/constants/time";
import {
  formatTimestampInTimeZone,
  getTimeZoneDateParts,
  getTimestampFromTimeZoneDateParts,
} from "./time";

describe("time", () => {
  test("getTimestampFromTimeZoneDateParts 按北京时间生成 Unix 秒级时间戳", () => {
    const timestamp = getTimestampFromTimeZoneDateParts(
      {
        year: 2026,
        month: 5,
        day: 19,
        hours: 5,
        minutes: 0,
      },
      TIME_ZONES.BEIJING
    );

    expect(timestamp).toBe(1779138000);
    expect(formatTimestampInTimeZone(timestamp, TIME_ZONES.BEIJING, "yyyy-MM-dd HH:mm")).toBe(
      "2026-05-19 05:00"
    );
  });

  test("getTimeZoneDateParts 使用指定时区读取时间部分", () => {
    expect(getTimeZoneDateParts(1779138000, TIME_ZONES.BEIJING)).toEqual({
      year: 2026,
      month: 5,
      day: 19,
      hours: 5,
      minutes: 0,
    });
  });
});

import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export interface TimeZoneDateParts {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}

const padDatePart = (value: number) => String(value).padStart(2, "0");

const normalizeDateParts = (parts: TimeZoneDateParts) => {
  const normalizedDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes)
  );
  return {
    year: normalizedDate.getUTCFullYear(),
    month: normalizedDate.getUTCMonth() + 1,
    day: normalizedDate.getUTCDate(),
    hours: normalizedDate.getUTCHours(),
    minutes: normalizedDate.getUTCMinutes(),
  };
};

export const getCurrentMinuteTimestamp = (now = Date.now()) => Math.floor(now / 60000) * 60;

export const getTimeZoneDateParts = (timestamp: number, timeZone: string): TimeZoneDateParts => {
  const date = toZonedTime(new Date(timestamp * 1000), timeZone);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
};

export const getTimestampFromTimeZoneDateParts = (
  parts: TimeZoneDateParts,
  timeZone: string
) => {
  const normalizedParts = normalizeDateParts(parts);
  const date = fromZonedTime(
    `${normalizedParts.year}-${padDatePart(normalizedParts.month)}-${padDatePart(
      normalizedParts.day
    )}T${padDatePart(normalizedParts.hours)}:${padDatePart(normalizedParts.minutes)}:00`,
    timeZone
  );
  return Math.floor(date.getTime() / 1000);
};

export const formatTimestampInTimeZone = (
  timestamp: number,
  timeZone: string,
  formatString: string
) => formatInTimeZone(new Date(timestamp * 1000), timeZone, formatString);

export const getDaysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

export const getMondayFirstMonthStartOffset = (year: number, month: number) => {
  const sundayFirstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (sundayFirstDay + 6) % 7;
};

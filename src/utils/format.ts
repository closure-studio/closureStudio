import { format } from "date-fns";

export const formatTime = (timestamp: number, formatString: string): string => {
  return format(new Date(timestamp * 1000), formatString);
};

export function maskPhoneNumber(phoneNumber: string): string {
  return maskSensitiveIdentifier(phoneNumber);
}

export function maskSensitiveIdentifier(value: string): string {
  if (!value) {
    return "";
  }
  if (value.length < 2) {
    return value;
  }
  const numStars = Math.max(Math.floor(value.length / 3), 1);
  const startIdx = Math.floor((value.length - numStars) / 2);
  const endIdx = startIdx + numStars;
  return value.substring(0, startIdx) + "*".repeat(numStars) + value.substring(endIdx);
}

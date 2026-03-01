import { format } from "date-fns";

export const formatTime = (timestamp: number, formatString: string): string => {
  return format(new Date(timestamp * 1000), formatString);
};

export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) {
    return "";
  }
  if (phoneNumber.length < 2) {
    return phoneNumber;
  }
  const numStars = Math.max(Math.floor(phoneNumber.length / 3), 1);
  const startIdx = Math.floor((phoneNumber.length - numStars) / 2);
  const endIdx = startIdx + numStars;
  return phoneNumber.substring(0, startIdx) + "*".repeat(numStars) + phoneNumber.substring(endIdx);
}

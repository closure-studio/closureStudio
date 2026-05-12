import { EMAIL_PATTERN, MOBILE_PHONE_PATTERN } from "@/constants/auth";

export function checkIsMobile(content: string): boolean {
  return MOBILE_PHONE_PATTERN.test(content);
}

export function checkIsEmail(content: string): boolean {
  return EMAIL_PATTERN.test(content);
}

export function getEmailUsernameLength(email: string): number {
  const username = email.split("@")[0];
  return username.length;
}

export function checkIsMobile(content: string): boolean {
  const mobileRegex = /(?:\+?86)?(?:\s|-)?1[3-9]\d{9}/;
  return mobileRegex.test(content);
}

export function checkIsEmail(content: string): boolean {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  return emailRegex.test(content);
}

export function getEmailUsernameLength(email: string): number {
  const username = email.split("@")[0];
  return username.length;
}

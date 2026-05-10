export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isNight = new Date().getHours() >= 22 || new Date().getHours() <= 6;

export function selectRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

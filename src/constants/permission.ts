export enum Permission {
  SuperAdmin = 1 << 0,
  CreateGame = 1 << 4,
  QueryGame = 1 << 5,
  UpdateGame = 1 << 6,
  DelGame = 1 << 7,
}

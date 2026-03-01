// ============================================================
// 游戏数据 类型定义 — 从 src/typings/system.d.ts 迁移
// ============================================================

export interface Stage {
  name: string;
  code: string;
  ap: number;
  items: string[];
}

export interface Stages {
  [key: string]: Stage;
}

export interface Items {
  [key: string]: Item;
}

export interface Item {
  name: string;
  icon: string;
}

import type { RecordDTO } from "@/shared/types/replay";

export const mockRecords: RecordDTO[] = Array.from({ length: 23 }, (_, i) => ({
  id: `mock-record-${i + 1}`,
  setId: null,
  userId: `user-${(i % 5) + 1}`,
  gameAccount: `b1300${(i % 5) + 1}`,
  nickName: [
    "欧皇大佬",
    "深渊探索者",
    "罗德岛指挥官",
    "博士在线",
    "低费通关王",
  ][i % 5],
  avatar: [
    { type: "DEFAULT", id: "avatar_def_mc" },
    { type: "DEFAULT", id: "avatar_activity_GK" },
    { type: "ICON",    id: "avatar_npc_017" },
    { type: "ICON",    id: "avatar_npc_045" },
    { type: "DEFAULT", id: "avatar_npc_082" },
  ][i % 5],
  stageId: [
    "main_01-07", "main_02-10", "main_04-01",
    "rogue_1-15", "act_05side_01",
  ][i % 5] + (i >= 5 ? `-ex${Math.floor(i / 5)}` : ""),
  sortOrder: 0,
  displayInfo: `这是第 ${i + 1} 个录像的详细描述。展示了如何在该关卡中高效部署干员，控制敌人走位，最终实现零费用通关。`,
  totalBattleCount: 10 + i,
  successBattleCount: 8 + (i % 3),
  status: 1,
  createdAt: Date.now() - i * 86400_000 * 3,
  updatedAt: Date.now() - i * 86400_000,
  netScore: Math.round(Math.sin(i) * 10),
  usageCount: (i + 1) * 7,
  myRating: undefined,
}));

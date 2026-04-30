import apiClient from "./apiClient";
import type {
  BattleReplayAction,
  ReplayAutoResult,
  ReplayAutoResultsQuery,
  ReplayListQuery,
  ReplayRecord,
  ReviewReplayPayload,
  UpdateReplayPayload,
} from "@/shared/types/replay";

function qs(params: object): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!entries.length) return "";
  const query = entries
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
  return `?${query}`;
}

export const replayApi = {
  listReplays(params: ReplayListQuery = {}) {
    return apiClient.get<ReplayRecord[]>(`/game/replays${qs(params)}`);
  },

  updateReplay(uuid: string, payload: UpdateReplayPayload) {
    return apiClient.post<ReplayRecord>(`/game/replays/${uuid}`, payload);
  },

  appendReplayActions(account: string, actions: BattleReplayAction[]) {
    return apiClient.doUpdateGameConf(account, {
      battle_replay_actions: actions,
    });
  },

  reviewReplay(uuid: string, payload: ReviewReplayPayload) {
    return apiClient.post<ReplayRecord>(`/game/replays/review/${uuid}`, payload);
  },

  listAutoResults(account: string, params: ReplayAutoResultsQuery = {}) {
    return apiClient.get<ReplayAutoResult[]>(`/game/replays/autoResults/${account}${qs(params)}`);
  },
};

export default replayApi;

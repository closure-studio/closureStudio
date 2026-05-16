jest.mock("@/services/systemConfigClient", () => ({
  __esModule: true,
  systemConfigApi: {
    fetchSystemConfig: jest.fn(),
    updateSystemConfig: jest.fn(),
  },
}));

jest.mock("@/services/qqBotClient", () => ({
  __esModule: true,
  default: {
    specialNotify: jest.fn(),
  },
}));

import { Permission } from "@/constants/auth";
import { SYSTEM_CONFIG_MESSAGES } from "@/constants/systemAdmin";
import { systemConfigApi } from "@/services/systemConfigClient";
import qqBotClient from "@/services/qqBotClient";
import {
  API_QQBOT_SPECIAL_NOTIFY_STATUS,
  type ApiSystemConfigEditable,
} from "@/shared/types/api";
import {
  buildApiSystemConfigUpdate,
  getAnnouncementNotifyGroups,
  loadApiSystemConfigEditable,
  saveApiSystemConfigEditable,
} from "./systemConfigAdmin";

const mockedSystemConfigApi = systemConfigApi as jest.Mocked<typeof systemConfigApi>;
const mockedQQBotClient = qqBotClient as jest.Mocked<typeof qqBotClient>;

const originalConfig: ApiSystemConfigEditable = {
  announcement: "旧公告",
  allowGameLogin: true,
  allowGameCreate: true,
  allowGameUpdate: true,
  allowGameDelete: true,
};

describe("systemConfigAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loadApiSystemConfigEditable 只返回可编辑字段", async () => {
    mockedSystemConfigApi.fetchSystemConfig.mockResolvedValue({
      code: 1,
      data: {
        ...originalConfig,
        isUnderMaintenance: false,
        isDebugMode: false,
        recaptchaScore: null,
        captcha: {
          autoPassV3: true,
          autoPassV4: true,
        },
        database: {
          apiLogBatchSize: 1000,
          gameLogBatchSize: 10,
          gameStatBatchSize: 10,
        },
        apiVersion: null,
      },
      message: "大成功!",
    });

    await expect(loadApiSystemConfigEditable()).resolves.toEqual(originalConfig);
  });

  test("buildApiSystemConfigUpdate 只提交变化字段", () => {
    expect(
      buildApiSystemConfigUpdate(originalConfig, {
        ...originalConfig,
        allowGameLogin: false,
      })
    ).toEqual({
      allowGameLogin: false,
    });
  });

  test("saveApiSystemConfigEditable 无变化时不调用更新 API", async () => {
    await expect(
      saveApiSystemConfigEditable({
        userPermission: Permission.CommunityHelper,
        originalConfig,
        draftConfig: originalConfig,
        customQQGroups: [],
      })
    ).resolves.toEqual({
      payload: {},
      config: originalConfig,
    });

    expect(mockedSystemConfigApi.updateSystemConfig).not.toHaveBeenCalled();
    expect(mockedQQBotClient.specialNotify).not.toHaveBeenCalled();
  });

  test("saveApiSystemConfigEditable 无权限时抛出错误且不调用更新 API", async () => {
    await expect(
      saveApiSystemConfigEditable({
        userPermission: Permission.CreateGame,
        originalConfig,
        draftConfig: {
          ...originalConfig,
          allowGameLogin: false,
        },
        customQQGroups: [],
      })
    ).rejects.toThrow(SYSTEM_CONFIG_MESSAGES.NO_PERMISSION);

    expect(mockedSystemConfigApi.updateSystemConfig).not.toHaveBeenCalled();
    expect(mockedQQBotClient.specialNotify).not.toHaveBeenCalled();
  });

  test("saveApiSystemConfigEditable 更新公告后调用 QQ bot 通知", async () => {
    mockedSystemConfigApi.updateSystemConfig.mockResolvedValue({
      code: 1,
      data: undefined,
      message: "大成功!",
    });
    mockedQQBotClient.specialNotify.mockResolvedValue({
      status: API_QQBOT_SPECIAL_NOTIFY_STATUS.OK,
      results: [
        {
          group: "1345795",
          ok: true,
          message_id: 123,
          error: null,
        },
      ],
    });

    await expect(
      saveApiSystemConfigEditable({
        userPermission: Permission.SuperAdmin,
        originalConfig,
        draftConfig: {
          ...originalConfig,
          announcement: "新公告",
        },
        customQQGroups: ["123456", "1345795"],
      })
    ).resolves.toEqual({
      payload: {
        announcement: "新公告",
      },
      config: {
        ...originalConfig,
        announcement: "新公告",
      },
      notifyResult: {
        status: API_QQBOT_SPECIAL_NOTIFY_STATUS.OK,
        results: [
          {
            group: "1345795",
            ok: true,
            message_id: 123,
            error: null,
          },
        ],
      },
      notifyError: undefined,
    });

    expect(mockedSystemConfigApi.updateSystemConfig).toHaveBeenCalledWith({
      announcement: "新公告",
    });
    expect(mockedQQBotClient.specialNotify).toHaveBeenCalledWith({
      message: "新公告",
      groups: ["1345795", "450555868", "123456"],
    });
  });

  test("saveApiSystemConfigEditable 支持 QQ bot 部分失败结果", async () => {
    mockedSystemConfigApi.updateSystemConfig.mockResolvedValue({
      code: 1,
      data: undefined,
      message: "大成功!",
    });
    mockedQQBotClient.specialNotify.mockResolvedValue({
      status: API_QQBOT_SPECIAL_NOTIFY_STATUS.PARTIAL_FAILED,
      results: [
        {
          group: "1345795",
          ok: true,
          message_id: 123,
          error: null,
        },
        {
          group: "450555868",
          ok: false,
          message_id: null,
          error: "Bot 当前无法 @全体成员",
        },
      ],
    });

    await expect(
      saveApiSystemConfigEditable({
        userPermission: Permission.SuperAdmin,
        originalConfig,
        draftConfig: {
          ...originalConfig,
          announcement: "新公告",
        },
        customQQGroups: [],
      })
    ).resolves.toMatchObject({
      payload: {
        announcement: "新公告",
      },
      notifyResult: {
        status: API_QQBOT_SPECIAL_NOTIFY_STATUS.PARTIAL_FAILED,
      },
    });
  });

  test("saveApiSystemConfigEditable 在 QQ bot 请求失败时保留配置保存结果", async () => {
    mockedSystemConfigApi.updateSystemConfig.mockResolvedValue({
      code: 1,
      data: undefined,
      message: "大成功!",
    });
    mockedQQBotClient.specialNotify.mockRejectedValue(new Error("请求过于频繁"));

    await expect(
      saveApiSystemConfigEditable({
        userPermission: Permission.SuperAdmin,
        originalConfig,
        draftConfig: {
          ...originalConfig,
          announcement: "新公告",
        },
        customQQGroups: [],
      })
    ).resolves.toMatchObject({
      payload: {
        announcement: "新公告",
      },
      config: {
        ...originalConfig,
        announcement: "新公告",
      },
      notifyError: "请求过于频繁",
    });
  });

  test("saveApiSystemConfigEditable 配置保存失败时不调用 QQ bot", async () => {
    mockedSystemConfigApi.updateSystemConfig.mockResolvedValue({
      code: 0,
      data: undefined,
      message: "保存失败",
    });

    await expect(
      saveApiSystemConfigEditable({
        userPermission: Permission.SuperAdmin,
        originalConfig,
        draftConfig: {
          ...originalConfig,
          announcement: "新公告",
        },
        customQQGroups: [],
      })
    ).rejects.toThrow("保存失败");

    expect(mockedQQBotClient.specialNotify).not.toHaveBeenCalled();
  });

  test("getAnnouncementNotifyGroups 合并默认群、自定义群并去重", () => {
    expect(getAnnouncementNotifyGroups([" 123456 ", "1345795", "abc"])).toEqual([
      "1345795",
      "450555868",
      "123456",
    ]);
  });
});

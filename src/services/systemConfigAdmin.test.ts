jest.mock("@/services/systemConfigClient", () => ({
  __esModule: true,
  systemConfigApi: {
    fetchSystemConfig: jest.fn(),
    updateSystemConfig: jest.fn(),
  },
}));

import { Permission } from "@/constants/auth";
import { SYSTEM_CONFIG_MESSAGES } from "@/constants/systemAdmin";
import { systemConfigApi } from "@/services/systemConfigClient";
import type { ApiSystemConfigEditable } from "@/shared/types/api";
import {
  buildApiSystemConfigUpdate,
  getAnnouncementNotifyGroups,
  loadApiSystemConfigEditable,
  saveApiSystemConfigEditable,
} from "./systemConfigAdmin";

const mockedSystemConfigApi = systemConfigApi as jest.Mocked<typeof systemConfigApi>;

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
    jest.spyOn(console, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
        userPermission: Permission.TicketOperate,
        originalConfig,
        draftConfig: originalConfig,
        customQQGroups: [],
      })
    ).resolves.toEqual({
      payload: {},
      config: originalConfig,
    });

    expect(mockedSystemConfigApi.updateSystemConfig).not.toHaveBeenCalled();
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
  });

  test("saveApiSystemConfigEditable 更新公告后调用 QQ bot 占位", async () => {
    mockedSystemConfigApi.updateSystemConfig.mockResolvedValue({
      code: 1,
      data: undefined,
      message: "大成功!",
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
    });

    expect(mockedSystemConfigApi.updateSystemConfig).toHaveBeenCalledWith({
      announcement: "新公告",
    });
    expect(console.info).toHaveBeenCalledWith(SYSTEM_CONFIG_MESSAGES.QQBOT_NOT_READY, {
      announcement: "新公告",
      groups: ["1345795", "450555868", "123456"],
    });
  });

  test("getAnnouncementNotifyGroups 合并默认群、自定义群并去重", () => {
    expect(getAnnouncementNotifyGroups([" 123456 ", "1345795", "abc"])).toEqual([
      "1345795",
      "450555868",
      "123456",
    ]);
  });
});

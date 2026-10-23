jest.mock("./apiClient", () => ({
  __esModule: true,
  default: {
    fetchSystemConfig: jest.fn(),
    doUpdateSystemConfig: jest.fn(),
  },
}));

import apiClient from "./apiClient";
import { isValidBattleStartAP, systemConfigApi } from "./systemConfigClient";
import { SYSTEM_CONFIG_MESSAGES } from "@/constants/systemAdmin";

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("systemConfigApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetchSystemConfig 复用 apiClient 读取系统配置", async () => {
    mockedApiClient.fetchSystemConfig.mockResolvedValue({
      code: 1,
      data: {
        isUnderMaintenance: false,
        isDebugMode: false,
        announcement: "维护公告",
        allowGameLogin: true,
        allowGameCreate: true,
        allowGameUpdate: true,
        allowGameDelete: true,
      },
      message: "ok",
    });

    await systemConfigApi.fetchSystemConfig();

    expect(mockedApiClient.fetchSystemConfig).toHaveBeenCalledTimes(1);
  });

  test.each([0, 100, 101, 1000])("更新非负整数阈值 %s 时原样传递", async (battleStartAP) => {
    await systemConfigApi.updateSystemConfig({ battleStartAP });
    expect(mockedApiClient.doUpdateSystemConfig).toHaveBeenCalledWith({ battleStartAP });
    expect(isValidBattleStartAP(battleStartAP)).toBe(true);
  });

  test.each([-1, 0.1, 100.5, NaN, Infinity, -Infinity, "100", "", null, undefined, true, Number.MAX_SAFE_INTEGER + 1])(
    "拒绝非法阈值 %s，不取整、不发送请求",
    (battleStartAP) => {
      expect(isValidBattleStartAP(battleStartAP)).toBe(false);
      expect(() => systemConfigApi.updateSystemConfig({ battleStartAP: battleStartAP as number }))
        .toThrow(SYSTEM_CONFIG_MESSAGES.INVALID_BATTLE_START_AP);
      expect(mockedApiClient.doUpdateSystemConfig).not.toHaveBeenCalled();
    }
  );

  test("updateSystemConfig 通过 /system/config 更新传入字段", async () => {
    mockedApiClient.doUpdateSystemConfig.mockResolvedValue({
      code: 1,
      data: undefined,
      message: "ok",
    });

    await systemConfigApi.updateSystemConfig({
      announcement: "新公告",
    });

    expect(mockedApiClient.doUpdateSystemConfig).toHaveBeenCalledWith({
      announcement: "新公告",
    });
  });
});

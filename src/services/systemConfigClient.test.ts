jest.mock("./apiClient", () => ({
  __esModule: true,
  default: {
    fetchSystemConfig: jest.fn(),
    doUpdateSystemConfig: jest.fn(),
  },
}));

import apiClient from "./apiClient";
import { systemConfigApi } from "./systemConfigClient";

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

jest.mock("@/services/authClient", () => ({
  __esModule: true,
  default: {
    queryUser: jest.fn(),
    updateUserPermission: jest.fn(),
  },
}));

import { API_RESPONSE_CODE } from "@/constants/api";
import { Permission } from "@/constants/auth";
import { USER_MANAGEMENT_MESSAGES } from "@/constants/systemAdmin";
import authClient from "@/services/authClient";
import type { ApiUserUser } from "@/shared/types/api";
import {
  canSearchAdminUser,
  canUpdateUserPermission,
  saveUserPermission,
  searchFirstAdminUser,
} from "./userPermissionAdmin";

const mockedAuthClient = authClient as jest.Mocked<typeof authClient>;

const firstUser: ApiUserUser = {
  ID: 1,
  UserEmail: "first@example.com",
  Password: "",
  UUID: "uuid-first",
  Status: 1,
  IP: "",
  Slot: 1,
  QQ: "123456789",
  Phone: "13800138000",
  Permission: Permission.CreateGame,
  CreatedTs: 1710000000,
  UpdateTs: 1710000001,
};

const secondUser: ApiUserUser = {
  ...firstUser,
  ID: 2,
  UserEmail: "second@example.com",
  UUID: "uuid-second",
};

describe("userPermissionAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("canSearchAdminUser 对 SuperAdmin 和 CommunityHelper 开放", () => {
    expect(canSearchAdminUser(Permission.SuperAdmin)).toBe(true);
    expect(canSearchAdminUser(Permission.CommunityHelper)).toBe(true);
    expect(canSearchAdminUser(Permission.CreateGame)).toBe(false);
  });

  test("canUpdateUserPermission 只允许 SuperAdmin", () => {
    expect(canUpdateUserPermission(Permission.SuperAdmin)).toBe(true);
    expect(canUpdateUserPermission(Permission.CommunityHelper)).toBe(false);
  });

  test("searchFirstAdminUser 空搜索关键字不调用 API", async () => {
    await expect(searchFirstAdminUser("  ")).resolves.toBeNull();
    expect(mockedAuthClient.queryUser).not.toHaveBeenCalled();
  });

  test("searchFirstAdminUser 返回搜索结果中的第一个用户", async () => {
    mockedAuthClient.queryUser.mockResolvedValue({
      code: API_RESPONSE_CODE.SUCCESS,
      data: [firstUser, secondUser],
      message: "成功",
    });

    await expect(searchFirstAdminUser(" first@example.com ")).resolves.toEqual(firstUser);
    expect(mockedAuthClient.queryUser).toHaveBeenCalledWith("first@example.com");
  });

  test("searchFirstAdminUser 无结果返回 null", async () => {
    mockedAuthClient.queryUser.mockResolvedValue({
      code: API_RESPONSE_CODE.SUCCESS,
      data: [],
      message: "成功",
    });

    await expect(searchFirstAdminUser("missing")).resolves.toBeNull();
  });

  test("saveUserPermission CommunityHelper 更新权限时不调用 API", async () => {
    await expect(
      saveUserPermission({
        operatorPermission: Permission.CommunityHelper,
        uuid: firstUser.UUID,
        originalPermission: firstUser.Permission,
        draftPermission: Permission.UpdateGame,
      })
    ).rejects.toThrow(USER_MANAGEMENT_MESSAGES.NO_PERMISSION);

    expect(mockedAuthClient.updateUserPermission).not.toHaveBeenCalled();
  });

  test("saveUserPermission SuperAdmin 权限无变化时不调用 API", async () => {
    await expect(
      saveUserPermission({
        operatorPermission: Permission.SuperAdmin,
        uuid: firstUser.UUID,
        originalPermission: firstUser.Permission,
        draftPermission: firstUser.Permission,
      })
    ).resolves.toEqual({
      permission: firstUser.Permission,
      changed: false,
    });

    expect(mockedAuthClient.updateUserPermission).not.toHaveBeenCalled();
  });

  test("saveUserPermission SuperAdmin 权限有变化时提交 uuid 和 permission", async () => {
    mockedAuthClient.updateUserPermission.mockResolvedValue({
      code: API_RESPONSE_CODE.SUCCESS,
      data: undefined,
      message: "成功",
    });

    await expect(
      saveUserPermission({
        operatorPermission: Permission.SuperAdmin,
        uuid: firstUser.UUID,
        originalPermission: firstUser.Permission,
        draftPermission: Permission.UpdateGame,
      })
    ).resolves.toEqual({
      permission: Permission.UpdateGame,
      changed: true,
    });

    expect(mockedAuthClient.updateUserPermission).toHaveBeenCalledWith(
      firstUser.UUID,
      Permission.UpdateGame
    );
  });

  test("saveUserPermission 更新接口失败时抛出后端 message", async () => {
    mockedAuthClient.updateUserPermission.mockResolvedValue({
      code: API_RESPONSE_CODE.FAILURE,
      data: undefined,
      message: "保存失败",
    });

    await expect(
      saveUserPermission({
        operatorPermission: Permission.SuperAdmin,
        uuid: firstUser.UUID,
        originalPermission: firstUser.Permission,
        draftPermission: Permission.UpdateGame,
      })
    ).rejects.toThrow("保存失败");
  });
});

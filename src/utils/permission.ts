import { Permission } from "@/constants/auth";

export function getPermissionValues(): Permission[] {
  return Object.values(Permission).filter((value): value is Permission => typeof value === "number");
}

export function hasPermission(userRights: number, requiredPermission: number): boolean {
  if ((userRights & Permission.SuperAdmin) === Permission.SuperAdmin) {
    return true;
  }
  return (userRights & requiredPermission) === requiredPermission;
}

export function addPermission(userRights: number, permission: number): number {
  return userRights | permission;
}

export function removePermission(userRights: number, permission: number): number {
  return userRights & ~permission;
}

export function canAccessSystemAdmin(userRights: number): boolean {
  return hasPermission(userRights, Permission.SuperAdmin) || hasPermission(userRights, Permission.CommunityHelper);
}

// return a list of permissions that the user has
export function listPermissions(userRights: number): Permission[] {
  if ((userRights & Permission.SuperAdmin) === Permission.SuperAdmin) {
    return getPermissionValues();
  }

  return getPermissionValues().filter((permission) => hasPermission(userRights, permission));
}

export function getPermissionName(permissionValue: number): string {
  // 查找与传入的权限值匹配的枚举键名
  for (const permissionName in Permission) {
    if (typeof Permission[permissionName] === "number") {
      if (Permission[permissionName as keyof typeof Permission] === permissionValue) {
        return permissionName; // 返回匹配的枚举键名
      }
    }
  }
  return "未知权限"; // 如果找不到匹配项，则返回未知权限
}

export const isAdmin = (state: { user: { Info: { permission: number } } }): boolean => {
  return hasPermission(state.user.Info.permission, Permission.SuperAdmin);
};

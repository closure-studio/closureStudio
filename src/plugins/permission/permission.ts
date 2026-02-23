export enum Permission {
    SuperAdmin = 1 << 0,
    CreateGame = 1 << 4,
    QueryGame = 1 << 5,
    UpdateGame = 1 << 6,
    DelGame = 1 << 7
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

// return a list of permissions that the user has
export function listPermissions(userRights: number): Permission[] {
    // if this user is a SuperAdmin, return all permissions
    const permissions: Permission[] = [];
    if ((userRights & Permission.SuperAdmin) === Permission.SuperAdmin) {
        // return all permissions
        for (const permission in Permission) {
            const permissionValue = parseInt(permission);
            permissions.push(permissionValue);
        }
    }

    for (const permission in Permission) {
        const permissionValue = parseInt(permission);
        if (hasPermission(userRights, permissionValue)) {
            permissions.push(permissionValue);
        }
    }
    return permissions;
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

export const isAdmin = (state: any): boolean => {
    return hasPermission(state.user.Info.permission, Permission.SuperAdmin);
};

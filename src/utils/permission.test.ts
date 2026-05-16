import { PERMISSION_DETAILS, Permission } from "@/constants/auth";
import {
    addPermission,
    canAccessSystemAdmin,
    hasPermission,
    isAdmin,
    listPermissions,
    removePermission,
} from "./permission";

describe("Permissions System", () => {
    test("permission bit values match backend iota order", () => {
        expect(Permission.SuperAdmin).toBe(1);
        expect(Permission.TicketCreate).toBe(2);
        expect(Permission.TicketUpdate).toBe(4);
        expect(Permission.CommunityHelper).toBe(8);
        expect(Permission.CreateGame).toBe(16);
        expect(Permission.QueryGame).toBe(32);
        expect(Permission.UpdateGame).toBe(64);
        expect(Permission.DelGame).toBe(128);
    });

    test("permission details cover every permission value", () => {
        const permissionValues = Object.values(Permission).filter(
            (value): value is Permission => typeof value === "number"
        );

        expect(Object.keys(PERMISSION_DETAILS).map(Number).sort((a, b) => a - b)).toEqual(
            permissionValues.sort((a, b) => a - b)
        );
        permissionValues.forEach((permission) => {
            expect(PERMISSION_DETAILS[permission].label).toBeTruthy();
            expect(PERMISSION_DETAILS[permission].description).toBeTruthy();
        });
    });

    test("SuperAdmin has all permissions", () => {
        const superAdminRights = Permission.SuperAdmin;
        expect(hasPermission(superAdminRights, Permission.CommunityHelper)).toBe(true);
        expect(hasPermission(superAdminRights, Permission.CreateGame)).toBe(true);
        expect(hasPermission(superAdminRights, Permission.DelGame)).toBe(true);
        expect(isAdmin({ user: { Info: { permission: superAdminRights } } })).toBe(true);
    });

    test("system admin access requires SuperAdmin or CommunityHelper", () => {
        expect(canAccessSystemAdmin(Permission.SuperAdmin)).toBe(true);
        expect(canAccessSystemAdmin(Permission.CommunityHelper)).toBe(true);
        expect(canAccessSystemAdmin(Permission.CreateGame)).toBe(false);
        expect(canAccessSystemAdmin(0)).toBe(false);
    });

    test("Add and check permission", () => {
        let userRights = 0; // Initially no permissions
        userRights = addPermission(userRights, Permission.CreateGame);
        expect(hasPermission(userRights, Permission.CreateGame)).toBe(true);
        expect(hasPermission(userRights, Permission.UpdateGame)).toBe(false); // Not added yet
    });

    test("Remove permission", () => {
        let userRights = addPermission(0, Permission.QueryGame);
        userRights = removePermission(userRights, Permission.QueryGame);
        expect(hasPermission(userRights, Permission.QueryGame)).toBe(false);
    });

    test("Multiple permissions manipulation", () => {
        let userRights = addPermission(0, Permission.CreateGame);
        userRights = addPermission(userRights, Permission.UpdateGame);
        userRights = addPermission(userRights, Permission.QueryGame);
        expect(hasPermission(userRights, Permission.CreateGame)).toBe(true);
        expect(hasPermission(userRights, Permission.UpdateGame)).toBe(true);
        expect(hasPermission(userRights, Permission.QueryGame)).toBe(true);
        userRights = removePermission(userRights, Permission.UpdateGame);
        expect(hasPermission(userRights, Permission.UpdateGame)).toBe(false);
    });

    test("listPermissions returns correct permissions for a user", () => {
        let userRights = addPermission(0, Permission.CreateGame);
        userRights = addPermission(userRights, Permission.UpdateGame);
        userRights = addPermission(userRights, Permission.QueryGame);
        userRights = addPermission(userRights, Permission.CommunityHelper);
        const expectedPermissions = [
            Permission.CreateGame,
            Permission.UpdateGame,
            Permission.QueryGame,
            Permission.CommunityHelper,
        ];
        expect(listPermissions(userRights)).toEqual(expect.arrayContaining(expectedPermissions));
        expect(listPermissions(userRights)).not.toEqual(expect.arrayContaining([NaN]));
    });

    test("listPermissions includes SuperAdmin and ignores other permissions", () => {
        const userRights = Permission.SuperAdmin;
        expect(listPermissions(userRights)).toEqual(expect.arrayContaining([Permission.SuperAdmin]));
    });

    test("listPermissions returns an empty array for no permissions", () => {
        const userRights = 0; // No permissions
        expect(listPermissions(userRights)).toEqual([]);
    });

    test("listPermissions works with multiple permissions including SuperAdmin", () => {
        let userRights = Permission.SuperAdmin;
        userRights = addPermission(userRights, Permission.CreateGame); // This should not affect the outcome
        userRights = addPermission(userRights, Permission.DelGame); // This should not affect the outcome
        const expectedPermissions = [
            Permission.SuperAdmin,
            Permission.TicketCreate,
            Permission.TicketUpdate,
            Permission.CommunityHelper,
            Permission.CreateGame,
            Permission.QueryGame,
            Permission.UpdateGame,
            Permission.DelGame,
        ];
        expect(listPermissions(userRights)).toEqual(expect.arrayContaining(expectedPermissions));
        expect(listPermissions(userRights)).not.toEqual(expect.arrayContaining([NaN]));
    });
});

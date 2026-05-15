import { createPinia, setActivePinia } from "pinia";
import { useSystemAdminStore } from "./useSystemAdminStore";

describe("useSystemAdminStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("默认 QQ 群固定存在", () => {
    const store = useSystemAdminStore();

    expect(store.defaultQQGroups).toEqual(["1345795", "450555868"]);
    expect(store.notificationQQGroups).toEqual(["1345795", "450555868"]);
  });

  test("自定义 QQ 群支持新增、trim 和去重", () => {
    const store = useSystemAdminStore();

    expect(store.addCustomQQGroup(" 123456 ")).toBe(true);
    expect(store.addCustomQQGroup("123456")).toBe(false);

    expect(store.customQQGroups).toEqual(["123456"]);
    expect(store.notificationQQGroups).toEqual(["1345795", "450555868", "123456"]);
  });

  test("非法 QQ 群不会写入", () => {
    const store = useSystemAdminStore();

    expect(store.addCustomQQGroup("abc")).toBe(false);
    expect(store.addCustomQQGroup("12 34")).toBe(false);

    expect(store.customQQGroups).toEqual([]);
  });

  test("自定义 QQ 群支持删除和清空", () => {
    const store = useSystemAdminStore();

    store.addCustomQQGroup("123456");
    store.addCustomQQGroup("654321");
    store.removeCustomQQGroup("123456");

    expect(store.customQQGroups).toEqual(["654321"]);

    store.clearCustomQQGroups();

    expect(store.customQQGroups).toEqual([]);
  });
});

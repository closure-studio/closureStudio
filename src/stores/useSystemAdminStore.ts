import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { DEFAULT_QQ_GROUPS } from "@/constants/systemAdmin";

const QQ_GROUP_PATTERN = /^\d+$/;

export const normalizeQQGroup = (group: string) => group.trim();

export const isValidQQGroup = (group: string) => QQ_GROUP_PATTERN.test(normalizeQQGroup(group));

export const mergeQQGroups = (groups: string[]) => {
  const normalizedGroups = groups.map(normalizeQQGroup).filter(isValidQQGroup);
  return Array.from(new Set(normalizedGroups));
};

export const useSystemAdminStore = defineStore("systemAdmin", () => {
  const customQQGroups = ref<string[]>([]);

  const defaultQQGroups = computed(() => [...DEFAULT_QQ_GROUPS]);

  const notificationQQGroups = computed(() =>
    mergeQQGroups([...defaultQQGroups.value, ...customQQGroups.value])
  );

  const addCustomQQGroup = (group: string) => {
    if (!isValidQQGroup(group)) {
      return false;
    }
    const nextGroups = mergeQQGroups([...customQQGroups.value, group]);
    const changed = nextGroups.length !== customQQGroups.value.length;
    customQQGroups.value = nextGroups;
    return changed;
  };

  const removeCustomQQGroup = (group: string) => {
    const normalizedGroup = normalizeQQGroup(group);
    customQQGroups.value = customQQGroups.value.filter((item) => item !== normalizedGroup);
  };

  const clearCustomQQGroups = () => {
    customQQGroups.value = [];
  };

  return {
    customQQGroups,
    defaultQQGroups,
    notificationQQGroups,
    addCustomQQGroup,
    removeCustomQQGroup,
    clearCustomQQGroups,
  };
});

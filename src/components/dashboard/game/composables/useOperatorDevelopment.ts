import { computed, onScopeDispose, reactive, ref, watch } from "vue";
import apiClient from "@/services/apiClient";
import { API_RESPONSE_CODE } from "@/constants/api";
import type { ApiGameChar, OperatorDevelopmentTask } from "@/shared/types/api";
import {
  cloneDevelopmentTarget,
  defaultDevelopmentTarget,
  updateDevelopmentTasks,
  validateDevelopmentTarget,
} from "@/utils/operatorDevelopment";

// Keep reopening a dialog from starting a second write for the same account.
const submittingAccounts = reactive(new Set<string>());

export function useOperatorDevelopment(
  account: () => string,
  selectedChar: () => ApiGameChar,
) {
  const currentChar = ref(selectedChar());
  const draft = ref(defaultDevelopmentTarget(selectedChar()));
  const savedTask = ref<OperatorDevelopmentTask | null>(null);
  const isLoading = ref(false);
  const isReady = ref(false);
  const error = ref("");
  const notice = ref("");
  const isSaving = computed(() => submittingAccounts.has(account()));
  const isAdded = computed(() => savedTask.value !== null);
  const target = computed(() => savedTask.value?.target ?? draft.value);
  let generation = 0;

  async function readDetails(requestAccount: string, charId: string) {
    const response = await apiClient.fetchGameDetails(requestAccount);
    if (response.code !== API_RESPONSE_CODE.SUCCESS || !response.data?.config) {
      throw new Error(response.message || "培养计划加载失败");
    }
    const char = Object.values(response.data.troop?.chars ?? {}).find(
      (item) => item.charId === charId,
    );
    if (!char) throw new Error("未获取到该干员的最新数据，请重试");
    return {
      char,
      tasks: response.data.config.operator_development_tasks ?? [],
    };
  }

  async function load() {
    const requestId = ++generation;
    const requestAccount = account();
    const charId = selectedChar().charId;
    currentChar.value = selectedChar();
    draft.value = defaultDevelopmentTarget(selectedChar());
    savedTask.value = null;
    isReady.value = false;
    isLoading.value = true;
    error.value = "";
    notice.value = "";
    try {
      const { char, tasks } = await readDetails(requestAccount, charId);
      if (requestId !== generation) return;
      currentChar.value = char;
      savedTask.value = tasks.find((task) => task.char_id === charId) ?? null;
      draft.value = savedTask.value
        ? cloneDevelopmentTarget(savedTask.value.target)
        : defaultDevelopmentTarget(char);
      isReady.value = true;
    } catch (cause) {
      if (requestId === generation)
        error.value =
          cause instanceof Error ? cause.message : "培养计划加载失败";
    } finally {
      if (requestId === generation) isLoading.value = false;
    }
  }

  async function submit() {
    if (!isReady.value || isSaving.value || isLoading.value) return;
    const requestId = generation;
    const requestAccount = account();
    const charId = selectedChar().charId;
    const removing = isAdded.value;
    const submittedTarget = cloneDevelopmentTarget(target.value);
    error.value = "";
    notice.value = "";
    submittingAccounts.add(requestAccount);
    try {
      const { char, tasks } = await readDetails(requestAccount, charId);
      if (requestId !== generation) return;
      currentChar.value = char;
      const existing = tasks.find((task) => task.char_id === charId);
      if (!removing && existing) {
        savedTask.value = existing;
        draft.value = cloneDevelopmentTarget(existing.target);
        notice.value = "该干员已加入培养计划，已刷新目标";
        return;
      }
      if (!removing) {
        const validation = validateDevelopmentTarget(char, submittedTarget);
        if (validation) throw new Error(validation);
      }
      const nextTasks = updateDevelopmentTasks(
        tasks,
        charId,
        removing ? null : submittedTarget,
      );
      const response = await apiClient.doUpdateGameConf(requestAccount, {
        operator_development_tasks: nextTasks,
      });
      if (requestId !== generation) return;
      if (response.code !== API_RESPONSE_CODE.SUCCESS)
        throw new Error(response.message || "培养计划提交失败");
      savedTask.value = removing
        ? null
        : { char_id: charId, target: cloneDevelopmentTarget(submittedTarget) };
      draft.value = cloneDevelopmentTarget(submittedTarget);
      notice.value = removing ? "已移出培养计划" : "已加入培养计划";
    } catch (cause) {
      if (requestId === generation)
        error.value =
          cause instanceof Error ? cause.message : "培养计划提交失败，请重试";
    } finally {
      submittingAccounts.delete(requestAccount);
    }
  }

  watch([account, () => selectedChar().charId], load, {
    immediate: true,
    flush: "sync",
  });
  onScopeDispose(() => {
    generation += 1;
  });

  return {
    currentChar,
    draft,
    target,
    isAdded,
    isLoading,
    isReady,
    isSaving,
    error,
    notice,
    load,
    submit,
  };
}

<template>
  <div class="system-config p-2">
    <div v-if="isLoadingConfig" class="flex min-h-64 items-center justify-center">
      <span class="loading loading-bars loading-lg text-info"></span>
    </div>

    <div v-else-if="draftConfig" class="space-y-5">
      <section class="space-y-5">
        <div>
          <h2 class="text-base font-bold">公告广播</h2>
          <p class="text-xs font-medium text-base-content/60">
            {{ SYSTEM_CONFIG_TEXT.ANNOUNCEMENT_HELP }}
          </p>
        </div>
        <textarea
          v-model="draftConfig.announcement"
          class="admin-announcement-field textarea textarea-bordered min-h-36 w-full resize-y border-base-300/55 text-sm leading-6 focus:border-info/60"
          :disabled="isPublishing"
          placeholder="请输入系统公告"
        ></textarea>
        <CheckOptionCard
          v-model="shouldNotifyAnnouncement"
          :title="SYSTEM_CONFIG_TEXT.ANNOUNCEMENT_NOTIFY_LABEL"
          :description="SYSTEM_CONFIG_TEXT.ANNOUNCEMENT_NOTIFY_HELP"
          :disabled="isPublishing"
        />
      </section>

      <div class="divider mb-3 mt-0">权限开关</div>

      <section class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ToggleInfoCard
          v-for="item in serviceSwitches"
          :key="item.key"
          v-model:active="draftConfig[item.key]"
          :title="item.title"
          :description="item.description"
          clickable
          :disabled="isPublishing"
        />
      </section>

      <div class="divider mb-3 mt-0">QQ 群通知</div>

      <section class="space-y-3">
        <div class="flex w-full flex-col gap-2 rounded-box bg-base-100">
          <div
            v-for="group in systemAdminStore.defaultQQGroups"
            :key="group"
            class="bg-[#251E15] rounded-lg"
          >
            <StatusListItem :title="group" active>
              <template #suffix>
                <span class="text-xs font-medium text-base-content/60">默认通知</span>
              </template>
            </StatusListItem>
          </div>
          <StatusListItem
            v-for="(group, index) in systemAdminStore.customQQGroups"
            :key="group"
            :title="group"
            clickable
            :disabled="isPublishing"
            @click="systemAdminStore.removeCustomQQGroup(group)"
          >
            <template #suffix>
              <span class="text-xs font-medium text-base-content/60">点击移除</span>
            </template>
            <div
              v-if="index < systemAdminStore.customQQGroups.length - 1"
              class="divider my-0"
            />
          </StatusListItem>
        </div>
      </section>

      <div class="divider mb-3 mt-0">{{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_TITLE }}</div>

      <section class="space-y-3">
        <button
          v-if="draftConfig.shutdownTasks?.length"
          type="button"
          class="admin-shutdown-summary flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isPublishing"
          @click="isShutdownTasksExpanded = !isShutdownTasksExpanded"
        >
          <div class="min-w-0 space-y-1">
            <div class="text-sm font-bold">
              {{ isShutdownTasksExpanded ? "▼" : "▶" }}
              {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_TITLE }}
            </div>
            <p class="text-xs font-medium text-base-content/60">
              {{ formatShutdownTaskTime(nextShutdownTask.timestamp) }}
            </p>
          </div>
          <span class="shrink-0 text-xs font-medium text-base-content/50">
            {{
              isShutdownTasksExpanded
                ? SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_EXPAND_SUFFIX
                : SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_COLLAPSE_SUFFIX
            }}
          </span>
        </button>

        <div v-if="isShutdownTasksExpanded" class="space-y-3 px-1 py-2">
          <div
            v-for="(task, index) in draftConfig.shutdownTasks"
            :key="`${task.timestamp}-${index}`"
            class="space-y-3"
          >
            <div class="flex justify-end">
              <button
                type="button"
                class="btn btn-outline btn-error btn-sm"
                :disabled="isPublishing"
                @click="removeShutdownTask(index)"
              >
                删除
              </button>
            </div>

            <div class="admin-time-editor space-y-3 py-2">
              <div class="grid grid-cols-1 gap-2 md:grid-cols-[minmax(17rem,20rem)_1fr] md:gap-4">
                <div class="admin-calendar space-y-3">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-medium text-base-content/60">
                        {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_DATE_LABEL }}
                      </p>
                      <p class="text-sm font-semibold">
                        {{ formatCalendarMonthTitle(task) }}
                      </p>
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="admin-time-step btn btn-ghost btn-xs"
                        :disabled="isPublishing"
                        aria-label="上个月"
                        @click="adjustCalendarMonth(task, -1)"
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        class="admin-time-step btn btn-ghost btn-xs"
                        :disabled="isPublishing"
                        aria-label="下个月"
                        @click="adjustCalendarMonth(task, 1)"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-medium text-base-content/45">
                    <span v-for="weekday in calendarWeekdays" :key="weekday">{{ weekday }}</span>
                  </div>

                  <div class="grid grid-cols-7 gap-1">
                    <button
                      v-for="cell in getCalendarCells(task)"
                      :key="cell.key"
                      type="button"
                      class="admin-calendar-day h-8 rounded-md text-sm"
                      :class="{
                        'admin-calendar-day-selected': cell.isSelected,
                        'admin-calendar-day-today': cell.isToday && !cell.isSelected,
                      }"
                      :disabled="isPublishing || !cell.day"
                      @click="cell.day && selectShutdownTaskCalendarDay(task, cell.day)"
                    >
                      {{ cell.day || "" }}
                    </button>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="space-y-1">
                    <span class="label-text text-xs font-medium text-base-content/70">
                      {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_CLOCK_LABEL }}
                    </span>
                    <div class="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        class="admin-time-step btn btn-ghost btn-xs"
                        :disabled="isPublishing"
                        @click="adjustShutdownTaskMinutes(task, -60)"
                      >
                        -1h
                      </button>
                      <button
                        type="button"
                        class="admin-time-step btn btn-ghost btn-xs"
                        :disabled="isPublishing"
                        @click="adjustShutdownTaskMinutes(task, -15)"
                      >
                        -15m
                      </button>
                      <span class="admin-time-readout rounded-lg px-3 py-1.5 text-sm font-semibold">
                        {{ formatShutdownTaskClock(task.timestamp) }}
                      </span>
                      <button
                        type="button"
                        class="admin-time-step btn btn-ghost btn-xs"
                        :disabled="isPublishing"
                        @click="adjustShutdownTaskMinutes(task, 15)"
                      >
                        +15m
                      </button>
                      <button
                        type="button"
                        class="admin-time-step btn btn-ghost btn-xs"
                        :disabled="isPublishing"
                        @click="adjustShutdownTaskMinutes(task, 60)"
                      >
                        +1h
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="admin-time-step btn btn-ghost btn-xs"
                      :disabled="isPublishing"
                      @click="setShutdownTaskAfterHours(task, 1)"
                    >
                      {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_QUICK_ONE_HOUR }}
                    </button>
                    <button
                      type="button"
                      class="admin-time-step btn btn-ghost btn-xs"
                      :disabled="isPublishing"
                      @click="setShutdownTaskTonight(task)"
                    >
                      {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_QUICK_TONIGHT }}
                    </button>
                    <button
                      type="button"
                      class="admin-time-step btn btn-ghost btn-xs"
                      :disabled="isPublishing"
                      @click="setShutdownTaskTomorrowDawn(task)"
                    >
                      {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_QUICK_TOMORROW_DAWN }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ToggleInfoCard
                v-for="item in shutdownTaskSwitches"
                :key="item.key"
                v-model:active="task.config[item.key]"
                :title="item.title"
                :description="`重启后${item.description}`"
                clickable
                :disabled="isPublishing"
              />
            </div>

            <div
              v-if="index < (draftConfig.shutdownTasks?.length ?? 0) - 1"
              class="divider my-1"
            />
          </div>

          <button
            type="button"
            class="btn btn-outline btn-info btn-sm w-full"
            :disabled="isPublishing"
            @click="addShutdownTask"
          >
            {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_ADD }}
          </button>
        </div>

        <button
          v-else
          type="button"
          class="btn btn-outline btn-info btn-sm w-full"
          :disabled="isPublishing"
          @click="addShutdownTask"
        >
          {{ SYSTEM_CONFIG_TEXT.SHUTDOWN_TASKS_ADD }}
        </button>
      </section>

      <button class="btn btn-info btn-block" :disabled="isPublishing" @click="handlePublish">
        <span v-if="isPublishing" class="loading loading-bars loading-sm"></span>
        发布
      </button>
    </div>

    <div v-else class="py-10 text-center">
      <button class="btn btn-outline btn-info btn-sm" :disabled="isLoadingConfig" @click="loadConfig">
        重新加载
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  API_QQBOT_SPECIAL_NOTIFY_STATUS,
  type ApiSystemConfigEditable,
  type ApiSystemConfigShutdownTask,
  type ApiSystemConfigShutdownTaskConfig,
} from "@/shared/types/api";
import {
  buildApiSystemConfigUpdate,
  cloneApiSystemConfigShutdownTasks,
  loadApiSystemConfigEditable,
  saveApiSystemConfigEditable,
} from "@/services/systemConfigAdmin";
import { SYSTEM_CONFIG_MESSAGES, SYSTEM_CONFIG_TEXT } from "@/constants/systemAdmin";
import { setMsg } from "@/utils/toast";
import { Type } from "@/constants/ui";
import { useSystemAdminStore } from "@/stores/useSystemAdminStore";
import { useUserStore } from "@/stores/useUserStore";
import CheckOptionCard from "@/shared/components/ui/CheckOptionCard.vue";
import StatusListItem from "@/shared/components/ui/StatusListItem.vue";
import ToggleInfoCard from "@/shared/components/ui/ToggleInfoCard.vue";

type ServiceSwitchKey = keyof ApiSystemConfigShutdownTaskConfig;

interface ServiceSwitch {
  key: ServiceSwitchKey;
  title: string;
  description: string;
}

interface BeijingDateParts {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}

interface CalendarCell {
  key: string;
  day: number | null;
  isSelected: boolean;
  isToday: boolean;
}

const BEIJING_UTC_OFFSET_SECONDS = 8 * 60 * 60;

const serviceSwitches: ServiceSwitch[] = [
  {
    key: "allowGameLogin",
    title: "游戏登录",
    description: "全局控制所有用户是否可以登录游戏服务",
  },
  {
    key: "allowGameCreate",
    title: "游戏创建",
    description: "全局控制所有用户是否可以创建托管账号",
  },
  {
    key: "allowGameUpdate",
    title: "游戏更新",
    description: "全局控制所有用户是否可以更新托管配置",
  },
  {
    key: "allowGameDelete",
    title: "游戏删除",
    description: "全局控制所有用户是否可以删除托管账号",
  },
];

const shutdownTaskSwitches = serviceSwitches.filter((item) => item.key === "allowGameLogin");

const userStore = useUserStore();
const systemAdminStore = useSystemAdminStore();

const originalConfig = ref<ApiSystemConfigEditable | null>(null);
const draftConfig = ref<ApiSystemConfigEditable | null>(null);
const isLoadingConfig = ref(false);
const isPublishing = ref(false);
const shouldNotifyAnnouncement = ref(false);
const isShutdownTasksExpanded = ref(false);
const calendarView = ref<{ year: number; month: number } | null>(null);

const calendarWeekdays = ["一", "二", "三", "四", "五", "六", "日"] as const;

const customQQGroups = computed(() => systemAdminStore.customQQGroups);

const cloneConfig = (config: ApiSystemConfigEditable): ApiSystemConfigEditable => ({
  ...config,
  shutdownTasks: cloneApiSystemConfigShutdownTasks(config.shutdownTasks),
});

const sortedShutdownTasks = computed(() =>
  [...(draftConfig.value?.shutdownTasks ?? [])].sort((left, right) => left.timestamp - right.timestamp)
);

const nextShutdownTask = computed(() => sortedShutdownTasks.value[0]);

const padDatePart = (value: number) => String(value).padStart(2, "0");

const getCurrentMinuteTimestamp = () => Math.floor(Date.now() / 60000) * 60;

const getDaysInBeijingMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const getBeijingMonthStartOffset = (year: number, month: number) => {
  const sundayFirstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (sundayFirstDay + 6) % 7;
};

const getBeijingDateParts = (timestamp: number): BeijingDateParts => {
  const date = new Date((timestamp + BEIJING_UTC_OFFSET_SECONDS) * 1000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
  };
};

const getTimestampFromBeijingDateParts = (parts: BeijingDateParts) =>
  Math.floor(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes) / 1000 -
      BEIJING_UTC_OFFSET_SECONDS
  );

const formatShutdownTaskTime = (timestamp: number) => {
  const parts = getBeijingDateParts(timestamp);
  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)} ${padDatePart(
    parts.hours
  )}:${padDatePart(parts.minutes)} 北京时间`;
};

const formatShutdownTaskClock = (timestamp: number) => {
  const parts = getBeijingDateParts(timestamp);
  return `${padDatePart(parts.hours)}:${padDatePart(parts.minutes)}`;
};

const getCalendarViewForTask = (task: ApiSystemConfigShutdownTask) => {
  const parts = getBeijingDateParts(task.timestamp);
  return calendarView.value ?? { year: parts.year, month: parts.month };
};

const isSameBeijingDate = (left: BeijingDateParts, right: BeijingDateParts) =>
  left.year === right.year && left.month === right.month && left.day === right.day;

const formatCalendarMonthTitle = (task: ApiSystemConfigShutdownTask) => {
  const view = getCalendarViewForTask(task);
  return `${view.year} 年 ${view.month} 月`;
};

const getCalendarCells = (task: ApiSystemConfigShutdownTask): CalendarCell[] => {
  const view = getCalendarViewForTask(task);
  const selectedParts = getBeijingDateParts(task.timestamp);
  const todayParts = getBeijingDateParts(Math.floor(Date.now() / 1000));
  const leadingBlankCount = getBeijingMonthStartOffset(view.year, view.month);
  const daysInMonth = getDaysInBeijingMonth(view.year, view.month);
  const cells: CalendarCell[] = [];

  for (let index = 0; index < leadingBlankCount; index += 1) {
    cells.push({
      key: `blank-start-${index}`,
      day: null,
      isSelected: false,
      isToday: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cellParts = {
      year: view.year,
      month: view.month,
      day,
      hours: selectedParts.hours,
      minutes: selectedParts.minutes,
    };
    cells.push({
      key: `${view.year}-${view.month}-${day}`,
      day,
      isSelected: isSameBeijingDate(cellParts, selectedParts),
      isToday: isSameBeijingDate(cellParts, todayParts),
    });
  }

  while (cells.length % calendarWeekdays.length !== 0) {
    cells.push({
      key: `blank-end-${cells.length}`,
      day: null,
      isSelected: false,
      isToday: false,
    });
  }

  return cells;
};

const createShutdownTaskConfigFromDraft = (): ApiSystemConfigShutdownTaskConfig => ({
  allowGameLogin: draftConfig.value?.allowGameLogin ?? true,
  allowGameCreate: draftConfig.value?.allowGameCreate ?? true,
  allowGameUpdate: draftConfig.value?.allowGameUpdate ?? true,
  allowGameDelete: draftConfig.value?.allowGameDelete ?? true,
});

const addShutdownTask = () => {
  if (!draftConfig.value) return;
  const nextTasks = [
    ...(draftConfig.value.shutdownTasks ?? []),
    {
      timestamp: getCurrentMinuteTimestamp() + 60 * 60,
      config: createShutdownTaskConfigFromDraft(),
    },
  ];
  draftConfig.value.shutdownTasks = nextTasks;
  isShutdownTasksExpanded.value = true;
  syncCalendarViewToTask(nextTasks[nextTasks.length - 1]);
};

const removeShutdownTask = (index: number) => {
  if (!draftConfig.value) return;
  draftConfig.value.shutdownTasks = (draftConfig.value.shutdownTasks ?? []).filter(
    (_task, taskIndex) => taskIndex !== index
  );
};

const syncCalendarViewToTask = (task: ApiSystemConfigShutdownTask) => {
  const parts = getBeijingDateParts(task.timestamp);
  calendarView.value = {
    year: parts.year,
    month: parts.month,
  };
};

const adjustShutdownTaskMinutes = (task: ApiSystemConfigShutdownTask, minutes: number) => {
  task.timestamp += minutes * 60;
};

const adjustCalendarMonth = (task: ApiSystemConfigShutdownTask, monthOffset: number) => {
  const view = getCalendarViewForTask(task);
  const nextMonthDate = new Date(Date.UTC(view.year, view.month - 1 + monthOffset, 1));
  calendarView.value = {
    year: nextMonthDate.getUTCFullYear(),
    month: nextMonthDate.getUTCMonth() + 1,
  };
};

const selectShutdownTaskCalendarDay = (task: ApiSystemConfigShutdownTask, day: number) => {
  const view = getCalendarViewForTask(task);
  const parts = getBeijingDateParts(task.timestamp);
  task.timestamp = getTimestampFromBeijingDateParts({
    ...parts,
    year: view.year,
    month: view.month,
    day,
  });
};

const setShutdownTaskAfterHours = (task: ApiSystemConfigShutdownTask, hours: number) => {
  task.timestamp = getCurrentMinuteTimestamp() + hours * 60 * 60;
  syncCalendarViewToTask(task);
};

const setShutdownTaskTonight = (task: ApiSystemConfigShutdownTask) => {
  const nowTimestamp = Math.floor(Date.now() / 1000);
  const parts = getBeijingDateParts(nowTimestamp);
  let timestamp = getTimestampFromBeijingDateParts({
    ...parts,
    hours: 23,
    minutes: 0,
  });
  if (timestamp <= nowTimestamp) {
    timestamp = getTimestampFromBeijingDateParts({
      ...parts,
      day: parts.day + 1,
      hours: 23,
      minutes: 0,
    });
  }
  task.timestamp = timestamp;
  syncCalendarViewToTask(task);
};

const setShutdownTaskTomorrowDawn = (task: ApiSystemConfigShutdownTask) => {
  const parts = getBeijingDateParts(Math.floor(Date.now() / 1000));
  task.timestamp = getTimestampFromBeijingDateParts({
    ...parts,
    day: parts.day + 1,
    hours: 5,
    minutes: 0,
  });
  syncCalendarViewToTask(task);
};

const loadConfig = async () => {
  if (isLoadingConfig.value) return;
  isLoadingConfig.value = true;
  try {
    const config = await loadApiSystemConfigEditable();
    originalConfig.value = cloneConfig(config);
    draftConfig.value = cloneConfig(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : SYSTEM_CONFIG_MESSAGES.LOAD_FAILED;
    setMsg(message, Type.Error);
    originalConfig.value = null;
    draftConfig.value = null;
  } finally {
    isLoadingConfig.value = false;
  }
};

const handlePublish = async () => {
  if (!originalConfig.value || !draftConfig.value || isPublishing.value) return;

  const payload = buildApiSystemConfigUpdate(originalConfig.value, draftConfig.value);
  if (Object.keys(payload).length === 0) {
    setMsg(SYSTEM_CONFIG_MESSAGES.NO_CHANGES, Type.Info);
    return;
  }

  isPublishing.value = true;
  try {
    const result = await saveApiSystemConfigEditable({
      userPermission: userStore.info.permission,
      originalConfig: originalConfig.value,
      draftConfig: draftConfig.value,
      customQQGroups: customQQGroups.value,
      shouldNotifyAnnouncement: shouldNotifyAnnouncement.value,
    });
    originalConfig.value = cloneConfig(result.config);
    draftConfig.value = cloneConfig(result.config);
    if (payload.announcement === undefined) {
      setMsg(SYSTEM_CONFIG_MESSAGES.PUBLISH_SUCCESS, Type.Success);
      return;
    }
    if (!shouldNotifyAnnouncement.value) {
      setMsg(SYSTEM_CONFIG_MESSAGES.PUBLISH_SUCCESS, Type.Success);
      return;
    }
    if (result.notifyError) {
      setMsg(SYSTEM_CONFIG_MESSAGES.QQBOT_NOTIFY_FAILED, Type.Warning);
      return;
    }
    if (result.notifyResult?.status === API_QQBOT_SPECIAL_NOTIFY_STATUS.PARTIAL_FAILED) {
      setMsg(SYSTEM_CONFIG_MESSAGES.QQBOT_NOTIFY_PARTIAL_FAILED, Type.Warning);
      return;
    }
    setMsg(SYSTEM_CONFIG_MESSAGES.QQBOT_NOTIFY_SUCCESS, Type.Success);
  } catch (error) {
    const message = error instanceof Error ? error.message : SYSTEM_CONFIG_MESSAGES.UPDATE_FAILED;
    setMsg(message, Type.Error);
  } finally {
    isPublishing.value = false;
  }
};

onMounted(loadConfig);
</script>

<style scoped>
.admin-announcement-field {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-100) 94%, var(--color-base-content) 6%),
      color-mix(in oklab, var(--color-base-100) 82%, var(--color-base-200) 18%)
    );
}

.admin-shutdown-summary {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 52%, var(--color-base-100) 48%),
      color-mix(in oklab, var(--color-base-300) 38%, var(--color-base-100) 62%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 7%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 8%, transparent),
    0 0.35rem 0.9rem color-mix(in oklab, black 16%, transparent);
}

.admin-shutdown-summary:hover {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 62%, var(--color-base-100) 38%),
      color-mix(in oklab, var(--color-base-300) 46%, var(--color-base-100) 54%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 9%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 11%, transparent),
    0 0.45rem 1rem color-mix(in oklab, black 18%, transparent);
}

.admin-time-readout {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 56%, var(--color-base-content) 4%),
      color-mix(in oklab, var(--color-base-300) 44%, var(--color-base-200) 56%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 8%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 10%, transparent);
}

.admin-time-step {
  min-height: 1.75rem;
  border: 0;
  color: color-mix(in oklab, var(--color-base-content) 92%, transparent);
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 62%, var(--color-base-content) 4%),
      color-mix(in oklab, var(--color-base-300) 48%, var(--color-base-200) 52%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 8%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 10%, transparent);
}

.admin-time-step:hover {
  color: var(--color-base-content);
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 72%, var(--color-base-content) 6%),
      color-mix(in oklab, var(--color-base-300) 58%, var(--color-base-200) 42%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 10%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 14%, transparent);
}

.admin-calendar {
  min-width: 0;
}

.admin-calendar-day {
  min-width: 0;
  background: transparent;
  color: color-mix(in oklab, var(--color-base-content) 82%, transparent);
  transition:
    background-color 140ms ease,
    color 140ms ease,
    box-shadow 140ms ease;
}

.admin-calendar-day:not(:disabled):hover {
  background: color-mix(in oklab, var(--color-base-200) 74%, transparent);
}

.admin-calendar-day:disabled {
  cursor: default;
  opacity: 0;
}

.admin-calendar-day-selected {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-info) 52%, var(--color-base-200) 48%),
      color-mix(in oklab, var(--color-info) 42%, var(--color-base-300) 58%)
    );
  color: color-mix(in oklab, var(--color-info-content) 86%, var(--color-base-content) 14%);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 10%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-info) 32%, transparent);
}

.admin-calendar-day-selected:not(:disabled):hover {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-info) 58%, var(--color-base-200) 42%),
      color-mix(in oklab, var(--color-info) 48%, var(--color-base-300) 52%)
    );
}

.admin-calendar-day-today {
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-base-content) 22%, transparent);
}

</style>

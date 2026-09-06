<template>
  <form
    class="flex min-h-0 flex-col border-t border-base-content/10 bg-base-100 text-[13px] tracking-normal text-base-content md:text-sm"
    :aria-busy="isLoading || isSaving"
    @submit.prevent="handleSubmit"
  >
    <div
      v-if="isLoading"
      class="flex min-h-60 flex-col items-center justify-center gap-4 p-6 text-center text-base-content/70"
      role="status"
    >
      <span class="loading loading-spinner loading-md" aria-hidden="true" />
      <span>正在加载培养计划</span>
    </div>
    <div
      v-else-if="!isReady"
      class="flex min-h-60 flex-col items-center justify-center gap-4 p-6 text-center text-base-content/70"
    >
      <p role="alert">{{ error }}</p>
      <button
        type="button"
        class="btn btn-sm btn-outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-info"
        @click="load"
      >
        <Icon icon="mdi:refresh" aria-hidden="true" />重试
      </button>
    </div>
    <template v-else>
      <div class="min-h-0 overflow-y-auto overscroll-contain px-4 md:px-6">
        <section aria-labelledby="development-base-title">
          <div class="pb-0 pt-4 md:pb-2 md:pt-6">
            <h3
              id="development-base-title"
              class="m-0 text-base/6 font-semibold md:text-lg/[1.5]"
            >
              基础培养
            </h3>
          </div>
          <fieldset
            class="m-0 min-w-0 border-0 p-0"
            :disabled="isAdded || isSaving"
          >
            <legend class="sr-only">基础培养目标</legend>
            <div
              class="grid min-h-[76px] grid-cols-[104px_36px_minmax(0,1fr)] items-center justify-stretch gap-1.5 border-b border-base-content/10 md:min-h-[86px] md:grid-cols-[188px_96px_minmax(0,270px)] md:justify-between md:gap-4"
            >
              <div
                class="relative flex min-w-0 flex-col justify-center gap-1.5 pl-[9px] before:absolute before:inset-y-0.5 before:left-0 before:w-0.5 before:rounded-[2px] before:bg-base-content/20 before:content-[''] md:gap-[7px] md:pl-[13px]"
              >
                <span
                  class="flex items-center gap-[5px] whitespace-nowrap text-[9px]/none font-semibold text-base-content/50 md:text-[11px] [&_strong]:font-semibold [&_strong]:text-base-content/70"
                >
                  <strong>当前</strong><span aria-hidden="true">·</span>精英阶段
                </span>
                <span
                  class="whitespace-nowrap text-[13px]/[1.15] font-semibold text-base-content tabular-nums md:text-lg"
                  >{{ phaseName(currentChar.evolvePhase) }}</span
                >
              </div>
              <span
                class="mt-4 flex h-6 w-9 min-w-0 items-center justify-self-center overflow-hidden text-info before:h-0.5 before:flex-1 before:animate-[operator-development-comparison-flow_650ms_linear_infinite] before:bg-[repeating-linear-gradient(to_right,currentColor_0_7px,transparent_7px_13px)] before:bg-[length:13px_2px] before:opacity-70 before:content-[''] motion-reduce:before:animate-none md:w-24 [&_svg]:ml-[-2px] [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:animate-[operator-development-comparison-arrow-pulse_900ms_ease-in-out_infinite] motion-reduce:[&_svg]:animate-none md:[&_svg]:size-5"
                aria-hidden="true"
                ><Icon icon="mdi:chevron-double-right"
              /></span>
              <div class="flex min-w-0 flex-col gap-1.5">
                <span
                  class="text-[9px]/none font-semibold text-success md:text-[10px]"
                  >目标</span
                >
                <div
                  class="flex h-9 min-w-0 overflow-hidden rounded border border-base-content/20 md:h-10"
                  role="group"
                  aria-label="目标精英阶段"
                >
                  <button
                    v-for="phase in phases"
                    :key="phase"
                    class="min-w-0 flex-1 cursor-pointer whitespace-nowrap border-0 border-r border-base-content/10 bg-transparent px-[3px] text-[11px] text-base-content/90 last:border-r-0 aria-pressed:bg-info aria-pressed:text-info-content disabled:cursor-default [&:disabled:not([aria-pressed=true])]:text-base-content/40 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-info md:px-[5px] md:text-[13px]"
                    type="button"
                    :aria-pressed="target.evolve_phase === phase"
                    :disabled="phase < currentChar.evolvePhase"
                    @click="setPhase(phase)"
                  >
                    {{ phaseName(phase) }}
                  </button>
                </div>
              </div>
            </div>
            <div
              v-for="row in numericRows"
              :key="row.key"
              class="grid min-h-[86px] grid-cols-[104px_36px_minmax(0,1fr)] items-center justify-stretch gap-1.5 border-b border-base-content/10 md:min-h-[100px] md:grid-cols-[188px_96px_minmax(0,270px)] md:justify-between md:gap-4"
            >
              <div
                class="relative flex min-w-0 flex-col justify-center gap-1.5 pl-[9px] before:absolute before:inset-y-0.5 before:left-0 before:w-0.5 before:rounded-[2px] before:bg-base-content/20 before:content-[''] md:gap-[7px] md:pl-[13px]"
              >
                <span
                  class="flex items-center gap-[5px] whitespace-nowrap text-[9px]/none font-semibold text-base-content/50 md:text-[11px] [&_strong]:font-semibold [&_strong]:text-base-content/70"
                >
                  <strong>当前</strong><span aria-hidden="true">·</span
                  >{{ row.label }}
                </span>
                <span
                  class="whitespace-nowrap text-[13px]/[1.15] font-semibold text-base-content tabular-nums"
                  :class="
                    row.key === 'skill_level' ? 'md:text-base' : 'md:text-lg'
                  "
                >
                  {{
                    row.key === "level" ? `Lv. ${currentChar.level}` : "未知"
                  }}
                </span>
              </div>
              <span
                class="mt-4 flex h-6 w-9 min-w-0 items-center justify-self-center overflow-hidden text-info before:h-0.5 before:flex-1 before:animate-[operator-development-comparison-flow_650ms_linear_infinite] before:bg-[repeating-linear-gradient(to_right,currentColor_0_7px,transparent_7px_13px)] before:bg-[length:13px_2px] before:opacity-70 before:content-[''] motion-reduce:before:animate-none md:w-24 [&_svg]:ml-[-2px] [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:animate-[operator-development-comparison-arrow-pulse_900ms_ease-in-out_infinite] motion-reduce:[&_svg]:animate-none md:[&_svg]:size-5"
                aria-hidden="true"
                ><Icon icon="mdi:chevron-double-right"
              /></span>
              <div class="flex min-w-0 flex-col gap-1.5">
                <span
                  class="text-[9px]/none font-semibold text-success md:text-[10px]"
                  >目标</span
                >
                <div
                  class="grid grid-cols-[32px_minmax(0,1fr)_32px] items-center gap-[3px] md:grid-cols-[38px_minmax(0,1fr)_38px] md:gap-2"
                >
                  <button
                    class="grid h-[34px] w-8 cursor-pointer touch-manipulation select-none place-items-center rounded border border-base-content/20 bg-transparent p-0 text-base-content/90 [-webkit-touch-callout:none] disabled:cursor-default disabled:text-base-content/40 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-info md:h-[38px] md:w-[38px]"
                    type="button"
                    :aria-label="`降低${row.label}`"
                    :title="`降低${row.label}`"
                    :disabled="target[row.key] <= row.min"
                    @click="handleNumberStepClick(row.key, -1)"
                    @pointerdown="startNumberRepeat($event, row.key, -1)"
                    @pointerup="stopNumberRepeat"
                    @pointercancel="stopNumberRepeat"
                    @lostpointercapture="stopNumberRepeat"
                    @contextmenu.prevent
                  >
                    <Icon
                      class="size-[19px] md:size-[23px]"
                      icon="mdi:minus"
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    class="flex min-w-0 items-baseline justify-center gap-0.5 tabular-nums md:gap-1"
                  >
                    <span
                      v-if="row.key === 'level'"
                      class="text-[13px] md:text-lg"
                      aria-hidden="true"
                      >Lv.</span
                    >
                    <output
                      class="inline-block min-w-[2.2ch] text-center text-[25px]/[1.4] text-success tabular-nums md:text-[30px]"
                      :aria-label="`目标${row.label} ${target[row.key]}`"
                    >
                      {{ target[row.key] }}
                    </output>
                  </div>
                  <button
                    class="grid h-[34px] w-8 cursor-pointer touch-manipulation select-none place-items-center rounded border border-base-content/20 bg-transparent p-0 text-base-content/90 [-webkit-touch-callout:none] disabled:cursor-default disabled:text-base-content/40 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-info md:h-[38px] md:w-[38px]"
                    type="button"
                    :aria-label="`提高${row.label}`"
                    :title="`提高${row.label}`"
                    :disabled="target[row.key] >= row.max"
                    @click="handleNumberStepClick(row.key, 1)"
                    @pointerdown="startNumberRepeat($event, row.key, 1)"
                    @pointerup="stopNumberRepeat"
                    @pointercancel="stopNumberRepeat"
                    @lostpointercapture="stopNumberRepeat"
                    @contextmenu.prevent
                  >
                    <Icon
                      class="size-[19px] md:size-[23px]"
                      icon="mdi:plus"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        <section
          class="pb-2 pt-4 md:pb-5 md:pt-[22px]"
          aria-labelledby="development-mastery-title"
        >
          <h3
            id="development-mastery-title"
            class="m-0 text-base/6 font-semibold md:text-lg/[1.5]"
          >
            技能专精
          </h3>
          <p v-if="!skills.length" class="py-5 text-base-content/60">
            暂无技能数据
          </p>
          <fieldset
            class="m-0 grid min-w-0 grid-cols-1 border-0 p-0 md:gap-x-4"
            :class="{
              'md:grid-cols-1': skills.length === 1,
              'md:grid-cols-2': skills.length === 2,
              'md:grid-cols-3': skills.length >= 3,
            }"
            :disabled="isAdded || isSaving"
          >
            <legend class="sr-only">技能专精目标</legend>
            <div
              v-for="(skill, index) in skills"
              :key="skill.skillId"
              class="grid min-w-0 grid-cols-[42px_minmax(0,1fr)] items-center gap-2.5 py-4 md:grid-cols-[48px_minmax(0,1fr)] md:gap-3 md:py-5"
            >
              <div
                class="grid size-[42px] place-items-center overflow-hidden rounded border border-base-content/20 bg-base-300 md:size-12"
              >
                <img
                  v-if="!failedImages.has(skill.skillId)"
                  class="size-full object-contain"
                  :src="getArkResourceUrl(`skills/skill_icon_${skill.skillId}`)"
                  alt=""
                  width="48"
                  height="48"
                  @error="failedImages.add(skill.skillId)"
                />
                <Icon
                  v-else
                  class="size-6 text-base-content/60"
                  icon="mdi:star-four-points-outline"
                  aria-hidden="true"
                />
              </div>
              <div
                class="col-start-2 flex h-9 min-w-0 overflow-hidden rounded border border-base-content/20 md:h-10"
                role="group"
                :aria-label="`${skillName(index)}目标专精`"
              >
                <button
                  v-for="level in masteryLevels"
                  :key="level"
                  class="min-w-0 flex-1 cursor-pointer whitespace-nowrap border-0 border-r border-base-content/10 bg-transparent px-[3px] text-[11px] text-base-content/90 first:flex-[1.5] last:border-r-0 aria-pressed:bg-info aria-pressed:text-info-content disabled:cursor-default [&:disabled:not([aria-pressed=true])]:text-base-content/40 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-info md:px-[5px] md:text-[13px]"
                  type="button"
                  :aria-label="`${skillName(index)}${level ? masteryName(level) : '不专精'}`"
                  :aria-pressed="masteryTarget(skill.skillId) === level"
                  :disabled="
                    level !== 0 &&
                    (!canDevelopMasteries(target) ||
                      level < skill.specializeLevel)
                  "
                  :title="
                    level && !canDevelopMasteries(target)
                      ? '需要目标精英 2、技能等级 7'
                      : undefined
                  "
                  @click="setMastery(skill.skillId, level)"
                >
                  {{ level ? romanLevels[level] : "不专精" }}
                </button>
              </div>
            </div>
          </fieldset>
        </section>
      </div>

      <footer
        class="shrink-0 border-t border-base-content/10 bg-base-100 p-3 md:px-[18px] md:py-3.5"
      >
        <p
          v-if="error || validationError"
          class="mb-2.5 text-[13px]/[1.5] text-error [overflow-wrap:anywhere]"
          role="alert"
        >
          {{ error || validationError }}
        </p>
        <button
          class="flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2.5 rounded border px-4 py-2.5 text-base font-medium transition-colors duration-[120ms] disabled:cursor-default disabled:opacity-[0.55] motion-reduce:transition-none md:min-h-12 md:text-[17px] [&>svg]:size-6 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-info"
          :class="
            isAdded
              ? 'border-error bg-transparent text-error enabled:hover:bg-error/10'
              : 'border-info bg-info text-info-content enabled:hover:bg-info/80'
          "
          type="submit"
          :disabled="isSaving || (!isAdded && !!validationError)"
        >
          <span
            v-if="isSaving"
            class="loading loading-spinner loading-sm"
            aria-hidden="true"
          />
          <Icon
            v-else
            :icon="isAdded ? 'mdi:minus' : 'mdi:plus'"
            aria-hidden="true"
          />
          {{
            isSaving ? "正在提交" : isAdded ? "移出培养计划" : "加入培养计划"
          }}
        </button>
      </footer>
    </template>
  </form>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, onBeforeUnmount, reactive, watch } from "vue";
import type { ApiGameChar } from "@/shared/types/api";
import { getArkResourceUrl } from "@/utils/resource";
import {
  canDevelopMasteries,
  DEVELOPMENT_LEVEL_CAPS,
  developmentLevelMin,
  validateDevelopmentTarget,
  type DevelopmentTarget,
} from "@/utils/operatorDevelopment";
import { useOperatorDevelopment } from "./composables/useOperatorDevelopment";

const props = defineProps<{ account: string; char: ApiGameChar }>();
const emit = defineEmits<{
  "development-change": [payload: { charId: string; isAdded: boolean }];
}>();
const {
  currentChar,
  draft,
  target,
  isAdded,
  isLoading,
  isReady,
  isSaving,
  error,
  load,
  submit,
} = useOperatorDevelopment(
  () => props.account,
  () => props.char,
);
const phases = [0, 1, 2] as const;
const masteryLevels = [0, 1, 2, 3] as const;
const romanLevels = ["", "I", "II", "III"];
const LONG_PRESS_DELAY = 400;
const LONG_PRESS_INTERVAL = 80;
type NumericRowKey = "level" | "skill_level";
let repeatDelayTimer: ReturnType<typeof setTimeout> | null = null;
let repeatIntervalTimer: ReturnType<typeof setInterval> | null = null;
let suppressStepperClick = false;
let suppressClickResetTimer: ReturnType<typeof setTimeout> | null = null;
const failedImages = reactive(new Set<string>());
const skills = computed(() => [
  ...new Map(
    currentChar.value.skills.map((skill) => [skill.skillId, skill]),
  ).values(),
]);
const phaseName = (phase: number) => (phase === 0 ? "未精英" : `精英 ${phase}`);
const skillName = (index: number) =>
  `${["一", "二", "三"][index] ?? index + 1}技能`;
const masteryName = (level: number) =>
  level ? `专精 ${romanLevels[level] ?? level}` : "未专精";
const masteryTarget = (skillId: string) =>
  target.value.masteries.find((item) => item.skill_id === skillId)
    ?.target_level ?? 0;
const numericRows = computed(() => [
  {
    key: "level" as const,
    label: "等级",
    min: developmentLevelMin(currentChar.value, target.value.evolve_phase),
    max: DEVELOPMENT_LEVEL_CAPS[target.value.evolve_phase],
  },
  {
    key: "skill_level" as const,
    label: "技能等级",
    min: 1,
    max: target.value.evolve_phase === 0 ? 4 : 7,
  },
]);
const validationError = computed(() =>
  isReady.value && !isAdded.value
    ? validateDevelopmentTarget(currentChar.value, draft.value)
    : "",
);
const clearMessages = () => {
  error.value = "";
};

async function handleSubmit() {
  const wasAdded = isAdded.value;
  await submit();
  if (isAdded.value === wasAdded) return;
  emit("development-change", {
    charId: props.char.charId,
    isAdded: isAdded.value,
  });
}

function clearNumberRepeatTimers() {
  if (repeatDelayTimer !== null) clearTimeout(repeatDelayTimer);
  if (repeatIntervalTimer !== null) clearInterval(repeatIntervalTimer);
  repeatDelayTimer = null;
  repeatIntervalTimer = null;
}

function stepNumber(key: NumericRowKey, delta: -1 | 1) {
  const row = numericRows.value.find((item) => item.key === key)!;
  const current = target.value[key];
  const next = Math.max(row.min, Math.min(row.max, current + delta));
  if (next === current) return false;
  setNumber(key, next);
  return true;
}

function startNumberRepeat(
  event: PointerEvent,
  key: NumericRowKey,
  delta: -1 | 1,
) {
  if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0))
    return;
  stopNumberRepeat();
  const button = event.currentTarget;
  if (!(button instanceof HTMLButtonElement) || button.disabled) return;
  button.setPointerCapture(event.pointerId);
  repeatDelayTimer = setTimeout(() => {
    repeatDelayTimer = null;
    suppressStepperClick = true;
    if (!stepNumber(key, delta)) return;
    repeatIntervalTimer = setInterval(() => {
      if (!stepNumber(key, delta)) {
        clearInterval(repeatIntervalTimer!);
        repeatIntervalTimer = null;
      }
    }, LONG_PRESS_INTERVAL);
  }, LONG_PRESS_DELAY);
}

function stopNumberRepeat() {
  clearNumberRepeatTimers();
  if (!suppressStepperClick) return;
  if (suppressClickResetTimer !== null) clearTimeout(suppressClickResetTimer);
  suppressClickResetTimer = setTimeout(() => {
    suppressStepperClick = false;
    suppressClickResetTimer = null;
  }, 0);
}

function handleNumberStepClick(key: NumericRowKey, delta: -1 | 1) {
  if (suppressStepperClick) {
    suppressStepperClick = false;
    if (suppressClickResetTimer !== null) {
      clearTimeout(suppressClickResetTimer);
      suppressClickResetTimer = null;
    }
    return;
  }
  stepNumber(key, delta);
}

function setPhase(phase: DevelopmentTarget["evolve_phase"]) {
  if (isAdded.value || isSaving.value || phase < currentChar.value.evolvePhase)
    return;
  draft.value.evolve_phase = phase;
  setNumber("level", draft.value.level);
  setNumber("skill_level", draft.value.skill_level);
  if (!canDevelopMasteries(draft.value)) draft.value.masteries = [];
  clearMessages();
}

function setNumber(key: NumericRowKey, value: number) {
  if (isAdded.value || isSaving.value) return;
  const row = numericRows.value.find((item) => item.key === key)!;
  const next = Math.max(
    row.min,
    Math.min(row.max, Math.round(value) || row.min),
  );
  if (key === "level") draft.value.level = next;
  else draft.value.skill_level = next as DevelopmentTarget["skill_level"];
  if (!canDevelopMasteries(draft.value)) draft.value.masteries = [];
  clearMessages();
}

function setMastery(skillId: string, level: 0 | 1 | 2 | 3) {
  if (
    isAdded.value ||
    isSaving.value ||
    (level && !canDevelopMasteries(draft.value))
  )
    return;
  draft.value.masteries = draft.value.masteries.filter(
    (item) => item.skill_id !== skillId,
  );
  if (level)
    draft.value.masteries.push({ skill_id: skillId, target_level: level });
  clearMessages();
}

watch(
  () => props.char.charId,
  () => failedImages.clear(),
);

onBeforeUnmount(() => {
  clearNumberRepeatTimers();
  if (suppressClickResetTimer !== null) clearTimeout(suppressClickResetTimer);
});
</script>

<style>
@keyframes operator-development-comparison-flow {
  to {
    background-position: 13px 0;
  }
}
@keyframes operator-development-comparison-arrow-pulse {
  0%,
  100% {
    opacity: 0.55;
    transform: translateX(-2px);
  }
  50% {
    opacity: 1;
    transform: translateX(1px);
  }
}
</style>

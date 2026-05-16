<template>
  <article
    class="rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_18px_50px_rgba(15,23,42,0.22)] transition-all duration-300"
    :class="{ 'border-cyan-300/25 bg-slate-900/85': expanded }"
  >
    <button class="flex w-full items-start gap-4 p-4 text-left" type="button" @click="$emit('toggle')">
      <img
        :src="avatarUrl(record.avatar)"
        :alt="record.title"
        class="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
        @error="onAvatarError"
      />

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
            {{ record.stage_id }}
          </span>
          <span class="badge badge-sm border-0 bg-slate-800 text-slate-200">
            {{ validationLabel(record.validation_status) }}
          </span>
          <span class="badge badge-sm border-0" :class="auditBadgeClass(record.audit_status)">
            {{ auditLabel(record.audit_status) }}
          </span>
          <span
            v-if="record.is_hidden"
            class="badge badge-sm border-0 bg-rose-500/15 text-rose-200"
          >
            已隐藏
          </span>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-3">
          <h3 class="truncate text-base font-bold text-white">{{ record.title || "未命名录像" }}</h3>
          <span class="truncate text-sm text-slate-400">{{ stageName }}</span>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>创建于 {{ formatTime(record.created_at, "yyyy-MM-dd HH:mm") }}</span>
          <span>更新于 {{ formatTime(record.updated_at, "yyyy-MM-dd HH:mm") }}</span>
        </div>
      </div>

      <Icon
        :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        class="mt-1 h-5 w-5 shrink-0 text-slate-500 transition-colors"
      />
    </button>

    <transition name="expand">
      <div v-if="expanded" class="border-t border-white/10 px-4 pb-4 pt-4">
        <div class="space-y-3">
          <div>
            <div class="text-xs uppercase tracking-[0.18em] text-slate-500">描述</div>
            <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
              {{ record.description || "暂无描述" }}
            </p>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div class="text-xs uppercase tracking-[0.16em] text-slate-500">校验结果</div>
              <div class="mt-2 text-sm font-medium text-slate-100">
                {{ record.validation_message || "暂无校验消息" }}
              </div>
              <div v-if="record.validated_at" class="mt-2 text-xs text-slate-400">
                {{ formatTime(record.validated_at, "yyyy-MM-dd HH:mm") }}
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div class="text-xs uppercase tracking-[0.16em] text-slate-500">审核结果</div>
              <div class="mt-2 text-sm font-medium text-slate-100">
                {{ record.audit_message || "暂无审核消息" }}
              </div>
              <div v-if="record.audited_at" class="mt-2 text-xs text-slate-400">
                {{ formatTime(record.audited_at, "yyyy-MM-dd HH:mm") }}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="showAutoBattle"
              class="btn btn-sm border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:border-cyan-200/45 hover:bg-cyan-300/15"
              :disabled="isActing"
              @click.stop="$emit('auto-battle')"
            >
              <span v-if="isActing" class="loading loading-spinner loading-xs" />
              <Icon v-else icon="mdi-robot-outline" class="h-4 w-4" />
              追加自动作战
            </button>
            <button
              v-if="showEdit"
              class="btn btn-sm border-white/15 bg-white/[0.05] text-slate-200 hover:bg-white/[0.08]"
              @click.stop="toggleEditing"
            >
              <Icon icon="mdi-pencil-outline" class="h-4 w-4" />
              {{ isEditing ? "取消编辑" : "编辑信息" }}
            </button>
          </div>

          <form
            v-if="showEdit && isEditing"
            class="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4"
            @submit.prevent="submitUpdate"
          >
            <label class="grid gap-2">
              <span class="text-xs uppercase tracking-[0.16em] text-slate-500">标题</span>
              <input
                v-model="form.title"
                type="text"
                maxlength="80"
                class="input input-bordered w-full border-white/10 bg-white/[0.03] text-sm text-white"
              />
            </label>

            <label class="grid gap-2">
              <span class="text-xs uppercase tracking-[0.16em] text-slate-500">描述</span>
              <textarea
                v-model="form.description"
                maxlength="500"
                class="textarea textarea-bordered min-h-[120px] border-white/10 bg-white/[0.03] text-sm text-white"
              />
            </label>

            <label class="label flex justify-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input v-model="form.is_hidden" type="checkbox" class="toggle toggle-sm" />
              <span class="label-text text-slate-200">将此 replay 设为隐藏</span>
            </label>

            <div class="flex justify-end">
              <button
                class="btn btn-sm border-emerald-300/25 bg-emerald-400/10 text-emerald-100 hover:border-emerald-200/45 hover:bg-emerald-300/15"
                type="submit"
                :disabled="isSaving"
              >
                <span v-if="isSaving" class="loading loading-spinner loading-xs" />
                <Icon v-else icon="mdi-content-save-outline" class="h-4 w-4" />
                保存修改
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </article>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { reactive, ref, watch } from "vue";
import { formatTime } from "@/utils/format";
import { getArkResourceUrl } from "@/utils/resource";
import {
  REPLAY_AUDIT_STATUS,
  REPLAY_VALIDATION_STATUS,
  type ReplayAuditStatus,
  type ReplayAvatar,
  type ReplayRecord,
  type ReplayValidationStatus,
  type UpdateReplayPayload,
} from "@/shared/types/replay";

const props = withDefaults(defineProps<{
  record: ReplayRecord;
  stageName?: string;
  expanded: boolean;
  showAutoBattle?: boolean;
  showEdit?: boolean;
  isActing?: boolean;
  isSaving?: boolean;
}>(), {
  stageName: "",
  showAutoBattle: false,
  showEdit: false,
  isActing: false,
  isSaving: false,
});

const emit = defineEmits<{
  toggle: [];
  "auto-battle": [];
  save: [payload: UpdateReplayPayload];
}>();

const isEditing = ref(false);
const form = reactive<UpdateReplayPayload>({
  title: props.record.title,
  description: props.record.description,
  is_hidden: props.record.is_hidden,
});

watch(
  () => props.record,
  (record) => {
    form.title = record.title;
    form.description = record.description;
    form.is_hidden = record.is_hidden;
  },
  { immediate: true, deep: true }
);

const avatarUrl = (avatar: ReplayAvatar) => getArkResourceUrl(`avatar/${avatar.type}/${avatar.id}`);

const onAvatarError = (event: Event) => {
  (event.target as HTMLImageElement).src = getArkResourceUrl("avatar/DEFAULT/avatar_def_mc");
};

const validationLabel = (status: ReplayValidationStatus) => {
  switch (status) {
    case REPLAY_VALIDATION_STATUS.PASSED:
      return "已通过";
    case REPLAY_VALIDATION_STATUS.FAILED:
      return "已失败";
    default:
      return "待校验";
  }
};

const auditLabel = (status: ReplayAuditStatus) => {
  switch (status) {
    case REPLAY_AUDIT_STATUS.APPROVED:
      return "已审核";
    case REPLAY_AUDIT_STATUS.REJECTED:
      return "已拒绝";
    default:
      return "待审核";
  }
};

const auditBadgeClass = (status: ReplayAuditStatus) => {
  switch (status) {
    case REPLAY_AUDIT_STATUS.APPROVED:
      return "bg-emerald-500/15 text-emerald-100";
    case REPLAY_AUDIT_STATUS.REJECTED:
      return "bg-rose-500/15 text-rose-200";
    default:
      return "bg-amber-400/15 text-amber-100";
  }
};

const toggleEditing = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    form.title = props.record.title;
    form.description = props.record.description;
    form.is_hidden = props.record.is_hidden;
  }
};

const submitUpdate = () => {
  emit("save", {
    title: form.title?.trim() || "",
    description: form.description?.trim() || "",
    is_hidden: Boolean(form.is_hidden),
  });
  isEditing.value = false;
};
</script>

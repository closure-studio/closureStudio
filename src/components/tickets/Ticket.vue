<template>
    <div class="h-full w-full collapse overflow-visible bg-base-300 shadow-lg rounded-lg blog" v-if="ticket">
        <input type="checkbox" class="w-full" v-model="isExpanded" />
        <div class="collapse-title w-full flex justify-between">
            <div class="flex space-x-1">
                <div class="flex justify-center items-center text-2xl md:text-4xl font-bold"><span
                        v-if="ticket.status === 0">🍡</span> <span v-if="ticket.status === 1">💤</span></div>
                <div class="flex flex-col">
                    <div :class="['text-base', 'font-bold', { 'line-clamp-1': !isExpanded }]">
                        {{ ticket?.content.title }}
                    </div>

                    <div class="flex">
                        <div v-for="(tag, key) in ticket?.tags" :key="tag">
                            <button class="btn btn-warning btn-xs m-1">{{ tag }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="isExpanded" class="collapse-content w-full">
            <Ticket :ticket="ticket" />
            <div v-for="(reply, key) in replays" :key="reply.id">
                <Ticket :ticket="reply" />
            </div>
            <div v-if="isLoading" class="flex justify-center w-full">
                <span className="loading loading-bars loading-md text-primary"></span>
                <span className="loading loading-bars loading-md text-primary"></span>
                <span className="loading loading-bars loading-md text-primary"></span>
            </div>
            <Reply :ticket="ticket" />
        </div>
    </div>
</template>
<script setup lang="ts">
interface Props {
    ticket: TicketSystem.Ticket | null;
}
const props = withDefaults(defineProps<Props>(), {
    ticket: null,
});
import { computed, ref, watch } from "vue";
import { myTickets, updateTicketStateById } from "../../store/tickets/myTickets";
import { userStore } from "../../store/user";
import Reply from "./ticket/Reply.vue";
import Ticket from "./ticket/Ticket.vue";
const user = userStore();
const isExpanded = ref(false);
const isLoading = ref(false);
const isAuthor = ref(false);
const { ticket } = props;

const replays = computed(() => {
    if (ticket?.id) {
        return myTickets.replyList[ticket.id] || [];
    }
    return [];
});

watch(
    () => ticket,
    (newVal) => {
        if (newVal) {
            isAuthor.value = newVal.authorUUID === user.info.uuid;
        }
    }
);

watch(
    () => isExpanded.value,
    async (newVal) => {
        if (newVal && ticket?.id) {
            await updateTicketStateById(ticket.id);
        }
    },
);
</script>

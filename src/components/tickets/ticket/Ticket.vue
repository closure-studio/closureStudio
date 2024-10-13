<template>
    <div class="flex" v-if="ticket">
        <Avatar :author="ticket.author" :updatedAt="ticket.updatedAt" />
        <div className="divider divider-horizontal m-0 p-1"></div>
        <Content :ticket="ticket" />
    </div>
    <div class="divider p-1 m-1"></div>
</template>

<script setup lang="ts">
import Avatar from "./Avatar.vue";
import Content from "./Content.vue";
interface Props {
    ticket: TicketSystem.Ticket | null;
}
const props = withDefaults(defineProps<Props>(), {
    ticket: null,
});
const { ticket } = props;
</script>

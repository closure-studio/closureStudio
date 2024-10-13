<template>
    <div v-if="tickets">
        <div v-for="(ticket, key) in tickets" :key="ticket.id">
            <Ticket :ticket="ticket" />
            <div class="h-2"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Ticket from "./Ticket.vue";
interface Props {
    tickets: TicketSystem.Ticket[];
}
const props = withDefaults(defineProps<Props>(), {
    tickets: () => [],
});
const { tickets } = props;


</script>

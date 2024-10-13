<template>
    <div class="flex h-full">
        <div class="w-full flex-col max-w-4xl 2xl:max-w-6xl xl:mr-auto s-margin md:!flex"
            :class="show ? 'xl:ml-0 !hidden' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'">
            <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
                <div class="text-2xl md:text-4xl font-bold text-info mt-3">💊 在线工单</div>
                <p>我们认真倾听您的意见与问题</p>
                <div class="divider mt-0">您的每一句话都非常重要</div>
                <p>我们认真记录下您的每一句话</p>
            </div>

            <div class="join my-2">
                <input class="join-item btn btn-xs sm:btn-sm btn-active"
                    @click="handleSelectBtnTypeOnClick(selectType.waiting)" type="radio"
                    :checked="selectBtnType === selectType.waiting" aria-label="等待处理" />
                <input class="join-item btn btn-xs sm:btn-sm btn-active"
                    @click="handleSelectBtnTypeOnClick(selectType.solved)" type="radio"
                    :checked="selectBtnType === selectType.solved" aria-label="已解决" />
            </div>


            <div v-if="myTickets.isLoadingTickets" class="h-72 flex justify-center">
                <span className="loading loading-ring loading-lg"></span>
                <span className="loading loading-ring loading-lg"></span>
                <span className="loading loading-ring loading-lg"></span>
            </div>

            <transition enter-active-class="animate__animated animate__fadeIn"
                leave-active-class="animate__animated animate__fadeOut">
                <TicketTable v-if="triggerAnimation" :tickets="selectedTickets" />
            </transition>
            <div class="h-12"></div>
            <Reply :ticket="null" />
        </div>
    </div>
</template>
<script setup lang="ts">
import "animate.css";
import { computed, onMounted, ref, watch } from "vue";
import TicketTable from "../../components/tickets/TicketTable.vue";
import Reply from "../../components/tickets/ticket/Reply.vue";
import { myTickets, queryTicketList } from "../../store/tickets/myTickets";
import { initializeGameListServerConnection } from "../../store/games/myGames";

enum selectType {
    waiting,
    solved
}

const show = ref(false);
const triggerAnimation = ref(false);
const selectBtnType = ref<selectType>(selectType.waiting);

const selectedTickets = computed(() => {
    if (selectBtnType.value === selectType.waiting) {
        return myTickets.ticketList.filter((item) => {
            return item.status === selectBtnType.value;
        });
    }
    if (selectBtnType.value === selectType.solved) {
        return myTickets.ticketList.filter((item) => {
            return item.status === selectBtnType.value;
        });
    }
    return myTickets.ticketList;
});


watch(selectedTickets, () => {
    triggerAnimation.value = false;
    setTimeout(() => {
        triggerAnimation.value = true;
    }, 250);
}, { deep: true });

// handler
const handleSelectBtnTypeOnClick = (type: selectType) => {
    selectBtnType.value = type;
};

// onMounted
onMounted(async () => {
    initializeGameListServerConnection();
    queryTicketList();
});

</script>

<style>
div,
img {
    user-select: none;
    -webkit-user-drag: none;
}
</style>

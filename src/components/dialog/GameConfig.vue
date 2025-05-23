<template>
    <div class="modal-box">
        <h3 class="font-bold text-2xl">托管配置</h3>
        <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4">请在普瑞赛斯指导下使用</div>
        <div class="flex">
            <label class="form-control w-full max-w-xs mr-4">
                <div class="label">
                    <span class="label-text">理智保留</span>
                </div>
                <input v-model="config.keeping_ap" type="number"
                    class="input input-sm input-bordered w-full max-w-xs" />
            </label>
            <label class="form-control w-full max-w-xs">
                <div class="label">
                    <span class="label-text">招募卷保留</span>
                </div>
                <input v-model="config.recruit_reserve" type="number"
                    class="input input-sm input-bordered w-full max-w-xs" />
            </label>
        </div>
        <div class="divider h-0">智能开关</div>
        <div class="grid grid-cols-2 gap-4 h-8">
            <label class="label cursor-pointer mb-4">
                <span class="label-text">自动基建</span>
                <input v-model="config.enable_building_arrange" type="checkbox" class="toggle toggle-sm" />
            </label>

            <label class="label cursor-pointer mb-4">
                <span class="label-text">自动作战</span>
                <input v-model="config.is_auto_battle" type="checkbox" class="toggle toggle-sm" />
            </label>
        </div>

        <div class="grid grid-cols-2 gap-4 h-8">
            <label class="label cursor-pointer mb-4">
                <span class="label-text">忽略小车</span>
                <input v-model="config.recruit_ignore_robot" type="checkbox" class="toggle toggle-sm" />
            </label>

            <label class="label cursor-pointer mb-4">
                <span class="label-text">允许他人协助登录</span>
                <input v-model="config.allow_login_assist" type="checkbox" class="toggle toggle-sm" />
            </label>
        </div>
        <div class="divider h-2">无人机加速</div>
        <BaseDesign :slot="config.accelerate_slot_cn" @updateSlot="config.accelerate_slot_cn = $event" />
        <div class="divider h-2">作战地图</div>
        <div class="flex py-2">
            <input v-model="stageKeyWord" class="input input-sm input-bordered w-full max-w-xs mr-4"
                placeholder="-- 请输入代号\名称 --" />
            <select class="select select-sm select-warning w-full max-w-xs" @change="addStageToConfig">
                <option key="-- 请选择地图 --" value="-- 请选择地图 --">-- 请选择地图 --</option>
                <option v-for="(stage, key) in assets.filteredStages(stageKeyWord)" :key="key" :value="key">{{
                    stage.code }} {{ stage.name }}</option>
            </select>
        </div>
        <div class="divider h-0">作战队列</div>
        <div class="flex flex-wrap">
            <button @click="removeBattleMap(battleMap)" v-for="battleMap in config.battle_maps" :key="battleMap"
                class="btn btn-outline btn-warning btn-xs m-1">
                {{ assets.getStageName(battleMap) }}
            </button>
        </div>
        <div class="grid gap-4 grid-cols-2 mt-2">
            <button class="btn btn-error btn-outline btn-block mt-4" @click="handleCloseBtnOnClick">
                <span v-if="isLoading" class="loading loading-bars loading-md"></span>
                关闭
            </button>
            <button class="btn btn-info btn-block mt-4" @click="onSubmit">
                <span v-if="isLoading" class="loading loading-bars loading-md"></span>
                递交
            </button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { assets } from "../../plugins/assets/assets";
import apiClient from "../../plugins/axios/apiClient";
import { setMsg } from "../../plugins/common";
import { DialogComponentProps } from "../../plugins/dialog/dialog";
import { findGame } from "../../store/games/myGames";
import BaseDesign from "../BaseDesign.vue";
import { Type } from "../toast/enum";

interface Props extends DialogComponentProps {
    account: string;
}

const props = withDefaults(defineProps<Props>(), {
    dialogClose: () => { },
    account: ""
});


const { dialogClose, account } = props;
const initConfig = {
    account: "",
    accelerate_slot: "",
    accelerate_slot_cn: "",
    battle_maps: [],
    enable_building_arrange: false,
    is_auto_battle: false,
    is_stopped: false,
    keeping_ap: 0,
    recruit_ignore_robot: false,
    recruit_reserve: 0,
    map_id: "",
    allow_login_assist: false
};
const game = findGame(account);
const config = ref<ApiGame.GameConfig>(game?.game_config || initConfig);

const isLoading = ref(false);
const stageKeyWord = ref("");

const addStageToConfig = (event: Event) => {
    const selectElement = event.target as HTMLSelectElement;
    const selectedKey = selectElement.value;
    if (selectedKey === "-- 请选择地图 --") {
        return;
    }
    if (!config.value.battle_maps.includes(selectedKey)) {
        config.value.battle_maps.unshift(selectedKey);
    }
};


const removeBattleMap = (battleMap: string) => {
    config.value.battle_maps = config.value.battle_maps.filter((item: string) => item !== battleMap);
};
const onSubmit = async () => {
    if (config.value.keeping_ap < 0) {
        setMsg("理智保留不能小于0", Type.Warning);
        return;
    }
    if (config.value.recruit_reserve < 0) {
        setMsg("招募卷保留不能小于0", Type.Warning);
        return;
    }
    const copyConfig = JSON.parse(JSON.stringify(config.value));
    delete copyConfig.is_stopped;
    delete copyConfig.map_id;
    delete copyConfig.accelerate_slot;
    delete copyConfig.account;
    isLoading.value = true;
    try {
        const result = await apiClient.doUpdateGameConf(account, copyConfig);
        setMsg(result.message, Type.Info);
        dialogClose();
    } catch (error) {
        setMsg(String(error), Type.Error);
    } finally {
        isLoading.value = false;
    }
};

const handleCloseBtnOnClick = () => {
    dialogClose();
};
</script>

<template>
    <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-xs m-1 btn-warning"><span v-if="isUpdating"
                className="loading loading-bars loading-xs"></span>标签修改</div>
        <ul tabindex="0" class="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-24">
            <li v-for="(tag, key) in defaultTags" :key="key">
                <a :onClick="() => {
                    handleTagsOnClick(tag.name);
                }
                    " :class="{ 'bg-info': props.tags.includes(tag.name) }" class="text-xs">{{ tag.name }}</a>
            </li>
        </ul>
    </div>
</template>
<script setup lang="ts">
interface Props {
    tags: string[];
    ticketId?: string | null;
}
import { ref } from "vue";
import { defaultTags, setMsg } from "../../../plugins/common";
import { UpdateTicketById } from "../../../plugins/axios";
import { Type } from "../../toast/enum";
import { updateTicketStateById } from "../../../store/tickets/myTickets";

const props = withDefaults(defineProps<Props>(), {
    tags: () => [],
    ticketId: null,
});
const isUpdating = ref(false);
const handleTagsOnClick = async (tag: string) => {
    const newTags = tagsChange(tag, props.tags);
    if (props.ticketId) {
        await updateTags(newTags); // 现在传递新的tags作为参数
        await updateTicketStateById(props.ticketId); // 更新ticket状态
    }

};

const tagsChange = (tag: string, currentTags: string[]) => {
    let newTags = [];
    if (currentTags.includes(tag)) {
        newTags = currentTags.filter((item) => item !== tag);
    } else {
        if (currentTags.length >= 3) {
            setMsg("最多只能添加3个标签", Type.Warning);
            return currentTags; // 如果不做更改，返回原始标签数组
        }
        newTags = [...currentTags, tag];
    }
    return newTags;
};

const updateTags = async (newTags: string[]) => {
    // update tags
    if (isUpdating.value) {
        return;
    }
    if (!props.ticketId) {
        return;
    }
    try {
        isUpdating.value = true;
        const updateResult = await UpdateTicketById(props.ticketId, { tags: newTags });
        if (updateResult.code === 0) {
            throw new Error(updateResult.message);
        }
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isUpdating.value = false;
    }
};
</script>

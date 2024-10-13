<template>
    <div className="join p-1">
        <div v-for="(author, key) in user.getGames" :key="author.key">
            <input className="join-item btn btn-xs" type="radio" :checked="isSelectedAuthor(author.value.nickname)"
                @click="() => {
                    setSelectAuthor(author.value, author.key);
                }
                    " name="options" :aria-label="author.value.nickname" />
        </div>
        <div v-if="!Array.isArray(user.getGames) || user.getGames.length === 0">
            <input className="join-item btn btn-xs" type="radio" :checked="isSelectedAuthor('匿名玩家')" @click="() => {
                setSelectAuthor(null, '')
            }" name="options" aria-label="匿名玩家" />
        </div>
    </div>
    <Tags v-if="!ticket" :tags="tags" @update:tags="updateTags" />
    <!-- // text input -->
    <input v-model="ticketTitle" v-if="!ticket" type="text" placeholder="标题"
        class="input input-bordered input-sm w-full my-2" />
    <textarea v-model="ticketContent" placeholder="请发表您的锐评"
        className="textarea textarea-bordered textarea-lg w-full my-2"></textarea>

    <div v-if="ticketAttachments.length > 0" className="">
        <div v-for="(attachment, key) in ticketAttachments" :key="key" className="flex justify-start items-center">
            <img :src="attachment" className="w-10 h-10" />
            <span className="m-2">{attachment}</span>
        </div>
    </div>

    <div className="flex justify-start">
        <div class="flex justify-center items-center">
            <label>
                <span class="m-2 btn btn-sm btn-info">上传截图</span>
                <input type="file" class="file-input w-0 invisible" disabled @change="uploadImage" />
            </label>
        </div>
        <button class="m-2 btn btn-sm btn-info" @click="postTicket">
            <span v-if="isUpdating" class="loading loading-spinner"></span>
            发表锐评
        </button>
    </div>
</template>
<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { PostTicket, ReplyTicket } from "../../../plugins/axios";
import { defaultAuthor, setMsg } from "../../../plugins/common";
import { queryTicketList } from "../../../store/tickets/myTickets";
import { userStore } from "../../../store/user";
import { checkIsEmail, checkIsMobile } from "../../../utils/regex";
import { Type } from "../../toast/enum";
import Tags from "./Tags.vue";
interface Props {
    ticket?: TicketSystem.Ticket | null;
}
const props = withDefaults(defineProps<Props>(), {
    ticket: null,
});
const { ticket } = props;
const user = userStore();
const selectedAuthor = ref<TicketSystem.Author | null>(defaultAuthor());
const selectedGame = ref<string>("");
const ticketTitle = ref<string>("");
const ticketContent = ref<string>("");
const isUpdating = ref(false);
const tags = ref<string[]>([]);
const ticketAttachments = ref<string[]>([]);

const updateTags = (newTags: string[]) => {
    tags.value = newTags;
};

const setSelectAuthor = (author: TicketSystem.Author | null, gameAccount: string) => {
    if (!author) {
        selectedAuthor.value = defaultAuthor();
        return;
    }
    selectedAuthor.value = author;
    selectedGame.value = gameAccount;
};

const privateInfoCheck = () => {
    if (checkIsEmail(ticketContent.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    if (checkIsEmail(ticketTitle.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    if (checkIsMobile(ticketContent.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    if (checkIsMobile(ticketTitle.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    return false;
};


const createTicketData = () => {
    if (!selectedAuthor.value) {
        setMsg("请选择一个游戏账号", Type.Warning);
        return;
    }
    if (privateInfoCheck()) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return;
    }
    const data: TicketSystem.createTicket = {
        replyTo: "",
        tags: [],
        attachments: [],
        isPinned: false,
        author: null,
        content: {
            id: "",
            title: "",
            content: ""
        },
        isAnonymous: false,
        gameAccount: ""
    };
    const tempAuthor = selectedAuthor.value;
    tempAuthor.uuid = user.info.uuid;
    data.content.content = ticketContent.value;
    data.content.title = ticketTitle.value;
    data.author = tempAuthor;
    data.tags = tags.value;
    data.gameAccount = selectedGame.value;
    data.attachments = ticketAttachments.value;
    if (props.ticket) {
        data.replyTo = props.ticket.id;
    }
    return data;
};


const postTicket = async () => {
    if (!ticketContent.value) {
        setMsg("请输入内容", Type.Warning);
        return;
    }
    if (!selectedAuthor.value) {
        setMsg("请选择一个游戏账号", Type.Warning);
        return;
    }
    if (!ticket && !ticketTitle.value) {
        // too long
        if (ticketTitle.value.length > 16) {
            setMsg("标题太长了", Type.Warning);
            return;
        }
        setMsg("请输入标题", Type.Warning);
        return;
    }
    const data = createTicketData();
    if (!data) {
        return;
    }
    if (ticket) {
        // reply
        await replyTicket(ticket.id, data);
    }
    if (!ticket) {
        // create
        await createTicket(data);
    }
    await queryTicketList();
    isUpdating.value = false;
}

const replyTicket = async (id: string, data: TicketSystem.createTicket) => {
    try {
        isUpdating.value = true;
        const result = await ReplyTicket(id, data);
        if (result.code === 0) {
            setMsg(result.message, Type.Warning);
            throw new Error(result.message);
        }
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
    } finally {
        resetForm()
    }
};
const createTicket = async (data: TicketSystem.createTicket) => {
    try {
        isUpdating.value = true;
        const result = await PostTicket(data);
        if (result.code === 0) {
            setMsg(result.message, Type.Warning);
            throw new Error(result.message);
        }

        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
    } finally {
        resetForm()
    }
};

const resetForm = () => {
    ticketContent.value = "";
    selectedAuthor.value = defaultAuthor();
    selectedGame.value = "";
    ticketTitle.value = "";
    tags.value = [];
};
const setDefaultAuthor = () => {
    if (user.getGames.length > 0) {
        const game = user.getGames[0];
        setSelectAuthor(game.value, game.key);
    } else {
        setSelectAuthor(null, '');
    }

};
const isSelectedAuthor = (nickName: string) => {
    return selectedAuthor.value?.nickname === nickName;
};

const uploadImage = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
        const formData = new FormData();
        formData.append('file', files[0]);

        try {
            const response = await axios({
                method: 'post',
                url: 'https://wenku.baidu.com/user/api/editorimg',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 && response.data) {
                // 解析返回的结果
                const result = response.data;
                ticketAttachments.value.push(result.link);
                setMsg('上传成功', response.data);
            } else {
                // 处理错误逻辑
                setMsg('上传失败', Type.Warning);
            }
        } catch (error) {
            // 处理错误逻辑
            setMsg('上传失败', Type.Warning);
        }
    }
};
// start

setDefaultAuthor()
</script>

<template>
    <div class="w-full" v-if="ticket">
        <div class="flex flex-col justify-between h-full">
            <div class="relative whitespace-pre-line">
                {{ ticket.content.content }}
                <img v-if="ticket.author.title"
                    class="absolute right-4 top-0 w-28 md:w-36 opacity-10 md:opacity-50 rounded-t-full rounded-bl-full"
                    src="../../../assets/1.png" alt="start" />
            </div>
            <div className="flex justify-start"></div>
            <div>
                <div v-if="(isAuthor || user.isAdmin) && !ticket.replyTo">
                    <div class="divider divider-info p-1 m-1"></div>
                    <div v-if="isUpdating">
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                    </div>
                    <div v-else>
                        <div v-if="ticket.status === 0" class="text-danger">
                            如果该问题已解决, 您可以<span class="underline font-bold cursor-pointer"
                                @click="ticketOperation">关闭</span>该ticket
                        </div>
                        <div v-if="ticket.status === 1" class="text-danger">
                            天啊, 这个Ticket已经关闭,不管没关系,您可以<span class="underline font-bold cursor-pointer"
                                @click="ticketOperation">重新打开</span>这个Ticket
                        </div>
                    </div>
                </div>
                <div class="flex flex-wrap">
                    <QA v-if="(user.isAdmin || isAuthor) && !ticket.replyTo" :updateQAContent="updateQAContent"
                        :title="ticket.content.title + '.' + ticket.content.content" :token="user.token" />
                    <Tags v-if="(user.isAdmin || isAuthor) && !ticket.replyTo" :tags="ticket.tags"
                        :ticketId="ticket.id" />
                    <button v-if="user.isAdmin && !ticket.replyTo && !ticket.isPinned"
                        class="btn btn-outline btn-xs m-1">
                        置顶
                    </button>
                    <button v-if="user.isAdmin && !ticket.replyTo && ticket.isPinned"
                        class="btn btn-outline btn-xs m-1">
                        取消置顶
                    </button>
                    <button v-if="user.isAdmin" :onClick="hiddenTicket" class="btn btn-outline btn-xs m-1">
                        隐藏
                    </button>
                    <button v-if="user.isAdmin" @click="() => (displayType = DisplayType.UserInfo)"
                        class="btn btn-outline btn-xs m-1">
                        通行证
                    </button>
                    <button v-if="user.isAdmin" @click="() => (displayType = DisplayType.GameSlots)"
                        class="btn btn-outline btn-xs m-1">
                        游戏槽
                    </button>
                    <button v-if="user.isAdmin" @click="handleSwitchUserBtnOnClick" class="btn btn-outline btn-xs m-1">
                        切换用户
                    </button>
                    <button v-if="user.isAdmin" @click="() => (displayType = DisplayType.GameLog)"
                        class="btn btn-outline btn-xs m-1">
                        日志
                    </button>
                    <button v-if="user.isAdmin && displayType != DisplayType.None"
                        @click="() => (displayType = DisplayType.None)" class="btn btn-outline btn-xs m-1">
                        收起
                    </button>
                </div>
                <div class="divider" v-if="displayType != DisplayType.None && user.isAdmin">
                    更多详细信息
                </div>
                <div v-if="displayType == DisplayType.UserInfo && user.isAdmin">
                    <div v-if="isLoading">
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                    </div>
                    <div v-if="!isLoading && authorInfo">
                        <div @click="copyToClipboard(ticket.authorUUID)">
                            UUID:
                            <span class="underline font-bold cursor-pointer">{{
                                ticket.authorUUID
                                }}</span>
                        </div>
                        <div @click="copyToClipboard(ticket.gameAccount)">
                            Game:
                            <span class="underline font-bold cursor-pointer">{{
                                ticket.gameAccount
                                }}</span>
                        </div>
                        <div @click="copyToClipboard(authorInfo.UserEmail)">
                            邮箱:
                            <span class="underline font-bold cursor-pointer">{{
                                authorInfo.UserEmail
                                }}</span>
                        </div>
                        <div>
                            <span v-if="authorInfo.Phone"> 手机: {{ authorInfo.Phone }}</span>
                            <span v-if="!authorInfo.Phone">
                                手机: 未绑定
                                <button v-if="user.isAdmin" @click="sendSMS(ticket.authorUUID, smsSendPhone)"
                                    class="btn btn-outline btn-xs m-1">
                                    发送SMS{{ smsSendPhone }}
                                </button></span>
                        </div>
                        <div @click="copyToClipboard(authorInfo.QQ)">
                            QQ:
                            <span class="underline font-bold cursor-pointer">{{
                                authorInfo.QQ
                                }}</span>
                        </div>
                        <div @click="copyToClipboard(String(authorInfo.Permission))">
                            权限:
                            <button @click="displayAuthorPermission = !displayAuthorPermission"
                                class="btn btn-outline btn-xs m-1">
                                {{ displayAuthorPermission ? "收起" : "显示" }}
                            </button>
                        </div>
                        <Permission v-if="displayAuthorPermission" :userPermission="authorInfo.Permission"
                            :uuid="authorInfo.UUID" />
                        <div @click="copyToClipboard(authorInfo.IP)">
                            IP: {{ String(authorInfo.IP) }}
                        </div>
                        <div>
                            创建时间:
                            {{ new Date(authorInfo.CreatedTs * 1000).toLocaleString() }}
                        </div>
                        <div>
                            更新时间:
                            {{ new Date(authorInfo.UpdateTs * 1000).toLocaleString() }}
                        </div>
                    </div>
                </div>
                <!-- Game Log -->
                <div v-if="displayType == DisplayType.GameLog && user.isAdmin">
                    <div v-if="isLoading">
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                    </div>
                    <div v-if="!isLoading && authorGameLogs" class="h-[calc(100vh-28rem)] overflow-y-auto">
                        <table class="text-[1rem]">
                            <tbody>
                                <tr class="text-wrap" v-for="log in authorGameLogs.logs">
                                    <td class="text-info whitespace-nowrap">
                                        {{ formatTime(log.ts, "dd/MM HH:mm") }}
                                    </td>
                                    <td class="pl-2 break-words">{{ log.content }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- slots -->
                <div v-if="displayType == DisplayType.GameSlots && user.isAdmin">
                    <div v-if="isLoading">
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                    </div>
                    <div v-if="!isLoading && authorSlots">
                        <div v-for="slot in authorSlots">
                            <div>
                                <span>Game:</span>
                                <span v-if="slot.gameAccount"> {{ slot.gameAccount }} </span><span
                                    v-if="!slot.gameAccount"> 空闲 </span>
                                <span v-if="slot.gameAccount">
                                    <button @click="handleDeleteSlotBtnOnClick(slot.uuid)"
                                        class="btn btn-outline btn-xs m-1">
                                        删除
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="QAContent">
                    <div class="divider divider-info p-1 m-1"></div>
                    <vue-markdown :source="QAContent" :options="options" />
                </div>

            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import VueMarkdown from 'vue-markdown-render';
import {
    Auth_Login_Admin,
    QueryUser,
    SendSMS,
    UpdateTicketById,
    doDelGame,
    fetchGameLogsAdmin,
    fetchUserSlotsAdmin
} from "../../../plugins/axios/axios";
import { formatTime, getRealGameAccount, setMsg } from "../../../plugins/common";
import showDialog from "../../../plugins/dialog/dialog";
import { getSMSSendPhone, getSMSSlot } from "../../../store/games/quota";
import { queryTicketList, updateTicketStateById } from "../../../store/tickets/myTickets";
import { userStore } from "../../../store/user";
import { checkIsMobile } from "../../../utils/regex";
import SwitchUserByAdmin from "../../dialog/SwitchUserByAdmin.vue";
import Permission from "../../permission/Permission.vue";
import { Type } from "../../toast/enum";
import QA from "./QA.vue";
import Tags from "./Tags.vue";
interface Props {
    ticket: TicketSystem.Ticket | null;
}
const props = withDefaults(defineProps<Props>(), {
    ticket: null,
});
const { ticket } = props;

enum DisplayType {
    None,
    UserInfo,
    GameLog,
    GameSlots,
    GamesInfo,
}
const user = userStore();
const isUpdating = ref(false);
const isLoading = ref(false);
const smsSendPhone = ref("");

const displayType = ref<DisplayType>(DisplayType.None);
const displayAuthorPermission = ref(false);
const authorInfo = ref<ApiUser.User | null>(null);
const authorSlots = ref<Registry.Slot[]>([]);
const authorGameLogs = ref<ApiGame.GameLogs>();
const QAContent = ref("");
const options = {
    html: true,
    xhtmlOut: true,
    breaks: true,
    linkify: true,
    typographer: true,
    quotes: "“”‘’",
};

const isAuthor = computed(() => {
    return ticket?.authorUUID === user.info.uuid;
});


watch(
    () => displayType.value,
    async () => {
        isLoading.value = true;
        switch (displayType.value) {
            case DisplayType.UserInfo:
                await getAuthorInfo();
                break;
            case DisplayType.GameLog:
                await getAuthorGameLogs();
                break;
            default:
                break;
        }
        isLoading.value = false;
    },
    {
        deep: true,
        immediate: false,
    }
);

const handleSwitchUserBtnOnClick = async () => {
    if (!ticket) {
        setMsg("该Ticket用户信息不存在", Type.Warning);
        return;
    }
    // Auth_Login_Admin
    showDialog(SwitchUserByAdmin, {
        uuid: ticket.authorUUID,
        switchFunc: switchUser,
    });
};

const handleDeleteSlotBtnOnClick = async (slotId: string) => {
    if (!ticket) {
        setMsg("该Ticket用户信息不存在", Type.Warning);
        return;
    }
    try {
        isLoading.value = true;
        console.log("slotId", slotId);
        const resp = await doDelGame(slotId, "1");
        setMsg(resp.message, resp.code === 1 ? Type.Success : Type.Warning);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isLoading.value = false;
    }
};

const getAuthorInfo = async () => {
    if (!ticket) {
        setMsg("该Ticket信息不存在", Type.Warning);
        return;
    }
    // use async method to fetch QueryUser and fetchUserSlotsAdmin
    if (ticket.authorUUID) {
        const [usersInfo, usersSlots] = await Promise.all([
            QueryUser(ticket.authorUUID),
            fetchUserSlotsAdmin(ticket.authorUUID),
        ]);
        if (usersInfo.code === 1) {
            const user = findAuthorInfo(ticket.authorUUID, usersInfo.data);
            if (user) {
                authorInfo.value = user;
            }
        }
        if (usersSlots.data && usersSlots.data?.length > 0) {
            authorSlots.value = usersSlots.data;
            const phone = getSMSSendPhone();
            if (phone) {
                smsSendPhone.value = phone;
            }
        }
        if (usersInfo.code != 1) {
            authorInfo.value = null;
            setMsg("获取用户信息失败: " + usersInfo.message, Type.Warning);
        }
        if (!usersSlots.data) {
            setMsg("获取用户托管槽失败: " + usersSlots.message, Type.Warning);
        }
    }
};

const getAuthorGameLogs = async () => {
    if (!ticket) {
        setMsg("该Ticket信息不存在", Type.Warning);
        return;
    }
    // use async method to fetch QueryUser and fetchUserSlotsAdmin
    if (ticket.authorUUID && ticket.gameAccount) {
        const resp = await fetchGameLogsAdmin(
            ticket.gameAccount,
            ticket.authorUUID,
            0
        );
        if (resp.code === 1 && resp.data) {
            authorGameLogs.value = resp.data;
            return;
        }
        setMsg("获取用户游戏日志失败: " + resp.message, Type.Warning);
    }
};

const hiddenTicket = async () => {
    if (!ticket) {
        setMsg("该Ticket信息不存在", Type.Warning);
        return;
    }
    try {
        isUpdating.value = true;
        const updateResult = await UpdateTicketById(ticket.id, {
            isHidden: true,
        });
        if (updateResult.code === 0) {
            throw new Error(updateResult.message);
        }
        await queryTicketList();
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isUpdating.value = false;
    }
};
const ticketOperation = async () => {
    await nextTick();
    if (!ticket) {
        setMsg("该Ticket信息不存在", Type.Warning);
        return;
    }
    if (isUpdating.value) {
        return;
    }
    try {
        isUpdating.value = true;
        const updateResult = await UpdateTicketById(ticket.id, {
            status: ticket.status === 0 ? 1 : 0,
        });
        if (updateResult.code === 0) {
            throw new Error(updateResult.message);
        }
        await updateTicketStateById(ticket.id);
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isUpdating.value = false;
    }
};

const sendSMS = async (uuid: string, phone: string) => {
    if (!uuid || !phone) {
        return;
    }
    const param = {
        uuid: uuid,
        phone: phone,
    };
    const resp = await SendSMS(param);
    if (resp.code === 1) {
        setMsg("发送成功 验证码: " + resp.data, Type.Success);
        return;
    }
    setMsg("发送失败 " + resp.message, Type.Warning);
    return;
};

const findAuthorInfo = (uuid: string, users: ApiUser.User[] | null) => {
    if (!users) {
        return null;
    }
    return users.find((user) => user.UUID === uuid) || null;
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        setMsg("复制成功", Type.Success);
    } catch (err) {
        console.error("复制到剪贴板失败", err);
    }
};

const switchUser = async (uuid: string) => {
    if (!uuid) {
        setMsg("该Ticket用户信息不存在", Type.Warning);
    }
    try {
        isLoading.value = true;
        const resp = await Auth_Login_Admin({ uuid: uuid });
        if (resp.code !== 1) {
            setMsg("切换用户失败: " + resp.message, Type.Warning);
            return;
        }
        if (resp.data && resp.data.token) {
            setMsg("切换用户成功", Type.Success);
            user.login(resp.data.token);
            window.location.href = "/dashboard";
            return;
        }
        setMsg("切换用户失败", Type.Warning);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isLoading.value = false;
    }
};

const updateQAContent = (content: string) => {
    QAContent.value = content;
};
</script>

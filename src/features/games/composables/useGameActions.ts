import type { Ref } from "vue";
import type { RegistryAddGameForm, RegistrySlot } from "@/shared/types/api";
import { Type } from "@/shared/components/toast/enum";
import { getRealGameAccount, processGameAccount } from "@/shared/utils/account";
import { setMsg } from "@/shared/utils/toast";
import { NOTIFY } from "@/shared/constants/config";
import { allowGameCreate, canDeleteGame } from "@/features/games/composables/useGameQuota";
import showDialog from "@/plugins/dialog/dialog";
import CreateGame from "@/features/games/components/CreateGame.vue";
import GeeTestNotify from "@/components/dialog/GeeTestNotify.vue";
import UpdateGamePasswd from "@/features/games/components/UpdateGamePasswd.vue";

interface UseGameActionsOptions {
  user: any;
  gamesStore: any;
  captcha: any;
  isLoading: Ref<boolean>;
  selectedSlotUUID: Ref<string>;
  selectedRegisterForm: Ref<RegistryAddGameForm>;
}

export function useGameActions(options: UseGameActionsOptions) {
  const { user, gamesStore, captcha, isLoading, selectedSlotUUID, selectedRegisterForm } = options;

  const findGame = (gameAccount: string) => gamesStore.findGame(gameAccount);

  const getSlot = (account: string) => {
    return gamesStore.userQuota?.slots.find((slot: RegistrySlot) => slot.gameAccount === account);
  };

  const createGameButtonOnClick = (
    slot: RegistrySlot,
    slotUUID: string,
    loginFunc: (account: string) => Promise<void>
  ) => {
    if (!gamesStore.userQuota) {
      setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
      return;
    }
    const response = allowGameCreate(slot, gamesStore.userQuota, user.isVerify);
    if (response.isLocked) {
      setMsg(response.message, Type.Warning);
      return;
    }
    showDialog(CreateGame, {
      slotUUID,
      isFirst: !user.isVerify,
      loginFunc,
    } as any);
  };

  const isUpdateStatus = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (!game) return false;
    if (
      !game.status.password ||
      game.status.text.includes("密码错误") ||
      game.status.text.includes("无法解密密码")
    ) {
      return true;
    }
    return false;
  };

  const isSuspendStatus = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (!game) return false;
    return game.status.code === 2;
  };

  const isLoginBtnDisabled = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (isLoading.value) return true;
    if (!game) return false;
    return game.status.code === 1;
  };

  const handleDeleteBtnOnClick = async (slotUUID: string, gameAccount: string) => {
    if (gamesStore.userQuota === undefined) {
      setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
      return;
    }
    if (!canDeleteGame(gamesStore.userQuota, gameAccount)) {
      setMsg(NOTIFY.NOT_ALLOW_DELETE_GAME, Type.Warning);
      return;
    }
    isLoading.value = true;
    try {
      const deleteResp = await captcha.deleteGame(slotUUID);
      await Promise.all([gamesStore.queryGameList(), gamesStore.queryUserQuota()]);
      if (deleteResp.code === 1) {
        setMsg("删除成功", Type.Success);
      } else {
        setMsg(deleteResp.message, Type.Warning);
      }
    } catch {
      setMsg("删除失败", Type.Warning);
    } finally {
      isLoading.value = false;
    }
  };

  const handleRepairBtnOnClick = async (slotUUID: string, gameAccount: string) => {
    if (gamesStore.userQuota === undefined) {
      setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
      return;
    }
    if (!canDeleteGame(gamesStore.userQuota, gameAccount)) {
      setMsg(NOTIFY.NOT_ALLOW_DELETE_GAME, Type.Warning);
      return;
    }
    isLoading.value = true;
    try {
      const accountInfo = processGameAccount(gameAccount);
      if (!accountInfo) {
        setMsg("账号格式不正确", Type.Warning);
        return;
      }
      const form: RegistryAddGameForm = {
        account: accountInfo.remaining,
        password: "123456",
        platform: accountInfo.code,
      };
      const createGameResp = await captcha.createGame(slotUUID, form);
      if (createGameResp.code === 1) {
        return createGameResp;
      }
      setMsg(createGameResp.message, Type.Error);
      await Promise.all([gamesStore.queryGameList(), gamesStore.queryUserQuota()]);
      if (createGameResp.code === 1) {
        setMsg("修复成功", Type.Success);
      } else {
        setMsg(createGameResp.message, Type.Warning);
      }
    } catch {
      setMsg("修复失败", Type.Warning);
    } finally {
      isLoading.value = false;
    }
  };

  const handleUpdatePasswdBtnOnClick = async (slot: RegistrySlot | undefined) => {
    if (!slot || !slot.gameAccount) return;
    const game = findGame(slot.gameAccount);
    if (!game) return;

    selectedSlotUUID.value = slot.uuid;
    selectedRegisterForm.value.account = getRealGameAccount(game.status.account);
    selectedRegisterForm.value.platform = game.status.platform;
    selectedRegisterForm.value.password = "";

    showDialog(UpdateGamePasswd, {
      slotUUID: slot.uuid,
      form: selectedRegisterForm.value,
    } as any);
  };

  const gameLogin = async (account: string) => {
    try {
      isLoading.value = true;
      const loginResp = await captcha.loginGame(account);
      await Promise.all([gamesStore.queryGameList(), gamesStore.queryUserQuota()]);
      if (loginResp.code === 1) {
        setMsg("启动成功", Type.Success);
        showDialog(GeeTestNotify);
      } else {
        setMsg(loginResp.message, Type.Warning);
      }
    } catch {
      setMsg("启动失败", Type.Warning);
    } finally {
      isLoading.value = false;
    }
  };

  const gameSuspend = async (account: string) => {
    isLoading.value = true;
    try {
      const resp = await gamesStore.gameSuspend(account);
      await gamesStore.queryGameList();
      if (resp.code === 1) {
        setMsg("暂停成功", Type.Success);
      } else {
        setMsg(resp.message, Type.Warning);
      }
    } catch {
      setMsg("暂停失败", Type.Warning);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    findGame,
    getSlot,
    createGameButtonOnClick,
    isUpdateStatus,
    isSuspendStatus,
    isLoginBtnDisabled,
    handleDeleteBtnOnClick,
    handleRepairBtnOnClick,
    handleUpdatePasswdBtnOnClick,
    gameLogin,
    gameSuspend,
  };
}

import type { Ref } from "vue";
import type { RegistryAddGameForm, RegistrySlot } from "@/shared/types/api";
import { Type } from "@/constants/ui";
import { GAME_STATUS_CODE } from "@/constants/game";
import { API_RESPONSE_CODE } from "@/constants/api";
import { getRealGameAccount, processGameAccount } from "@/utils/account";
import { setMsg } from "@/utils/toast";
import { NOTIFY } from "@/constants/ui";
import { allowGameCreate, canDeleteGame } from "@/services/gameQuota";
import type { useGamesStore } from "@/stores/useGamesStore";
import showDialog from "@/shared/components/dialog/dialog";
import CreateGame from "@/components/dashboard/dialogs/CreateGame.vue";
import GeeTestNotify from "@/components/dashboard/dialogs/GeeTestNotify.vue";
import UpdateGamePasswd from "@/components/dashboard/dialogs/UpdateGamePasswd.vue";

interface ActionResult {
  code: number;
  message: string;
}

interface GameActionsCaptcha {
  deleteGame: (slotUUID: string) => Promise<ActionResult>;
  createGame: (slotUUID: string, form: RegistryAddGameForm) => Promise<ActionResult>;
  loginGame: (account: string) => Promise<ActionResult>;
}

interface GameActionsUser {
  isVerify: boolean;
}

interface UseGameActionsOptions {
  user: GameActionsUser;
  gamesStore: ReturnType<typeof useGamesStore>;
  captcha: GameActionsCaptcha;
  isLoading: Ref<boolean>;
  selectedSlotUUID: Ref<string>;
  selectedRegisterForm: Ref<RegistryAddGameForm>;
}

export function useGameActions(options: UseGameActionsOptions) {
  const { user, gamesStore, captcha, isLoading, selectedSlotUUID, selectedRegisterForm } = options;

  const runGameAction = async <T>(action: () => Promise<T>) => {
    if (isLoading.value) return undefined;
    isLoading.value = true;
    try {
      return await action();
    } finally {
      isLoading.value = false;
    }
  };

  const normalizeAccount = (account: string | undefined | null) => {
    return getRealGameAccount(account ?? "");
  };

  const findGame = (gameAccount: string) => gamesStore.findGame(gameAccount);

  const findGameByAccount = (gameAccount: string) => {
    const exact = findGame(gameAccount);
    if (exact) return exact;

    const normalized = normalizeAccount(gameAccount);
    return gamesStore.gameList.find(
      (game) => normalizeAccount(game.status.account) === normalized
    );
  };

  const getSlot = (account: string) => {
    const normalized = normalizeAccount(account);
    return gamesStore.userQuota?.slots.find((slot: RegistrySlot) => {
      if (!slot.gameAccount) return false;
      return slot.gameAccount === account || normalizeAccount(slot.gameAccount) === normalized;
    });
  };

  const createGameButtonOnClick = (
    slot: RegistrySlot,
    slotUUID: string,
    loginFunc: (account: string) => Promise<void>
  ) => {
    if (isLoading.value) return;
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
    } as Record<string, unknown>);
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
    return game.status.code === GAME_STATUS_CODE.RUNNING;
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
    await runGameAction(async () => {
      try {
        const deleteResp = await captcha.deleteGame(slotUUID);
        await Promise.all([gamesStore.queryGameList(), gamesStore.queryUserQuota()]);
        if (deleteResp.code === API_RESPONSE_CODE.SUCCESS) {
          setMsg("删除成功", Type.Success);
        } else {
          setMsg(deleteResp.message, Type.Warning);
        }
      } catch {
        setMsg("删除失败", Type.Warning);
      }
    });
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
    await runGameAction(async () => {
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
        await Promise.all([gamesStore.queryGameList(), gamesStore.queryUserQuota()]);
        if (createGameResp.code === API_RESPONSE_CODE.SUCCESS) {
          setMsg("修复成功", Type.Success);
        } else {
          setMsg(createGameResp.message, Type.Warning);
        }
      } catch {
        setMsg("修复失败", Type.Warning);
      }
    });
  };

  const handleUpdatePasswdBtnOnClick = async (slot: RegistrySlot | undefined) => {
    if (isLoading.value) return;
    if (!slot || !slot.gameAccount) {
      setMsg("未找到托管槽位，请刷新后重试", Type.Warning);
      return;
    }
    const game = findGameByAccount(slot.gameAccount);
    if (!game) {
      setMsg("未找到游戏信息，请刷新后重试", Type.Warning);
      return;
    }

    selectedSlotUUID.value = slot.uuid;
    selectedRegisterForm.value.account = getRealGameAccount(game.status.account);
    selectedRegisterForm.value.platform = game.status.platform;
    selectedRegisterForm.value.password = "";

    showDialog(UpdateGamePasswd, {
      slotUUID: slot.uuid,
      form: selectedRegisterForm.value,
    } as Record<string, unknown>);
  };

  const gameLogin = async (account: string) => {
    await runGameAction(async () => {
      try {
        const loginResp = await captcha.loginGame(account);
        await Promise.all([gamesStore.queryGameList(), gamesStore.queryUserQuota()]);
        if (loginResp.code === API_RESPONSE_CODE.SUCCESS) {
          setMsg("启动成功", Type.Success);
          showDialog(GeeTestNotify);
        } else {
          setMsg(loginResp.message, Type.Warning);
        }
      } catch {
        setMsg("启动失败", Type.Warning);
      }
    });
  };

  const gameSuspend = async (account: string) => {
    await runGameAction(async () => {
      try {
        const resp = await gamesStore.gameSuspend(account);
        await gamesStore.queryGameList();
        if (resp.code === API_RESPONSE_CODE.SUCCESS) {
          setMsg("暂停成功", Type.Success);
        } else {
          setMsg(resp.message, Type.Warning);
        }
      } catch {
        setMsg("暂停失败", Type.Warning);
      }
    });
  };

  return {
    findGame,
    getSlot,
    createGameButtonOnClick,
    isUpdateStatus,
    isSuspendStatus,
    handleDeleteBtnOnClick,
    handleRepairBtnOnClick,
    handleUpdatePasswdBtnOnClick,
    gameLogin,
    gameSuspend,
  };
}

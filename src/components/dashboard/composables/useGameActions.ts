import type { Ref } from "vue";
import type { GameAccountForm } from "@/shared/types/api";
import { Type } from "@/constants/ui";
import { GAME_STATUS_CODE } from "@/constants/game";
import { API_RESPONSE_CODE } from "@/constants/api";
import { getRealGameAccount } from "@/utils/account";
import { setMsg } from "@/utils/toast";
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
  deleteGame: (account: string) => Promise<ActionResult>;
  createGame: (form: GameAccountForm) => Promise<ActionResult>;
  updateGamePassword: (form: GameAccountForm) => Promise<ActionResult>;
  loginGame: (account: string) => Promise<ActionResult>;
}

interface UseGameActionsOptions {
  gamesStore: ReturnType<typeof useGamesStore>;
  captcha: GameActionsCaptcha;
  isLoading: Ref<boolean>;
  selectedRegisterForm: Ref<GameAccountForm>;
}

export function useGameActions(options: UseGameActionsOptions) {
  const { gamesStore, captcha, isLoading, selectedRegisterForm } = options;

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

  const createGameButtonOnClick = (loginFunc: (account: string) => Promise<void>) => {
    if (isLoading.value) return;
    if (!gamesStore.canCreateGame) {
      setMsg("托管数量已达上限", Type.Warning);
      return;
    }
    showDialog(CreateGame, { loginFunc } as Record<string, unknown>);
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

  const handleDeleteBtnOnClick = async (gameAccount: string) => {
    await runGameAction(async () => {
      try {
        const deleteResp = await captcha.deleteGame(gameAccount);
        if (deleteResp.code === API_RESPONSE_CODE.SUCCESS) {
          await gamesStore.queryGameList();
          setMsg("删除成功", Type.Success);
        } else {
          setMsg(deleteResp.message, Type.Warning);
        }
      } catch {
        setMsg("删除失败", Type.Warning);
      }
    });
  };

  const handleUpdatePasswdBtnOnClick = async (gameAccount: string) => {
    if (isLoading.value) return;
    const game = findGameByAccount(gameAccount);
    if (!game) {
      setMsg("未找到游戏信息，请刷新后重试", Type.Warning);
      return;
    }

    selectedRegisterForm.value = {
      account: getRealGameAccount(game.status.account),
      platform: game.status.platform,
      password: "",
    };

    showDialog(UpdateGamePasswd, {
      form: selectedRegisterForm.value,
    } as Record<string, unknown>);
  };

  const gameLogin = async (account: string) => {
    await runGameAction(async () => {
      try {
        const loginResp = await captcha.loginGame(account);
        if (loginResp.code === API_RESPONSE_CODE.SUCCESS) {
          await gamesStore.queryGameList();
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
        if (resp.code === API_RESPONSE_CODE.SUCCESS) {
          await gamesStore.queryGameList();
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
    createGameButtonOnClick,
    isUpdateStatus,
    isSuspendStatus,
    handleDeleteBtnOnClick,
    handleUpdatePasswdBtnOnClick,
    gameLogin,
    gameSuspend,
  };
}

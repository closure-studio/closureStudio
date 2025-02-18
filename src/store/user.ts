import { defineStore } from "pinia";
import service from "../plugins/axios/axios";
import { isAdmin } from "../plugins/permission/permission";

interface TicketAuthor {
  [key: string]: TicketSystem.Author;
}
export const userStore = defineStore("user", {
  state: () => ({
    games: {
      author: {} as TicketAuthor,
    },
    user: {
      isLogin: false,
      max_slot: 0,
      Token: "",
      Info: {
        createdAt: 0,
        uuid: "",
        email: "",
        permission: 0,
        status: -1,
        isAdmin: false,
        exp: 0,
        slot: 0,
      } as ApiUser.Info,
    },
  }),
  actions: {
    setGame(gameAccount: string, nickname: string, avatar: ApiGame.Avatar) {
      const data: TicketSystem.Author = {
        uuid: "",
        title: "",
        nickname: nickname,
        avatar: avatar,
      };
      this.games.author[gameAccount] = data;
    },
    login(token: string) {
      this.user.isLogin = true;
      this.user.Token = token;
      function b64(str: string) {
        let base64Decoded = atob(str);
        let chars = [];
        for (let i = 0; i < base64Decoded.length; i++) {
          chars.push(base64Decoded.charCodeAt(i));
        }
        let utf8Bytes = new Uint8Array(chars);
        let decoder = new TextDecoder("utf-8");
        return decoder.decode(utf8Bytes);
      }
      this.user.Info = JSON.parse(b64(token.split(".")[1]));
      service.defaults.headers.common["Authorization"] = "Bearer " + token;
    },
    logout() {
      this.$reset();
    },
  },
  getters: {
    isLogin: (state) => state.user.isLogin,
    token: (state) => state.user.Token,
    isAdmin: (state) => isAdmin(state),
    info: (state) => state.user.Info,
    isVerify: (state) =>
      state.user.Info.status === 1 || state.user.Info.status === 2,
    getGame: (state) => (gameAccount: string) =>
      state.games.author[gameAccount],
    getGames: (state) => {
      return Object.entries(state.games.author).map(([key, value]) => ({
        key,
        value,
      }));
    },
  },
});

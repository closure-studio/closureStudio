import type { AxiosInstance } from "axios";
import axios from "axios";

enum Host {
  ArkHostServer = "api.ltsc.vip",
  AuthServer = "passport.ltsc.vip",
  RegistryServer = "registry.ltsc.vip",
}

export const service = axios.create({
  baseURL: "https://api.ltsc.vip/",
});

const version = import.meta.env.VITE_APP_VERSION;
const user = localStorage.getItem("closureV3_user");

if (user != null) {
  service.defaults.headers.common["Authorization"] =
    "Bearer " + JSON.parse(user)?.user?.Token;
}



export default service;
const AuthServer: string = "https://passport.ltsc.vip/api/v1/";
const RegistryServer: string = "https://registry.ltsc.vip/";
const TicketsServer: string = "https://ticket.arknights.app/";


function load<T>(fileName: string): Promise<T> {
  const url = `/data/${fileName}.json?v=${version}`;
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((res) => resolve(res.data as T))
      .catch((error) => reject(error));
  });
}

// idServer





// Email         string `json:"email"`
// CurrentPasswd string `json:"currentPasswd"`
// NewPasswd     string `json:"newPasswd"`

const QueryWXPusher = () => get<ApiUser.WXPusher>(`${AuthServer}wechat`);
const CreateWXPusherQRCode = () =>
  post<ApiUser.WXPusherQRCode>(`${AuthServer}wxpusher`);

// idServer admin






const fetchCron = () => get("Nodes"); // Cron
const fetchAnnounce = () => get("Common/Announcement"); // Announce

const fetchGameLogs = (account: string, id: number) =>
  get<ApiGame.GameLogs>(`game/log/${account}/${id}`);
const fetchGameLogsAdmin = (account: string, uuid: string, id: number) =>
  get<ApiGame.GameLogs>(`game/log/${account}/${id}?uuid=${uuid}`);
const fetchGameList = () => get<ApiGame.Game[]>(`game`); // GameList
const fetchGameScreen = (account: string, platform: string) =>
  get(`Game/Screenshot/${account}/${platform}`); // GetScreen
const fetchDetails = (account: string, platform: string) =>
  get(`Game/${account}/${platform}`); // GetDetails
const fetchGameConf = (account: string, platform: string) =>
  get(`Game/Config/${account}/${platform}`); // GetConf

const apiGeetestSet = (account: string, platform: number, params: any) =>
  post(`Game/Captcha/${account}/${platform}`, params); // Geetest

const fetchSystemConfig = () => get<ApiSystem.Config>("system/config");
const fetchSystemList = () => get<ApiSystem.Hall[]>("system/apCostList");

const doGameLogin = (token: string, account: string) =>
  captchaPost<void>(`game/login/${account}`, token, null); // GameLogin

const doAddGame = (slot: string, token: string, params: any) =>
  captchaPost<void>(
    `${RegistryServer}api/slots/gameAccount?uuid=${slot}`,
    token,
    params
  ); // GameCreate
const doUpdateGamePasswd = (slot: string, token: string, params: any) =>
  captchaPost(
    `${RegistryServer}api/slots/gameAccount?uuid=${slot}`,
    token,
    params
  ); // GameCreate
const doDelGame = (token: string, slot: string) =>
  captchaPost<void>(
    `${RegistryServer}api/slots/gameAccount?uuid=${slot}`,
    token,
    {
      account: null,
    }
  );
const doDelGameAdmin = (slot: string, token: string) =>
  captchaPost(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, {
    account: null,
  });
const doFindAccount = (gameAccount: string, token: string) =>
  captchaPost<Registry.AccountFound>(
    `${RegistryServer}api/users/findEmail?gameAccount=${gameAccount}`,
    token
  );
const DelQuotaGameAdmin = (
  userId: string,
  params: { uuid: string; gameAccount: string | null }
) => post<string>(`${RegistryServer}api/mgm/slots/slot?uid=${userId}`, params);

const doUpdateGameConf = (account: string, game: ApiGame.Config) =>
  post(`game/config/${account}`, {
    config: game,
  });
const doUpdateCaptcha = (account: string, captcha: any) =>
  post(`game/config/${account}`, {
    captcha_info: captcha,
  });
const Auth_Refresh = () => get<ApiUser.Auth>(`${AuthServer}refreshToken`); // RefreshToken
const Auth_Verify = (code: string) =>
  post<void>(`${AuthServer}phone`, { code }); // RealSMS

// qq bind
const fetchQQBindCode = () => get(`${AuthServer}qq`); // QQBindCode // get qqcode

const fetchUserSlots = () =>
  get<Registry.UserInfo>(`${RegistryServer}api/users/me`); // UserSlots
const fetchUserSlotsAdmin = (uid: string) =>
  get<Registry.Slot[]>(`${RegistryServer}api/mgm/slots/slots?uid=${uid}`); // fetch someones slots with admin

const fetchGameListBySSE = () => sse<ApiGame.Game[]>("sse/game"); // 实验性获取 GameList
const fetchGameDetails = (account: string) =>
  get<ApiGame.Detail>(`game/${account}`);

// ---------------------- ticket ----------------------
const GetTicketById = (id: string) =>
  get<TicketSystem.Ticket>(`${TicketsServer}tickets/${id}`); // getTIckets
const GetTickets = () => get<TicketSystem.Ticket[]>(`${TicketsServer}tickets`); // getTIckets
const GetReplays = (id: string) =>
  get<TicketSystem.Ticket[]>(`${TicketsServer}tickets/${id}/replies`); // getTIckets
const UpdateTicketById = (id: string, data: TicketSystem.updateTicket) =>
  put(`${TicketsServer}tickets/${id}`, data); // getTIckets
const ReplyTicket = (id: string, data: TicketSystem.createTicket) =>
  post(`${TicketsServer}tickets/${id}/replies`, data); // getTIckets
const PostTicket = (data: TicketSystem.createTicket) =>
  post(`${TicketsServer}tickets/`, data); // getTIckets

export {
  Auth_Info,
  Auth_Login,
  Auth_Login_Admin,
  Auth_Refresh,
  Auth_Register,
  Auth_ResetPassword,
  Auth_Send_SMS,
  Auth_UpdatePasswd,
  Auth_Verify,
  DelQuotaGameAdmin,
  doAddGame,
  doDelGame,
  doFindAccount,
  doGameLogin,
  doUpdateCaptcha,
  doUpdateGameConf,
  doUpdateGamePasswd,
  fetchGameDetails,
  fetchGameList,
  fetchGameListBySSE,
  fetchGameLogs,
  fetchGameLogsAdmin,
  fetchQQBindCode,
  fetchSystemConfig,
  fetchSystemList,
  fetchUserSlots,
  fetchUserSlotsAdmin,
  load,
  QueryUser,
  SendCodeOnRegister,
  SendSMS,
  UpdateUserPermission,
};

export {
  GetReplays,
  GetTicketById,
  GetTickets,
  PostTicket,
  ReplyTicket,
  UpdateTicketById,
};

export { CreateWXPusherQRCode, QueryWXPusher };

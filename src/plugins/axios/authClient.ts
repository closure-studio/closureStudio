import { AuthServer, HostServer } from "./host";
import { AxiosServer } from "./server";

// const AuthServer: string = "https://passport.ltsc.vip/api/v1/";
const LOGIN_PATH = "/login";

class AuthClient extends AxiosServer {
  AuthServer: string;
  constructor(hostServer: HostServer) {
    super(hostServer);
    this.AuthServer = hostServer.baseURL;
  }
  Auth_Login(params: { email: string; password: string }) {
    return this.post<ApiUser.Auth>(`${this.AuthServer}${LOGIN_PATH}`, params);
  }

  Auth_Register(params: {
    email: string;
    password: string;
    code: string;
    noise: string;
    sign: string;
  }) {
    return this.post<ApiUser.Auth>(`/register`, params);
  }

  Auth_ResetPassword(params: {
    email: string;
    code: string;
    newPasswd: string;
  }) {
    return this.post<ApiUser.Auth>(`/forget`, params);
  }
  Auth_Send_SMS(params: { phone: string }) {
    return this.post<ApiUser.Auth>(`/sms`, params);
  }

  Auth_UpdatePasswd(params: {
    email: string;
    currentPasswd: string;
    newPasswd: string;
  }) {
    return this.put<void>(`password`, params);
  }

  QueryUser(value: string) {
    return this.get<ApiUser.User[]>(`/admin/users/query?value=${value}`);
  }
  SendSMS(params: { uuid: string; phone: string }) {
    return this.post<string>(`/admin/users/sms`, params);
  }
  UpdateUserPermission(uuid: string, permission: number) {
    return this.post(`/admin/permission?uuid=${uuid}&permission=${permission}`);
  }
  SendCodeOnRegister(params: { email: string }) {
    return this.post(`/mail/register/code`, params);
  }
  Auth_Info() {
    return this.get(`/info`);
  }

  Auth_Login_Admin(params: { uuid: string }) {
    return this.post<ApiUser.Auth>(`/admin/users/login`, params);
  }
  //RefreshToken
  Auth_Refresh() {
    return this.get<ApiUser.Auth>(`/refreshToken`);
  }
  Auth_Verify(code: string) {
    return this.post<void>(`/phone`, { code }); // RealSMS
  }
  FetchQQBindCode() {
    return this.get(`/qq`); // QQBindCode // get qqcode
  }
  QueryWXPusher() {
    return this.get<ApiUser.WXPusher>(`/wechat`);
  }
  CreateWXPusherQRCode() {
    return this.post<ApiUser.WXPusherQRCode>(`/wxpusher`);
  }
}

const authClient = new AuthClient(AuthServer);
export default authClient;

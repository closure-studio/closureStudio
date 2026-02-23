import { AuthServer, IHostServer } from "./host";
import { AxiosServer } from "./server";

// const AuthServer: string = "https://passport.ltsc.vip/api/v1/";
const LOGIN_PATH = "/login";

class AuthClient extends AxiosServer {
  AuthServer: string;
  constructor(hostServer: IHostServer) {
    super(hostServer);
    this.AuthServer = hostServer.baseURL;
  }



  login(params: { email: string; password: string }) {
    return this.post<ApiUser.Auth>(`${LOGIN_PATH}`, params);
  }

  register(params: {
    email: string;
    password: string;
    code: string;
    noise: string;
    sign: string;
  }) {
    return this.post<ApiUser.Auth>(`/register`, params);
  }

  resetPassword(params: { email: string; code: string; newPasswd: string }) {
    return this.post<ApiUser.Auth>(`/forget`, params);
  }
  Send_SMS(params: { phone: string }) {
    return this.post<ApiUser.Auth>(`/sms`, params);
  }

  updatePasswd(params: {
    email: string;
    currentPasswd: string;
    newPasswd: string;
  }) {
    return this.put<void>(`/password`, params);
  }

  queryUser(value: string) {
    return this.get<ApiUser.User[]>(`/admin/users/query?value=${value}`);
  }
  SendSMS(params: { uuid: string; phone: string }) {
    return this.post<string>(`/admin/users/sms`, params);
  }
  updateUserPermission(uuid: string, permission: number) {
    return this.post(`/admin/permission?uuid=${uuid}&permission=${permission}`);
  }
  sendCodeOnRegister(params: { email: string }) {
    return this.post(`/mail/register/code`, params);
  }
  info() {
    return this.get(`/info`);
  }

  loginAdmin(params: { uuid: string }) {
    return this.post<ApiUser.Auth>(`/admin/users/login`, params);
  }
  //RefreshToken
  refresh() {
    return this.get<ApiUser.Auth>(`/refreshToken`);
  }
  verify(code: string) {
    return this.post<void>(`/phone`, { code }); // RealSMS
  }
  fetchQQBindCode() {
    return this.get(`/qq`); // QQBindCode // get qqcode
  }
}

const authClient = new AuthClient(AuthServer);
export default authClient;

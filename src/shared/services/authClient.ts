import { AuthServer, IHostServer } from "./host";
import { AxiosServer } from "./server";
import type { ApiUserAuth, ApiUserUser } from "@/shared/types/api";

const LOGIN_PATH = "/login";

class AuthClient extends AxiosServer {
  AuthServer: string;
  constructor(hostServer: IHostServer) {
    super(hostServer);
    this.AuthServer = hostServer.baseURL;
  }

  login(params: { email: string; password: string }) {
    return this.post<ApiUserAuth>(`${LOGIN_PATH}`, params);
  }

  register(params: { email: string; password: string; code: string; noise: string; sign: string }) {
    return this.post<ApiUserAuth>(`/register`, params);
  }

  resetPassword(params: { email: string; code: string; newPasswd: string }) {
    return this.post<ApiUserAuth>(`/forget`, params);
  }

  sendSms(params: { phone: string }) {
    return this.post<ApiUserAuth>(`/sms`, params);
  }

  updatePasswd(params: { email: string; currentPasswd: string; newPasswd: string }) {
    return this.put<void>(`/password`, params);
  }

  queryUser(value: string) {
    return this.get<ApiUserUser[]>(`/admin/users/query?value=${value}`);
  }
  sendSmsAdmin(params: { uuid: string; phone: string }) {
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
    return this.post<ApiUserAuth>(`/admin/users/login`, params);
  }
  refresh() {
    return this.get<ApiUserAuth>(`/refreshToken`);
  }
  verify(code: string) {
    return this.post<void>(`/phone`, { code });
  }
  fetchQQBindCode() {
    return this.get(`/qq`);
  }
}

const authClient = new AuthClient(AuthServer);
export default authClient;

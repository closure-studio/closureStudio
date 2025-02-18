import { HostServer, RegistryServer } from "./host";
import { AxiosServer } from "./server";

class RegistryClient extends AxiosServer {
  constructor(hostServer: HostServer) {
    super(hostServer);
  }
  doAddGame(slot: string, token: string, params: any) {
    return this.captchaPost<void>(
      `/api/slots/gameAccount?uuid=${slot}`,
      token,
      params
    ); // GameCreate
  }

  doUpdateGamePasswd(slot: string, token: string, params: any) {
    return this.captchaPost(
      `/api/slots/gameAccount?uuid=${slot}`,
      token,
      params
    ); // GameCreate
  }
  doDelGame(token: string, slot: string) {
    return this.captchaPost<void>(
      `/api/slots/gameAccount?uuid=${slot}`,
      token,
      {
        account: null,
      }
    );
  }
  doFindAccount(gameAccount: string, token: string) {
    return this.captchaPost<Registry.AccountFound>(
      `/api/users/findEmail?gameAccount=${gameAccount}`,
      token
    );
  }
  DelQuotaGameAdmin(
    userId: string,
    params: { uuid: string; gameAccount: string | null }
  ) {
    return this.post<string>(`/api/mgm/slots/slot?uid=${userId}`, params);
  }

  fetchUserSlots() {
    return this.get<Registry.UserInfo>(`/api/users/me`); // UserSlots
  }

  fetchUserSlotsAdmin(uid: string) {
    return this.get<Registry.Slot[]>(`/api/mgm/slots/slots?uid=${uid}`); // fetch someones slots with admin
  }

  fetchGameDetails(account: string) {
    return this.get<ApiGame.Detail>(`/game/${account}`);
  }
}

const registryClient = new RegistryClient(RegistryServer);
export default registryClient;

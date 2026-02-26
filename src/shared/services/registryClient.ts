import { IHostServer, RegistryServer } from "./host";
import { AxiosServer } from "./server";
import type {
  RegistryAccountFound,
  RegistryUserInfo,
  RegistrySlot,
  ApiGameDetail,
} from "@/shared/types/api";

class RegistryClient extends AxiosServer {
  constructor(hostServer: IHostServer) {
    super(hostServer);
  }
  doAddGame(slot: string, token: string, params: any) {
    return this.captchaPost<void>(`/api/slots/gameAccount?uuid=${slot}`, token, params);
  }

  doUpdateGamePasswd(slot: string, token: string, params: any) {
    return this.captchaPost(`/api/slots/gameAccount?uuid=${slot}`, token, params);
  }
  doDelGame(token: string, slot: string) {
    return this.captchaPost<void>(`/api/slots/gameAccount?uuid=${slot}`, token, { account: null });
  }
  doFindAccount(gameAccount: string, token: string) {
    return this.captchaPost<RegistryAccountFound>(
      `/api/users/findEmail?gameAccount=${gameAccount}`,
      token
    );
  }
  DelQuotaGameAdmin(userId: string, params: { uuid: string; gameAccount: string | null }) {
    return this.post<string>(`/api/mgm/slots/slot?uid=${userId}`, params);
  }

  fetchUserSlots() {
    return this.get<RegistryUserInfo>(`/api/users/me`);
  }

  fetchUserSlotsAdmin(uid: string) {
    return this.get<RegistrySlot[]>(`/api/mgm/slots/slots?uid=${uid}`);
  }

  fetchGameDetails(account: string) {
    return this.get<ApiGameDetail>(`/game/${account}`);
  }
}

const registryClient = new RegistryClient(RegistryServer);
export default registryClient;

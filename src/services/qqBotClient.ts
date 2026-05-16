import { QQBOT_SERVER, type IHostServer } from "@/constants/api";
import { AxiosServer } from "./server";
import type {
  ApiQQBotSpecialNotifyParams,
  ApiQQBotSpecialNotifyResponse,
} from "@/shared/types/api";

class QQBotClient extends AxiosServer {
  constructor(hostServer: IHostServer) {
    super(hostServer);
  }

  specialNotify(params: ApiQQBotSpecialNotifyParams) {
    return this.post<ApiQQBotSpecialNotifyResponse>(
      "/api/special_notify",
      params
    ) as unknown as Promise<ApiQQBotSpecialNotifyResponse>;
  }
}

const qqBotClient = new QQBotClient(QQBOT_SERVER);

export default qqBotClient;

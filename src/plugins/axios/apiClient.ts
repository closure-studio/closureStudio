import { APIHostLTSC, HostServer } from "./host";
import { AxiosServer } from "./server";

class APIClient extends AxiosServer {
  constructor(hostServer: HostServer) {
    super(hostServer);
  }
}

let hostServer: HostServer;

const apiHost = localStorage.getItem("apiHost");
if (!apiHost) {
  hostServer = APIHostLTSC;
  // save to localStorage
  localStorage.setItem("apiHost", JSON.stringify(hostServer));
} else {
  const tempHost = JSON.parse(apiHost);
  if (!tempHost.baseURL) {
    hostServer = APIHostLTSC;
    // save to localStorage
    localStorage.setItem("apiHost", JSON.stringify(hostServer));
  } else {
    hostServer = tempHost;
  }
}

const apiClient = new APIClient(hostServer);
export default apiClient;

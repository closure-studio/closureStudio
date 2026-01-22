import axios from "axios";

const VERSION_API_URL = "https://closure-studio-version-api.arknights.app";

export async function checkVersion(): Promise<number> {
  try {
    const res = await axios.get(VERSION_API_URL);
    // 期望返回 { version: 1 }
    const latest: number = res.data.version;
    return latest;
  } catch (e) {
    console.error("版本检查失败", e);
    throw e;
  }
}

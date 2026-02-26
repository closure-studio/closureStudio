import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
export const reportError = (error: unknown) => {
  if (error instanceof Error) {
    // 处理特定类型的错误
    console.error("An error occurred:", error.message);
    setMsg(error.message, Type.Warning);
    // 可以在这里设置错误消息或采取其他适当的措施
  } else {
    // 处理其他类型的错误
    console.error("An unknown error occurred:", error);
  }
};

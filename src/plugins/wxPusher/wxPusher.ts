import { ref } from "vue";
import { setMsg } from "../common";
import { Type } from "../../components/toast/enum";
import authClient from "../axios/authClient";

export const useWXPusher = () => {
  const isQueryWxPusher = ref(false);
  const isCreateQRCodes = ref(false);
  const wxPusher = ref<ApiUser.WXPusher>();
  const QRCode = ref<ApiUser.WXPusherQRCode>();
  const queryWxPusher = async () => {
    if (isQueryWxPusher.value) return;
    isQueryWxPusher.value = true;
    try {
      const res = await authClient.queryWXPusher();
      if (res.code == 1 && res.data) {
        wxPusher.value = res.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      isQueryWxPusher.value = false;
    }
  };

  const createQRCodes = async () => {
    if (isCreateQRCodes.value) return;
    isCreateQRCodes.value = true;
    try {
      const res = await authClient.createWXPusherQRCode();
      if (res.code == 1 && res.data) {
        QRCode.value = res.data;
      } else {
        setMsg(res.message, Type.Error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isCreateQRCodes.value = false;
    }
  };

  return {
    isQueryWxPusher,
    isCreateQRCodes,
    wxPusher,
    QRCode,
    queryWxPusher,
    createQRCodes,
  };
};

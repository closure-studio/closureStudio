import { ref } from "vue";
import { Store } from "@/shared/components/toast/store";

export const { setMsg } = Store();
export const isLarge = ref(false);

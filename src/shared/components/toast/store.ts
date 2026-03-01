import { computed, reactive } from "vue";
import { Toast } from "./interface";
import { Appearance, Position, Type } from "./enum";

const state = reactive({
    toasts: {} as Record<string, Toast>,
});
const DURATION = 3000;
const defaultCfg = (): Toast => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(-8)}`,
    message: "",
    type: Type.Info,
    showIcon: true,
    dismiss: {
        automatically: true,
        manually: true,
    },
    duration: DURATION,
    showProgress: true,
    appearance: Appearance.Light,
    position: Position.TopRight,
});

export const Store = () => {
    const toasts = computed(() => state.toasts);
    const toast = (id: string) => computed(() => state.toasts[id]);
    const setMsg = (
        message: string | unknown,
        type: Type,
        position: Position = Position.TopRight,
        appearance: Appearance = Appearance.Dark
    ) => {
        const full: Toast = Object.assign(defaultCfg(), {
            message,
            type,
            position, // 使用传递进来的 position 参数
            appearance,
        });
        state.toasts[full.id] = full;
    };
    const unset = (id: string) => {
        delete state.toasts[id];
    };
    return {
        toasts,
        toast,
        setMsg,
        unset,
    };
};

import {
    Appearance, Position, Type
} from "./enum";

interface ToastDismiss {
    automatically: boolean;
    manually: boolean;
}

export interface Toast {
    id: string;
    message: string;
    type: Type;
    showIcon: boolean;
    dismiss: ToastDismiss;
    duration: number;
    showProgress: boolean;
    appearance: Appearance; // 背景 可选 Dark Light Glass
    position: Position; // 添加 position 属性
}
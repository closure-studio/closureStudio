import { createApp, h } from "vue";
import type { Component } from "vue";
import DialogWrapper from "./DialogWrapper.vue";

// DialogComponentProps 规定了传入组件必须包含的 props
export interface DialogComponentProps {
  dialogClose: () => void;
}

const showDialog = (component: Component, componentProps: Record<string, unknown> = {}) => {
  const div = document.createElement("div");
  document.body.appendChild(div);

  const closeDialog = () => {
    app.unmount();
    div.remove();
  };

  // 创建 Vue app
  const app = createApp({
    render() {
      return h(DialogWrapper, {
        component,
        dialogClose: closeDialog, // 将 closeDialog 传递给 DialogWrapper
        componentProps, // 将 `componentProps` 传递给 `DialogWrapper`
      });
    },
  });
  app.mount(div);
};

export default showDialog;

// ============================================================
// Window 全局类型扩展 — 从 api.d.ts + system.d.ts 合并
// 保持 ambient declaration，无需显式 import
// ============================================================

interface Window {
  idaks?: string[];
  skadi: (payload: string) => string;
  grecaptcha: {
    ready: (callback: () => void) => void;
    execute: (sitekey: string, options: { action: string }) => Promise<string>;
    render: (id: string, options: { sitekey: string; callback: (token: string) => void }) => void;
    reset: (id: string) => void;
  };
  initGeetest4: (options: any, handle: any) => void;
  initGeetest: (options: any, handle: any) => void;
  captchaObj: {
    verify: () => void;
    onReady: (callback: () => void) => void;
    onRefresh: (callback: () => void) => void;
    onError: (callback: () => void) => void;
    onSuccess: (callback: () => void) => void;
    appendTo: (id: string) => any;
    getValidate: () => any;
    showCaptcha: () => void;
  };
}

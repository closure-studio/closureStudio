import { CaptchaError } from "./sdkLifecycle";

export function createDisplayLease() {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    run<T>(work: () => Promise<T>, signal?: AbortSignal): Promise<T> {
      let release!: () => void;
      const previous = tail;
      tail = new Promise<void>((resolve) => { release = resolve; });
      return new Promise<T>((resolve, reject) => {
        let started = false;
        const abort = () => {
          if (!started) reject(new CaptchaError("cancelled", "已取消排队验证"));
        };
        signal?.addEventListener("abort", abort, { once: true });
        void previous.then(async () => {
          signal?.removeEventListener("abort", abort);
          try {
            if (signal?.aborted) { abort(); return; }
            started = true;
            resolve(await work());
          } catch (error) { reject(error); }
          finally { release(); }
        });
        if (signal?.aborted) abort();
      });
    },
  };
}
export const captchaDisplayLease = createDisplayLease();

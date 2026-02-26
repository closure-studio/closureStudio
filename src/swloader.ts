interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval: number }): Promise<void>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    readonly periodicSync: PeriodicSyncManager;
  }
}

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; ++index) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}

async function subscribeUser(swRegistration: ServiceWorkerRegistration) {
  const applicationServerPublicKey =
    "BGMPdVED8VFVGjGEzOxiQcnfaBfaiQS0dLy4_CVD4AvFsYrfrKdVyb61W2Ijr8NdJf0QC1fPHCTd3llO4zX_B68";
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    console.log("user is subscribed:", JSON.stringify(subscription));
  } catch {
    const localState = JSON.parse(localStorage.getItem("test") || "{}");
    if (localState?.config?.subscribe) {
      alert("尝试获取【通知】权限失败，将无法自动推送新内容");
    }
  }
}

export function initSW() {
  let deferredPrompt: BeforeInstallPromptEvent | "init" | null = "init";

  window.addEventListener("load", () => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener(
      "beforeinstallprompt",
      (event) => {
        event.preventDefault();
        if (deferredPrompt === "init") {
          deferredPrompt = event as BeforeInstallPromptEvent;
        }
        console.log("your browser can install pwa");
        window.addEventListener("pwa", () => {
          if (!deferredPrompt || deferredPrompt === "init") {
            return;
          }
          void deferredPrompt.prompt();
          deferredPrompt = null;
        });
      },
      { once: true }
    );

    void navigator.serviceWorker.register("/sw.js");

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        alert("可露希尔已更新，即将自动更新");
        window.location.reload();
      });
    }

    void (async () => {
      const registration = await navigator.serviceWorker.ready;

      if ("periodicSync" in registration) {
        const status = await navigator.permissions.query({
          name: "periodic-background-sync" as PermissionName,
        });

        if (status.state === "granted") {
          await registration.periodicSync.register("update-check", {
            minInterval: 24 * 60 * 60 * 1000,
          });
        }
      }

      if (window.PushManager) {
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          await subscribeUser(registration);
        } else {
          console.log("subscription success:" + subscription);
        }
      }

      if (window.matchMedia("(display-mode: standalone)").matches) {
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState !== "hidden") {
            navigator.serviceWorker.controller?.postMessage("update-check");
            void registration.update();
          }
        });
      }
    })();
  });
}

interface PeriodicSyncManager {
    register(tag: string, options?: { minInterval: number }): Promise<void>;
}

declare global {
    interface ServiceWorkerRegistration {
        readonly periodicSync: PeriodicSyncManager;
    }
}
function urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
function subscribeUser(swRegistration: ServiceWorkerRegistration) {
    // private key: rkoNSmRkPZpLuLaO5neU3G-G4OT7bHs1JaGxQDwDfLA
    const applicationServerPublicKey = "BGMPdVED8VFVGjGEzOxiQcnfaBfaiQS0dLy4_CVD4AvFsYrfrKdVyb61W2Ijr8NdJf0QC1fPHCTd3llO4zX_B68"
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        // 用户同意
        .then(function (subscription) {
            // alert(JSON.stringify(subscription))
            console.log('user is subscribed:', JSON.stringify(subscription));
        })
        // 用户不同意或者生成失败
        .catch(function () {
            let ls = JSON.parse(localStorage.getItem("test") || '{}')
            if (ls?.config?.subscribe) alert('尝试获取【通知】权限失败，将无法自动推送新内容');
        });
}

export function initSW() {
    // @ts-ignore
    let deferredPrompt: BeforeInstallPromptEvent = 'init';
    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('beforeinstallprompt', (event) => {
                event.preventDefault();
                if (deferredPrompt === 'init') {
                    deferredPrompt = event;
                }
                console.log('your browser can install pwa')
                window.addEventListener('pwa', () => {
                    if (!deferredPrompt) return;
                    deferredPrompt.prompt();
                    deferredPrompt = null;
                });
            }, { once: true });

            // Register the service worker
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                // Immediately check for updates
                registration.update();

                // If the service worker is ready
                navigator.serviceWorker.ready.then(async (registration) => {
                    if ('periodicSync' in registration) {
                        const status = await navigator.permissions.query({
                            name: 'periodic-background-sync' as PermissionName,
                        });

                        if (status.state === 'granted') {
                            await registration.periodicSync.register('update-check', {
                                minInterval: 24 * 60 * 60 * 1000,
                            });
                        }
                    }

                    // Handle push subscription
                    if (window.PushManager) {
                        registration.pushManager.getSubscription().then(subscription => {
                            if (!subscription) {
                                subscribeUser(registration);
                            } else {
                                console.log("subscription success:", subscription);
                            }
                        });
                    }

                    // Reload page when service worker updates
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        alert('可露希尔已更新，即将自动更新');
                        window.location.reload();
                    });

                    // Periodically check for updates in standalone mode
                    if (window.matchMedia('(display-mode: standalone)').matches) {
                        document.addEventListener('visibilitychange', () => {
                            if (document.visibilityState !== 'hidden') {
                                registration.update();
                            }
                        });
                    }
                });
            }).catch((error) => {
                console.error('Service worker registration failed:', error);
            });
        }
    });
}
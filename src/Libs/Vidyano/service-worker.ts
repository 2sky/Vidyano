namespace Vidyano {
    export interface IServiceWorkerMonitor {
        readonly available: boolean;
        readonly activation: Promise<void>;
    }

    class ServiceWorkerMonitor implements IServiceWorkerMonitor {
        private _activation: Promise<void>;

        constructor(private _register?: Promise<ServiceWorkerRegistration>) {
            if (this.available) {
                let resolveUpdater: () => void;

                this._activation = new Promise(async resolve => {
                    const reg = await this._register;

                    reg.onupdatefound = () => {
                        var installingWorker = reg.installing;

                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === "activated") {
                                console.log("New service worker installed successfully, reloading page...");
                                document.location.reload();
                            }
                        };
                    };

                    try {
                        await reg.unregister();
                    }
                    catch { /* Throws service-worker.js not found exception while offline. */}

                    if (!reg.installing && reg.active && reg.active.state === "activated") {
                        resolve();
                        return;
                    }
                });
            }
        }

        get available(): boolean {
            return this._register != null;
        }

        get activation(): Promise<void> {
            return this._activation;
        }
    }

    const monitor = new ServiceWorkerMonitor("serviceWorker" in navigator ? navigator.serviceWorker.register("service-worker.js") : null);

    export class ServiceWorker {
        static get Monitor(): IServiceWorkerMonitor {
            return monitor;
        }
    }
}
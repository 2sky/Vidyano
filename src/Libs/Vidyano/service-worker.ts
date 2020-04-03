namespace Vidyano {
    export interface IServiceWorkerMonitor {
        readonly available: boolean;
        readonly activation: Promise<void>;
    }

    class ServiceWorkerMonitor implements IServiceWorkerMonitor {
        private _activation: Promise<void>;

        constructor(private _registration?: Promise<ServiceWorkerRegistration>) {
            if (!this.available)
                return;

            this._activation = new Promise(async resolve => {
                const reg = await this._registration;

                reg.onupdatefound = () => {
                    reg.installing.onstatechange = () => {
                        if (reg.active?.state === "activated") {
                            console.log("New service worker installed successfully, reloading page...");
                            document.location.reload();
                        }
                    };
                };

                if (!reg.installing && reg.active && reg.active.state === "activated") {
                    resolve();
                    return;
                }
            });
        }

        get available(): boolean {
            return this._registration != null;
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
namespace Vidyano {
    // See issue: https://github.com/Microsoft/TypeScript/issues/14877
    const self_service_worker_global_scope = (self as unknown) as ServiceWorkerGlobalScope;

    export const version = "latest";
    const CACHE_NAME = `vidyano.web2.${version}`;
    const WEB2_BASE = "WEB2_BASE" + "/";

    export class ServiceWorker {
        constructor(private serviceUri?: string, private _verbose?: boolean) {
            if (!serviceUri)
                this.serviceUri = location.href.split("service-worker.js")[0];

            self.addEventListener("install", (e: ExtendableEvent) => {
                self_service_worker_global_scope.skipWaiting();
                e.waitUntil(this._onInstall(e));
            });
            self.addEventListener("activate", (e: ExtendableEvent) => e.waitUntil(this._onActivate(e)));
            self.addEventListener("fetch", (e: FetchEvent) => e.respondWith(this._onFetch(e)));
        }

        // get db(): IndexedDB {
        //     return this._db || (this._db = new IndexedDB());
        // }

        private _log(message: string) {
            if (!this._verbose)
                return;

            console.log("SW: " + message);
        }

        protected getPreloadFiles(): string[] {
            return [];
        }

        private async _onInstall(e: ExtendableEvent) {
            console.log("Installing Vidyano Web2 version " + version);
            const start = new Date().getTime();

            vidyanoFiles.splice(0, vidyanoFiles.length, ...[
                `${WEB2_BASE}`,
            ].concat(vidyanoFiles.map(f => `${WEB2_BASE}${f}`)));

            this.getPreloadFiles().forEach(file => {
                vidyanoFiles.push(file);
            });

            const cache = await caches.open(CACHE_NAME);
            await Promise.all(vidyanoFiles.map(async url => {
                const request = new Request(url);
                const response = await fetch(request);

                if (request.url !== response.url) {
                    const redirect = new Response(null, {
                        status: 302,
                        headers: new Headers({
                            "location": response.url
                        })
                    });

                    cache.put(request, redirect);
                    cache.put(new Request(response.url), response);
                }
                else
                    cache.put(request, response);
            }));

            self.importScripts(
                `${WEB2_BASE}Libs/bignumber.js/bignumber.min.js`,
                `${WEB2_BASE}Libs/Vidyano/vidyano.common.js`,
                `${WEB2_BASE}Libs/idb/idb.js`);

            this._log(`Installed ServiceWorker. Time taken: ${(new Date().getTime() - start) / 1000}s.`);
        }

        private async _onActivate(e: ExtendableEvent) {
            await self_service_worker_global_scope.clients.claim();

            const oldCaches = (await caches.keys()).filter(cache => cache.startsWith("vidyano.web2.") && cache !== CACHE_NAME);
            while (oldCaches.length > 0) {
                const cacheName = oldCaches.splice(0, 1)[0];
                console.log("Uninstalling Vidyano Web2 version " + cacheName.substr(13));
                const success = await caches.delete(cacheName);
                if (!success)
                    console.error("Failed uninstalling Vidyano Web2 version " + cacheName.substr(13));
            }

            this._log("Activated ServiceWorker");
        }

        private async _onFetch(e: FetchEventInit) {
            try {
                let response: Response;

                const cache = await caches.open(CACHE_NAME);
                if (!!(response = await cache.match(e.request)))
                    return response;
                else {
                    console.warn("No cache hit for: " + e.request.url);
                }

                try {
                    response = await fetch(e.request);
                }
                catch (error) { }

                if (e.request.method === "GET") {
                    if (response) {
                        if (response.status !== 0 && e.request.url !== response.url) {
                            cache.put(new Request(response.url), response);
                            response = new Response(null, {
                                status: 302,
                                headers: new Headers({
                                    "location": response.url
                                })
                            });

                            cache.put(e.request, response);
                        }
                        else
                            cache.put(e.request, response.clone());
                    }
                    else
                        response = await caches.match(e.request);
                }

                if (!response && e.request.url.startsWith(this.serviceUri) && e.request.method === "GET")
                    return await caches.match(this.serviceUri); // Fallback to root document when a deeplink is loaded directly

                return response;
            }
            catch (ee) {
                console.log(ee);
                return this.createResponse(null);
            }
        }

        private async _send(message: string) {
            const clients = await self_service_worker_global_scope.clients.matchAll();
            await Promise.all(clients.map(client => {
                const channel = new MessageChannel();
                client.postMessage(message, [channel.port2]);
            }));
        }

        protected createRequest(data: any, request: Request): Request {
            if (typeof data === "object")
                data = JSON.stringify(data);

            return new Request(request.url, {
                headers: request.headers,
                body: data,
                cache: request.cache,
                credentials: request.credentials,
                integrity: request.integrity,
                keepalive: request.keepalive,
                method: request.method,
                mode: request.mode,
                referrer: request.referrer,
                referrerPolicy: request.referrerPolicy
            });
        }

        protected createResponse(data: any, response?: Response): Response {
            if (!data) {
                return new Response("<h1>Service Unavailable</h1>", {
                    status: 503,
                    statusText: "Service Unavailable",
                    headers: new Headers({
                        "Content-Type": "text/html"
                    })
                });
            }

            if (typeof data === "object")
                data = JSON.stringify(data);

            return new Response(data, response ? {
                headers: response.headers,
                status: response.status,
                statusText: response.statusText
            } : null);
        }
    }
}
namespace Vidyano {
    // See issue: https://github.com/Microsoft/TypeScript/issues/14877
    const self_service_worker_global_scope = (self as unknown) as ServiceWorkerGlobalScope;

    export const version = "latest";
    const CACHE_NAME = `vidyano.web2.${version}`;
    const WEB2_BASE = "WEB2_BASE" + "/";

    export type Fetcher<TPayload, TResult> = (payload?: TPayload) => Promise<TResult>;
    interface IFetcher<TPayload, TResult> {
        payload?: TPayload;
        request?: Request;
        response?: Response;
        fetch: Fetcher<TPayload, TResult>;
    }

    export abstract class ServiceWorker<T extends IndexedDB> {
        private _db: T;
        private _vidyanoDb: IndexedDBVidyano;
        private readonly serviceUri: string;
        private _clientData: Service.ClientData;
        private _application: Service.ApplicationResponse;

        constructor(serviceUri?: string) {
            this.serviceUri = serviceUri ?? location.href.split("service-worker.js")[0];

            self.addEventListener("install", (e: ExtendableEvent) => {
                self_service_worker_global_scope.skipWaiting();
                e.waitUntil(this._onInstall(e));
            });
            self.addEventListener("activate", (e: ExtendableEvent) => e.waitUntil(this._onActivate(e)));
            self.addEventListener("fetch", (e: FetchEvent) => e.respondWith(this._onFetch(e)));
        }

        protected abstract onCreateDatabase(): T;

        get db(): T {
            return this._db || (this._db = this.onCreateDatabase());
        }

        private get vidyanoDb(): IndexedDBVidyano {
            return this._vidyanoDb || (this._vidyanoDb = new IndexedDBVidyano());
        }

        get clientData(): Service.ClientData {
            return this._clientData;
        }

        get application(): Service.ApplicationResponse {
            return this._application;
        }

        private _log(message: string) {
            console.log("SW: " + message);
        }

        protected abstract getPreloadFiles(files: string[]): string[];

        private async _onInstall(e: ExtendableEvent) {
            console.log("Installing Vidyano Web2 version " + version);
            const start = new Date().getTime();

            vidyanoFiles.splice(0, vidyanoFiles.length, ...[
                `${WEB2_BASE}`,
            ].concat(vidyanoFiles.map(f => `${WEB2_BASE}${f}`)));

            const files = this.getPreloadFiles(vidyanoFiles);
            const cache = await caches.open(CACHE_NAME);
            await Promise.all(files.map(async url => {
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

            await this.onInstall();

            this._log(`Installed ServiceWorker. Time taken: ${(new Date().getTime() - start) / 1000}s.`);
        }

        protected async onInstall(): Promise<any> {
            return Promise.resolve();
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

            await this.onActivate();

            this._log("Activated ServiceWorker");
        }

        protected async onActivate(): Promise<any> {
            return Promise.resolve();
        }

        private async _onFetch(e: FetchEventInit) {
            if (!globalThis.idb) {
                self.importScripts(
                    `${WEB2_BASE}Libs/bignumber.js/bignumber.min.js`,
                    `${WEB2_BASE}Libs/Vidyano/vidyano.common.js`,
                    `${WEB2_BASE}Libs/idb/idb.js`);
            }

            try {
                let response: Response;

                if (e.request.method === "GET" && e.request.url.endsWith("GetClientData?v=2")) {
                    const fetcher = await this.createFetcher<any, Service.ClientData>(e.request);
                    let response = await fetcher.fetch();
                    if (!response)
                        response = await this.onGetClientData();
                    else {
                        await this.onCacheClientData(response);

                    }

                    return this.createResponse(response);
                }

                if (e.request.method === "POST") {
                    if (e.request.url.endsWith("GetApplication")) {
                        const fetcher = await this.createFetcher<Service.GetApplicationRequest, Service.ApplicationResponse>(e.request);
                        let response = await fetcher.fetch(fetcher.payload);
                        if (!response)
                            response = await this.onGetApplication();
                        else
                            await this.onCacheApplication(response);

                        return this.createResponse(response);
                    }
                }

                const cache = await caches.open(CACHE_NAME);
                response = await this.onFetch(e.request, cache);
                if (response)
                    return response;

                if (!!(response = await cache.match(e.request)))
                    return response;
                else {
                    console.warn("No cache hit for: " + e.request.url);
                }

                try {
                    response = await fetch(e.request);
                }
                catch (error) {
                    // Do nothing
                }

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

        protected async onFetch(request: Request, cache: Cache): Promise<Response> {
            return null;
        }

        protected onGetClientData(): Promise<Service.ClientData> {
            return this.vidyanoDb.getClientData();
        }

        protected onCacheClientData(clientData: Service.ClientData): Promise<void> {
            return this.vidyanoDb.saveClientData(clientData);
        }

        protected async onGetApplication(): Promise<Service.ApplicationResponse> {
            return this.vidyanoDb.getApplication();
        }

        protected onCacheApplication(application: Service.ApplicationResponse): Promise<void> {
            return this.vidyanoDb.saveApplication(application);
        }

        async broadcast(message: string) {
            const clients = await self_service_worker_global_scope.clients.matchAll();
            await Promise.all(clients.map(client => {
                const channel = new MessageChannel();
                client.postMessage(message, [channel.port2]);
            }));
        }

        protected async createFetcher<TPayload, TResult>(originalRequest: Request): Promise<IFetcher<TPayload, TResult>> {
            const fetcher: IFetcher<any, any> = {
                payload: originalRequest.headers.get("Content-type") === "application/json" ? await originalRequest.clone().json() : await originalRequest.text(),
                fetch: null
            };

            fetcher.fetch = async payload => {
                const fetchRquest = this.createRequest(payload, originalRequest);
                try {
                    fetcher.response = await fetch(fetchRquest);
                }
                catch (ex) {
                    await this.broadcast("Offline");
                    return;
                }

                return await fetcher.response.json();
            };

            return fetcher;
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
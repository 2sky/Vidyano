namespace Vidyano {
    // See issue: https://github.com/Microsoft/TypeScript/issues/14877
    const self_service_worker_global_scope = (self as unknown) as ServiceWorkerGlobalScope;

    export const version = "latest";
    const CACHE_NAME = `vidyano.web2.${version}`;
    const WEB2_BASE = "WEB2_BASE" + "/";

    export interface IFetcher {
        payload?: any;
        request?: Request;
        response?: Response;
        fetch: () => Promise<any>;
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

                this.cache(new Request(url), response, cache);
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
                // Handle Vidyano requests
                let response = await this._onFetchVidyano(e);
                if (response)
                    return response;

                // Allow implementor to handle request
                response = await this.onFetch(await this.createFetcher(e.request));
                if (response)
                    return response;

                const cache = await caches.open(CACHE_NAME);
                if (!!(response = await cache.match(e.request)))
                    return response;
                else {
                    response = await this.onCacheMiss(e.request);
                    if (response)
                        return response;
                }

                // Launch request
                try {
                    response = await fetch(e.request);
                }
                catch (error) {
                    // Do nothing
                }

                // Cache GET requests
                if (e.request.method === "GET" && response)
                    this.cache(e.request, response, cache);

                if (!response && e.request.url.startsWith(this.serviceUri) && e.request.method === "GET")
                    return await cache.match(this.serviceUri); // Fallback to root document when a deeplink is loaded directly

                return response;
            }
            catch (ee) {
                console.log(ee);
                return this.createResponse(null);
            }
        }

        private async _onFetchVidyano(e: FetchEventInit): Promise<Response> {
            if (e.request.method === "GET" && e.request.url.endsWith("GetClientData?v=2")) {
                const fetcher = await this.createFetcher(e.request);
                let response = await fetcher.fetch();
                if (!response)
                    response = await this.onGetClientData();
                else
                    await this.onCacheClientData(response);

                return this.createResponse(response);
            }

            if (e.request.method === "POST") {
                if (e.request.url.endsWith("GetApplication")) {
                    const fetcher = await this.createFetcher(e.request);
                    let response = await fetcher.fetch();
                    if (!response)
                        response = await this.onGetApplication();
                    else
                        await this.onCacheApplication(response);

                    return this.createResponse(response);
                }
            }

            return null;
        }

        protected async onFetch(fetcher: IFetcher): Promise<Response> {
            return null;
        }

        protected async onCacheMiss(request: Request): Promise<Response> {
            return Promise.resolve(null);
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

        protected async cache(request: Request, response: Response, cache: Cache): Promise<void> {
            response = response.clone();

            if (request.url !== response.url) {
                const redirect = new Response(null, {
                    status: 302,
                    headers: new Headers({
                        "location": response.url
                    })
                });

                await cache.put(request, redirect);
                await cache.put(new Request(response.url), response);
            }
            else
                await cache.put(request, response);
        }

        async broadcast(message: string) {
            const clients = await self_service_worker_global_scope.clients.matchAll();
            await Promise.all(clients.map(client => {
                const channel = new MessageChannel();
                client.postMessage(message, [channel.port2]);
            }));
        }

        protected async createFetcher(originalRequest: Request): Promise<IFetcher> {
            let payload = null;
            const method = originalRequest.method.toUpperCase();
            if (method !== "GET" && method !== "HEAD") {
                if (originalRequest.headers.get("Content-type") === "application/json")
                    payload = await originalRequest.clone().json();
                else
                    payload = await originalRequest.text();
            }

            const fetcher: IFetcher = {
                request: originalRequest,
                payload: payload,
                fetch: async () => {
                    const fetchRquest = this.createRequest(fetcher.payload, originalRequest);
                    try {
                        fetcher.response = await fetch(fetchRquest);
                    }
                    catch (ex) {
                        await this.broadcast("Offline");
                        return;
                    }

                    return await fetcher.response.clone().json();
                }
            };

            return fetcher;
        }

        protected createRequest(data: any, request: Request): Request {
            if (data != null) {
                const method = request.method.toUpperCase();
                if (method === "GET" || method === "HEAD")
                    data = null;
                else if (typeof data === "object")
                    data = JSON.stringify(data);
            }

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
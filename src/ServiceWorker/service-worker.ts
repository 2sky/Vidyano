namespace Vidyano {
    // See issue: https://github.com/Microsoft/TypeScript/issues/14877
    const self_service_worker_global_scope = (self as unknown) as ServiceWorkerGlobalScope;

    export const version = "latest";
    const VIDYANO_RESOURCES_CACHE_NAME = `vidyano.resources.${version}`;
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
        private _resourceCacheName: string;
        private _lastConnectionState: boolean;
        protected readonly serviceUri: string;
        private _requests: ServiceWorkerRequest[];

        constructor(protected readonly name: string) {
            this._resourceCacheName = `${name}.resources`;
            this.serviceUri = location.href.split("service-worker.js")[0];

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

        get requests(): ServiceWorkerRequest[] {
            return this._requests || (this._requests = []);
        }

        private _log(message: string) {
            console.log("SW: " + message);
        }

        protected getPreloadFiles(): string[] {
            return [];
        }

        private async _onInstall(e: ExtendableEvent) {
            console.log("Installing Vidyano Web2 version " + version);
            const start = new Date().getTime();

            const processFiles = async (files: string[], cache: Cache) => {
                await Promise.all(files.map(async (url: string) => {
                    const request = new Request(url);
                    const response = await fetch(request);

                    this.cache(new Request(url), response, cache);
                }));
            };

            if (!await caches.has(VIDYANO_RESOURCES_CACHE_NAME))
                await processFiles([...vidyanoFiles.map(f => `${WEB2_BASE}${f}`)], await caches.open(VIDYANO_RESOURCES_CACHE_NAME));

            self.importScripts(
                `${WEB2_BASE}Libs/bignumber.js/bignumber.min.js`,
                `${WEB2_BASE}Libs/Vidyano/vidyano.common.js`,
                `${WEB2_BASE}Libs/idb/idb.js`);

            await processFiles(this.getPreloadFiles(), await caches.open(this._resourceCacheName));
            await this.onInstall();

            this._log(`Installed ServiceWorker. Time taken: ${(new Date().getTime() - start) / 1000}s.`);
        }

        protected async onInstall(): Promise<any> {
            return Promise.resolve();
        }

        private async _onActivate(e: ExtendableEvent) {
            await self_service_worker_global_scope.clients.claim();

            const oldCaches = (await caches.keys()).filter(cache => cache.startsWith("vidyano.resources.") && cache !== VIDYANO_RESOURCES_CACHE_NAME);
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

            let response: Response;
            try {
                // Try to match from Vidyano resource cache
                const vidyanoCache = await caches.open(VIDYANO_RESOURCES_CACHE_NAME);
                response = await vidyanoCache.match(e.request);
                if (response)
                    return response;

                // Handle Vidyano requests
                response = await this._onFetchVidyano(e);
                if (response)
                    return response;

                

                // Try to match from project resource cache
                const resourceCache = await caches.open(this._resourceCacheName);
                response = await resourceCache.match(e.request);
                if (response)
                    return response;

                const fetcher = await this.createFetcher(e.request);

                // Allow implementor to handle request
                response = await this.onFetch(fetcher);
                if (fetcher.response)
                    return fetcher.response;

                if (e.request.method !== "GET")
                    response = (await fetcher.fetch()).response;
                else {
                    // If mimetype can be resolved, try to fetch and cache the resource. If offline, attempt to return the previously cached verion.
                    if (!e.request.url.startsWith(this.serviceUri) || GetMimeType(e.request.url) !== "application/octet-stream") {
                        console.warn(`Could not get a precached response for ${e.request.url}`);

                        const result = await fetcher.fetch();
                        if (result) {
                            await this.cache(fetcher.request, fetcher.response, resourceCache);
                            return fetcher.response;
                        }

                        response = await resourceCache.match(fetcher.request);
                        if (response)
                            return response;
                    }
                    // Fallback to root document when a deeplink is fetched directly
                    else if (e.request.url.startsWith(this.serviceUri)) {
                        response = await resourceCache.match(this.serviceUri);
                        if (!response) {
                            response = await fetch(e.request);
                            await resourceCache.put(e.request, response);
                        }
                    }
                }
            }
            catch (ee) {
                console.error(ee);
            }

            return response ?? this.createOfflineResponse();
        }

        private async _onFetchVidyano(e: FetchEventInit): Promise<Response> {
            if (e.request.method === "GET") {
                if (e.request.url.endsWith("GetClientData?v=2")) {
                    const fetcher = await this.createFetcher(e.request);
                    let response = await fetcher.fetch();
                    if (!response)
                        response = await this.onGetClientData();
                    else
                        await this.onCacheClientData(response);

                    return this.createResponse(response);
                }
                else {
                    const vidyanoCache = await caches.open(VIDYANO_RESOURCES_CACHE_NAME);
                    const cacheResponse = await vidyanoCache.match(e.request);
                    if (cacheResponse)
                        return cacheResponse;
                }
            }
            else if (e.request.method === "POST") {
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

        protected async setConnectionState(online: boolean): Promise<void> {
            this.sendMessageToClients(`connection-${online ? "online" : "offline"}`);
        }

        async sendMessageToClients(message: string) {
            const clients = await self_service_worker_global_scope.clients.matchAll();
            await Promise.all(clients.map(client => {
                const channel = new MessageChannel();
                client.postMessage(message, [channel.port2]);
            }));
        }

        protected async createFetcher(originalRequest: Request): Promise<IFetcher> {
            const asJson: boolean = originalRequest.headers.get("Content-type") === "application/json";
            const method = originalRequest.method.toUpperCase();

            let payload = null;
            if (method !== "GET" && method !== "HEAD") {
                if (asJson)
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
                        await this.setConnectionState(true);
                    }
                    catch (ex) {
                        await this.setConnectionState(false);
                        return;
                    }

                    const response = await fetcher.response.clone();
                    return await (asJson ? response.json() : response.text());
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
                method: request.method,
                referrer: request.referrer,
                referrerPolicy: request.referrerPolicy
            });
        }

        protected createResponse(data: any, response?: Response): Response {
            let headers = response?.headers;
            if (typeof data === "object") {
                data = JSON.stringify(data);
                if (!headers) {
                    headers = new Headers({
                        "Content-Type": "application/json"
                    });
                }
            }

            return new Response(data, {
                headers: headers,
                status: response?.status ?? 200,
                statusText: response?.statusText
            });
        }

        protected createOfflineResponse(): Response {
            return new Response("<h1>Service Unavailable</h1>", {
                status: 503,
                statusText: "Service Unavailable",
                headers: new Headers({
                    "Content-Type": "text/html"
                })
            });
        }
    }
}
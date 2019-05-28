namespace Vidyano {
    "use strict";

    export let version = "latest";

    export class Service extends Vidyano.Common.Observable<Service> {
        private static _getMs = window.performance && window.performance.now ? () => window.performance.now() : () => new Date().getTime();
        private static _base64KeyStr: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        private static _token: string;
        private _lastAuthTokenUpdate: Date = new Date();
        private _isUsingDefaultCredentials: boolean;
        private _clientData: Service.ClientData;
        private _language: Language;
        private _languages: Language[];
        private _windowsAuthentication: boolean;
        private _providers: { [name: string]: Service.ProviderParameters };
        private _isSignedIn: boolean;
        private _application: Application;
        private _userName: string;
        private _authToken: string;
        private _profile: boolean;
        private _profiledRequests: Service.ProfilerRequest[];
        private _queuedClientOperations: ClientOperations.IClientOperation[] = [];
        private _initial: Vidyano.PersistentObject;
        staySignedIn: boolean;
        icons: linqjs.Dictionary<string, string>;
        actionDefinitions: linqjs.Dictionary<string, ActionDefinition>;
        environment: string = "Web";
        environmentVersion: string = "2";

        constructor(public serviceUri: string, public hooks: ServiceHooks = new ServiceHooks(), public readonly isTransient: boolean = false) {
            super();

            (<any>this.hooks)._service = this;

            if (!isTransient)
                this.staySignedIn = cookie("staySignedIn", { force: true }) === "true";
        }

        static set token(token: string) {
            Service._token = token;
        }

        private _createUri(method: string) {
            let uri = this.serviceUri;
            if (!StringEx.isNullOrEmpty(uri) && !uri.endsWith("/"))
                uri += "/";
            return uri + method;
        }

        private _createData(method: string, data?: any) {
            data = data || {};

            data.clientVersion = version;
            data.environment = this.environment;
            data.environmentVersion = this.environmentVersion;

            if (method !== "getApplication") {
                data.userName = this.userName;
                if (data.userName !== this.defaultUserName)
                    data.authToken = this.authToken;
            }

            const requestedLanguage = this.requestedLanguage;
            if (requestedLanguage != null)
                data.requestedLanguage = requestedLanguage;

            if (this.application && this.application.session)
                data.session = this.application.session.toServiceObject(true);

            if (this.profile)
                data.profile = true;

            this.hooks.createData(data);

            return data;
        }

        private _getMs(): number {
            return Service._getMs();
        }

        postJSON(method: string, data: any): Promise<any> {
            return this._postJSON(this._createUri(method), data);
        }

        private _postJSON(url: string, data: any): Promise<any> {
            const createdRequest = new Date();
            if (this.profile) {
                /* tslint:disable:no-var-keyword */
                var requestStart = this._getMs();
                var requestMethod = url.split("/").pop();
                /* tslint:enable:no-var-keyword */
            }

            return new Promise((resolve, reject) => {
                const r = new XMLHttpRequest();
                r.open("POST", url, true);
                r.overrideMimeType("application/json; charset=utf-8");
                r.setRequestHeader("Content-type", "application/json");
                r.onload = async () => {
                    if (r.status !== 200) {
                        if (r.status === 429) {
                            setTimeout(() => {
                                this._postJSON(url, data).then(result => resolve(result), err => reject(err));
                            }, parseInt(r.getResponseHeader("retry-after") || "5") * 1000 + 1000);
                            return;
                        }

                        reject(`${r.statusText} (${r.status})`);
                        return;
                    }

                    const result = JSON.parse(r.responseText);
                    if (result.exception == null)
                        result.exception = result.ExceptionMessage;

                    if (result.exception == null) {
                        if (createdRequest > this._lastAuthTokenUpdate) {
                            this.authToken = result.authToken;
                            this._lastAuthTokenUpdate = createdRequest;
                        }

                        if (this.application)
                            this.application._updateSession(result.session);

                        resolve(result);
                    } else if (result.exception === "Session expired") {
                        this.authToken = null;
                        delete data.authToken;

                        if (this.defaultUserName && this.defaultUserName === this.userName) {
                            delete data.password;
                            this._postJSON(url, data).then(resolve, reject);
                        } else if (!await this.hooks.onSessionExpired())
                            reject(result.exception);
                        else if (this.defaultUserName) {
                            delete data.password;
                            data.userName = this.defaultUserName;
                            this._postJSON(url, data).then(resolve, reject);
                        }
                        else
                            reject(result.exception);

                        return;
                    }
                    else
                        reject(result.exception);

                    this._postJSONProcess(data, result, requestMethod, createdRequest, requestStart, result.profiler ? r.getResponseHeader("X-ElapsedMilliseconds") : undefined);
                };
                r.onerror = () => {
                    if (r.status === 0) {
                        const noInternet = NoInternetMessage.messages.get(navigator.language.split("-")[0].toLowerCase()) || NoInternetMessage.messages.get("en");
                        if (url.endsWith("GetClientData?v=2"))
                            reject(noInternet);
                        else
                            reject(noInternet.message);
                    }
                    else
                        reject(r.statusText);
                };

                r.send(JSON.stringify(data));
            });
        }

        private _postJSONProcess(data: any, result: any, requestMethod: string, createdRequest: Date, requestStart: number, elapsedMs: string) {
            let finishProfile = this.profile;
            switch (requestMethod) {
                case "GetPersistentObject":
                    finishProfile = finishProfile && result.result && result.result.id !== "b15730ad-9f47-4775-aacb-0a181e95e53d" && !result.result.isSystem;
                    break;

                case "GetQuery":
                    finishProfile = finishProfile && result.query && !result.query.isSystem;
                    break;

                case "ExecuteQuery":
                    finishProfile = finishProfile && data.query && !data.query.isSystem;
                    break;

                case "ExecuteAction":
                    finishProfile = finishProfile && !((result.result != null && (result.result.id === "b15730ad-9f47-4775-aacb-0a181e95e53d" || result.result.isSystem) || (data.query != null && data.query.isSystem) || (data.parent != null && data.parent.isSystem && data.parent.id !== "70381ffa-ae0b-4dc0-b4c3-b02dd9a9c0a0")));
                    break;
            }

            if (finishProfile) {
                const requestEnd = this._getMs();

                if (!result.profiler) {
                    result.profiler = { elapsedMilliseconds: -1 };
                    if (result.exception)
                        result.profiler.exceptions = [result.exception];
                }

                if (elapsedMs)
                    result.profiler.elapsedMilliseconds = Service.fromServiceString(elapsedMs, "Int32");

                const request: Service.ProfilerRequest = {
                    when: createdRequest,
                    profiler: result.profiler,
                    transport: Math.round(requestEnd - requestStart - result.profiler.elapsedMilliseconds),
                    method: requestMethod,
                    request: data,
                    response: result
                };

                const requests = this.profiledRequests || [];
                requests.unshift(request);

                this._setProfiledRequests(requests.slice(0, 20));
            }

            if (result.operations) {
                this._queuedClientOperations.push(...result.operations);
                result.operations = null;
            }

            if (this._queuedClientOperations.length > 0) {
                setTimeout(() => {
                    let operation: ClientOperations.IClientOperation;
                    while (operation = this._queuedClientOperations.splice(0, 1)[0])
                        this.hooks.onClientOperation(operation);
                }, 0);
            }
        }

        private _getJSON(url: string, headers?: any): Promise<any> {
            return new Promise((resolve, reject) => {
                const r = new XMLHttpRequest();

                r.open("GET", url, true);

                if (headers) {
                    for (const key in headers)
                        r.setRequestHeader(key, headers[key]);
                }

                r.onload = () => {
                    if (r.status !== 200) {
                        reject(r.statusText);
                        return;
                    }

                    resolve(JSON.parse(r.responseText));
                };
                r.onerror = () => { reject(r.statusText || (Vidyano.NoInternetMessage.messages.get(navigator.language.split("-")[0].toLowerCase()) || Vidyano.NoInternetMessage.messages.get("en")).message); };

                r.send();
            });
        }

        private static _decodeBase64(input: string): string {
            let output = "";
            let chr1, chr2, chr3;
            let enc1, enc2, enc3, enc4;
            let i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            const base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                throw "There were invalid base64 characters in the input text.";
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc2 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc3 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc4 = Service._base64KeyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }
            } while (i < input.length);

            return decodeURIComponent(output);
        }

        private static _getServiceTimeString = function (timeString: string, defaultValue: string) {
            if (!StringEx.isNullOrWhiteSpace(timeString)) {
                timeString = timeString.trim();

                // 00:00.0000000
                let ms = "0000000";
                const parts = timeString.split(".");
                if (parts.length === 2) {
                    ms = parts[1];
                    timeString = parts[0];
                }
                else if (parts.length !== 1)
                    return defaultValue;

                const length = timeString.length;
                if (length >= 4) {
                    const values = timeString.split(":"), valuesLen = values.length;
                    let days = 0, hours, minutes, seconds = 0;

                    if ((length === 4 || length === 5) && valuesLen === 2) {
                        // [0]0:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                    }
                    else if ((length === 7 || length === 8) && valuesLen === 3) {
                        // [0]0:00:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                        seconds = parseInt(values[2], 10);
                    }
                    else if (length >= 10 && valuesLen === 4) {
                        // 0:00:00:00
                        days = parseInt(values[0], 10);
                        hours = parseInt(values[1], 10);
                        minutes = parseInt(values[2], 10);
                        seconds = parseInt(values[3], 10);
                    }
                    else
                        return defaultValue;

                    if (!isNaN(days) && !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds) && days >= 0 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59)
                        return StringEx.format("{0}:{1:d2}:{2:d2}:{3:d2}.{4}", days, hours, minutes, seconds, ms.padRight(7, "0"));
                }
            }

            return defaultValue;
        };

        _getStream(obj: PersistentObject, action?: string, parent?: PersistentObject, query?: Query, selectedItems?: Array<QueryResultItem>, parameters?: any) {
            const data = this._createData("getStream");
            data.action = action;
            if (obj != null)
                data.id = obj.objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();
            if (query != null)
                data.query = query._toServiceObject();
            if (selectedItems != null)
                data.selectedItems = selectedItems.map(si => si._toServiceObject());
            if (parameters != null)
                data.parameters = parameters;

            const name = "iframe-vidyano-download";
            let iframe = <HTMLIFrameElement>document.querySelector("iframe[name='" + name + "']");
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.src = "javascript:false;";
                iframe.name = name;
                iframe.style.position = "absolute";
                iframe.style.top = "-1000px";
                iframe.style.left = "-1000px";

                document.body.appendChild(iframe);
            }

            const form = document.createElement("form");
            form.enctype = "multipart/form-data";
            form.encoding = "multipart/form-data";
            form.method = "post";
            form.action = this._createUri("GetStream");
            form.target = name;

            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "data";
            input.value = JSON.stringify(data);

            form.appendChild(input);
            document.body.appendChild(form);

            form.submit();
            document.body.removeChild(form);
        }

        get queuedClientOperations(): ClientOperations.IClientOperation[] {
            return this._queuedClientOperations;
        }

        get application(): Application {
            return this._application;
        }

        private _setApplication(application: Application) {
            if (this._application === application)
                return;

            const oldApplication = this._application;
            this.notifyPropertyChanged("application", this._application = application, oldApplication);

            if (this._application && this._application.canProfile)
                this.profile = !!BooleanEx.parse(Vidyano.cookie("profile"));
            else
                this.profile = false;
        }

        get language(): Language {
            return this._language;
        }

        set language(l: Language) {
            if (this._language === l)
                return;

            const oldLanguage = this._language;
            this.notifyPropertyChanged("language", this._language = l, oldLanguage);
        }

        get requestedLanguage(): string {
            return Vidyano.cookie("requestedLanguage");
        }

        set requestedLanguage(val: string) {
            if (this.requestedLanguage === val)
                return;

            Vidyano.cookie("requestedLanguage", val);
        }

        get isSignedIn(): boolean {
            return this._isSignedIn;
        }

        private _setIsSignedIn(val: boolean) {
            const oldIsSignedIn = this._isSignedIn;
            this._isSignedIn = val;

            this._setIsUsingDefaultCredentials(this.defaultUserName && this.userName && this.defaultUserName.toLowerCase() === this.userName.toLowerCase());

            if (val !== oldIsSignedIn)
                this.notifyPropertyChanged("isSignedIn", this._isSignedIn, oldIsSignedIn);
        }

        get languages(): Language[] {
            return this._languages;
        }

        get windowsAuthentication(): boolean {
            return this._windowsAuthentication;
        }

        get providers(): { [name: string]: Service.ProviderParameters } {
            return this._providers;
        }

        get isUsingDefaultCredentials(): boolean {
            return this._isUsingDefaultCredentials;
        }

        private _setIsUsingDefaultCredentials(val: boolean) {
            const oldIsUsingDefaultCredentials = this._isUsingDefaultCredentials;
            this.notifyPropertyChanged("isUsingDefaultCredentials", this._isUsingDefaultCredentials = val, oldIsUsingDefaultCredentials);
        }

        get userName(): string {
            return !this.isTransient ? Vidyano.cookie("userName") : this._userName;
        }

        private _setUserName(val: string) {
            const oldUserName = this.userName;
            if (oldUserName === val)
                return;

            if (!this.isTransient)
                Vidyano.cookie("userName", val, { expires: this.staySignedIn ? 365 : 30 });
            else
                this._userName = val;

            this.notifyPropertyChanged("userName", val, oldUserName);
        }

        get defaultUserName(): string {
            return !!this._clientData ? this._clientData.defaultUser || null : null;
        }

        get registerUserName(): string {
            return !!this._providers && this._providers["Vidyano"] ? this._providers["Vidyano"].registerUser || null : null;
        }

        get authToken(): string {
            return !this.isTransient ? Vidyano.cookie("authToken") : this._authToken;
        }

        set authToken(val: string) {
            if (!this.isTransient) {
                const oldAuthToken = this.authToken;

                if (this.staySignedIn)
                    Vidyano.cookie("authToken", val, { expires: 14 });
                else
                    Vidyano.cookie("authToken", val);

                if (!oldAuthToken && val) {
                    localStorage.setItem("vi-setAuthToken", JSON.stringify({ cookiePrefix: Vidyano.cookiePrefix, authToken: val }));
                    localStorage.removeItem("vi-setAuthToken");
                }
            }
            else
                this._authToken = val;
        }

        get profile(): boolean {
            return this._profile;
        }

        set profile(val: boolean) {
            if (this._profile === val)
                return;

            const currentProfileCookie = !!BooleanEx.parse(Vidyano.cookie("profile"));
            if (currentProfileCookie !== val)
                Vidyano.cookie("profile", String(val));

            const oldValue = this._profile;
            this._profile = val;

            if (!val)
                this._setProfiledRequests([]);

            this.notifyPropertyChanged("profile", val, oldValue);
        }

        get profiledRequests(): Service.ProfilerRequest[] {
            return this._profiledRequests;
        }

        private _setProfiledRequests(requests: Service.ProfilerRequest[]) {
            this.notifyPropertyChanged("profiledRequests", this._profiledRequests = requests);
        }

        getTranslatedMessage(key: string, ...params: string[]): string {
            return StringEx.format.apply(null, [this.language.messages[key] || key].concat(params));
        }

        async initialize(skipDefaultCredentialLogin: boolean = false): Promise<Application> {
            if (ServiceWorker.Monitor.available)
                await ServiceWorker.Monitor.activation;

            let url = "GetClientData?v=2";
            if (this.requestedLanguage)
                url = `${url}&lang=${this.requestedLanguage}`;

            this._clientData = await this.hooks.onInitialize(await (this._getJSON(this._createUri(url))));

            if (this._clientData.exception)
                throw this._clientData.exception;

            const languages = Object.keys(this._clientData.languages).map(culture => new Language(this._clientData.languages[culture], culture));
            this.hooks.setDefaultTranslations(languages);

            this._languages = languages;
            this.language = this._languages.find(l => l.isDefault) || this.languages[0];

            this._providers = {};
            for (const provider in this._clientData.providers) {
                this._providers[provider] = this._clientData.providers[provider].parameters;
            }
            this._windowsAuthentication = this._clientData.windowsAuthentication;

            if (Service._token) {
                const tokenParts = Service._token.split("/", 2);
                Service._token = undefined;

                this._setUserName(Service._decodeBase64(tokenParts[0]));
                this.authToken = tokenParts[1].replace("_", "/");

                const returnUrl = Vidyano.cookie("returnUrl", { force: true }) || "";
                if (returnUrl)
                    Vidyano.cookie("returnUrl", null, { force: true });

                this.hooks.onNavigate(returnUrl, true);

                return this._getApplication();
            }

            this._setUserName(this.userName || this._clientData.defaultUser);

            let application: Application;
            if (!StringEx.isNullOrEmpty(this.authToken) || ((this._clientData.defaultUser || this.windowsAuthentication) && !skipDefaultCredentialLogin)) {
                try {
                    application = await this._getApplication();
                }
                catch (e) {
                    application = null;
                }
            }
            else
                this._setIsSignedIn(!!this.application);

            return application;
        }

        signInExternal(providerName: string) {
            if (!this.providers[providerName] || !this.providers[providerName].requestUri)
                throw "Provider not found or not flagged for external authentication.";

            document.location.href = this.providers[providerName].requestUri;
        }

        async signInUsingCredentials(userName: string, password: string, staySignedIn?: boolean): Promise<Application>;
        async signInUsingCredentials(userName: string, password: string, code?: string, staySignedIn?: boolean): Promise<Application>;
        async signInUsingCredentials(userName: string, password: string, codeOrStaySignedIn?: string | boolean, staySignedIn?: boolean): Promise<Application> {
            this._setUserName(userName);

            const data = this._createData("getApplication");
            data.userName = userName;
            data.password = password;

            if (typeof codeOrStaySignedIn === "string")
                data.code = codeOrStaySignedIn;

            try {
                const application = await this._getApplication(data);
                if (application && this.isSignedIn && !this.isTransient) {
                    const ssi = (typeof codeOrStaySignedIn === "boolean" && codeOrStaySignedIn) || (typeof staySignedIn === "boolean" && staySignedIn);
                    Vidyano.cookie("staySignedIn", (this.staySignedIn = ssi) ? "true" : null, { force: true, expires: 365 });
                }

                return application;
            }
            catch (e) {
                throw e;
            }
        }

        signInUsingDefaultCredentials(): Promise<Application> {
            this._setUserName(this.defaultUserName);

            return this._getApplication();
        }

        signOut(skipAcs?: boolean): Promise<boolean> {
            if (this.userName === this.defaultUserName || this.userName === this.registerUserName)
                this._setUserName(null);

            this.authToken = null;
            this._setApplication(null);

            if (!skipAcs && this._providers["Acs"] && this._providers["Acs"].signOutUri) {
                return new Promise(resolve => {
                    const iframe = document.createElement("iframe");
                    iframe.setAttribute("hidden", "");
                    iframe.width = "0";
                    iframe.height = "0";
                    iframe.src = this._providers["Acs"].signOutUri;
                    iframe.onload = () => {
                        document.body.removeChild(iframe);
                        this._setIsSignedIn(false);

                        resolve(true);
                    };
                    iframe.onerror = () => {
                        this._setIsSignedIn(false);
                        resolve(true);
                    };

                    document.body.appendChild(iframe);
                });
            }

            this._setIsSignedIn(false);
            return Promise.resolve(true);
        }

        private async _getApplication(data: any = this._createData("")): Promise<Application> {
            if (!(data.authToken || data.accessToken || data.password) && this.userName && this.userName !== this.defaultUserName && this.userName !== this.registerUserName) {
                if (this.defaultUserName)
                    this._setUserName(this.defaultUserName);

                if (!this.userName && !this.hooks.onSessionExpired())
                    throw "Session expired";

                data.userName = this.userName;
            }

            const result = await this._postJSON(this._createUri("GetApplication"), data);

            if (!StringEx.isNullOrEmpty(result.exception))
                throw result.exception;

            if (result.application == null)
                throw "Unknown error";

            this._setApplication(this.hooks.onConstructApplication(result));

            const resourcesQuery = this.application.getQuery("Resources");
            if (resourcesQuery)
                this.icons = Enumerable.from(resourcesQuery.items).where((i => i.getValue("Type") === "Icon")).toDictionary(i => <string>i.getValue("Key"), i => <string>i.getValue("Data"));
            else
                this.icons = Enumerable.empty<string>().toDictionary(i => i, i => i);

            this.actionDefinitions = Enumerable.from(this.application.getQuery("Actions").items).toDictionary(i => <string>i.getValue("Name"), i => new ActionDefinition(this, i));

            this.language = Enumerable.from(this._languages).firstOrDefault(l => l.culture === result.userLanguage) || Enumerable.from(this._languages).firstOrDefault(l => l.isDefault);

            const clientMessagesQuery = this.application.getQuery("ClientMessages");
            if (clientMessagesQuery) {
                const newMessages = { ...this.language.messages };
                clientMessagesQuery.items.forEach(msg => newMessages[msg.getValue("Key")] = msg.getValue("Value"));

                this.notifyPropertyChanged("language.messages", this.language.messages = newMessages, this.language.messages);
            }

            this.actionDefinitions.toEnumerable().forEach(kvp => this.language.messages[`Action_${kvp.key}`] = kvp.value.displayName);

            CultureInfo.currentCulture = CultureInfo.cultures[result.userCultureInfo] || CultureInfo.cultures[result.userLanguage] || CultureInfo.invariantCulture;

            if (result.initial != null)
                this._initial = this.hooks.onConstructPersistentObject(this, result.initial);

            if (result.userName !== this.registerUserName || result.userName === this.defaultUserName) {
                this._setUserName(result.userName);

                if (result.session)
                    this.application._updateSession(result.session);

                this._setIsSignedIn(true);
            }
            else
                this._setIsSignedIn(false);

            return this.application;
        }

        async getQuery(id: string, asLookup?: boolean): Promise<Query> {
            const data = this._createData("getQuery");
            data.id = id;

            const result = await this._postJSON(this._createUri("GetQuery"), data);
            if (result.exception)
                throw result.exception;

            return this.hooks.onConstructQuery(this, result.query, null, asLookup);
        }

        async getPersistentObject(parent: PersistentObject, id: string, objectId?: string, isNew?: boolean): Promise<PersistentObject> {
            const data = this._createData("getPersistentObject");
            data.persistentObjectTypeId = id;
            data.objectId = objectId;
            if (isNew)
                data.isNew = isNew;
            if (parent != null)
                data.parent = parent.toServiceObject();

            const result = await this._postJSON(this._createUri("GetPersistentObject"), data);
            if (result.exception)
                throw result.exception;
            else if (result.result && result.result.notification) {
                if (result.result.notificationDuration) {
                    this.hooks.onShowNotification(result.result.notification, result.result.notificationType, result.result.notificationDuration);
                    result.result.notification = null;
                    result.result.notificationDuration = 0;
                }
                else if (result.result.notificationType === "Error")
                    throw result.result.notification;
            }

            return this.hooks.onConstructPersistentObject(this, result.result);
        }

        async executeQuery(parent: PersistentObject, query: Query, asLookup: boolean = false, throwExceptions?: boolean): Promise<Service.QueryResult> {
            const data = this._createData("executeQuery");
            data.query = query._toServiceObject();

            if (parent != null)
                data.parent = parent.toServiceObject();
            if (asLookup)
                data.asLookup = asLookup;

            try {
                const result = await this._postJSON(this._createUri("ExecuteQuery"), data);
                if (result.exception)
                    throw result.exception;

                const queryResult = <Service.QueryResult>result.result;
                if (queryResult.continuation) {
                    const wanted = <number>data.query.top || queryResult.pageSize;

                    while (queryResult.continuation && queryResult.items.length < wanted) {
                        data.query.continuation = queryResult.continuation;
                        data.query.top = wanted - queryResult.items.length;

                        const innerResult = await this._postJSON(this._createUri("ExecuteQuery"), data);
                        if (innerResult.exception)
                            throw innerResult.exception;

                        const innerQueryResult = <Service.QueryResult>innerResult.result;
                        queryResult.items.push(...innerQueryResult.items);
                        queryResult.continuation = innerQueryResult.continuation;
                    }

                    if (!queryResult.continuation)
                        queryResult.totalItems = query.items.length + queryResult.items.length;
                }

                return queryResult;
            }
            catch (e) {
                query.setNotification(e);

                if (throwExceptions)
                    throw e;
            }
        }

        async executeAction(action: string, parent: PersistentObject, query: Query, selectedItems: Array<QueryResultItem>, parameters?: any, skipHooks: boolean = false): Promise<PersistentObject> {
            const isObjectAction = action.startsWith("PersistentObject.") || query == null;

            if (!skipHooks) {
                if (!isObjectAction) {
                    query.setNotification();
                    if (query.selectAll.allSelected && !query.selectAll.inverse)
                        selectedItems = [];
                }
                else if (parent)
                    parent.setNotification();

                this.hooks.trackEvent(action, parameters ? parameters.MenuLabel || parameters.MenuOption : null, query || parent);

                const args = new ExecuteActionArgs(this, action, parent, query, selectedItems, parameters);
                try {
                    await this.hooks.onAction(args);
                    if (args.isHandled)
                        return args.result;

                    return await this.executeAction(action, parent, query, selectedItems, args.parameters, true);
                }
                catch (e) {
                    if (isObjectAction)
                        parent.setNotification(e);
                    else
                        query.setNotification(e);

                    throw e;
                }
            }

            const isFreezingAction = isObjectAction && action !== "PersistentObject.Refresh";
            const data = this._createData("executeAction");
            data.action = action;
            if (parent != null)
                data.parent = parent.toServiceObject();
            if (query != null)
                data.query = query._toServiceObject();
            if (selectedItems != null)
                data.selectedItems = selectedItems.map(item => item && item._toServiceObject());
            if (parameters != null)
                data.parameters = parameters;

            try {
                if (isFreezingAction)
                    parent.freeze();

                const executeThen: (QueryResultItem: any) => Promise<Vidyano.PersistentObject> = async result => {
                    if (result.operations) {
                        this._queuedClientOperations.push(...result.operations);
                        result.operations = null;
                    }

                    if (!result.retry)
                        return result.result ? await this.hooks.onConstructPersistentObject(this, result.result) : null;

                    if (result.retry.persistentObject)
                        result.retry.persistentObject = this.hooks.onConstructPersistentObject(this, result.retry.persistentObject);

                    const option = await this.hooks.onRetryAction(result.retry);
                    (data.parameters || (data.parameters = {})).RetryActionOption = option;

                    if (result.retry.persistentObject instanceof Vidyano.PersistentObject)
                        data.retryPersistentObject = result.retry.persistentObject.toServiceObject();

                    const retryResult = await this._postJSON(this._createUri("ExecuteAction"), data);
                    return await executeThen(retryResult);
                };

                if (parent == null) {
                    const result = await this._postJSON(this._createUri("ExecuteAction"), data);
                    return await executeThen(result);
                }

                const inputs = parent.getRegisteredInputs();
                if (inputs.count() === 0 || !inputs.select(i => parent.getAttribute(i.key)).toArray().some(a => a.isValueChanged)) {
                    const result = await this._postJSON(this._createUri("ExecuteAction"), data);
                    return await executeThen(result);
                }

                const origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
                if (this.serviceUri.startsWith("http") && !this.serviceUri.startsWith(origin) + "/") {
                    data.parent = parent.toServiceObject();

                    const inputsEnum = inputs.getEnumerator();
                    while (inputsEnum.moveNext()) {
                        const input = inputsEnum.current().value;
                        const attribute = Enumerable.from(data.parent.attributes).first(a => a.name === inputsEnum.current().key);

                        await new Promise((resolve, reject) => {
                            const file = input.files[0];
                            if (!file) {
                                resolve(true);
                                return;
                            }

                            const reader = new FileReader();

                            reader.onload = event => {
                                const fileName = attribute.value;
                                attribute.value = (<any>event.target).result.match(/,(.*)$/)[1];
                                if (attribute.type === "BinaryFile")
                                    attribute.value = fileName + "|" + attribute.value;

                                resolve(true);
                            };
                            reader.onerror = function (e) {
                                reject(e);
                            };

                            reader.readAsDataURL(file);
                        });
                    }

                    const result = await this._postJSON(this._createUri("ExecuteAction"), data);
                    return await executeThen(result);
                }

                const iframeName = "iframe-" + new Date();
                const iframe = document.createElement("iframe");
                iframe.src = "javascript:false;";
                iframe.name = iframeName;
                iframe.style.position = "absolute";
                iframe.style.top = "-1000px";
                iframe.style.left = "-1000px";

                const clonedForm = document.createElement("form");
                clonedForm.enctype = "multipart/form-data";
                clonedForm.encoding = "multipart/form-data";
                clonedForm.method = "post";
                clonedForm.action = this._createUri("ExecuteAction");
                clonedForm.target = iframeName;

                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "data";
                input.value = JSON.stringify(data);

                clonedForm.appendChild(input);
                clonedForm.style.display = "none";

                inputs.where(item => item.value.value !== "").forEach(function (item) {
                    const input = item.value;
                    input.name = item.key;
                    const replacement = document.createElement("input");
                    replacement.type = "file";
                    input.insertAdjacentElement("afterend", replacement);
                    (<any>input).replacement = replacement;
                    clonedForm.appendChild(input);
                });

                const createdRequest = new Date();
                if (this.profile)
                    /* tslint:disable:no-var-keyword */ var requestStart = this._getMs(); /* tslint:enable:no-var-keyword*/

                const service = this;
                const result = await new Promise((resolve, reject) => {
                    // NOTE: The first load event gets fired after the iframe has been injected into the DOM, and is used to prepare the actual submission.
                    iframe.onload = function (e: Event) {
                        // NOTE: The second load event gets fired when the response to the form submission is received. The implementation detects whether the actual payload is embedded in a <textarea> element, and prepares the required conversions to be made in that case.
                        iframe.onload = function (e: Event) {
                            const frame = <HTMLIFrameElement>this;
                            const doc = frame.contentDocument || frame.contentWindow.document,
                                root = doc.documentElement ? doc.documentElement : doc.body,
                                textarea = root.getElementsByTagName("textarea")[0],
                                type = textarea ? textarea.getAttribute("data-type") : null,
                                content = {
                                    html: root.innerHTML,
                                    text: type ?
                                        textarea.value :
                                        root ? (root.textContent || root.innerText) : null
                                };

                            const result = JSON.parse(content.text);
                            service._postJSONProcess(data, result, "ExecuteAction", createdRequest, requestStart, (service._getMs() - requestStart).toString());

                            resolve(result);
                        };

                        Array.prototype.forEach.call(clonedForm.querySelectorAll("input"), (input: HTMLInputElement) => { input.disabled = false; });
                        clonedForm.submit();
                    };

                    document.body.appendChild(clonedForm);
                    document.body.appendChild(iframe);
                });

                document.body.removeChild(clonedForm);
                document.body.removeChild(iframe);

                parent.clearRegisteredInputs();
                inputs.forEach(item => {
                    const replacement: HTMLInputElement = (<any>item.value).replacement;
                    if (replacement != null) {
                        const tempParent = document.createElement("div");
                        tempParent.innerHTML = item.value.outerHTML;
                        const newInput = <HTMLInputElement>tempParent.querySelector("input");
                        replacement.parentNode.replaceChild(newInput, replacement);
                        parent.registerInput(item.key, newInput);
                    }
                    else
                        parent.registerInput(item.key, item.value);
                });

                return await executeThen(result);
            }
            catch (e) {
                if (isObjectAction)
                    parent.setNotification(e);
                else
                    query.setNotification(e);

                throw e;
            }
            finally {
                if (isFreezingAction)
                    parent.unfreeze();
            }
        }

        async getReport(token: string, { filter = "", orderBy, top, skip, hideIds, hideType = true }: IReportOptions = {}): Promise<any[]> {
            let uri = this._createUri(`GetReport/${token}?format=json&$filter=${encodeURIComponent(filter)}`);

            if (orderBy)
                uri = `${uri}&$orderBy=${orderBy}`;
            if (top)
                uri = `${uri}&$top=${top}`;
            if (skip)
                uri = `${uri}&$skip=${skip}`;
            if (hideIds)
                uri = `${uri}&hideIds=true`;
            if (hideType)
                uri = `${uri}&hideType=true`;

            const data = await this._getJSON(uri);
            return data.d;
        }

        async getInstantSearch(search: string): Promise<IInstantSearchResult[]> {
            const uri = this._createUri(`Instant?q=${encodeURIComponent(search)}`);
            const userName = encodeURIComponent(this.userName);
            const authToken = this.authToken ? this.authToken.replace("/", "_") : "";

            const data = await this._getJSON(uri, {
                "Authorization": `Bearer ${userName}/${authToken}`
            });

            return data.d;
        }

        forgotPassword(userName: string): Promise<IForgotPassword> {
            return this._postJSON(this._createUri("forgotpassword"), { userName: userName });
        }

        static fromServiceString(value: string, typeName: string): any {
            return DataType.fromServiceString(value, typeName);
        }

        static toServiceString(value: any, typeName: string): string {
            return DataType.toServiceString(value, typeName);
        }
    }

    export type NotificationType = Service.NotificationType;

    export interface IForgotPassword {
        notification: string;
        notificationType: NotificationType;
        notificationDuration: number;
    }

    export interface IReportOptions {
        filter?: string;
        orderBy?: string;
        top?: number;
        skip?: number;
        hideIds?: boolean;
        hideType?: boolean;
    }

    export interface IInstantSearchResult {
        id: string;
        label: string;
        objectId: string;
        breadcrumb: string;
    }
}
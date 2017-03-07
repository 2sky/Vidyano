﻿namespace Vidyano {
    "use strict";

    export let version = "latest";

    export class Service extends Vidyano.Common.Observable<Service> {
        private static _getMs = window.performance && window.performance.now ? () => window.performance.now() : () => new Date().getTime();
        private static _base64KeyStr: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        private static _token: string;
        private _lastAuthTokenUpdate: Date = new Date();
        private _isUsingDefaultCredentials: boolean;
        private _clientData: any;
        private _language: ILanguage;
        private _languages: ILanguage[];
        private _windowsAuthentication: boolean;
        private _providers: { [name: string]: IProviderParameters };
        private _isSignedIn: boolean;
        private _application: Application;
        private _profile: boolean;
        private _profiledRequests: IServiceRequest[];
        private _queuedClientOperations: ClientOperations.IClientOperation[] = [];
        staySignedIn: boolean;
        icons: linqjs.Dictionary<string, string>;
        actionDefinitions: linqjs.Dictionary<string, ActionDefinition>;
        environment: string = "Web";
        environmentVersion: string = "2";

        constructor(public serviceUri: string, public hooks: ServiceHooks = new ServiceHooks(), private _forceUser?: string) {
            super();

            (<any>this.hooks)._service = this;
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
                r.onload = () => {
                    if (r.status !== 200) {
                        reject(r.statusText);
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
                        } else if (!this.hooks.onSessionExpired())
                            reject(result.exception);

                        return;
                    }
                    else
                        reject(result.exception);

                    this._postJSONProcess(data, result, requestMethod, createdRequest, requestStart, result.profiler ? r.getResponseHeader("X-ElapsedMilliseconds") : undefined);
                };
                r.onerror = () => { reject(r.statusText); };

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

                const request: IServiceRequest = {
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

        private _getJSON(url: string): Promise<any> {
            return new Promise((resolve, reject) => {
                const r = new XMLHttpRequest();
                r.open("GET", url, true);
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

        get language(): ILanguage {
            return this._language;
        }
        set language(l: ILanguage) {
            this._language = l;
        }

        get requestedLanguage(): string {
            return Vidyano.cookie("requestedLanguage");
        }

        set requestedLanguage(val: string) {
            Vidyano.cookie("requestedLanguage", val);
        }

        get isSignedIn(): boolean {
            return this._isSignedIn;
        }

        private _setIsSignedIn(val: boolean) {
            const oldIsSignedIn = this._isSignedIn;
            this._isSignedIn = val;

            this._setIsUsingDefaultCredentials(val && this.defaultUserName && this.userName && this.defaultUserName.toLowerCase() === this.userName.toLowerCase());

            if (val !== oldIsSignedIn)
                this.notifyPropertyChanged("isSignedIn", this._isSignedIn, oldIsSignedIn);
        }

        get languages(): ILanguage[] {
            return this._languages;
        }

        get windowsAuthentication(): boolean {
            return this._windowsAuthentication;
        }

        get providers(): { [name: string]: IProviderParameters } {
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
            return this._forceUser || Vidyano.cookie("userName");
        }

        private _setUserName(val: string) {
            const oldUserName = this.userName;
            if (oldUserName === val)
                return;

            if (this.staySignedIn)
                Vidyano.cookie("userName", val, { expires: 365 });
            else
                Vidyano.cookie("userName", val);

            this.notifyPropertyChanged("userName", val, oldUserName);
        }

        get defaultUserName(): string {
            return !!this._clientData ? this._clientData.defaultUser : null;
        }

        private get authToken(): string {
            if (this._forceUser)
                return null;

            return Vidyano.cookie("authToken");
        }

        private set authToken(val: string) {
            if (this._forceUser)
                return;

            if (this.staySignedIn)
                Vidyano.cookie("authToken", val, { expires: 14 });
            else
                Vidyano.cookie("authToken", val);
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

        get profiledRequests(): IServiceRequest[] {
            return this._profiledRequests;
        }

        private _setProfiledRequests(requests: IServiceRequest[]) {
            this.notifyPropertyChanged("profiledRequests", this._profiledRequests = requests);
        }

        getTranslatedMessage(key: string, ...params: string[]): string {
            return StringEx.format.apply(null, [this.language.messages[key] || key].concat(params));
        }

        async initialize(skipDefaultCredentialLogin: boolean = false): Promise<Application> {
            this._clientData = await this.hooks.onInitialize(await (this._getJSON(this._createUri("GetClientData?v=2"))));

            if (this._clientData.exception)
                throw this._clientData.exception;

            const languages: ILanguage[] = [];
            for (const name in this._clientData.languages) {
                languages.push({ culture: name, name: this._clientData.languages[name].name, isDefault: this._clientData.languages[name].isDefault, messages: this._clientData.languages[name].messages });
            }
            this._languages = languages;
            this.language = Enumerable.from(this._languages).firstOrDefault(l => l.isDefault) || this._languages[0];

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

            if (this._forceUser || !StringEx.isNullOrEmpty(this.authToken) || ((this._clientData.defaultUser || this.windowsAuthentication) && !skipDefaultCredentialLogin))
                return this._getApplication();
            else {
                this._setIsSignedIn(!!this.application);
                return this.application;
            }
        }

        signInExternal(providerName: string) {
            if (!this.providers[providerName] || !this.providers[providerName].requestUri)
                throw "Provider not found or not flagged for external authentication.";

            document.location.href = this.providers[providerName].requestUri;
        }

        signInUsingCredentials(userName: string, password: string, code?: string): Promise<Application> {
            this._setUserName(userName);

            const data = this._createData("getApplication");
            data.userName = userName;
            data.password = password;

            if (code)
                data.code = code;

            return this._getApplication(data);
        }

        signInUsingDefaultCredentials(): Promise<Application> {
            this._setUserName(this._clientData.defaultUser);

            return this._getApplication();
        }

        signOut(skipAcs?: boolean): Promise<boolean> {
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
            if (!(data.authToken || data.accessToken || data.password) && this.userName && this.userName !== this.defaultUserName) {
                this._setUserName(this.defaultUserName);
                if (!this.userName && !this.hooks.onSessionExpired())
                    throw "Session expired";

                data.userName = this.userName;
            }

            Vidyano.cookie("staySignedIn", this.staySignedIn ? "true" : null, { force: true, expires: 365 });

            try {
                const result = await this._postJSON(this._createUri("GetApplication"), data);

                if (!StringEx.isNullOrEmpty(result.exception))
                    throw result.exception;

                if (result.application == null)
                    throw "Unknown error";

                this._setApplication(new Application(this, result.application));

                const resourcesQuery = this.application.getQuery("Resources");
                if (resourcesQuery)
                    this.icons = Enumerable.from(resourcesQuery.items).where((i => i.getValue("Type") === "Icon")).toDictionary(i => <string>i.getValue("Key"), i => <string>i.getValue("Data"));
                else
                    this.icons = Enumerable.empty<string>().toDictionary(i => i, i => i);

                this.actionDefinitions = Enumerable.from(this.application.getQuery("Actions").items).toDictionary(i => <string>i.getValue("Name"), i => new ActionDefinition(this, i));

                this.language = Enumerable.from(this._languages).firstOrDefault(l => l.culture === result.userLanguage) || Enumerable.from(this._languages).firstOrDefault(l => l.isDefault);

                const clientMessagesQuery = this.application.getQuery("ClientMessages");
                if (clientMessagesQuery)
                    clientMessagesQuery.items.forEach(msg => this.language.messages[msg.getValue("Key")] = msg.getValue("Value"));

                this.actionDefinitions.toEnumerable().forEach(kvp => this.language.messages[`Action_${kvp.key}`] = kvp.value.displayName);

                CultureInfo.currentCulture = CultureInfo.cultures.get(result.userCultureInfo) || CultureInfo.cultures.get(result.userLanguage) || CultureInfo.invariantCulture;

                this._setUserName(result.userName);

                if (result.session)
                    this.application._updateSession(result.session);

                this._setIsSignedIn(true);

                return this.application;
            }
            catch (e) {
                this._setApplication(null);
                this._setIsSignedIn(false);

                throw e;
            }
        }

        async getQuery(id: string, asLookup?: boolean): Promise<Query> {
            const data = this._createData("getQuery");
            data.id = id;

            const result = await this._postJSON(this._createUri("GetQuery"), data);
            if (result.exception)
                throw result.exception;

            return this.hooks.onConstructQuery(this, result.query, null, asLookup);
        }

        async getPersistentObject(parent: PersistentObject, id: string, objectId?: string): Promise<PersistentObject> {
            const data = this._createData("getPersistentObject");
            data.persistentObjectTypeId = id;
            data.objectId = objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();

            const result = await this._postJSON(this._createUri("GetPersistentObject"), data);
            if (result.exception || (result.result && result.result.notification && result.result.notificationType === "Error"))
                throw result.exception || result.result.notification;

            return this.hooks.onConstructPersistentObject(this, result.result);
        }

        async executeQuery(parent: PersistentObject, query: Query, asLookup: boolean = false, throwExceptions?: boolean): Promise<any> {
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

                return result.result;
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
                if (inputs.count() === 0) {
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
                            const doc = this.contentDocument || this.contentWindow.document,
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

        static getDate = function (yearString: string, monthString: string, dayString: string, hourString: string, minuteString: string, secondString: string, msString: string) {
            const year = parseInt(yearString, 10);
            const month = parseInt(monthString || "1", 10) - 1;
            const day = parseInt(dayString || "1", 10);
            const hour = parseInt(hourString || "0", 10);
            const minutes = parseInt(minuteString || "0", 10);
            const seconds = parseInt(secondString || "0", 10);
            const ms = parseInt(msString || "0", 10);

            return new Date(year, month, day, hour, minutes, seconds, ms);
        };

        static fromServiceString(value: string, typeName: string): any {
            switch (typeName) {
                case "Decimal":
                case "Single":
                case "Double":
                case "Int64":
                case "UInt64":
                    if (StringEx.isNullOrEmpty(value))
                        return new BigNumber(0);

                    return new BigNumber(value);

                case "NullableDecimal":
                case "NullableSingle":
                case "NullableDouble":
                case "NullableInt64":
                case "NullableUInt64":
                    if (StringEx.isNullOrEmpty(value))
                        return null;

                    return new BigNumber(value);

                case "Int16":
                case "UInt16":
                case "Int32":
                case "UInt32":
                case "Byte":
                case "SByte":
                    if (StringEx.isNullOrEmpty(value))
                        return 0;

                    return parseInt(value, 10);

                case "NullableInt16":
                case "NullableInt32":
                case "NullableUInt16":
                case "NullableUInt32":
                case "NullableByte":
                case "NullableSByte":
                    if (StringEx.isNullOrEmpty(value))
                        return null;

                    return parseInt(value, 10);

                case "Date":
                case "NullableDate":
                case "DateTime":
                case "NullableDateTime":
                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    // Example format: 17-07-2003 00:00:00[.000] [+00:00]
                    if (!StringEx.isNullOrEmpty(value) && value.length >= 19) {
                        const parts = value.split(" ");
                        const date = parts[0].split("-");
                        const time = parts[1].split(":");
                        const dateTime = Service.getDate(date[2], date[1], date[0], time[0], time[1], time[2].substring(0, 2), time[2].length > 2 ? time[2].substr(3, 3) : null);
                        if (parts.length === 3) {
                            dateTime.netType("DateTimeOffset");
                            dateTime.netOffset(parts[2]);
                        }

                        return dateTime;
                    }

                    const now = new Date();
                    if (typeName === "Date") {
                        now.setHours(0, 0, 0, 0);
                        return now;
                    }
                    else if (typeName === "DateTime")
                        return now;
                    else if (typeName === "DateTimeOffset") {
                        now.netType("DateTimeOffset");
                        const zone = now.getTimezoneOffset() * -1;
                        const zoneHour = zone / 60;
                        const zoneMinutes = zone % 60;
                        now.netOffset(StringEx.format("{0}{1:D2}:{2:D2}", zone < 0 ? "-" : "+", zoneHour, zoneMinutes)); // +00:00
                        return now;
                    }

                    return null;

                case "Time":
                case "NullableTime":
                    return Service.toServiceString(value, typeName);

                case "Boolean":
                case "NullableBoolean":
                case "YesNo":
                    return value != null ? BooleanEx.parse(value) : null;

                default:
                    return value;
            }
        }

        static toServiceString(value: any, typeName: string): string {
            switch (typeName) {
                case "NullableDecimal":
                case "Decimal":
                case "NullableSingle":
                case "Single":
                case "NullableDouble":
                case "Double":
                case "NullableInt64":
                case "Int64":
                case "NullableUInt64":
                case "UInt64":
                case "NullableInt32":
                case "Int32":
                case "NullableUInt32":
                case "UInt32":
                case "NullableInt16":
                case "Int16":
                case "NullableUInt16":
                case "UInt16":
                case "NullableByte":
                case "Byte":
                case "NullableSByte":
                case "SByte":
                    if (StringEx.isNullOrEmpty(value) && !typeName.startsWith("Nullable"))
                        return "0";

                    break;

                case "Date":
                case "NullableDate":
                    if (!StringEx.isNullOrEmpty(value)) {
                        let date: Date = value;
                        if (typeof (date) === "string")
                            date = new Date(value);

                        return `${date.format("dd-MM-yyyy")} 00:00:00`;
                    }

                    break;

                case "DateTime":
                case "NullableDateTime":
                    if (!StringEx.isNullOrEmpty(value)) {
                        let date = value;
                        if (typeof (date) === "string")
                            date = new Date(value);

                        return date.format("dd-MM-yyyy HH:mm:ss.fff").trimEnd("0").trimEnd(".");
                    }

                    break;

                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    if (!StringEx.isNullOrEmpty(value)) {
                        let dateOffset = value;
                        if (typeof (value) === "string") {
                            if (value.length >= 23 && value.length <= 30) {
                                const dateParts = value.split(" ");

                                dateOffset = new Date(dateParts[0] + " " + dateParts[1]);
                                dateOffset.netOffset(dateParts[2]);
                                dateOffset.netType("DateTimeOffset");
                            }
                            else
                                return null;
                        }

                        return dateOffset.format("dd-MM-yyyy HH:mm:ss") + " " + (dateOffset.netOffset() || "+00:00");
                    }

                    break;

                case "Boolean":
                case "NullableBoolean":
                case "YesNo":
                    if (value == null)
                        return null;

                    if (typeof (value) === "string")
                        value = BooleanEx.parse(value);

                    return value ? "True" : "False";

                case "Time":
                    return Service._getServiceTimeString(value, "0:00:00:00.0000000");

                case "NullableTime":
                    return Service._getServiceTimeString(value, null);
            }

            return typeof (value) === "string" || value == null ? value : String(value);
        }

        static numericTypes = [
            "NullableDecimal",
            "Decimal",
            "NullableSingle",
            "Single",
            "NullableDouble",
            "Double",
            "NullableInt64",
            "Int64",
            "NullableUInt64",
            "UInt64",
            "NullableInt32",
            "Int32",
            "NullableUInt32",
            "UInt32",
            "NullableInt16",
            "Int16",
            "NullableUInt16",
            "UInt16",
            "NullableByte",
            "Byte",
            "NullableSByte",
            "SByte"
        ];

        static isNumericType(type: string): boolean {
            return Service.numericTypes.indexOf(type) >= 0;
        }

        static dateTimeTypes = [
            "NullableDate",
            "Date",
            "NullableTime",
            "Time",
            "NullableDateTime",
            "DateTime",
            "NullableDateTimeOffset",
            "DateTimeOffset"
        ];

        static isDateTimeType(type: string): boolean {
            return Service.dateTimeTypes.indexOf(type) >= 0;
        }
    }

    export enum NotificationType {
        Error,
        Notice,
        OK,
        Warning
    }

    export interface IProviderParameters {
        label: string;
        description: string;
        requestUri: string;
        signOutUri: string;
        redirectUri: string;
    }

    export interface ILanguage {
        culture: string;
        name: string;
        isDefault: boolean;
        messages: {
            [key: string]: string;
        };
    }

    export interface IReportOptions {
        filter?: string;
        orderBy?: string;
        top?: number;
        skip?: number;
        hideIds?: boolean;
        hideType?: boolean;
    }

    export interface IRetryAction {
        title: string;
        message: string;
        options: string[];
        persistentObject?: PersistentObject;
    }

    export interface IServiceClientData {
        defaultUser: string;
        exception: string;
        languages: { [code: string]: { name: string; isDefault: boolean; messages: { [key: string]: string; } } };
        providers: { [name: string]: { parameters: IProviderParameters } };
    }

    export interface IServiceRequest {
        when: Date;
        profiler: IServiceRequestProfiler;
        transport: number;
        method: string;
        request: any;
        response: any;
    }

    export interface IServiceRequestProfiler {
        taskId: number;
        elapsedMilliseconds: number;
        entries: IServiceRequestProfilerEntry[];
        sql: IServiceRequestProfilerSQL[];
        exceptions: {
            id: string;
            message: string;
        }[];
    }

    export interface IServiceRequestProfilerEntry {
        entries: IServiceRequestProfilerEntry[];
        methodName: string;
        sql: string[];
        started: number;
        elapsedMilliseconds: number;
        hasNPlusOne?: boolean;
        exception: string;
        arguments: any[];
    }

    export interface IServiceRequestProfilerSQL {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        recordsAffected: number;
        taskId: number;
        type: string;
        parameters: IServiceRequestProfilerSQLParameter[];
    }

    export interface IServiceRequestProfilerSQLParameter {
        name: string;
        type: string;
        value: string;
    }

    export interface IServiceClientData {
        defaultUser: string;
        exception: string;
        languages: { [code: string]: { name: string; isDefault: boolean; messages: { [key: string]: string; } } };
        providers: { [name: string]: { parameters: IProviderParameters } };
    }

    export interface IServiceRequest {
        when: Date;
        profiler: IServiceRequestProfiler;
        transport: number;
        method: string;
        request: any;
        response: any;
    }

    export interface IServiceRequestProfiler {
        taskId: number;
        elapsedMilliseconds: number;
        entries: IServiceRequestProfilerEntry[];
        sql: IServiceRequestProfilerSQL[];
        exceptions: {
            id: string;
            message: string;
        }[];
    }

    export interface IServiceRequestProfilerEntry {
        entries: IServiceRequestProfilerEntry[];
        methodName: string;
        sql: string[];
        started: number;
        elapsedMilliseconds: number;
        hasNPlusOne?: boolean;
        exception: string;
        arguments: any[];
    }

    export interface IServiceRequestProfilerSQL {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        recordsAffected: number;
        taskId: number;
        type: string;
        parameters: IServiceRequestProfilerSQLParameter[];
    }

    export interface IServiceRequestProfilerSQLParameter {
        name: string;
        type: string;
        value: string;
    }
}
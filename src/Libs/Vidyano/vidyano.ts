declare var unescape;
declare var Windows;

interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    entries(): Array<[T, T]>;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    keys(): Array<T>;
    size: number;
}

interface SetConstructor {
    new <T>(): Set<T>;
    prototype: Set<any>;
}

declare var Set: SetConstructor;

module Vidyano {
    "use strict";

    export var version = "latest";

    export enum NotificationType {
        Error,
        Notice,
        OK,
        Warning
    }

    export interface Language {
        culture: string;
        name: string;
        isDefault: boolean;
        messages: {
            [key: string]: string;
        };
    }

    export interface ProviderParameters {
        label: string;
        description: string;
        requestUri: string;
        signOutUri: string;
        redirectUri: string;
    }

    export interface Routes {
        programUnits: { [name: string]: string};
        persistentObjects: { [type: string]: string};
        queries: { [type: string]: string};
    }

    var hasStorage = (function () {
        var vi = 'Vidyano';
        try {
            window.localStorage.setItem(vi, vi);
            window.localStorage.removeItem(vi);

            window.sessionStorage.setItem(vi, vi);
            window.sessionStorage.removeItem(vi);

            return true;
        } catch (e) {
            return false;
        }
    })();
    var locationPrefix = document.location.pathname;

    var mobile: boolean = (function (a) { return /android.+mobile|avantgo|bada\/|blackberry|bb10|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)); })(navigator.userAgent || navigator.vendor);

    export function extend(target: any, ...sources: any[]) {
        sources.forEach(source => {
            for (var key in source)
                if (source.hasOwnProperty(key))
                    target[key] = source[key];
        });

        return target;
    }

    export function cookie(key: string, value?: any, options?: { force?: boolean; raw?: boolean; path?: string; domain?: string; secure?: boolean; expires?: number | Date; }) {
        var now = new Date();

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (Object.prototype.toString.call(value) === "[object String]" || value === null || value === undefined)) {
            options = Vidyano.extend({}, options);

            if (value == null)
                options.expires = -1;

            var expires: Date = <Date>options.expires;
            if (typeof options.expires === 'number') {
                expires = new Date();
                expires.setDate(expires.getDate() + <number>options.expires);
            }

            value = String(value);

            if (hasStorage && !options.force) {
                // Clear cookie
                document.cookie = encodeURIComponent(key) + '=; expires=' + new Date(Date.parse("2000-01-01")).toUTCString();

                // Save to localStorage/sessionStorage
                key = locationPrefix + key;

                if (expires) {
                    if (expires > now)
                        window.localStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value), exp: expires.toUTCString() }));
                    else
                        window.localStorage.removeItem(key);

                    window.sessionStorage.removeItem(key);
                } else {
                    window.sessionStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value) }));
                    window.localStorage.removeItem(key);
                }

                return key;
            } else {
                return (document.cookie = [
                    encodeURIComponent(key), '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

        if (hasStorage && !options.force) {
            key = locationPrefix + key;

            var item = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
            if (item != null) {
                item = JSON.parse(item);
                if (item.exp && new Date(item.exp) < now) {
                    window.localStorage.removeItem(key);
                    return null;
                }

                return decode(item.val);
            }
        } else {
            var parts = document.cookie.split('; ');
            for (var i = 0, part; part = parts[i]; i++) {
                var pair = part.split('=');
                if (decodeURIComponent(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB
            }
        }
        return null;
    }

    export function _debounce(func: Function, wait: number, immediate?: boolean): Function {
        var result;
        var timeout = null;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    }

    export module Common {
        export interface KeyValuePair {
            key: any;
            value: string;
        }

        export interface SubjectNotifier<TSource, TDetail> {
            notify: (source: TSource, detail?: TDetail) => void;
        }

        export class PropertyChangedArgs {
            constructor(public propertyName: string, public newValue: any, public oldValue: any) {
            }
        }

        export interface SubjectDisposer {
            (): void;
        }

        export class Subject<TSource, TDetail> {
            private _observers: ((sender: TSource, detail: TDetail) => void)[] = [];

            constructor(notifier: SubjectNotifier<TSource, TDetail>) {
                notifier.notify = (source: TSource, detail: TDetail) => {
                    for (var i in this._observers)
                        this._observers[i](source, detail);
                }
            }

            attach(observer: SubjectObserver<TSource, TDetail>): SubjectDisposer {
                var id = this._observers.length;
                this._observers.push(observer);

                return <SubjectDisposer>this._detach.bind(this, id);
            }

            private _detach(observerId: number) {
                delete this._observers[observerId];
            }
        }

        export interface SubjectObserver<TSource, TDetail> {
            (sender: TSource, detail: TDetail): void;
        }

        export class Observable<T> {
            private _propertyChangedNotifier: Vidyano.Common.SubjectNotifier<T, Vidyano.Common.PropertyChangedArgs>;
            propertyChanged: Vidyano.Common.Subject<T, Vidyano.Common.PropertyChangedArgs>;

            constructor() {
                this.propertyChanged = new Vidyano.Common.Subject<T, Vidyano.Common.PropertyChangedArgs>(this._propertyChangedNotifier = { notify: undefined });
            }

            protected notifyPropertyChanged(propertyName: string, newValue: any, oldValue?: any) {
                this._propertyChangedNotifier.notify(<T><any>this, {
                    propertyName: propertyName,
                    newValue: newValue,
                    oldValue: oldValue
                });
            }
        }

        export interface PropertyChangedObserver<T> extends SubjectObserver<T, Vidyano.Common.PropertyChangedArgs> {
        }
    }

    export module ClientOperations {
        export interface ClientOperation {
            type: string;
        }

        export interface RefreshOperation extends ClientOperation {
            delay?: number;
            queryId?: string;
            fullTypeName?: string;
            objectId?: string;
        }

        export interface ExecuteMethodOperation extends ClientOperation {
            name: string;
            arguments: any[];
        }

        export interface OpenOperation extends ClientOperation {
            persistentObject: any;
            replace?: boolean;
        }

        export function navigate(hooks: ServiceHooks, path: string, replaceCurrent?: boolean): void {
            hooks.onNavigate(path, replaceCurrent);
        }

        export function reloadPage(): void {
            document.location.reload();
        }

        export function showMessageBox(hooks: ServiceHooks, title: string, message: string, html: boolean = false, delay: number = 0): void {
            setTimeout(function () {
                hooks.onMessageDialog(title, message, html, hooks.service.getTranslatedMessage("OK"));
            }, delay);
        }
    }

    export interface ServiceClientData {
        defaultUser: string;
        exception: string;
        languages: { [code: string]: { name: string; isDefault: boolean; messages: { [key: string]: string; } } };
        providers: { [name: string]: { parameters: ProviderParameters } };
    }

    export interface ServiceRequest {
        when: Date;
        profiler: ServiceRequestProfiler;
        transport: number;
        method: string;
        request: any;
        response: any;
    }

    export interface ServiceRequestProfiler {
        taskId: number;
        elapsedMilliseconds: number;
        entries: ServiceRequestProfilerEntry[];
        sql: ServiceRequestProfilerSQL[];
        exceptions: {
            id: string;
            message: string;
        }[];
    }

    export interface ServiceRequestProfilerEntry {
        entries: ServiceRequestProfilerEntry[];
        methodName: string;
        sql: string[];
        started: number;
        elapsedMilliseconds: number;
        hasNPlusOne?: boolean;
        exception: string;
        arguments: any[];
    }

    export interface ServiceRequestProfilerSQL {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        recordsAffected: number;
        taskId: number;
        type: string;
        parameters: ServiceRequestProfilerSQLParameter[];
    }

    export interface ServiceRequestProfilerSQLParameter {
        name: string;
        type: string;
        value: string;
    }

    export class Service extends Vidyano.Common.Observable<Service> {
        private static _getMs = window.performance && window.performance.now ? () => window.performance.now() : () => new Date().getTime();
        private static _base64KeyStr: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        private _lastAuthTokenUpdate: Date = new Date();
        private _isUsingDefaultCredentials: boolean;
        private _clientData: any;
        private _language: Language;
        private _languages: Language[];
        private _windowsAuthentication: boolean;
        private _providers: { [name: string]: ProviderParameters };
        private _isSignedIn: boolean;
        private _application: Application;
        private _profile: boolean;
        private _profiledRequests: ServiceRequest[];
        staySignedIn: boolean;
        icons: linqjs.Dictionary<string, string>;
        actionDefinitions: linqjs.Dictionary<string, ActionDefinition>;
        environment: string = "Web";
        environmentVersion: string = "2";
        ignoreMobile: boolean;

        constructor(public serviceUri: string, public hooks: ServiceHooks = new ServiceHooks(), private _forceUser?: string) {
            super();

            (<any>this.hooks)._service = this;
            this.staySignedIn = cookie("staySignedIn", undefined, { force: true });
        }

        private _createUri(method: string) {
            var uri = this.serviceUri;
            if (!StringEx.isNullOrEmpty(uri) && !uri.endsWith('/'))
                uri += '/';
            return uri + method;
        }

        private _createData(method: string, data?: any) {
            data = data || {};

            if (!this.ignoreMobile && mobile)
                data.isMobile = true;

            data.environment = this.environment;
            data.environmentVersion = this.environmentVersion;

            if (method != "getApplication") {
                data.userName = this.userName;
                if (data.userName !== this.defaultUserName)
                    data.authToken = this.authToken;
            }

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
                var requestStart = this._getMs();
                var requestMethod = url.split("/").pop();
            }

            return new Promise((resolve, reject) => {
                var r = new XMLHttpRequest();
                r.open("POST", url, true);
                r.overrideMimeType("application/json; charset=utf-8");
                r.onload = () => {
                    if (r.status != 200) {
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
                    } else if (result.exception == "Session expired") {
                        this.authToken = null;
                        delete data.authToken;

                        if (this.isUsingDefaultCredentials) {
                            data.userName = this._clientData.defaultUser;
                            delete data.password;
                            this._postJSON(url, data).then(resolve, reject);
                        } else {
                            reject(result.exception);
                            this.hooks.onSessionExpired();
                        }

                        return;
                    }
                    else
                        reject(result.exception);

                    this._postJSONProcess(data, result, requestMethod, createdRequest, requestStart, r.getResponseHeader("X-ElapsedMilliseconds"));
                };
                r.onerror = () => { reject(r.statusText); };

                r.send(JSON.stringify(data));
            });
        }

        private _postJSONProcess(data: any, result: any, requestMethod: string, createdRequest: Date, requestStart: number, elapsedMs: string) {
            let finishProfile = this.profile;
            switch (requestMethod) {
                case "GetPersistentObject":
                    finishProfile = finishProfile && result.result && result.result.id != "b15730ad-9f47-4775-aacb-0a181e95e53d" && !result.result.isSystem;
                    break;

                case "GetQuery":
                    finishProfile = finishProfile && result.query && !result.query.isSystem;
                    break;

                case "ExecuteQuery":
                    finishProfile = finishProfile && data.query && !data.query.isSystem;
                    break;

                case "ExecuteAction":
                    finishProfile = finishProfile && !((result.result != null && (result.result.id == "b15730ad-9f47-4775-aacb-0a181e95e53d" || result.result.isSystem) || (data.query != null && data.query.isSystem) || (data.parent != null && data.parent.isSystem && data.parent.id != "70381ffa-ae0b-4dc0-b4c3-b02dd9a9c0a0")));
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

                const request: ServiceRequest = {
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

            if (result.operations)
                setTimeout(() => result.operations.forEach(o => this.hooks.onClientOperation(o)), 0);
        }

        private _getJSON(url: string): Promise<any> {
            return new Promise((resolve, reject) => {
                var r = new XMLHttpRequest();
                r.open("GET", url, true);
                r.onload = () => {
                    if (r.status != 200) {
                        reject(r.statusText);
                        return;
                    }

                    resolve(JSON.parse(r.responseText));
                };
                r.onerror = () => { reject(r.statusText); };

                r.send();
            });
        }

        private static _decodeBase64(input): string {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
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

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            } while (i < input.length);

            return unescape(output);
        }

        private static _getServiceTimeString = function (timeString: string, defaultValue: string) {
            if (!StringEx.isNullOrWhiteSpace(timeString)) {
                timeString = timeString.trim();

                // 00:00.0000000
                var ms = "0000000";
                var parts = timeString.split('.');
                if (parts.length == 2) {
                    ms = parts[1];
                    timeString = parts[0];
                }
                else if (parts.length != 1)
                    return defaultValue;

                var length = timeString.length;
                if (length >= 4) {
                    var values = timeString.split(':'), valuesLen = values.length;
                    var days = 0, hours, minutes, seconds = 0;

                    if ((length == 4 || length == 5) && valuesLen == 2) {
                        // [0]0:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                    }
                    else if ((length == 7 || length == 8) && valuesLen == 3) {
                        // [0]0:00:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                        seconds = parseInt(values[2], 10);
                    }
                    else if (length >= 10 && valuesLen == 4) {
                        // 0:00:00:00
                        days = parseInt(values[0], 10);
                        hours = parseInt(values[1], 10);
                        minutes = parseInt(values[2], 10);
                        seconds = parseInt(values[3], 10);
                    }
                    else
                        return defaultValue;

                    if (days != NaN && hours != NaN && minutes != NaN && seconds != NaN && days >= 0 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59)
                        return StringEx.format("{0}:{1:d2}:{2:d2}:{3:d2}.{4}", days, hours, minutes, seconds, ms.padRight(7, '0'));
                }
            }

            return defaultValue;
        }

        _getStream(obj: PersistentObject, action?: string, parent?: PersistentObject, query?: Query, selectedItems?: Array<QueryResultItem>, parameters?: any) {
            var data = this._createData("getStream");
            data.action = action;
            if (obj != null)
                data.id = obj.objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();
            if (query != null)
                data.query = query._toServiceObject();
            if (selectedItems != null)
                data.selectedItems = selectedItems.map(function (si) { return si._toServiceObject(); });
            if (parameters != null)
                data.parameters = parameters;

            var name = "iframe-vidyano-download";
            var iframe = <HTMLIFrameElement>document.querySelector("iframe[name='" + name + "']");
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.src = "javascript:false;";
                iframe.name = name;
                iframe.style.position = "absolute";
                iframe.style.top = "-1000px";
                iframe.style.left = "-1000px";

                document.body.appendChild(iframe);
            }

            var form = document.createElement("form");
            form.enctype = "multipart/form-data";
            form.encoding = "multipart/form-data";
            form.method = "post";
            form.action = this._createUri("GetStream");
            form.target = name;

            var input = document.createElement("input");
            input.type = "hidden";
            input.name = "data";
            input.value = JSON.stringify(data);

            form.appendChild(input);
            document.body.appendChild(form);

            form.submit();
            document.body.removeChild(form);
        }

        get application(): Application {
            return this._application;
        }

        private _setApplication(application: Application) {
            if (this._application === application)
                return;

            var oldApplication = this._application;
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
            this._language = l;
        }

        get isSignedIn(): boolean {
            return this._isSignedIn;
        }

        private _setIsSignedIn(val: boolean) {
            if (this._isSignedIn === val)
                return;

            this._setIsUsingDefaultCredentials(val && this.defaultUserName && this.userName && this.defaultUserName.toLowerCase() === this.userName.toLowerCase());

            var oldIsSignedIn = this._isSignedIn;
            this.notifyPropertyChanged("isSignedIn", this._isSignedIn = val, oldIsSignedIn);
        }

        get languages(): Language[] {
            return this._languages;
        }

        get windowsAuthentication(): boolean {
            return this._windowsAuthentication;
        }

        get providers(): { [name: string]: ProviderParameters } {
            return this._providers;
        }

        get isUsingDefaultCredentials(): boolean {
            return this._isUsingDefaultCredentials;
        }

        private _setIsUsingDefaultCredentials(val: boolean) {
            this._isUsingDefaultCredentials = val;
        }

        get userName(): string {
            return this._forceUser || Vidyano.cookie("userName");
        }

        private _setUserName(val: string) {
            var oldUserName = this.userName;
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

            var currentProfileCookie = !!BooleanEx.parse(Vidyano.cookie("profile"));
            if (currentProfileCookie != val)
                Vidyano.cookie("profile", String(val));

            var oldValue = this._profile;
            this._profile = val;

            if (!val)
                this._setProfiledRequests([]);

            this.notifyPropertyChanged("profile", val, oldValue);
        }

        get profiledRequests(): ServiceRequest[] {
            return this._profiledRequests;
        }

        private _setProfiledRequests(requests: ServiceRequest[]) {
            this.notifyPropertyChanged("profiledRequests", this._profiledRequests = requests);
        }

        getTranslatedMessage(key: string, ...params: string[]): string {
            return StringEx.format.apply(null, [this.language.messages[key] || key].concat(params));
        }

        initialize(skipDefaultCredentialLogin: boolean = false): Promise<Application> {
            return this._getJSON(this._createUri("GetClientData?v=2")).then((clientData: ServiceClientData) => {
                this.hooks.onInitialize(clientData);

                this._clientData = clientData;

                if (clientData.exception)
                    throw clientData.exception;

                var languages: Language[] = [];
                for (var name in clientData.languages) {
                    languages.push({ culture: name, name: clientData.languages[name].name, isDefault: clientData.languages[name].isDefault, messages: clientData.languages[name].messages });
                }
                this._languages = languages;
                this.language = Enumerable.from(this._languages).firstOrDefault(l => l.isDefault) || this._languages[0];

                this._providers = {};
                for (var provider in clientData.providers) {
                    this._providers[provider] = clientData.providers[provider].parameters;
                }
                this._windowsAuthentication = this._clientData.windowsAuthentication;

                if (!StringEx.isNullOrEmpty(document.location.hash) && document.location.hash.startsWith("#!/SignInWithToken/")) {
                    var token = document.location.hash.substr(19);
                    var tokenParts = token.split("/", 2);
                    this._setUserName(Service._decodeBase64(tokenParts[0]));
                    this.authToken = tokenParts[1].replace("_", "/");

                    var returnUrl = Vidyano.cookie("returnUrl", { force: true });
                    if (returnUrl) {
                        Vidyano.cookie("returnUrl", null, { force: true });
                        document.location.hash = "!/" + returnUrl;
                    }
                    else
                        document.location.hash = "!/";

                    return this._getApplication();
                }
                else {
                    this._setUserName(this.userName || this._clientData.defaultUser);

                    if (this._forceUser || !StringEx.isNullOrEmpty(this.authToken) || ((this._clientData.defaultUser || this.windowsAuthentication) && !skipDefaultCredentialLogin))
                        return this._getApplication();
                    else {
                        this._setIsSignedIn(!!this.application);
                        return Promise.resolve(this.application);
                    }
                }
            });
        }

        signInExternal(providerName: string) {
            var provider = this.providers[providerName];
            if (provider != null) {
                var requestUri = provider.requestUri;
                if (typeof (Windows) != "undefined") {
                    var broker = Windows.Security.Authentication.Web.WebAuthenticationBroker;
                    var redirectUri = provider.redirectUri;
                    var authenticate = broker.authenticateAsync(Windows.Security.Authentication.Web.WebAuthenticationOptions.none, new Windows.Foundation.Uri(requestUri), new Windows.Foundation.Uri(redirectUri));
                    authenticate.then(result => {
                        if (result.responseStatus == Windows.Security.Authentication.Web.WebAuthenticationStatus.success) {
                            var data = this._createData("getApplication");
                            data.accessToken = result.responseData.split('#')[0].replace(redirectUri + "?code=", "");
                            data.serviceProvider = "Yammer";

                            this._getApplication(data).then(() => {
                                if (document.location.hash != "")
                                    document.location.hash = "";
                                document.location.reload();
                            }, e => {
                                // TODO: Toast notification!
                            });
                        }
                    });
                }
                else
                    document.location.assign(requestUri);
            }
        }

        signInUsingCredentials(userName: string, password: string): Promise<Application> {
            this._setUserName(userName);

            var data = this._createData("getApplication");
            data.userName = userName;
            data.password = password;

            return this._getApplication(data);
        }

        signInUsingDefaultCredentials(): Promise<Application> {
            this._setUserName(this._clientData.defaultUser);

            return this._getApplication();
        }

        signOut() {
            this._setUserName(null);
            this.authToken = null;
            this._setApplication(null);

            if (this._providers["Acs"] && this._providers["Acs"].signOutUri) {
                var iframe = document.createElement("iframe");
                iframe.width = "0";
                iframe.height = "0";
                iframe.src = this._providers["Acs"].signOutUri;
                iframe.onload = () => {
                    document.body.removeChild(iframe);
                };

                document.body.appendChild(iframe);
            }

            this._setIsSignedIn(false);
        }

        private _getApplication(data: any = this._createData("")): Promise<Application> {
            return new Promise<Application>((resolve, reject) => {
                Vidyano.cookie("staySignedIn", this.staySignedIn ? "true" : null, { force: true, expires: 365 });
                this._postJSON(this._createUri("GetApplication"), data).then(result => {
                    if (!StringEx.isNullOrEmpty(result.exception)) {
                        reject(result.exception);
                        return;
                    }

                    if (result.application == null) {
                        reject("Unknown error");
                        return;
                    }

                    this._setApplication(new Application(this, result.application));

                    var resourcesQuery = this.application.getQuery("Resources");
                    if (resourcesQuery)
                        this.icons = Enumerable.from(resourcesQuery.items).where(i => i.getValue("Type") == "Icon").toDictionary(i => <string>i.getValue("Key"), i => <string>i.getValue("Data"));
                    else
                        this.icons = Enumerable.empty<string>().toDictionary(i => i, i => i);
                    this.actionDefinitions = Enumerable.from(this.application.getQuery("Actions").items).toDictionary(i => <string>i.getValue("Name"), i => new ActionDefinition(this, i));

                    this.language = Enumerable.from(this._languages).firstOrDefault(l => l.culture == result.userLanguage) || Enumerable.from(this._languages).firstOrDefault(l => l.isDefault);
                    var clientMessagesQuery = this.application.getQuery("ClientMessages");
                    if (clientMessagesQuery)
                        clientMessagesQuery.items.forEach(msg => this.language.messages[msg.getValue("Key")] = msg.getValue("Value"));

                    CultureInfo.currentCulture = CultureInfo.cultures.get(result.userCultureInfo) || CultureInfo.cultures.get(result.userLanguage) || CultureInfo.invariantCulture;

                    this._setUserName(result.userName);

                    if (result.session)
                        this.application._updateSession(result.session);

                    this._setIsSignedIn(true);

                    resolve(this.application);
                }, e => {
                    this._setApplication(null);
                    this._setIsSignedIn(false);

                    reject(e);
                });
            });
        }

        getQuery(id: string, asLookup?: boolean): Promise<Query> {
            var data = this._createData("getQuery");
            data.id = id;

            return new Promise<Query>((resolve, reject) => {
                this._postJSON(this._createUri("GetQuery"), data).then(result => {
                    if (result.exception == null)
                        resolve(this.hooks.onConstructQuery(this, result.query, null, asLookup));
                    else
                        reject(result.exception);
                }, e => {
                    reject(e);
                });
            });
        }

        getPersistentObject(parent: PersistentObject, id: string, objectId?: string): Promise<PersistentObject> {
            var data = this._createData("getPersistentObject");
            data.persistentObjectTypeId = id;
            data.objectId = objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();

            return new Promise<PersistentObject>((resolve, reject) => {
                this._postJSON(this._createUri("GetPersistentObject"), data).then(result => {
                    if (result.exception || (result.result && result.result.notification && result.result.notificationType == "Error"))
                        reject(result.exception || result.result.notification);
                    else
                        resolve(this.hooks.onConstructPersistentObject(this, result.result));
                }, e => {
                    reject(e);
                });
            });
        }

        executeQuery(parent: PersistentObject, query: Query, asLookup: boolean = false): Promise<any> {
            var data = this._createData("executeQuery");
            data.query = query._toServiceObject();

            if (parent != null)
                data.parent = parent.toServiceObject();
            if (asLookup)
                data.asLookup = asLookup;

            return this._postJSON(this._createUri("ExecuteQuery"), data).then(result => {
                if (result.exception == null) {
                    return result.result;
                }
                else {
                    query.setNotification(result.exception, NotificationType.Error);
                    throw result.exception;
                }
            }, e => {
                query.setNotification(e, NotificationType.Error);
                throw e;
            });
        }

        executeAction(action: string, parent: PersistentObject, query: Query, selectedItems: Array<QueryResultItem>, parameters?: any, skipHooks: boolean = false): Promise<PersistentObject> {
            var isObjectAction = action.startsWith("PersistentObject.") || query == null;
            return new Promise<PersistentObject>((resolve, reject) => {
                if (!skipHooks) {
                    if (!isObjectAction) {
                        query.setNotification(null);
                        if (query.selectAll.allSelected && !query.selectAll.inverse)
                            selectedItems = [];
                    }
                    else if (parent)
                        parent.setNotification(null);

                    this.hooks.trackEvent(action, parameters ? parameters.MenuLabel || parameters.MenuOption : null, query || parent);

                    var args = new ExecuteActionArgs(this, action, parent, query, selectedItems, parameters);
                    this.hooks.onAction(args).then(() => {
                        if (args.isHandled)
                            resolve(args.result);
                        else
                            this.executeAction(action, parent, query, selectedItems, parameters, true).then(po => {
                                resolve(po);
                            }, e => {
                                reject(e);
                            });
                    }, e => {
                        if (isObjectAction)
                            parent.setNotification(e);
                        else
                            query.setNotification(e);

                        reject(e);
                    });

                    return;
                }

                var data = this._createData("executeAction");
                data.action = action;
                if (parent != null)
                    data.parent = parent.toServiceObject();
                if (query != null)
                    data.query = query._toServiceObject();
                if (selectedItems != null)
                    data.selectedItems = selectedItems.map(item => item && item._toServiceObject());
                if (parameters != null)
                    data.parameters = parameters;

                if (parent != null) {
                    var inputs = parent.getRegisteredInputs();
                    if (inputs.count() > 0) {
                        var origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
                        if (this.serviceUri.startsWith("http") && !this.serviceUri.startsWith(origin) + "/") {
                            Promise.all(inputs.select(input => {
                                return new Promise((resolve, reject) => {
                                    var file = input.value.files[0];
                                    if (!file){
                                        resolve(true);
                                        return;
                                    }

                                    var attribute = parent.getAttribute(input.key);
                                    var reader = new FileReader();

                                    reader.onload = event => {
                                        var fileName = attribute.value;
                                        attribute.value = (<any>event.target).result.match(/,(.*)$/)[1];
                                        if (attribute.type == "BinaryFile")
                                            attribute.value = fileName + "|" + attribute.value;

                                        resolve(true);
                                    };
                                    reader.onerror = function (e) {
                                        reject(e);
                                    };

                                    reader.readAsDataURL(file);
                                });
                            }).toArray()).then(() => {
                                data.parent = parent.toServiceObject();
                                return this._postJSON(this._createUri("ExecuteAction"), data).then(result => {
                                    if (result.exception == null)
                                        resolve(result.result ? this.hooks.onConstructPersistentObject(this, result.result) : null);
                                    else
                                        reject(result.exception);
                                });
                            });

                            return;
                        }

                        var iframeName = "iframe-" + new Date();
                        var iframe = document.createElement("iframe");
                        iframe.src = "javascript:false;";
                        iframe.name = iframeName;
                        iframe.style.position = "absolute";
                        iframe.style.top = "-1000px";
                        iframe.style.left = "-1000px";

                        var clonedForm = document.createElement("form");
                        clonedForm.enctype = "multipart/form-data";
                        clonedForm.encoding = "multipart/form-data";
                        clonedForm.method = "post";
                        clonedForm.action = this._createUri("ExecuteAction");
                        clonedForm.target = iframeName;

                        var input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "data";
                        input.value = JSON.stringify(data);

                        clonedForm.appendChild(input);
                        clonedForm.style.display = "none";

                        inputs.where(function (item) { return item.value.value != ""; }).forEach(function (item) {
                            var input = item.value;
                            input.name = item.key;
                            var replacement = document.createElement("input");
                            replacement.type = "file";
                            input.insertAdjacentElement("afterend", replacement);
                            (<any>input).replacement = replacement;
                            clonedForm.appendChild(input);
                        });

                        const createdRequest = new Date();
                        if (this.profile)
                            var requestStart = this._getMs();

                        const service = this;
                        // NOTE: The first load event gets fired after the iframe has been injected into the DOM, and is used to prepare the actual submission.
                        iframe.onload = function (e: Event) {
                            // NOTE: The second load event gets fired when the response to the form submission is received. The implementation detects whether the actual payload is embedded in a <textarea> element, and prepares the required conversions to be made in that case.
                            iframe.onload = function (e: Event) {
                                var doc = this.contentWindow ? this.contentWindow.document : (this.contentDocument ? this.contentDocument : this.document),
                                    root = doc.documentElement ? doc.documentElement : doc.body,
                                    textarea = root.getElementsByTagName("textarea")[0],
                                    type = textarea ? textarea.getAttribute("data-type") : null,
                                    content = {
                                        html: root.innerHTML,
                                        text: type ?
                                            textarea.value :
                                            root ? (root.textContent || root.innerText) : null
                                    };

                                var result = JSON.parse(content.text);

                                if (result.exception == null) {
                                    iframe.src = "javascript:false;";
                                    document.body.removeChild(iframe);

                                    resolve(result.result ? service.hooks.onConstructPersistentObject(service, result.result) : null);
                                }
                                else
                                    reject(result.exception);

                                service._postJSONProcess(data, result, "ExecuteAction", createdRequest, requestStart, (service._getMs() - requestStart).toString());

                                document.body.removeChild(clonedForm);
                            };

                            Array.prototype.forEach.call(clonedForm.querySelectorAll("input"), (input: HTMLInputElement) => { input.disabled = false; });
                            clonedForm.submit();
                            parent.clearRegisteredInputs();
                            inputs.forEach(item => {
                                var replacement: HTMLInputElement = (<any>item.value).replacement;
                                if (replacement != null) {
                                    var tempParent = document.createElement("div");
                                    tempParent.innerHTML = item.value.outerHTML;
                                    var newInput = <HTMLInputElement>tempParent.querySelector("input")
                                    replacement.parentNode.replaceChild(newInput, replacement);
                                    parent.registerInput(item.key, newInput);
                                }
                                else
                                    parent.registerInput(item.key, item.value);
                            });
                        };

                        document.body.appendChild(clonedForm);
                        document.body.appendChild(iframe);

                        return;
                    }
                }

                this._postJSON(this._createUri("ExecuteAction"), data).then(result => {
                    resolve(result.result ? this.hooks.onConstructPersistentObject(this, result.result) : null);
                }, e => {
                    if (isObjectAction)
                        parent.setNotification(e);
                    else
                        query.setNotification(e);

                    reject(e);
                });
            });
        }

        static getDate = function (yearString: string, monthString: string, dayString: string, hourString: string, minuteString: string, secondString: string, msString: string) {
            var year = parseInt(yearString, 10);
            var month = parseInt(monthString || "1", 10) - 1;
            var day = parseInt(dayString || "1", 10);
            var hour = parseInt(hourString || "0", 10);
            var minutes = parseInt(minuteString || "0", 10);
            var seconds = parseInt(secondString || "0", 10);
            var ms = parseInt(msString || "0", 10);

            return new Date(year, month, day, hour, minutes, seconds, ms);
        }

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
                        var parts = value.split(" ");
                        var date = parts[0].split("-");
                        var time = parts[1].split(":");
                        var dateTime = Service.getDate(date[2], date[1], date[0], time[0], time[1], time[2].substring(0, 2), time[2].length > 2 ? time[2].substr(3, 3) : null);
                        if (parts.length == 3) {
                            dateTime.netType("DateTimeOffset");
                            dateTime.netOffset(parts[2]);
                        }

                        return dateTime;
                    }

                    var now = new Date();
                    if (typeName == "Date") {
                        now.setHours(0, 0, 0, 0);
                        return now;
                    }
                    else if (typeName == "DateTime")
                        return now;
                    else if (typeName == "DateTimeOffset") {
                        now.netType("DateTimeOffset");
                        var zone = now.getTimezoneOffset() * -1;
                        var zoneHour = zone / 60;
                        var zoneMinutes = zone % 60;
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
                case "DateTime":
                case "NullableDateTime":
                    if (!StringEx.isNullOrEmpty(value)) {
                        var date = value;
                        if (typeof (date) == "string")
                            date = new Date(value);

                        return date.format("dd-MM-yyyy HH:mm:ss.fff").trimEnd('0').trimEnd('.');
                    }

                    break;

                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    if (!StringEx.isNullOrEmpty(value)) {
                        var dateOffset = value;
                        if (typeof (value) == "string") {
                            if (value.length >= 23 && value.length <= 30) {
                                var dateParts = value.split(" ");

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

                    if (typeof (value) == "string")
                        value = BooleanEx.parse(value);

                    return value ? "True" : "False";

                case "Time":
                    return Service._getServiceTimeString(value, "0:00:00:00.0000000");

                case "NullableTime":
                    return Service._getServiceTimeString(value, null);
            }

            return typeof (value) == "string" || value == null ? value : String(value);
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

    export class ServiceHooks {
        private _service: Vidyano.Service;

        get service(): Vidyano.Service {
            return this._service;
        }

        createData(data: any) {
        }

        setNotification(notification: string, type: NotificationType) {
        }

        trackEvent(name: string, option: string, owner: ServiceObjectWithActions) {
        }

        onInitialize(clientData: ServiceClientData) {
        }

        onSessionExpired() {
        }

        onActionConfirmation(action: Action, option: number): Promise<boolean> {
            return Promise.resolve(true);
        }

        onAction(args: ExecuteActionArgs): Promise<any> {
            return Promise.resolve(null);
        }

        onOpen(obj: ServiceObject, replaceCurrent: boolean = false, fromAction: boolean = false) {
        }

        onClose(obj: ServiceObject) {
        }

        onConstructPersistentObject(service: Service, po: any): PersistentObject {
            return new PersistentObject(service, po);
        }

        onConstructPersistentObjectAttributeTab(service: Service, groups: linqjs.Enumerable<PersistentObjectAttributeGroup>, key: string, id: string, name: string, layout: any, parent: PersistentObject, columnCount: number, isVisible: boolean): PersistentObjectAttributeTab {
            return new PersistentObjectAttributeTab(service, groups.toArray(), key, id, name, layout, parent, columnCount, isVisible);
        }

        onConstructPersistentObjectQueryTab(service: Service, query: Query): PersistentObjectQueryTab {
            return new PersistentObjectQueryTab(service, query);
        }

        onConstructPersistentObjectAttributeGroup(service: Service, key: string, attributes: linqjs.Enumerable<PersistentObjectAttribute>, parent: PersistentObject): PersistentObjectAttributeGroup {
            return new PersistentObjectAttributeGroup(service, key, attributes.toArray(), parent);
        }

        onConstructPersistentObjectAttribute(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttribute {
            return new PersistentObjectAttribute(service, attr, parent);
        }

        onConstructPersistentObjectAttributeWithReference(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeWithReference {
            return new PersistentObjectAttributeWithReference(service, attr, parent);
        }

        onConstructPersistentObjectAttributeAsDetail(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeAsDetail {
            return new PersistentObjectAttributeAsDetail(service, attr, parent);
        }

        onConstructQuery(service: Service, query: any, parent?: PersistentObject, asLookup: boolean = false, maxSelectedItems?: number): Query {
            return new Query(service, query, parent, asLookup, maxSelectedItems);
        }

        onConstructQueryResultItem(service: Service, item: any, query: Query, isSelected: boolean = false): QueryResultItem {
            return new QueryResultItem(service, item, query, isSelected);
        }

        onConstructQueryResultItemValue(service: Service, item: QueryResultItem, value: any): QueryResultItemValue {
            return new QueryResultItemValue(service, item, value);
        }

        onConstructQueryColumn(service: Service, col: any, query: Query): QueryColumn {
            return new QueryColumn(service, col, query);
        }

        onConstructAction(service: Service, action: Action): Action {
            return action;
        }

        onMessageDialog(title: string, message: string, html: boolean, ...actions: string[]): Promise<number> {
            return Promise.resolve(-1);
        }

        onSelectReference(query: Vidyano.Query): Promise<QueryResultItem[]> {
            return Promise.resolve([]);
        }

        onNavigate(path: string, replaceCurrent: boolean = false) {
        }

        onClientOperation(operation: ClientOperations.ClientOperation) {
            switch (operation.type) {
                case "ExecuteMethod":
                    var executeMethod = <ClientOperations.ExecuteMethodOperation>operation;
                    var method: Function = Vidyano.ClientOperations[executeMethod.name];
                    if (typeof (method) == "function") {
                        method.apply(Vidyano.ClientOperations, [this].concat(executeMethod.arguments));
                    }
                    else if (window.console && console.error)
                        console.error("Method not found: " + executeMethod.name, executeMethod);

                    break;

                case "Open":
                    var open = <ClientOperations.OpenOperation>operation;
                    this.onOpen(this.onConstructPersistentObject(this.service, open.persistentObject), open.replace, true);
                    break;

                default:
                    if (window.console && console.log)
                        console.log("Missing client operation type: " + operation.type, operation);
                    break;
            }
        }

        onSelectedItemsActions(query: Query, selectedItems: QueryResultItem[], action: SelectedItemsActionArgs) {
        }
    }

    export interface SelectedItemsActionArgs {
       name: string;
       isVisible: boolean;
       canExecute: boolean;
       options: string[];
    }

    export class ExecuteActionArgs {
        private _action: string;

        action: string;
        isHandled: boolean = false;
        result: PersistentObject;

        constructor(private service: Service, action: string, public persistentObject: PersistentObject, public query: Query, public selectedItems: Array<QueryResultItem>, public parameters: any) {
            this._action = action;
            this.action = action.split(".")[1];
        }

        executeServiceRequest(): Promise<PersistentObject> {
            return new Promise<PersistentObject>((resolve, reject) => {
                this.service.executeAction(this._action, this.persistentObject, this.query, this.selectedItems, this.parameters, true).then(result => {
                    this.result = result;
                    this.isHandled = true;
                    resolve(result);
                }, e => {
                    reject(e);
                });
            });
        }
    }

    export interface ServiceObjectPropertyChangedObserver extends Common.PropertyChangedObserver<ServiceObject> {
    }

    export class ServiceObject extends Vidyano.Common.Observable<ServiceObject> {
        constructor(public service: Service) {
            super();
        }

        copyProperties(propertyNames: Array<string>, includeNullValues?: boolean, result?: any): any {
            result = result || {};
            propertyNames.forEach(p => {
                var value = this[p];
                if (includeNullValues || (value != null && value !== false && (value !== 0 || p == "pageSize") && (!Array.isArray(value) || value.length > 0)))
                    result[p] = value;
            });
            return result;
        }
    }

    export class ServiceObjectWithActions extends ServiceObject {
        private _queue: Queue;
        private _isBusy: boolean = false;
        notification: string;
        notificationType: NotificationType;
        actions: Action[] = [];

        constructor(service: Service, private _actionNames: string[] = []) {
            super(service);

            this._queue = new Queue(1);
        }

        get isBusy(): boolean {
            return this._isBusy;
        }

        private _setIsBusy(val: boolean) {
            if (this._isBusy == val)
                return;

            var oldIsBusy = this._isBusy;
            this.notifyPropertyChanged("isBusy", this._isBusy = val, oldIsBusy);
        }

        setNotification(notification: string = null, type: NotificationType = NotificationType.Error) {
            var oldNotificationType = this.notificationType;
            this.notifyPropertyChanged("notificationType", this.notificationType = type, oldNotificationType);

            var oldNotification = this.notification;
            this.notifyPropertyChanged("notification", this.notification = notification, oldNotification);
        }

        queueWork<T>(work: () => Promise<T>, blockActions: boolean = true): Promise<T> {
            this._setIsBusy(true);

            return this._queue.add(() => {
                if (blockActions)
                    this._blockActions(true);

                return work().then(result => {
                    this._setIsBusy(this._queue.getQueueLength() > 0);
                    if (blockActions)
                        this._blockActions(false);

                    return result;
                }).catch(e => {
                    this._setIsBusy(this._queue.getQueueLength() > 0);
                    this._blockActions(false);

                    return Promise.reject(e);
                });
            });
        }

        protected _initializeActions() {
            Action.addActions(this.service, this, this.actions, this._actionNames);
            this.actions.forEach(a => {
                this.actions[a.name] = a;
            });
        }

        private _blockActions(block: boolean) {
            this.actions.forEach(action => {
                action.block = block;
            });
        }
    }

    export enum PersistentObjectLayoutMode {
        FullPage,
        MasterDetail
    }

    export class PersistentObject extends ServiceObjectWithActions {
        private _isSystem: boolean;
        private _lastResult: any;
        private _lastResultBackup: any;
        private securityToken: string;
        private _isEditing: boolean = false;
        private _isDirty: boolean = false;
        private _inputs: linqjs.Dictionary<string, HTMLInputElement> = Enumerable.empty<string>().toDictionary(i => i, i => null);
        private _id: string;
        private _type: string;
        private _breadcrumb: string;
        private _isDeleted: boolean;
        private _tabs: PersistentObjectTab[];

        fullTypeName: string;
        label: string;
        objectId: string;
        isHidden: boolean;
        isNew: boolean;
        isReadOnly: boolean;
        queryLayoutMode: PersistentObjectLayoutMode;
        newOptions: string;
        ignoreCheckRules: boolean;
        stateBehavior: string;
        parent: PersistentObject;
        ownerDetailAttribute: PersistentObjectAttributeAsDetail;
        ownerAttributeWithReference: PersistentObjectAttributeWithReference;
        ownerPersistentObject: PersistentObject;
        ownerQuery: Query;
        bulkObjectIds: string;
        queriesToRefresh: Array<string> = [];
        attributes: PersistentObjectAttribute[];
        queries: Query[];

        constructor(service: Service, po: any) {
            super(service, (po._actionNames || po.actions || []).map(a => a == "Edit" && po.isNew ? "Save" : a));

            this._id = po.id;
            this._isSystem = !!po.isSystem;
            this._type = po.type;
            this.label = po.label;
            this.fullTypeName = po.fullTypeName;
            this.queryLayoutMode = po.queryLayoutMode === "FullPage" ? PersistentObjectLayoutMode.FullPage : PersistentObjectLayoutMode.MasterDetail;
            this.objectId = po.objectId;
            this._breadcrumb = po.breadcrumb;
            this.notification = po.notification;
            this.notificationType = typeof (po.notificationType) == "number" ? po.notificationType : NotificationType[<string>po.notificationType];
            this.isNew = !!po.isNew;
            this.newOptions = po.newOptions;
            this.isReadOnly = !!po.isReadOnly;
            this.isHidden = !!po.isHidden;
            this.ignoreCheckRules = !!po.ignoreCheckRules;
            this.stateBehavior = po.stateBehavior || "None";
            this.setIsEditing(false);
            this.securityToken = po.securityToken;
            this.bulkObjectIds = po.bulkObjectIds;
            this.queriesToRefresh = po.queriesToRefresh || [];
            this.parent = po.parent != null ? service.hooks.onConstructPersistentObject(service, po.parent) : null;

            this.attributes = po.attributes ? Enumerable.from<PersistentObjectAttribute>(po.attributes).select(attr => this._createPersistentObjectAttribute(attr)).toArray() : [];
            this.attributes.forEach(attr => this.attributes[attr.name] = attr);

            this.queries = po.queries ? Enumerable.from<Query>(po.queries).select(query => service.hooks.onConstructQuery(service, query, this)).orderBy(q => q.offset).toArray() : [];
            this.queries.forEach(query => this.queries[query.name] = query);

            var visibility = this.isNew ? "New" : "Read";
            var attributeTabs = po.tabs ? Enumerable.from<PersistentObjectTab>(Enumerable.from(this.attributes).where(attr => attr.visibility == "Always" || attr.visibility.contains(visibility)).orderBy(attr => attr.offset).groupBy(attr => attr.tabKey, attr => attr).select(attributesByTab => {
                var groups = attributesByTab.orderBy(attr => attr.offset).groupBy(attr => attr.groupKey, attr => attr).select(attributesByGroup => {
                    var newGroup = this.service.hooks.onConstructPersistentObjectAttributeGroup(service, attributesByGroup.key(), attributesByGroup, this);
                    attributesByGroup.forEach(attr => attr.group = newGroup);

                    return newGroup;
                }).memoize();
                groups.toArray().forEach((g, n) => g.index = n);

                var serviceTab = po.tabs[attributesByTab.key()] || {};
                var newTab = this.service.hooks.onConstructPersistentObjectAttributeTab(service, groups, attributesByTab.key(), serviceTab.id, serviceTab.name, serviceTab.layout, this, serviceTab.columnCount, !this.isHidden);
                attributesByTab.forEach(attr => attr.tab = newTab);

                return newTab;
            })).toArray() : [];
            this._tabs = attributeTabs.concat(Enumerable.from(this.queries).select(q => <PersistentObjectTab>this.service.hooks.onConstructPersistentObjectQueryTab(this.service, q)).toArray());

            if (this._tabs.length == 0)
                this._tabs = [this.service.hooks.onConstructPersistentObjectAttributeTab(service, Enumerable.empty<PersistentObjectAttributeGroup>(), "", "", "", null, this, 0, true)];

            this._lastResult = po;

            if (this.isNew || this.stateBehavior == "OpenInEdit" || this.stateBehavior.indexOf("OpenInEdit") >= 0 || this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                this.beginEdit();

            this._initializeActions();
        }

        private _createPersistentObjectAttribute(attr: PersistentObjectAttribute): PersistentObjectAttribute {
            if ((<PersistentObjectAttributeWithReference>attr).displayAttribute || (<PersistentObjectAttributeWithReference>attr).objectId)
                return this.service.hooks.onConstructPersistentObjectAttributeWithReference(this.service, attr, this);

            if ((<PersistentObjectAttributeAsDetail>attr).objects || (<PersistentObjectAttributeAsDetail>attr).details)
                return this.service.hooks.onConstructPersistentObjectAttributeAsDetail(this.service, attr, this);

            return this.service.hooks.onConstructPersistentObjectAttribute(this.service, attr, this);
        }

        get id(): string {
            return this._id;
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get type(): string {
            return this._type;
        }

        get isBulkEdit(): boolean {
            return this.bulkObjectIds && this.bulkObjectIds.length > 0;
        }

        get tabs(): PersistentObjectTab[] {
            return this._tabs;
        }

        set tabs(tabs: PersistentObjectTab[]) {
            var oldTabs = this._tabs;
            this.notifyPropertyChanged("tabs", this._tabs = tabs, oldTabs);
        }

        get isEditing(): boolean {
            return this._isEditing;
        }
        private setIsEditing(value: boolean) {
            this._isEditing = value;
            this.actions.forEach(action => action._onParentIsEditingChanged(value));
            this.notifyPropertyChanged("isEditing", value, !value);
        }

        get breadcrumb(): string {
            return this._breadcrumb;
        }
        private _setBreadcrumb(breadcrumb: string) {
            var oldBreadcrumb = this._breadcrumb;
            if (oldBreadcrumb !== breadcrumb)
                this.notifyPropertyChanged("breadcrumb", this._breadcrumb = breadcrumb, oldBreadcrumb);
        }

        get isDirty(): boolean {
            return this._isDirty;
        }

        private _setIsDirty(value: boolean) {
            this._isDirty = value;
            this.actions.forEach(action => action._onParentIsDirtyChanged(value));

            if (this.ownerDetailAttribute && value)
                this.ownerDetailAttribute.onChanged(false);
        }

        get isDeleted(): boolean {
            return this._isDeleted;
        }

        set isDeleted(isDeleted: boolean) {
            var oldIsDeleted = this._isDeleted;
            if (oldIsDeleted !== isDeleted)
                this.notifyPropertyChanged("isDeleted", this._isDeleted = isDeleted, oldIsDeleted);
        }

        getAttribute(name: string): PersistentObjectAttribute {
            return this.attributes[name];
        }

        getAttributeValue(name: string): any {
            var attr = this.attributes[name];
            return attr != null ? attr.value : null;
        }

        getQuery(name: string): Query {
            return this.queries[name];
        }

        beginEdit() {
            if (!this.isEditing) {
                this._lastResultBackup = this._lastResult;

                this.setIsEditing(true);
            }
        }

        cancelEdit() {
            if (this.isEditing) {
                this.setIsEditing(false);
                this._setIsDirty(false);

                this.refreshFromResult(this._lastResultBackup);
                this._lastResultBackup = null;

                if (!!this.notification)
                    this.setNotification();

                if (this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                    this.beginEdit();
            }
        }

        save(waitForOwnerQuery?: boolean): Promise<boolean> {
            return this.queueWork(() => new Promise<boolean>((resolve, reject) => {
                if (this.isEditing) {
                    this.service.executeAction("PersistentObject.Save", this, null, null, null).then(po => {
                        if (po) {
                            var wasNew = this.isNew;
                            this.refreshFromResult(po);

                            if (StringEx.isNullOrWhiteSpace(this.notification) || this.notificationType != NotificationType.Error) {
                                this._setIsDirty(false);

                                if (!wasNew) {
                                    this.setIsEditing(false);
                                    if (this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                                        this.beginEdit();
                                }

                                if (this.ownerAttributeWithReference) {
                                    if (this.ownerAttributeWithReference.objectId != this.objectId) {
                                        var parent = this.ownerAttributeWithReference.parent;
                                        if (parent.ownerDetailAttribute != null)
                                            parent = parent.ownerDetailAttribute.parent;
                                        parent.beginEdit();

                                        this.ownerAttributeWithReference.changeReference([po.objectId]);
                                    }
                                    else if ((<any>this.ownerAttributeWithReference).value != this.breadcrumb)
                                        (<any>this.ownerAttributeWithReference).value = this.breadcrumb;
                                }
                                else if (this.ownerQuery)
                                    this.ownerQuery.search().then(() => {
                                        resolve(true);
                                    }, () => {
                                        resolve(true);
                                    });

                                if (waitForOwnerQuery !== true || !this.ownerQuery)
                                    resolve(true);
                            }
                            else if (!StringEx.isNullOrWhiteSpace(this.notification))
                                reject(this.notification);
                        }
                    }, e => {
                        reject(e);
                    });
                }
                else
                    resolve(true);
            }));
        }

        getRegisteredInputs(): linqjs.Enumerable<linqjs.KeyValuePair<string, HTMLInputElement>> {
            return this._inputs.toEnumerable().memoize();
        }

        hasRegisteredInput(attributeName: string): boolean {
            return !!this._inputs.contains(attributeName);
        }

        registerInput(attributeName: string, input: HTMLInputElement) {
            this._inputs.add(attributeName, input);
        }

        clearRegisteredInputs(attributeName?: string) {
            if (attributeName)
                this._inputs.remove(attributeName);
            else
                this._inputs.clear();
        }

        toServiceObject(skipParent: boolean = false): any {
            var result = this.copyProperties(["id", "type", "objectId", "isNew", "isHidden", "bulkObjectIds", "securityToken", "isSystem"]);

            if (this.parent && !skipParent)
                result.parent = this.parent.toServiceObject();
            if (this.attributes)
                result.attributes = Enumerable.from(this.attributes).select(attr => attr._toServiceObject()).toArray();

            return result;
        }

        refreshFromResult(result: PersistentObject) {
            this._lastResult = result;

            this.setNotification(result.notification, result.notificationType);

            var changedAttributes: PersistentObjectAttribute[] = [];
            var isDirty = false;

            this.attributes.removeAll(attr => {
                if (!result.attributes.some(a => a.id === attr.id)) {
                    delete this.attributes[attr.name];
                    changedAttributes.push(attr);

                    return true;
                }

                return false;
            });

            this.attributes.forEach(attr => {
                var serviceAttr = Enumerable.from(result.attributes).firstOrDefault(a => a.id == attr.id);
                if (serviceAttr) {
                    if (!(serviceAttr instanceof PersistentObjectAttribute))
                        serviceAttr = this._createPersistentObjectAttribute(serviceAttr);

                    if (attr._refreshFromResult(serviceAttr))
                        changedAttributes.push(attr);
                }

                if (attr.isValueChanged)
                    isDirty = true;
            });

            result.attributes.forEach(attr => {
                if (!this.attributes.some(a => a.id === attr.id)) {
                    this.attributes.push(attr);
                    changedAttributes.push(attr);

                    if (attr.isValueChanged)
                        isDirty = true;
                }
            });

            if (changedAttributes.length > 0) {
                var tabGroupsChanged = new Set<PersistentObjectAttributeTab>();
                var tabGroupAttributesChanged = new Set<PersistentObjectAttributeGroup>();
                var tabsRemoved = false;
                var tabsAdded = false;
                changedAttributes.forEach(attr => {
                    var tab = <PersistentObjectAttributeTab>Enumerable.from(this.tabs).firstOrDefault(t => t instanceof PersistentObjectAttributeTab && t.key === attr.tabKey);
                    if (!tab) {
                        if (!attr.isVisible)
                            return;

                        var groups = [this.service.hooks.onConstructPersistentObjectAttributeGroup(this.service, attr.groupKey, Enumerable.from([attr]), this)];
                        groups[0].index = 0;

                        var serviceTab = this._lastResult.tabs[attr.tabKey];
                        attr.tab = tab = this.service.hooks.onConstructPersistentObjectAttributeTab(this.service, Enumerable.from(groups), attr.tabKey, serviceTab.id, serviceTab.name, serviceTab.layout, this, serviceTab.columnCount, !this.isHidden);
                        this.tabs.push(tab);
                        tabsAdded = true;
                        return;
                    }

                    var group = Enumerable.from(tab.groups).firstOrDefault(g => g.key == attr.groupKey);
                    if (!group && attr.isVisible) {
                        group = this.service.hooks.onConstructPersistentObjectAttributeGroup(this.service, attr.groupKey, Enumerable.from([attr]), this);
                        tab.groups.push(group);
                        tab.groups.sort((g1, g2) => Enumerable.from(g1.attributes).min(a => a.offset) - Enumerable.from(g2.attributes).min(a => a.offset));
                        tab.groups.forEach((g, n) => g.index = n);

                        tabGroupsChanged.add(tab);
                    }
                    else if (attr.isVisible) {
                        if (group.attributes.indexOf(attr) < 0) {
                            group.attributes.push(attr);
                            tabGroupAttributesChanged.add(group);

                            group.attributes[attr.name] = attr;
                            group.attributes.sort((x, y) => x.offset - y.offset);
                        }
                    }
                    else if (group) {
                        group.attributes.remove(attr);
                        delete group.attributes[attr.name];

                        if (group.attributes.length == 0) {
                            tab.groups.remove(group);
                            tabGroupsChanged.add(tab);

                            if (tab.groups.length == 0) {
                                this.tabs.remove(tab);
                                tabsRemoved = true;
                                return;
                            }
                            else
                                tab.groups.forEach((g, n) => g.index = n);
                        }
                        else
                            tabGroupAttributesChanged.add(group);
                    }
                });

                if (tabsAdded) {
                    var attrTabs = <PersistentObjectAttributeTab[]>this.tabs.filter(t => t instanceof PersistentObjectAttributeTab);
                    attrTabs.sort((t1, t2) => Enumerable.from(t1.groups).selectMany(g => g.attributes).min(a => a.offset) - Enumerable.from(t2.groups).selectMany(g => g.attributes).min(a => a.offset));
                    this.tabs = attrTabs.concat.apply(attrTabs, this.tabs.filter(t => t instanceof PersistentObjectQueryTab));
                }
                else if (tabsRemoved)
                    this.tabs = this.tabs.slice();

                if (tabGroupsChanged.size > 0)
                    tabGroupsChanged.forEach(tab => tab.groups = tab.groups.slice());

                if (tabGroupAttributesChanged.size > 0) {
                    tabGroupAttributesChanged.forEach(group => {
                        group.attributes = group.attributes.slice();
                    });
                }
            }

            this._setIsDirty(isDirty);

            if (this.isNew) {
                this.objectId = result.objectId;
                this.isNew = result.isNew;
            }

            this.securityToken = result.securityToken;
            if (result.breadcrumb)
                this._setBreadcrumb(result.breadcrumb);

            if (result.queriesToRefresh) {
                result.queriesToRefresh.forEach(id => {
                    var query = Enumerable.from(this.queries).firstOrDefault(q => q.id == id || q.name == id);
                    if (query && (query.hasSearched || query.totalItems != null)) {
                        query.search();
                    }
                });
            }
        }

        triggerDirty() {
            this._setIsDirty(true);
        }

        _triggerAttributeRefresh(attr: PersistentObjectAttribute): Promise<boolean> {
            return this.queueWork(() => {
                return new Promise<any>((resolve, reject) => {
                    var parameters = [{ RefreshedPersistentObjectAttributeId: attr.id }];

                    this._prepareAttributesForRefresh(attr);
                    this.service.executeAction("PersistentObject.Refresh", this, null, null, parameters).then((result) => {
                        if (this.isEditing)
                            this.refreshFromResult(result);

                        resolve(true);
                    }, e=> {
                        reject(e);
                    });
                });
            });
        }

        _prepareAttributesForRefresh(sender: PersistentObjectAttribute) {
            Enumerable.from(this.attributes).where(a => a.id != sender.id).forEach(attr => {
                (<any>attr)._refreshValue = (<any>attr).value;
                if (attr instanceof PersistentObjectAttributeWithReference) {
                    var attrWithRef = <any>attr;
                    attrWithRef._refreshObjectId = attrWithRef.objectId;
                }
            });
        }
    }

    export class PersistentObjectAttribute extends ServiceObject {
        private _isSystem: boolean;
        private _lastParsedValue: string;
        private _cachedValue: any;
        private _serviceValue: string;
        private _serviceOptions: string[];
        private _displayValueSource: any;
        private _displayValue: string;
        private _validationError: string;
        private _tab: PersistentObjectAttributeTab;
        private _tabKey: string;
        private _group: PersistentObjectAttributeGroup;
        private _groupKey: string;
        private _isRequired: boolean;
        private _isReadOnly: boolean;
        private _isValueChanged: boolean;

        protected _queueRefresh: boolean = false;
        private _refreshValue: string;

        id: string;
        name: string;
        label: string;
        options: string[] | Common.KeyValuePair[];
        offset: number;
        type: string;
        toolTip: string;
        rules: string;
        visibility: string;
        typeHints: any;
        editTemplateKey: string;
        templateKey: string;
        disableSort: boolean;
        triggersRefresh: boolean;
        column: number;
        columnSpan: number;

        constructor(service: Service, attr: any, public parent: PersistentObject) {
            super(service);

            this.id = attr.id;
            this._isSystem = !!attr.isSystem;
            this.name = attr.name;
            this.type = attr.type;
            this.label = attr.label;
            this._serviceValue = attr.value !== undefined ? attr.value : null;
            this._groupKey = attr.group;
            this._tabKey = attr.tab;
            this._isReadOnly = !!attr.isReadOnly;
            this._isRequired = !!attr.isRequired;
            this._isValueChanged = !!attr.isValueChanged;
            this.offset = attr.offset || 0;
            this.toolTip = attr.toolTip;
            this.rules = attr.rules;
            this.validationError = attr.validationError;
            this.visibility = attr.visibility;
            this.typeHints = attr.typeHints || {};
            this.editTemplateKey = attr.editTemplateKey;
            this.templateKey = attr.templateKey;
            this.disableSort = !!attr.disableSort;
            this.triggersRefresh = !!attr.triggersRefresh;
            this.column = attr.column;
            this.columnSpan = attr.columnSpan || 0;
            this._setOptions(attr.options);
        }

        get groupKey(): string {
            return this._groupKey;
        }

        get group(): PersistentObjectAttributeGroup {
            return this._group;
        }
        set group(group: PersistentObjectAttributeGroup) {
            var oldGroup = this._group;
            this._group = group;

            this._groupKey = group ? group.key : null;

            this.notifyPropertyChanged("group", group, oldGroup);
        }

        get tabKey(): string {
            return this._tabKey;
        }

        get tab(): PersistentObjectAttributeTab {
            return this._tab;
        }
        set tab(tab: PersistentObjectAttributeTab) {
            var oldTab = this._tab;
            this._tab = tab;

            this._tabKey = tab ? tab.key : null;

            this.notifyPropertyChanged("tab", tab, oldTab);
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get isVisible(): boolean {
            return this.visibility.indexOf("Always") >= 0 || this.visibility.indexOf(this.parent.isNew ? "New" : "Read") >= 0;
        }

        get validationError(): string {
            return this._validationError;
        }

        set validationError(error: string) {
            var oldValidationError = this._validationError;
            if (oldValidationError != error)
                this.notifyPropertyChanged("validationError", this._validationError = error, oldValidationError);
        }

        get isRequired(): boolean {
            return this._isRequired;
        }

        private _setIsRequired(isRequired: boolean) {
            var oldIsRequired = this._isRequired;
            if (oldIsRequired !== isRequired)
                this.notifyPropertyChanged("isRequired", this._isRequired = isRequired, oldIsRequired);
        }

        get isReadOnly(): boolean {
            return this._isReadOnly;
        }

        private _setIsReadOnly(isReadOnly: boolean) {
            var oldisReadOnly = this._isReadOnly;
            if (oldisReadOnly !== isReadOnly)
                this.notifyPropertyChanged("isReadOnly", this._isReadOnly = isReadOnly, oldisReadOnly);
        }

        get displayValue(): string {
            if (this._displayValueSource == this._serviceValue)
                return !StringEx.isNullOrEmpty(this._displayValue) ? this._displayValue : "—";

            var format = this.getTypeHint("DisplayFormat", "{0}");

            var value = this.value;
            if (value != null && (this.type == "Boolean" || this.type == "NullableBoolean" || this.type == "YesNo"))
                value = this.service.getTranslatedMessage(value ? this.getTypeHint("TrueKey", "Yes") : this.getTypeHint("FalseKey", "No"));
            else if (this.type == "KeyValueList") {
                if (this.options && this.options.length > 0) {
                    var isEmpty = StringEx.isNullOrEmpty(value);
                    var option = Enumerable.from(<Common.KeyValuePair[]>this.options).firstOrDefault(o => o.key == value || (isEmpty && StringEx.isNullOrEmpty(o.key)));
                    if (this.isRequired && option == null)
                        option = Enumerable.from(<Common.KeyValuePair[]>this.options).firstOrDefault(o => StringEx.isNullOrEmpty(o.key));

                    if (option != null)
                        value = option.value;
                    else if (this.isRequired)
                        value = this.options.length > 0 ? (<Common.KeyValuePair>this.options[0]).value : null;
                }
            }
            else if (value != null && (this.type == "Time" || this.type == "NullableTime")) {
                value = value.trimEnd('0').trimEnd('.');
                if (value.startsWith('0:'))
                    value = value.substr(2);
                if (value.endsWith(':00'))
                    value = value.substr(0, value.length - 3);
            } else if (value != null && (this.type == "User" || this.type == "NullableUser") && this.options.length > 0)
                value = this.options[0];

            if (format == "{0}") {
                if (this.type == "Date" || this.type == "NullableDate")
                    format = "{0:" + CultureInfo.currentCulture.dateFormat.shortDatePattern + "}";
                else if (this.type == "DateTime" || this.type == "NullableDateTime")
                    format = "{0:" + CultureInfo.currentCulture.dateFormat.shortDatePattern + " " + CultureInfo.currentCulture.dateFormat.shortTimePattern + "}";
            }

            this._displayValueSource = this._serviceValue;
            return !StringEx.isNullOrEmpty(this._displayValue = value != null ? StringEx.format(format, value) : null) ? this._displayValue : "—";
        }

        get value(): any {
            if (this._lastParsedValue !== this._serviceValue) {
                this._lastParsedValue = this._serviceValue;

                if (!this.parent.isBulkEdit || !!this._serviceValue)
                    this._cachedValue = Service.fromServiceString(this._serviceValue, this.type);
                else
                    this._cachedValue = null;
            }

            return this._cachedValue;
        }

        set value(val: any) {
            this.setValue(val);
        }

        setValue(val: any, allowRefresh: boolean = true): Promise<any> {
            return new Promise<any>((resolve, reject) => {
                if (!this.parent.isEditing || this.isReadOnly) {
                    resolve(this.value);
                    return;
                }

                var newServiceValue = Service.toServiceString(val, this.type);
                var queuedTriggersRefresh = null;

                // If value is equal
                if (this._cachedValue === val || (this._serviceValue == null && StringEx.isNullOrEmpty(newServiceValue)) || this._serviceValue == newServiceValue) {
                    if (allowRefresh && this._queueRefresh)
                        queuedTriggersRefresh = this._triggerAttributeRefresh();
                }
                else {
                    var oldDisplayValue = this.displayValue;
                    var oldServiceValue = this._serviceValue;
                    this.notifyPropertyChanged("value", this._serviceValue = newServiceValue, oldServiceValue);
                    this.isValueChanged = true;

                    var newDisplayValue = this.displayValue;
                    if (oldDisplayValue != newDisplayValue)
                        this.notifyPropertyChanged("displayValue", newDisplayValue, oldDisplayValue);

                    if (this.triggersRefresh) {
                        if (allowRefresh)
                            queuedTriggersRefresh = this._triggerAttributeRefresh();
                        else
                            this._queueRefresh = true;
                    }

                    this.parent.triggerDirty();
                }

                if (queuedTriggersRefresh)
                    queuedTriggersRefresh.then(resolve, reject);
                else
                    resolve(this.value);
            });
        }

        get isValueChanged(): boolean {
            return this._isValueChanged;
        }

        set isValueChanged(isValueChanged: boolean) {
            if (isValueChanged === this._isValueChanged)
                return;

            var oldIsValueChanged = this._isValueChanged;
            this.notifyPropertyChanged("isValueChanged", this._isValueChanged = isValueChanged, oldIsValueChanged);
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any, ignoreCasing?: boolean): string {
            if (typeHints != null) {
                if (this.typeHints != null)
                    typeHints = Vidyano.extend({}, this.typeHints, typeHints);
            }
            else
                typeHints = this.typeHints;

            if (typeHints != null) {
                var typeHint = typeHints[ignoreCasing ? name : name.toLowerCase()];

                if (typeHint != null)
                    return typeHint;
            }

            return defaultValue;
        }

        getRegisteredInput(): HTMLInputElement {
            var inputKvp = this.parent.getRegisteredInputs().firstOrDefault(kvp => kvp.key == this.name);
            return inputKvp ? inputKvp.value : null;
        }

        registerInput(input: HTMLInputElement) {
            this.parent.registerInput(this.name, input);
        }

        clearRegisteredInput() {
            this.parent.clearRegisteredInputs(this.name);
        }

        _toServiceObject() {
            var result = this.copyProperties(["id", "name", "label", "type", "isReadOnly", "triggersRefresh", "isRequired", "differsInBulkEditMode", "isValueChanged", "displayAttribute", "objectId", "visibility"]);
            result.value = this._serviceValue;

            if (this.options && this.options.length > 0 && this.isValueChanged)
                result.options = (<any[]>this.options).map(o => o ? (typeof (o) != "string" ? o.key + "=" + o.value : o) : null);
            else
                result.options = this._serviceOptions;

            return result;
        }

        _refreshFromResult(resultAttr: PersistentObjectAttribute): boolean {
            var visibilityChanged = false;

            this._setOptions(resultAttr._serviceOptions);
            this._setIsReadOnly(resultAttr.isReadOnly);
            this._setIsRequired(resultAttr.isRequired);
            if (this.visibility != resultAttr.visibility) {
                this.visibility = resultAttr.visibility;
                visibilityChanged = true;
            }
            if ((!this.isReadOnly && this._refreshValue !== undefined ? this._refreshValue : this.value) != resultAttr.value) {
                var oldDisplayValue = this.displayValue;
                var oldValue = this.value;

                this._serviceValue = resultAttr._serviceValue;
                this._lastParsedValue = undefined;

                this.notifyPropertyChanged("value", this.value, oldValue);
                this.notifyPropertyChanged("displayValue", this.displayValue, oldDisplayValue);
            }

            this._refreshValue = undefined;
            this.triggersRefresh = resultAttr.triggersRefresh;
            this.isValueChanged = resultAttr.isValueChanged;
            this.validationError = resultAttr.validationError;

            return visibilityChanged;
        }

        protected _triggerAttributeRefresh(): Promise<any> {
            this._queueRefresh = false;
            return this.parent._triggerAttributeRefresh(this);
        }

        private _setOptions(options: string[]) {
            var oldOptions = this.options ? this.options.slice() : undefined;

            if (!options || options.length == 0) {
                this.options = this._serviceOptions = options;
                return;
            }

            this._serviceOptions = <any[]>options.slice(0);
            var addEmptyOption = !this.isRequired && !options.some(o => o == null || o.startsWith("=")) && ["KeyValueList", "DropDown", "ComboBox"].indexOf(this.type) != -1;
            var keyValuePairOptionType = ["FlagsEnum", "KeyValueList", "Reference"].indexOf(this.type) != -1;

            if (!keyValuePairOptionType) {
                if (addEmptyOption)
                    options.splice(0, 0, null);

                this.options = options;
            }
            else {
                this.options = (addEmptyOption ? [{ key: null, value: "" }] : []).concat(options.map(o => {
                    var optionSplit = o.split("=", 2);
                    return {
                        key: optionSplit[0],
                        value: optionSplit[1]
                    };
                }));
            }

            this.notifyPropertyChanged("options", this.options, oldOptions);
        }
    }

    export class PersistentObjectAttributeWithReference extends PersistentObjectAttribute {
        lookup: Query;
        objectId: string;
        displayAttribute: string;
        canAddNewReference: boolean;
        selectInPlace: boolean;

        constructor(service: Service, attr: any, public parent: PersistentObject) {
            super(service, attr, parent);

            if (attr.lookup)
                this.lookup = this.service.hooks.onConstructQuery(service, attr.lookup, parent, false, 1);
            else
                this.lookup = null;

            this.objectId = typeof attr.objectId == "undefined" ? null : attr.objectId;
            this.displayAttribute = attr.displayAttribute;
            this.canAddNewReference = !!attr.canAddNewReference;
            this.selectInPlace = !!attr.selectInPlace;
        }

        addNewReference() {
            if (this.isReadOnly)
                return;

            this.service.executeAction("Query.New", this.parent, this.lookup, null, { PersistentObjectAttributeId: this.id }).then(
                po => {
                    po.ownerAttributeWithReference = this;
                    po.stateBehavior = (po.stateBehavior || "") + " OpenAsDialog";

                    this.service.hooks.onOpen(po, false, true);
                },
                error => {
                    this.parent.setNotification(error, NotificationType.Error);
                });
        }

        changeReference(selectedItems: QueryResultItem[] | string[]): Promise<boolean> {
            return this.parent.queueWork(() => new Promise<boolean>((resolve, reject) => {
                if (this.isReadOnly)
                    reject("Attribute is read-only.");
                else {
                    this.parent._prepareAttributesForRefresh(this);
                    if (selectedItems.length && selectedItems.length > 0 && typeof selectedItems[0] === "string") {
                        var selectedObjectIds = <string[]>selectedItems;
                        selectedItems = selectedObjectIds.map(id => this.service.hooks.onConstructQueryResultItem(this.service, { id: id }, null));
                    }

                    this.service.executeAction("PersistentObject.SelectReference", this.parent, this.lookup, <QueryResultItem[]>selectedItems, [{ PersistentObjectAttributeId: this.id }]).then(result => {
                        if (result)
                            this.parent.refreshFromResult(result);

                        resolve(true);
                    }, e => {
                        reject(e);
                    });
                }
            }));
        }

        getPersistentObject(): Promise<Vidyano.PersistentObject> {
            if (!this.objectId)
                return Promise.resolve(null);

            return this.parent.queueWork(() => this.service.getPersistentObject(this.parent, this.lookup.persistentObject.id, this.objectId));
        }

        _refreshFromResult(resultAttr: PersistentObjectAttribute): boolean {
            var resultAttrWithRef = <PersistentObjectAttributeWithReference>resultAttr;
            this.objectId = resultAttrWithRef.objectId;

            var visibilityChanged = super._refreshFromResult(resultAttr);

            this.displayAttribute = resultAttrWithRef.displayAttribute;
            this.canAddNewReference = resultAttrWithRef.canAddNewReference;
            this.selectInPlace = resultAttrWithRef.selectInPlace;

            return visibilityChanged;
        }
    }

    export class PersistentObjectAttributeAsDetail extends PersistentObjectAttribute {
        private _objects: PersistentObject[];
        details: Query;
        lookupAttribute: string;

        constructor(service: Service, attr: any, public parent: PersistentObject) {
            super(service, attr, parent);

            if (attr.details)
                this.details = this.service.hooks.onConstructQuery(service, attr.details, parent, true, 1);
            else
                this.details = null;

            if (attr.objects) {
                this._objects = attr.objects.map(po => {
                    var detailObj = this.service.hooks.onConstructPersistentObject(service, po);
                    detailObj.parent = this.parent;
                    detailObj.ownerDetailAttribute = this;

                    return detailObj;
                });
            }
            else
                this._objects = [];

            this.parent.propertyChanged.attach((sender, args) => {
                if (args.propertyName === "isEditing") {
                    if (args.newValue)
                        this.objects.forEach(o => o.beginEdit());
                    else
                        this.objects.forEach(o => o.cancelEdit());
                }
            });

            this.lookupAttribute = attr.lookupAttribute;
        }

        get objects(): Vidyano.PersistentObject[] {
            return this._objects;
        }
        private _setObjects(objects: Vidyano.PersistentObject[]) {
            if (objects === this._objects) {
                if (!!objects && objects.length === this._objects.length) {
                    var hasDifferences: boolean;
                    for (var n = 0; n < objects.length; n++) {
                        if (objects[n] !== this.objects[n]) {
                            hasDifferences = true;
                            break;
                        }
                    }

                    if (!hasDifferences)
                        return;
                }
            }

            var oldObjects = this.objects;
            this.notifyPropertyChanged("objects", this._objects = objects, oldObjects);
        }

        _refreshFromResult(resultAttr: PersistentObjectAttribute): boolean {
            var asDetailAttr = <PersistentObjectAttributeAsDetail>resultAttr;

            var visibilityChanged = super._refreshFromResult(resultAttr);

            if (this.objects != null && asDetailAttr.objects != null) {
                var isEditing = this.parent.isEditing;
                var oldObjects = this.objects;
                this._setObjects(asDetailAttr.objects.map(obj => {
                    obj.parent = this.parent;
                    obj.ownerDetailAttribute = this;
                    if (isEditing)
                        obj.beginEdit();
                    return obj;
                }));
            }

            return visibilityChanged;
        }

        _toServiceObject() {
            var result = super._toServiceObject();

            if (this.objects != null) {
                result.objects = this.objects.map(obj => {
                    var detailObj = obj.toServiceObject(true);
                    if (obj.isDeleted)
                        detailObj.isDeleted = true;

                    return detailObj;
                });
            }

            return result;
        }

        onChanged(allowRefresh: boolean): Promise<any> {
            return new Promise<any>((resolve, reject) => {
                if (!this.parent.isEditing || this.isReadOnly) {
                    resolve(this.value);
                    return;
                }

                this.parent.triggerDirty();
                if (this.triggersRefresh) {
                    if (allowRefresh)
                        return this._triggerAttributeRefresh();
                    else
                        this._queueRefresh = true;
                }

                resolve(this.value);
            });
        }
    }

    export class PersistentObjectTab extends Common.Observable<PersistentObjectTab> {
        tabGroupIndex: number;

        constructor(public service: Service, public name: string, public label: string, public target: ServiceObjectWithActions, public parent?: PersistentObject, private _isVisible = true) {
            super();
        }

        get isVisible(): boolean {
            return this._isVisible;
        }

        set isVisible(val: boolean) {
            var oldIsVisible = this._isVisible;
            if (oldIsVisible != val)
                this.notifyPropertyChanged("isVisible", this._isVisible = val, oldIsVisible);
        }
    }

    export class PersistentObjectAttributeTab extends PersistentObjectTab {
        private _attributes: PersistentObjectAttribute[];

        constructor(service: Service, private _groups: PersistentObjectAttributeGroup[], public key: string, public id: string, name: string, private _layout: any, po: PersistentObject, public columnCount: number, isVisible: boolean) {
            super(service, name, StringEx.isNullOrEmpty(key) ? po.label : key, po, po, isVisible);
            this.tabGroupIndex = 0;

            this._attributes = this._updateAttributes();
        }

        get layout(): any {
            return this._layout;
        }

        private _setLayout(layout: any) {
            var oldLayout = this._layout;
            this.notifyPropertyChanged("layout", this._layout = layout, oldLayout);
        }

        get attributes(): PersistentObjectAttribute[] {
            return this._attributes;
        }

        get groups(): PersistentObjectAttributeGroup[] {
            return this._groups;
        }

        set groups(groups: PersistentObjectAttributeGroup[]) {
            var oldGroups = this._groups;
            this.notifyPropertyChanged("groups", this._groups = groups, oldGroups);

            var oldAttributes = this._attributes;
            this.notifyPropertyChanged("attributes", this._attributes = this._updateAttributes(), oldAttributes);
        }

        saveLayout(layout: any): Promise<any> {
            return this.service.executeAction("System.SaveTabLayout", null, null, null, { "Id": this.id, "Layout": layout ? JSON.stringify(layout) : "" }).then(_ => {
                this._setLayout(layout);
            });
        }

        private _updateAttributes(): Vidyano.PersistentObjectAttribute[] {
            var attributes = Enumerable.from(this.groups).selectMany(grp => grp.attributes).toArray();
            attributes.forEach(attr => attributes[attr.name] = attr);

            return attributes;
        }
    }

    export class PersistentObjectQueryTab extends PersistentObjectTab {
        constructor(service: Service, public query: Query) {
            super(service, query.name, query.label, query, query.parent, !query.isHidden);
            this.tabGroupIndex = 1;
        }
    }

    export class PersistentObjectAttributeGroup extends Vidyano.Common.Observable<PersistentObjectAttributeGroup> {
        private _attributes: PersistentObjectAttribute[];
        label: string;
        index: number;

        constructor(public service: Service, public key: string, _attributes: PersistentObjectAttribute[], public parent: PersistentObject) {
            super();

            this.label = key || "";
            this.attributes = _attributes;
        }

        get attributes(): PersistentObjectAttribute[] {
            return this._attributes;
        }

        set attributes(attributes: PersistentObjectAttribute[]) {
            var oldAttributes = this._attributes;
            var newAttributes = attributes;
            newAttributes.forEach(attr => newAttributes[attr.name] = attr);

            this.notifyPropertyChanged("attributes", this._attributes = newAttributes, oldAttributes);
        }
    }

    export enum SortDirection {
        None,
        Ascending,
        Descending
    }

    export interface SortOption {
        column: QueryColumn;
        direction: SortDirection;
    }

    export interface QuerySelectAll {
        isAvailable: boolean;
        allSelected: boolean;
        inverse: boolean;
    }

    class QuerySelectAllImpl extends Vidyano.Common.Observable<QuerySelectAll> implements QuerySelectAll {
        private _allSelected: boolean = false;
        private _inverse: boolean = false;

        constructor(private _query: Query, private _isAvailable: boolean, observer: Common.PropertyChangedObserver<QuerySelectAllImpl>) {
            super();

            this.propertyChanged.attach(observer);
        }

        get isAvailable(): boolean {
            if (this._query.maxSelectedItems)
                return;

            return this._isAvailable;
        }

        set isAvailable(isAvailable: boolean) {
            if (this._query.maxSelectedItems)
                return;

            if (this._isAvailable === isAvailable)
                return;

            this.allSelected = this.inverse = false;

            var oldValue = this._isAvailable;
            this.notifyPropertyChanged("isAvailable", this._isAvailable = isAvailable, oldValue);
        }

        get allSelected(): boolean {
            return this._allSelected;
        }

        set allSelected(allSelected: boolean) {
            if (!this.isAvailable)
                return;

            if (this._allSelected === allSelected)
                return;

            var oldInverse = this._inverse;
            if (oldInverse)
                this._inverse = false;

            var oldValue = this._allSelected;
            this.notifyPropertyChanged("allSelected", this._allSelected = allSelected, oldValue);

            if (oldInverse)
                this.notifyPropertyChanged("inverse", this._inverse, oldValue);
        }

        get inverse(): boolean {
            return this._inverse;
        }

        set inverse(inverse: boolean) {
            if (!this.isAvailable)
                return;

            if (this._inverse === inverse)
                return;

            var oldValue = this._inverse;
            this.notifyPropertyChanged("inverse", this._inverse = inverse, oldValue);
        }
    }

    export class Query extends ServiceObjectWithActions {
        private _lastResult: any;
        private _asLookup: boolean;
        private _isSelectionModifying: boolean;
        private _totalItems: number;
        private _labelWithTotalItems: string;
        private _sortOptions: SortOption[];
        private _queriedPages: Array<number> = [];
        private _filters: QueryFilters;
        private _canFilter: boolean;
        private _canRead: boolean;
        private _canReorder: boolean;
        private _charts: linqjs.Enumerable<QueryChart> = null;
        private _defaultChartName: string = null;
        private _currentChart: QueryChart = null;
        private _lastUpdated: Date;
        private _isReorderable: boolean;
        private _totalItem: QueryResultItem;
        private _isSystem: boolean;

        persistentObject: PersistentObject;
        columns: QueryColumn[];
        id: string;
        name: string;
        autoQuery: boolean;
        isHidden: boolean;
        hasSearched: boolean;
        label: string;
        singularLabel: string;
        offset: number;
        textSearch: string;
        pageSize: number;
        skip: number;
        top: number;
        items: QueryResultItem[];
        groupingInfo: {
            groupedBy: string;
            type: string;
            groups: {
                name: string;
                start: number;
                count: number;
                end: number;
            }[];
        };
        selectAll: QuerySelectAll;

        constructor(service: Service, query: any, public parent?: PersistentObject, asLookup: boolean = false, public maxSelectedItems?: number) {
            super(service, query._actionNames || query.actions);

            this._asLookup = asLookup;
            this._isSystem = !!query.isSystem;
            this.id = query.id;
            this.name = query.name;
            this.autoQuery = query.autoQuery;
            if (!this.autoQuery)
                this.items = [];

            this._canRead = !!query.canRead;
            this._canReorder = !!query.canReorder && !asLookup;
            this.isHidden = query.isHidden;
            this.label = query.label;
            this.notification = query.notification;
            this.notificationType = typeof (query.notificationType) == "number" ? query.notificationType : NotificationType[<string>query.notificationType];
            this.offset = query.offset || 0;
            this.textSearch = query.textSearch || "";
            this.pageSize = query.pageSize;
            this.skip = query.skip;
            this.top = query.top;
            this.groupingInfo = query.groupingInfo;

            this.persistentObject = query.persistentObject instanceof Vidyano.PersistentObject ? query.persistentObject : service.hooks.onConstructPersistentObject(service, query.persistentObject);
            this.singularLabel = this.persistentObject.label;

            this._updateColumns(query.columns);
            this._initializeActions();
            this.selectAll = new QuerySelectAllImpl(this, !!query.isSystem && !query.maxSelectedItems && this.actions.some(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue), this._selectAllPropertyChanged.bind(this));

            this._setTotalItems(query.totalItems);
            this._setSortOptionsFromService(query.sortOptions);

            if (query.disableBulkEdit) {
                var bulkEdit = <Action>this.actions["BulkEdit"];
                if (bulkEdit)
                    bulkEdit.selectionRule = count => count == 1;
            }

            if (!asLookup && query.filters && !(query.filters instanceof PersistentObject))
                this._filters = new QueryFilters(this, service.hooks.onConstructPersistentObject(service, query.filters));
            else
                this._filters = null;

            this._canFilter = this._filters && this.actions.some(a => a.name === "Filter") && this.columns.some(c => c.canFilter);

            if (query.result)
                this._setResult(query.result);
            else {
                this.items = [];
                this._labelWithTotalItems = this.label;
                this._lastUpdated = new Date();
            }
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get filters(): QueryFilters {
            return this._filters;
        }

        get canFilter(): boolean {
            return this._canFilter;
        }

        get canRead(): boolean {
            return this._canRead;
        }

        get canReorder(): boolean {
            return this._canReorder;
        }

        get charts(): linqjs.Enumerable<QueryChart> {
            return this._charts;
        }

        private _setCharts(charts: linqjs.Enumerable<QueryChart>) {
            if (this._charts && charts && !this._charts.isEmpty() && this._charts.count() === charts.count() && this._charts.orderBy(c => c.name).toArray().join("\n") === charts.orderBy(c => c.name).toArray().join("\n"))
                return;

            var oldCharts = this._charts;
            this.notifyPropertyChanged("charts", this._charts = Enumerable.from(charts).memoize(), oldCharts);

            if (charts && this.defaultChartName && !this.currentChart)
                this.currentChart = this.charts.firstOrDefault(c => c.name === this._defaultChartName);
        }

        get currentChart(): QueryChart {
            return this._currentChart;
        }

        set currentChart(currentChart: QueryChart) {
            if (this._currentChart === currentChart)
                return;

            var oldCurrentChart = this._currentChart;
            this.notifyPropertyChanged("currentChart", this._currentChart = currentChart !== undefined ? currentChart : null, oldCurrentChart);
        }

        get defaultChartName(): string {
            return this._defaultChartName;
        }

        set defaultChartName(defaultChart: string) {
            if (this._defaultChartName === defaultChart)
                return;

            var oldDefaultChart = this._defaultChartName;
            this.notifyPropertyChanged("defaultChartName", this._defaultChartName = defaultChart !== undefined ? defaultChart : null, oldDefaultChart);

            if (this.charts && defaultChart && !this.currentChart)
                this.currentChart = this.charts.firstOrDefault(c => c.name === this._defaultChartName);
        }

        get lastUpdated(): Date {
            return this._lastUpdated;
        }

        private _setLastUpdated(date: Date = new Date()) {
            if (this._lastUpdated === date)
                return;

            var oldLastUpdated = this._lastUpdated;
            this.notifyPropertyChanged("lastUpdated", this._lastUpdated = date, oldLastUpdated);
        }

        get selectedItems(): QueryResultItem[] {
            return this.items ? this.items.filter(i => i.isSelected) : [];
        }

        set selectedItems(items: QueryResultItem[]) {
            try {
                this._isSelectionModifying = true;
                items = items || [];

                var selectedItems = this.selectedItems;
                if (selectedItems && selectedItems.length > 0)
                    selectedItems.forEach(item => item.isSelected = false);

                items.forEach(item => item.isSelected = true);
                this.notifyPropertyChanged("selectedItems", items);
            }
            finally {
                this._isSelectionModifying = false;
            }
        }

        private _selectAllPropertyChanged(selectAll: QuerySelectAllImpl, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName == "allSelected")
                this.selectedItems = this.selectAll.allSelected ? this.items : [];
        }

        selectRange(from: number, to: number): boolean {
            var selectionUpdated: boolean;

            try {
                this._isSelectionModifying = true;
                var itemsToSelect = this.items.slice(from, ++to);

                if (this.maxSelectedItems && Enumerable.from(this.selectedItems.concat(itemsToSelect)).distinct().count() > this.maxSelectedItems)
                    return;

                // Detect if array has gaps
                if (Object.keys(itemsToSelect).length == to - from) {
                    itemsToSelect.forEach(item => {
                        item.isSelected = true;
                    });

                    selectionUpdated = itemsToSelect.length > 0;
                    this.notifyPropertyChanged("selectedItems", this.selectedItems);
                    return true;
                }

                return false;
            }
            finally {
                this._isSelectionModifying = false;

                if (selectionUpdated)
                    this._updateSelectAll();
            }
        }

        get asLookup(): boolean {
            return this._asLookup;
        }

        get totalItems(): number {
            return this._totalItems;
        }

        get labelWithTotalItems(): string {
            return this._labelWithTotalItems;
        }

        get sortOptions(): SortOption[] {
            return this._sortOptions;
        }

        get totalItem(): QueryResultItem {
            return this._totalItem;
        }

        private _setTotalItem(item: QueryResultItem) {
            if (this._totalItem === item)
                return;

            var oldTotalItem = this._totalItem;
            this.notifyPropertyChanged("totalItem", this._totalItem = item, oldTotalItem);
        }

        set sortOptions(options: SortOption[]) {
            if (this._sortOptions === options)
                return;

            var oldSortOptions = this._sortOptions;
            this.notifyPropertyChanged("sortOptions", this._sortOptions = options, oldSortOptions);
        }

        reorder(before: QueryResultItem, item: QueryResultItem, after: QueryResultItem): Promise<QueryResultItem[]> {
            if (!this.canReorder)
                return Promise.reject("Unable to reorder, canReorder is set to false.");

            this.queueWork(() => this.service.executeAction("QueryOrder.Reorder", this.parent, this, [before, item, after]).then(po => {
                this._setResult(po.queries[0]._lastResult);
                return this.items;
            }));
        }

        private _setSortOptionsFromService(options: string | SortOption[]) {
            var oldSortOptions = this._sortOptions;

            var newSortOptions: SortOption[];
            if (typeof options === "string") {
                if (!StringEx.isNullOrEmpty(options)) {
                    newSortOptions = [];
                    options.split(';').map(option => option.trim()).forEach(option => {
                        var optionParts = option.split(' ', 2).map(option => option.trim());
                        var col = this.getColumn(optionParts[0]);
                        if (col) {
                            newSortOptions.push({
                                column: col,
                                direction: optionParts.length < 2 || optionParts[1].toUpperCase() == "ASC" ? SortDirection.Ascending : SortDirection.Descending
                            });
                        }
                    });
                }
            }
            else
                newSortOptions = !!options ? options.slice(0) : [];

            this.sortOptions = newSortOptions;
        }

        private _setTotalItems(items: number) {
            if (this._totalItems === items)
                return;

            var oldTotalItems = this._totalItems;
            this.notifyPropertyChanged("totalItems", this._totalItems = items, oldTotalItems);

            var oldLabelWithTotalItems = this._labelWithTotalItems;
            this._labelWithTotalItems = (this.totalItems != null ? this.totalItems + " " : "") + (this.totalItems != 1 ? this.label : (this.singularLabel || this.persistentObject.label || this.persistentObject.type));
            this.notifyPropertyChanged("labelWithTotalItems", this._labelWithTotalItems, oldLabelWithTotalItems);
        }

        _toServiceObject() {
            var result = this.copyProperties(["id", "isSystem", "name", "label", "pageSize", "skip", "top", "textSearch"]);
            if (this.selectAll.allSelected) {
                result["allSelected"] = true;
                if (this.selectAll.inverse)
                    result["allSelectedInversed"] = true;
            }

            result["sortOptions"] = this.sortOptions ? this.sortOptions.filter(option => option.direction !== SortDirection.None).map(option => option.column.name + (option.direction == SortDirection.Ascending ? " ASC" : " DESC")).join("; ") : "";

            if (this.persistentObject)
                result.persistentObject = this.persistentObject.toServiceObject();

            result.columns = Enumerable.from(this.columns).select(col => col._toServiceObject()).toArray();

            return result;
        }

        _setResult(result: any) {
            this._lastResult = result;

            this.pageSize = result.pageSize || 0;

            this.groupingInfo = result.groupingInfo;
            if (this.groupingInfo) {
                var start = 0;
                this.groupingInfo.groups.forEach(g => {
                    g.start = start;
                    g.end = (start = start + g.count) - 1;
                });
            }

            if (this.pageSize > 0) {
                this._setTotalItems(result.totalItems || 0);
                this._queriedPages.push(Math.floor((this.skip || 0) / this.pageSize));
            }
            else
                this._setTotalItems(result.items.length);

            this.hasSearched = true;
            this._updateColumns(result.columns);
            this._updateItems(Enumerable.from(result.items).select(item => this.service.hooks.onConstructQueryResultItem(this.service, item, this)).toArray());
            this._setSortOptionsFromService(result.sortOptions);

            this._setTotalItem(result.totalItem != null ? this.service.hooks.onConstructQueryResultItem(this.service, result.totalItem, this) : null);

            this.setNotification(result.notification, result.notificationType);

            if ((this._charts && this._charts.count() > 0) || (result.charts && result.charts.length > 0))
                this._setCharts(Enumerable.from(result.charts).select(c => new QueryChart(this, c.label, c.name, c.options, c.type)).memoize());

            this._setLastUpdated();
        }

        getColumn(name: string): QueryColumn {
            return Enumerable.from(this.columns).firstOrDefault(c => c.name == name);
        }

        getItemsInMemory(start: number, length: number): QueryResultItem[] {
            if (!this.hasSearched)
                return null;

            if (this.totalItems >= 0) {
                if (start > this.totalItems)
                    start = this.totalItems;

                if (start + length > this.totalItems)
                    length = this.totalItems - start;
            }

            if (this.pageSize <= 0 || length == 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();

            var startPage = Math.floor(start / this.pageSize);
            var endPage = Math.floor((start + length - 1) / this.pageSize);

            while (startPage < endPage && this._queriedPages.indexOf(startPage) >= 0)
                startPage++;
            while (endPage > startPage && this._queriedPages.indexOf(endPage) >= 0)
                endPage--;

            if (startPage == endPage && this._queriedPages.indexOf(startPage) >= 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();

            return null;
        }

        getItems(start: number, length: number = this.pageSize, skipQueue: boolean = false): Promise<QueryResultItem[]> {
            if (!this.hasSearched)
                return this.search(0).then(() => this.getItems(start, length));
            else {
                if (this.totalItems >= 0) {
                    if (start > this.totalItems)
                        start = this.totalItems;

                    if (start + length > this.totalItems)
                        length = this.totalItems - start;
                }

                if (this.pageSize <= 0 || length == 0)
                    return Promise.resolve(this.items.slice(start, start + length));

                var startPage = Math.floor(start / this.pageSize);
                var endPage = Math.floor((start + length - 1) / this.pageSize);

                while (startPage < endPage && this._queriedPages.indexOf(startPage) >= 0)
                    startPage++;
                while (endPage > startPage && this._queriedPages.indexOf(endPage) >= 0)
                    endPage--;

                if (startPage == endPage && this._queriedPages.indexOf(startPage) >= 0)
                    return Promise.resolve(this.items.slice(start, start + length));

                var clonedQuery = this.clone(this._asLookup);
                clonedQuery.skip = startPage * this.pageSize;
                clonedQuery.top = (endPage - startPage + 1) * this.pageSize;

                const work = () => {
                    if (Enumerable.rangeTo(startPage, endPage).all(p => this._queriedPages.indexOf(p) >= 0))
                        return Promise.resolve(this.items.slice(start, start + length));

                    return this.service.executeQuery(this.parent, clonedQuery, this._asLookup).then(result => {
                        for (var p = startPage; p <= endPage; p++)
                            this._queriedPages.push(p);

                        var isChanged = this.pageSize > 0 && result.totalItems != this.totalItems;
                        if (isChanged) {
                            // NOTE: Query has changed (items added/deleted) so remove old data
                            this._queriedPages = [];
                            for (var i = startPage; i <= endPage; i++)
                                this._queriedPages.push(i);

                            if (!this.selectAll.allSelected) {
                                var selectedItems = {};
                                this.selectedItems.forEach(i => selectedItems[i.id] = i);
                            }

                            this.items = [];
                            this._setTotalItems(result.totalItems);
                        }

                        for (var n = 0; n < clonedQuery.top && (clonedQuery.skip + n < clonedQuery.totalItems); n++) {
                            if (this.items[clonedQuery.skip + n] == null) {
                                var item = this.items[clonedQuery.skip + n] = this.service.hooks.onConstructQueryResultItem(this.service, result.items[n], this);
                                if (this.selectAll.allSelected || (selectedItems && selectedItems[item.id]))
                                    (<any>item)._isSelected = true;
                            }
                        }

                        if (isChanged)
                            return this.getItems(start, length, true).then(result => {
                                this.notifyPropertyChanged("items", this.items);

                                return result;
                            });

                        this._setLastUpdated();

                        return Promise.resolve(this.items.slice(start, start + length));
                    }, e => {
                        this.setNotification(e, NotificationType.Error);
                        return Promise.reject(e);
                    });
                };

                if (!skipQueue)
                    return this.queueWork(work, false);
                else
                    return work();
            }
        }

        search(delay?: number): Promise<QueryResultItem[]> {
            var search = () => {
                this._queriedPages = [];
                this._updateItems([], true);

                var now = new Date();
                return this.queueWork(() => {
                    if (this._lastUpdated && this._lastUpdated > now)
                        return Promise.resolve(this.items);

                    return this.service.executeQuery(this.parent, this, this._asLookup).then(result => {
                        if (!this._lastUpdated || this._lastUpdated <= now) {
                            this.hasSearched = true;
                            this._setResult(result);
                        }

                        return this.items;
                    });
                }, false);
            };

            if (delay === 0)
                return search();
            else {
                if (delay > 0) {
                    var now = new Date();
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            if (!this._lastUpdated || this._lastUpdated <= now)
                                search().then(result => resolve(result), e => reject(e));
                            else
                                resolve(this.items);
                        }, delay);
                    });
                }
                else
                    return search();
            }
        }

        clone(asLookup: boolean = false): Query {
            return this.service.hooks.onConstructQuery(this.service, this, this.parent, asLookup);
        }

        private _updateColumns(_columns: any[] = []) {
            var oldColumns = this.columns ? this.columns.slice(0) : this.columns;
            var columns = this.columns || [];
            var columnsChanged = columns != this.columns;

            var _columnsEnum = Enumerable.from(_columns || []);
            var i = columns.length;

            while (i--) {
                if (_columnsEnum.firstOrDefault(c => columns[i].name == c.name) == null) {
                    let column = columns.splice(i, 1)[0];
                    columns[column.name] = undefined;
                    columnsChanged = true;
                }
            }
            _columns.forEach(c => {
                if (!columns[c.name]) {
                    columns.push(columns[c.name] = this.service.hooks.onConstructQueryColumn(this.service, c, this));
                    columnsChanged = true;
                }
            });

            columns.sort((c1, c2) => c1.offset - c2.offset);

            columns.forEach(c => {
                if (c.distincts)
                    c.distincts.isDirty = true;
            });

            if (columnsChanged) {
                if (this.columns != columns)
                    this.columns = columns;

                this.notifyPropertyChanged("columns", this.columns, oldColumns);
            }
        }

        private _updateItems(items: QueryResultItem[], reset: boolean = false) {
            if (reset) {
                this.hasSearched = false;
                this._setTotalItems(null);
            }

            this.selectAll.inverse = this.selectAll.allSelected = false;

            var oldItems = this.items;
            this.notifyPropertyChanged("items", this.items = items, oldItems);
            this.selectedItems = this.selectedItems;
        }

        private _notifyItemSelectionChanged(item: QueryResultItem) {
            if (this._isSelectionModifying)
                return;

            var selectedItems = this.selectedItems;
            if (this.maxSelectedItems && selectedItems.length > this.maxSelectedItems) {
                try {
                    this._isSelectionModifying = true;
                    selectedItems.filter(i => i != item && selectedItems.length > this.maxSelectedItems).forEach(i => i.isSelected = false);
                    selectedItems = this.selectedItems;
                } finally {
                    this._isSelectionModifying = false;
                }
            }

            this._updateSelectAll(item, selectedItems);

            this.notifyPropertyChanged("selectedItems", selectedItems);
        }

        private _updateSelectAll(item?: QueryResultItem, selectedItems: QueryResultItem[] = this.selectedItems) {
            if (this.selectAll.isAvailable) {
                if (this.selectAll.allSelected) {
                    if (!this.items.some(i => i.isSelected))
                        this.selectAll.allSelected = false;
                    else {
                        if (item && !item.isSelected)
                            this.selectAll.inverse = true;
                        else if (!this.items.some(i => !i.isSelected))
                            this.selectAll.inverse = false;
                    }
                }
                else if (selectedItems.length == this.totalItems)
                    this.selectAll.allSelected = true;
            }
        }

        static FromJsonData(service: Service, data: JsonQueryData): Query {
            const query = {
                actions: [],
                allowTextSearch: false,
                autoQuery: true,
                canRead: false,
                columns: data.columns,
                disableBulkEdit: true,
                filters: {},
                id: data.id || Unique.get(),
                label: data.label,
                name: data.name || data.label,
                persistentObject: { label: data.singularLabel },
                result: data
            };

            return new Query(service, query);
        }
    }

    export interface JsonQueryData {
        id?: string;
        name?: string;
        label?: string;
        singularLabel?: string;

        items: {
            id: string | number;
            breadcrumb?: string;
            typeHints?: { [name: string]: string };
            values: {
                key: string;
                value: string;
                typeHints?: { [name: string]: string };
            }[];
        }[];

        columns: {
            name: string;
            label: string;
            type: string;
            width?: string;
            typeHints?: { [name: string]: string };
        }[];
    }

    export class QueryColumn extends ServiceObject {
        private displayAttribute: string;
        private _sortDirection: SortDirection;
        private _canSort: boolean;
        private _canFilter: boolean;
        private _canListDistincts: boolean;
        private _name: string;
        private _type: string;
        private _label: string;
        private _distincts: QueryColumnDistincts;
        private _selectedDistincts: linqjs.Enumerable<string>;
        private _selectedDistinctsInversed: boolean;
        private _total: QueryResultItemValue;

        offset: number;
        isPinned: boolean;
        isHidden: boolean;
        width: string;
        typeHints: any;

        constructor(service: Service, col: any, public query: Query) {
            super(service);

            this.displayAttribute = col.displayAttribute;
            this._canSort = !!col.canSort;
            this._canFilter = !!col.canFilter;
            this._canListDistincts = !!col.canListDistincts;
            if (col instanceof QueryColumn) {
                this._selectedDistincts = col._selectedDistincts;
                this._selectedDistinctsInversed = col._selectedDistinctsInversed;
            }
            else {
                this._selectedDistincts = Enumerable.from(col.includes || col.excludes || []);
                this._selectedDistinctsInversed = !!col.excludes && col.excludes.length > 0;
            }
            this._label = col.label;
            this._name = col.name;
            this.offset = col.offset || 0;
            this._type = col.type;
            this.isPinned = !!col.isPinned;
            this.isHidden = !!col.isHidden;
            this.width = col.width;
            this.typeHints = col.typeHints;
            this._sortDirection = SortDirection.None;

            query.propertyChanged.attach(this._queryPropertyChanged.bind(this));
        }

        get name(): string {
            return this._name;
        }

        get type(): string {
            return this._type;
        }

        get label(): string {
            return this._label;
        }

        get canFilter(): boolean {
            return this._canFilter;
        }

        get canSort(): boolean {
            return this._canSort;
        }

        get canListDistincts(): boolean {
            return this._canListDistincts;
        }

        get isSorting(): boolean {
            return this._sortDirection !== SortDirection.None;
        }

        get sortDirection(): SortDirection {
            return this._sortDirection;
        }

        get selectedDistincts(): linqjs.Enumerable<string> {
            return this._selectedDistincts;
        }

        set selectedDistincts(selectedDistincts: linqjs.Enumerable<string>) {
            var oldSelectedIncludes = this._selectedDistincts;

            this.notifyPropertyChanged("selectedDistincts", this._selectedDistincts = (selectedDistincts || Enumerable.empty<string>()).memoize(), oldSelectedIncludes);
            this.query.columns.forEach(c => {
                if (c === this)
                    return;

                if (c.distincts)
                    c.distincts.isDirty = true;
            });
        }

        get selectedDistinctsInversed(): boolean {
            return this._selectedDistinctsInversed;
        }

        set selectedDistinctsInversed(selectedDistinctsInversed: boolean) {
            var oldSelectedDistinctsInversed = this._selectedDistinctsInversed;

            this.notifyPropertyChanged("selectedDistinctsInversed", this._selectedDistinctsInversed = selectedDistinctsInversed, oldSelectedDistinctsInversed);
        }

        get distincts(): QueryColumnDistincts {
            return this._distincts;
        }

        set distincts(distincts: QueryColumnDistincts) {
            var oldDistincts = this._distincts;

            this.notifyPropertyChanged("distincts", this._distincts = distincts, oldDistincts);
        }

        get total(): QueryResultItemValue {
            return this._total;
        }

        private _setTotal(total: QueryResultItemValue) {
            var oldTotal = this._total;

            this.notifyPropertyChanged("total", this._total = total, oldTotal);
        }

        private _setSortDirection(direction: SortDirection) {
            if (this._sortDirection === direction)
                return;

            var oldSortDirection = this._sortDirection;
            this.notifyPropertyChanged("sortDirection", this._sortDirection = direction, oldSortDirection);
        }

        _toServiceObject() {
            var serviceObject = this.copyProperties(["id", "name", "label", "type", "displayAttribute"]);
            serviceObject.includes = !this.selectedDistinctsInversed ? this.selectedDistincts.toArray() : [];
            serviceObject.excludes = this.selectedDistinctsInversed ? this.selectedDistincts.toArray() : [];

            return serviceObject;
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any, ignoreCasing?: boolean): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }

        refreshDistincts(): Promise<QueryColumnDistincts> {
            return this.service.executeAction("QueryFilter.RefreshColumn", this.query.parent, this.query, null, [{ ColumnName: this.name }]).then(result => {
                this.query.columns.filter(q => q != this).forEach(col => {
                    if (col.distincts)
                        col.distincts.isDirty = true;
                });

                const matchingDistinctsAttr = result.attributes["MatchingDistincts"];
                const remainingDistinctsAttr = result.attributes["RemainingDistincts"];

                this.distincts = {
                    matching: <string[]>matchingDistinctsAttr.options,
                    remaining: <string[]>remainingDistinctsAttr.options,
                    isDirty: false,
                    hasMore: matchingDistinctsAttr.typeHints.hasmore || remainingDistinctsAttr.typeHints.hasmore
                };

                return this.distincts;
            });
        }

        sort(direction: SortDirection, multiSort?: boolean): Promise<QueryResultItem[]> {
            if (!!multiSort) {
                var sortOption = this.query.sortOptions.filter(option => option.column === this)[0];
                if (sortOption && sortOption.direction === direction)
                    return;

                if (!sortOption) {
                    if (direction !== SortDirection.None)
                        this.query.sortOptions = this.query.sortOptions.concat([{ column: this, direction: direction }]);
                }
                else {
                    if (direction !== SortDirection.None) {
                        sortOption.direction = direction;
                        this.query.sortOptions = this.query.sortOptions.slice();
                    }
                    else
                        this.query.sortOptions = this.query.sortOptions.filter(option => option !== sortOption);
                }
            } else
                this.query.sortOptions = direction !== SortDirection.None ? [{ column: this, direction: direction }] : [];

            return this.query.search().then(result => {
                var querySettings = (this.service.application.userSettings["QuerySettings"] || (this.service.application.userSettings["QuerySettings"] = {}))[this.query.id] || {};
                querySettings["sortOptions"] = this.query.sortOptions.filter(option => option.direction !== SortDirection.None).map(option => option.column.name + (option.direction == SortDirection.Ascending ? " ASC" : " DESC")).join("; ");

                this.service.application.userSettings["QuerySettings"][this.query.id] = querySettings;
                return this.service.application.saveUserSettings().then(() => {
                    return result;
                });
            });
        }

        private _queryPropertyChanged(sender: Vidyano.Query, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName == "sortOptions") {
                var sortOption = this.query.sortOptions ? this.query.sortOptions.filter(option => option.column === this)[0] : null;
                this._setSortDirection(sortOption ? sortOption.direction : SortDirection.None);
            } else if (args.propertyName === "totalItem")
                this._setTotal(sender.totalItem ? sender.totalItem.getFullValue(this.name) : null);
        }
    }

    export interface QueryColumnDistincts {
        matching: string[];
        remaining: string[];
        isDirty: boolean;
        hasMore: boolean;
    }

    export class QueryResultItem extends ServiceObject {
        id: string;
        breadcrumb: string;
        rawValues: linqjs.Enumerable<QueryResultItemValue>;
        typeHints: any;
        private _fullValuesByName: any;
        private _values: any;

        constructor(service: Service, item: any, public query: Query, private _isSelected: boolean) {
            super(service);

            this.id = item.id;
            this.breadcrumb = item.breadcrumb;

            if (item.values)
                this.rawValues = Enumerable.from(item.values).select(v => service.hooks.onConstructQueryResultItemValue(this.service, this, v)).memoize();
            else
                this.rawValues = Enumerable.empty<QueryResultItemValue>();

            this.typeHints = item.typeHints;
        }

        get values(): any {
            if (!this._values) {
                this._values = {};
                this.rawValues.forEach(v => {
                    var col = this.query.columns[v.key];
                    if (!col)
                        return;

                    this._values[v.key] = Service.fromServiceString(v.value, col.type);
                });
            }

            return this._values;
        }

        get isSelected(): boolean {
            return this._isSelected;
        }

        set isSelected(val: boolean) {
            if (this._isSelected == val)
                return;

            var oldIsSelected = this._isSelected;
            this.notifyPropertyChanged("isSelected", this._isSelected = val, oldIsSelected);

            (<any>this.query)._notifyItemSelectionChanged(this);
        }

        getValue(key: string): any {
            return this.values[key];
        }

        getFullValue(key: string): QueryResultItemValue {
            if (!this._fullValuesByName) {
                this._fullValuesByName = {};
                this.rawValues.forEach(v => {
                    this._fullValuesByName[v.key] = v;
                });
            }

            return this._fullValuesByName[key] || (this._fullValuesByName[key] = null);
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }

        getPersistentObject(): Promise<PersistentObject> {
            return this.query.queueWork(() => {
                return this.service.getPersistentObject(this.query.parent, this.query.persistentObject.id, this.id).then(po => {
                    po.ownerQuery = this.query;

                    return po;
                }, e => {
                    this.query.setNotification(e);
                    return null;
                });
            }, false);
        }

        _toServiceObject() {
            var result = this.copyProperties(["id"]);
            result.values = this.rawValues.select(v => v._toServiceObject()).toArray();

            return result;
        }
    }

    export class QueryResultItemValue extends ServiceObject {
        private _value: any;
        private _valueParsed: boolean;

        key: string;
        value: string;
        typeHints: any;
        persistentObjectId: string;
        objectId: string;

        constructor(service: Service, private _item: QueryResultItem, value: any) {
            super(service);

            this.key = value.key;
            this.value = value.value;
            this.persistentObjectId = value.persistentObjectId;
            this.objectId = value.objectId;
            this.typeHints = value.typeHints;
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }

        getValue(): any {
            if (this._valueParsed)
                return this._value;

            this._value = Service.fromServiceString(this.value, this._item.query.getColumn(this.key).type);
            this._valueParsed = true;

            return this._value;
        }

        _toServiceObject() {
            return this.copyProperties(["key", "value", "persistentObjectId", "objectId"]);
        }
    }

    export class QueryFilters extends Vidyano.Common.Observable<QueryFilters> {
        private _filters: QueryFilter[];
        private _currentFilter: QueryFilter;
        private _filtersAsDetail: PersistentObjectAttributeAsDetail;
        private _skipSearch: boolean;

        constructor(private _query: Query, private _filtersPO: Vidyano.PersistentObject) {
            super();

            this._filtersAsDetail = <Vidyano.PersistentObjectAttributeAsDetail>this._filtersPO.attributes["Filters"];
            this._computeFilters(true);

            var defaultFilter = Enumerable.from(this._filters).firstOrDefault(f => f.isDefault);
            if (defaultFilter) {
                this._skipSearch = true;
                try {
                    this.currentFilter = defaultFilter;
                }
                finally {
                    this._skipSearch = false;
                }
            }
        }

        get filters(): QueryFilter[] {
            return this._filters;
        }

        private _setFilters(filters: QueryFilter[]) {
            var oldFilters = this._filters;
            this.notifyPropertyChanged("filters", this._filters = filters, oldFilters);
        }

        get currentFilter(): QueryFilter {
            return this._currentFilter;
        }

        set currentFilter(filter: QueryFilter) {
            let doSearch;
            if (!!filter) {
                if (!filter.persistentObject.isNew) {
                    let columnsFilterData = Enumerable.from(JSON.parse(filter.persistentObject.getAttributeValue("Columns")));
                    this._query.columns.forEach(col => {
                        let columnFilterData = columnsFilterData.firstOrDefault(c => c.name === col.name);
                        if (columnFilterData) {
                            if (columnFilterData.includes && columnFilterData.includes.length > 0)
                                col.selectedDistincts = Enumerable.from(columnFilterData.includes);
                            else if (columnFilterData.excludes && columnFilterData.excludes.length > 0)
                                col.selectedDistincts = Enumerable.from(columnFilterData.excludes);
                            else
                                col.selectedDistincts = Enumerable.from([]);

                            col.selectedDistinctsInversed = columnFilterData.excludes && columnFilterData.excludes.length > 0;
                            col.distincts = null;

                            doSearch = doSearch || (col.selectedDistincts.isEmpty() === false);
                        }
                        else
                            col.selectedDistincts = Enumerable.empty<string>();
                    });
                }
            } else {
                this._query.columns.forEach(col => {
                    col.selectedDistincts = Enumerable.empty<string>();
                    col.selectedDistinctsInversed = false;
                    col.distincts = null;
                });

                doSearch = !!this._currentFilter;
            }

            const oldCurrentFilter = this._currentFilter;
            this.notifyPropertyChanged("currentFilter", this._currentFilter = filter, oldCurrentFilter);

            if (doSearch && !this._skipSearch)
                this._query.search();
        }

        private _getFilterPersistentObject(name: string): Vidyano.PersistentObject {
            return Enumerable.from(this._filtersAsDetail.objects).firstOrDefault(filter => filter.getAttributeValue("Name") === name);
        }

        private _computeFilters(setDefaultFilter?: boolean) {
            if (!this._filtersAsDetail) {
                this._setFilters([]);
                return;
            }

            this._setFilters(this._filtersAsDetail.objects.map(filter => new QueryFilter(filter)));

            if (setDefaultFilter)
                this._currentFilter = Enumerable.from(this._filters).firstOrDefault(f => f.persistentObject.getAttributeValue("IsDefault"));
        }

        private _computeFilterData(): string {
            return JSON.stringify(this._query.columns.filter(c => !c.selectedDistincts.isEmpty()).map(c => {
                return {
                    name: c.name,
                    includes: !c.selectedDistinctsInversed ? c.selectedDistincts.toArray() : [],
                    excludes: c.selectedDistinctsInversed ? c.selectedDistincts.toArray() : []
                };
            }));
        }

        getFilter (name: string): QueryFilter {
            return Enumerable.from(this.filters).first(f => f.name === name);
        }

        createNew(): Promise<QueryFilter> {
            var newAction = (<Action>this._filtersAsDetail.details.actions["New"]);
            newAction.skipOpen = true;

            return this._query.queueWork(() => {
                return newAction.execute().then(po => new QueryFilter(po));
            });
        }

        save(filter: QueryFilter = this.currentFilter): Promise<QueryFilter> {
            if (!filter)
                return;
            else if (filter.isLocked)
                return Promise.reject("Filter is locked.");

            this._filtersPO.beginEdit();

            if (filter === this.currentFilter || filter.persistentObject.isNew) {
                filter.persistentObject.beginEdit();
                filter.persistentObject.attributes["Columns"].setValue(this._computeFilterData());
            }

            if (filter.persistentObject.isNew)
                this._filtersAsDetail.objects.push(filter.persistentObject);

            return this._query.queueWork(() => {
                return this._filtersPO.save().then(result => {
                    this._computeFilters();
                    return this.getFilter(filter.name);
                });
            });
        }

        delete(name: string): Promise<any> {
            var filter = this.getFilter(name);
            if (!filter)
                return Promise.reject(`No filter found with name '${name}'.`);

            if (filter.isLocked)
                return Promise.reject("Filter is locked.");

            filter.persistentObject.isDeleted = true;

            return this._query.queueWork(() => {
                this._filtersPO.beginEdit();

                return this._filtersPO.save().then(result => {
                    this._computeFilters();
                    return null;
                });
            });
        }
    }

    export class QueryFilter extends Vidyano.Common.Observable<QueryFilter> {
        private _name: string

        constructor(private _po: PersistentObject) {
            super();
        }

        get name(): string {
            return this._po.getAttributeValue("Name");
        }

        get isLocked(): boolean {
            return this._po.getAttributeValue("IsLocked");
        }

        get isDefault(): boolean {
            return this._po.getAttributeValue("IsDefault");
        }

        get persistentObject(): PersistentObject {
            return this._po;
        }
    }

    export class QueryChart extends Vidyano.Common.Observable<QueryChart> {
        constructor(private _query: Vidyano.Query, private _label: string, private _name: string, private _options: any, private _type: string) {
            super();
        }

        get query(): Vidyano.Query {
            return this._query;
        }

        get label(): string {
            return this._label;
        }

        get name(): string {
            return this._name;
        }

        get options(): any {
            return this._options;
        }

        get type(): string {
            return this._type;
        }

        execute(parameters: any = {}): Promise<any> {
            return this._query.service.executeAction("QueryFilter.Chart", this._query.parent, this._query, null, Vidyano.extend(parameters, { name: this.name })).then(result => JSON.parse(result.getAttributeValue("Data")));
        }
    }

    export class Action extends ServiceObject {
        private _targetType: string;
        private _target: ServiceObjectWithActions;
        private _query: Query;
        private _parent: PersistentObject;
        private _isVisible: boolean = true;
        private _canExecute: boolean;
        private _block: boolean;
        private _parameters: any = {};
        private _offset: number;
        protected _isPinned: boolean;
        private _options: string[] = [];
        skipOpen: boolean;
        selectionRule: (count: number) => boolean;
        displayName: string;
        dependentActions = [];

        constructor(public service: Service, public definition: ActionDefinition, public owner: ServiceObjectWithActions) {
            super(service);

            this.displayName = definition.displayName;
            this.selectionRule = definition.selectionRule;
            this._isPinned = definition.isPinned;

            if (owner instanceof Query) {
                this._targetType = "Query";
                this._query = <Query>owner;
                this._parent = this.query.parent;
                if (definition.name == "New" && this.query.persistentObject != null && !StringEx.isNullOrEmpty(this.query.persistentObject.newOptions))
                    this._setOptions(this.query.persistentObject.newOptions.split(";"));

                this.query.propertyChanged.attach((source, detail) => {
                    if (detail.propertyName == "selectedItems") {
                        var options: string[];

                        if (definition.name == "New" && this.query.persistentObject != null && !StringEx.isNullOrEmpty(this.query.persistentObject.newOptions))
                            options = this.query.persistentObject.newOptions.split(";");
                        else
                            options = definition.options.slice();

                        var args: SelectedItemsActionArgs = {
                            name: this.name,
                            isVisible: this.isVisible,
                            canExecute: this.selectionRule(detail.newValue ? detail.newValue.length : 0),
                            options: options
                        };
                        this.service.hooks.onSelectedItemsActions(this._query, detail.newValue, args);

                        this.canExecute = args.canExecute;
                        this._setOptions(args.options);
                    }
                });

                this.canExecute = this.selectionRule(0);
            }
            else if (owner instanceof PersistentObject) {
                this._targetType = "PersistentObject";
                this._parent = <PersistentObject>owner;
                this.canExecute = true;
            }
            else
                throw "Invalid owner-type.";

            if (definition.options.length > 0)
                this._options = definition.options.slice();
        }

        get parent(): PersistentObject {
            return this._parent;
        }

        get query(): Query {
            return this._query;
        }

        get offset(): number {
            return this._offset;
        }

        set offset(value: number) {
            this._offset = value;
        }

        get name(): string {
            return this.definition.name;
        }

        get canExecute(): boolean {
            return this._canExecute && !this._block;
        }

        set canExecute(val: boolean) {
            if (this._canExecute == val)
                return;

            this._canExecute = val;
            this.notifyPropertyChanged("canExecute", val, !val);
        }

        set block(block: boolean) {
            this._block = block;
            this.notifyPropertyChanged("canExecute", this._block = block, this._canExecute);
        }

        get isVisible(): boolean {
            return this._isVisible;
        }

        set isVisible(val: boolean) {
            if (this._isVisible == val)
                return;

            this._isVisible = val;
            this.notifyPropertyChanged("isVisible", val, !val);
        }

        get isPinned(): boolean {
            return this._isPinned;
        }

        get options(): string[] {
            return this._options;
        }

        private _setOptions(options: string[]) {
            if (this._options == options)
                return;

            var oldOptions = this._options;
            this.notifyPropertyChanged("options", this._options = options, oldOptions);
        }

        execute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[], throwExceptions?: boolean): Promise<PersistentObject> {
            return new Promise<PersistentObject>((resolve, reject) => {
                if (this.canExecute || (selectedItems != null && this.selectionRule(selectedItems.length)))
                    this._onExecute(option, parameters, selectedItems).then(po => {
                        resolve(po);
                    }, e => {
                        if (throwExceptions)
                            reject(e);
                        else
                            this.owner.setNotification(e);
                    });
            });
        }

        _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
            var confirmation = this.definition.confirmation ? this.service.hooks.onActionConfirmation(this, option) : Promise.resolve(true);

            return confirmation.then(result => {
                if (result) {
                    return this.owner.queueWork(() => {
                        return new Promise<PersistentObject>((resolve, reject) => {
                            parameters = this._getParameters(parameters, option);

                            if (selectedItems == null && this.query) {
                                if (this.query.selectAll.allSelected) {
                                    if (!this.query.selectAll.inverse)
                                        selectedItems = [];
                                    else
                                        selectedItems = this.query.items.filter(i => !i.isSelected);
                                }
                                else
                                    selectedItems = this.query.selectedItems;
                            }

                            this.service.executeAction(this._targetType + "." + this.definition.name, this.parent, this.query, selectedItems, parameters).then(po => {
                                if (po != null) {
                                    if (po.fullTypeName == "Vidyano.Notification") {
                                        if (po.objectId != null && JSON.parse(po.objectId).dialog) {
                                            this._setNotification();
                                            this.service.hooks.onMessageDialog(NotificationType[po.notificationType], po.notification, false, this.service.hooks.service.getTranslatedMessage("OK"));
                                        }
                                        else {
                                            if (this.query && this.definition.refreshQueryOnCompleted)
                                                var notificationPO = po;
                                            else
                                                this._setNotification(po.notification, po.notificationType);
                                        }
                                    } else if (po.fullTypeName == "Vidyano.RegisteredStream") {
                                        this.service._getStream(po);
                                    } else if (po.fullTypeName == "Vidyano.AddReference") {
                                        const query = po.queries[0];
                                        query.parent = this.parent;

                                        this.service.hooks.onSelectReference(query).then(selectedItems => {
                                            if (!selectedItems || !selectedItems.length)
                                                return;

                                            this.service.executeAction("Query.AddReference", this.parent, query, selectedItems, { AddAction: this.name }, true).then(() => {
                                                this.query.search();
                                            }).catch(e => {
                                                this.query.setNotification(e, NotificationType.Error);
                                            });
                                        });
                                    } else if (this.parent != null && (po.fullTypeName == this.parent.fullTypeName || po.isNew == this.parent.isNew) && po.id == this.parent.id && po.objectId == this.parent.objectId) {
                                        this.parent.refreshFromResult(po);
                                        this.parent.setNotification(po.notification, po.notificationType);
                                    } else {
                                        po.ownerQuery = this.query;
                                        po.ownerPersistentObject = this.parent;

                                        if (!this.skipOpen)
                                            this.service.hooks.onOpen(po, false, true);
                                    }
                                }

                                if (this.query != null && this.definition.refreshQueryOnCompleted) {
                                    this.query.search().then(_ => {
                                        if (notificationPO && !this.query.notification)
                                            this._setNotification(po.notification, po.notificationType);
                                    });
                                }

                                resolve(po);
                            }, error => {
                                reject(error);
                            });
                        });
                    });
                }
                else
                    return Promise.resolve(null);
            });
        }

        _getParameters(parameters, option) {
            if (parameters == null)
                parameters = {};
            if (this._parameters != null)
                parameters = Vidyano.extend({}, this._parameters, parameters);
            if (this.options != null && this.options.length > 0 && option >= 0) {
                parameters["MenuOption"] = option;
                parameters["MenuLabel"] = this.options[option];
            }
            else if (option != null)
                parameters["MenuOption"] = option;
            return parameters;
        }

        _onParentIsEditingChanged(isEditing: boolean) {
        }

        _onParentIsDirtyChanged(isDirty: boolean) {
        }

        private _setNotification(notification: string = null, notificationType: NotificationType = NotificationType.Error) {
            if (this.query != null)
                this.query.setNotification(notification, notificationType);
            else
                this.parent.setNotification(notification, notificationType);
        }

        static get(service: Service, name: string, owner: ServiceObjectWithActions): Action {
            var definition = service.actionDefinitions.get(name);
            if (definition != null) {
                var hook = Actions[name];
                return service.hooks.onConstructAction(service, hook != null ? new hook(service, definition, owner) : new Action(service, definition, owner));
            }
            else
                return null;
        }

        static addActions(service: Service, owner: ServiceObjectWithActions, actions: Action[], actionNames: string[]) {
            if (actionNames == null || actionNames.length == 0)
                return;

            actionNames.forEach(actionName => {
                var action = Action.get(service, actionName, owner);
                action.offset = actions.length;
                actions.push(action);

                Action.addActions(service, owner, actions, action.dependentActions);
            });
        }
    }

    export module Actions {
        export class RefreshQuery extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = false;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<any> {
                return this.query.search();
            }
        }

        export class Filter extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = false;
            }
        }

        export class Edit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = !this.parent.isEditing;

                this.dependentActions = ["EndEdit", "CancelEdit"];
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = !isEditing;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.parent.beginEdit();
                return Promise.resolve(null);
            }
        }

        export class EndEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = this.parent.isDirty;
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = isEditing;
            }

            _onParentIsDirtyChanged(isDirty: boolean) {
                this.canExecute = isDirty;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                return new Promise<PersistentObject>((resolve, reject) => {
                    this.parent.save().then(() => {
                        if (StringEx.isNullOrWhiteSpace(this.parent.notification) || this.parent.notificationType != NotificationType.Error) {
                            var edit = this.parent.actions["Edit"];
                            var endEdit = this.parent.actions["EndEdit"];

                            if (this.parent.stateBehavior.indexOf("StayInEdit") != -1 && endEdit != null) {
                                endEdit.canExecute = false;
                            } else if (edit) {
                                edit.isVisible = true;
                                if (endEdit != null)
                                    endEdit.isVisible = false;
                            }
                        }

                        resolve(this.parent);
                    }, e => {
                        reject(e);
                    });
                });
            }
        }

        export class Save extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.dependentActions = ["CancelSave"];
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                var wasNew = this.parent.isNew;
                return new Promise<PersistentObject>((resolve, reject) => {
                    this.parent.save().then(() => {
                        if (StringEx.isNullOrWhiteSpace(this.parent.notification) || this.parent.notificationType != NotificationType.Error) {
                            if (wasNew && this.parent.ownerAttributeWithReference == null && this.parent.stateBehavior.indexOf("OpenAfterNew") != -1)
                                this.service.getPersistentObject(this.parent.parent, this.parent.id, this.parent.objectId).then(po2 => {
                                    this.service.hooks.onOpen(po2, true);
                                    resolve(this.parent);
                                }, reject);
                            else {
                                this.service.hooks.onClose(this.parent);
                                resolve(this.parent);
                            }
                        }
                        else
                            resolve(this.parent);
                    }, reject);
                });
            }
        }

        export class CancelSave extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.service.hooks.onClose(this.parent);
                return Promise.resolve(null);
            }
        }

        export class CancelEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = this.parent.stateBehavior.indexOf("StayInEdit") < 0 || this.parent.isDirty;
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = isEditing;
            }

            _onParentIsDirtyChanged(isDirty: boolean) {
                this.canExecute = this.parent.stateBehavior.indexOf("StayInEdit") < 0 || isDirty;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.parent.cancelEdit();
                return Promise.resolve(null);
            }
        }

        export class ExportToExcel extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.service._getStream(null, "Query.ExportToExcel", this.parent, this.query, null, this._getParameters(parameters, option));
                return Promise.resolve(null);
            }
        }

        export class ShowHelp extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                var owner = this.query ? this.query.persistentObject : this.parent;
                var helpWindow = window.open();
                return this.service.executeAction("PersistentObject.ShowHelp", owner, null, null).then(po => {
                    if (po != null) {
                        if (po.fullTypeName == "Vidyano.RegisteredStream" || po.getAttributeValue("Type") == "0") {
                            helpWindow.close();
                            this.service._getStream(po);
                        } else {
                            helpWindow.location = po.getAttributeValue("Document");
                            helpWindow.focus();
                        }
                    }
                    else
                        helpWindow.close();
                    return null;
                }, e => {
                    helpWindow.close();
                    this.owner.setNotification(e);
                });
            }
        }

        export class viSearch extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);

                this.isVisible = this.parent == null || this.parent.fullTypeName == "Vidyano.Search";

                if (this.parent != null && this.parent.fullTypeName == "Vidyano.Search")
                    this._isPinned = false;
            }
        }
    }

    export class ActionDefinition {
        private _name: string;
        private _displayName: string;
        private _isPinned: boolean;
        private _refreshQueryOnCompleted: boolean;
        private _offset: number;
        private _iconData: string;
        private _reverseIconData: string;
        private _confirmation: string;
        private _options: Array<string> = [];
        private _selectionRule: (count: number) => boolean;

        constructor(service: Service, item: QueryResultItem) {
            this._name = item.getValue("Name");
            this._displayName = item.getValue("DisplayName");
            this._isPinned = item.getValue("IsPinned");
            this._confirmation = item.getValue("Confirmation");
            this._selectionRule = ExpressionParser.get(item.getValue("SelectionRule"));
            this._refreshQueryOnCompleted = item.getValue("RefreshQueryOnCompleted");

            var icon = item.getFullValue("Icon");

            var options = item.getValue("Options");
            this._options = !StringEx.isNullOrWhiteSpace(options) ? options.split(";") : [];

            if (icon != null) {
                var appIcon = service.icons.get(icon.objectId);
                if (StringEx.isNullOrWhiteSpace(appIcon))
                    return;

                var iconWidth = 20, iconHeight = 20;
                var img = new Image();
                img.width = iconWidth;
                img.height = iconHeight;
                img.onload = () => {
                    var canvas = document.createElement("canvas");
                    canvas.width = iconWidth;
                    canvas.height = iconHeight;
                    var canvasContext = <CanvasRenderingContext2D>canvas.getContext("2d");
                    canvasContext.drawImage(img, 0, 0, iconWidth, iconHeight);

                    var imgd = canvasContext.getImageData(0, 0, iconWidth, iconHeight);
                    var pix = imgd.data;

                    for (var i = 0, n = pix.length; i < n; i += 4) {
                        pix[i] = 255 - pix[i];
                        pix[i + 1] = 255 - pix[i + 1];
                        pix[i + 2] = 255 - pix[i + 2];
                    }

                    canvasContext.putImageData(imgd, 0, 0);

                    this._reverseIconData = canvas.toDataURL("image/png");
                };
                img.src = appIcon.asDataUri();
            }
            else
                this._reverseIconData = null;
        }

        get name(): string {
            return this._name;
        }

        get displayName(): string {
            return this._displayName;
        }

        get isPinned(): boolean {
            return this._isPinned;
        }

        get refreshQueryOnCompleted(): boolean {
            return this._refreshQueryOnCompleted;
        }

        get offset(): number {
            return this._offset;
        }

        get iconData(): string {
            return this._iconData;
        }

        get reverseIconData(): string {
            return this._reverseIconData;
        }

        get confirmation(): string {
            return this._confirmation;
        }

        get options(): Array<string> {
            return this._options;
        }

        get selectionRule(): (count: number) => boolean {
            return this._selectionRule;
        }
    }

    export class Application extends PersistentObject {
        private _userId: string;
        private _friendlyUserName: string;
        private _feedbackId: string;
        private _userSettingsId: string;
        private _globalSearchId: string;
        private _analyticsKey: string;
        private _userSettings: any;
        private _canProfile: boolean;
        private _hasManagement: boolean;
        private _session: Vidyano.PersistentObject;
        private _routes: Routes;
        private _poRe: RegExp;
        private _queryRe: RegExp;
        programUnits: ProgramUnit[];

        constructor(service: Service, po: any) {
            super(service, po);

            this._userId = this.getAttributeValue("UserId");
            this._friendlyUserName = this.getAttributeValue("FriendlyUserName") || service.userName;
            this._feedbackId = this.getAttributeValue("FeedbackId");
            this._userSettingsId = this.getAttributeValue("UserSettingsId");
            this._globalSearchId = this.getAttributeValue("GlobalSearchId");
            this._analyticsKey = this.getAttributeValue("AnalyticsKey");
            this._routes = JSON.parse(this.getAttributeValue("Routes"));
            var puRoutes = "^((" + Object.keys(this._routes.programUnits).join("|") + ")/)?";
            this._poRe = new RegExp(puRoutes + "(" + Object.keys(this._routes.persistentObjects).join("|") + ")(/.+)?$");
            this._queryRe = new RegExp(puRoutes + "(" + Object.keys(this._routes.queries).join("|") + ")$");

            var userSettings = this.getAttributeValue("UserSettings");
            this._userSettings = JSON.parse(StringEx.isNullOrEmpty(userSettings) ? (localStorage["UserSettings"] || "{}") : userSettings);

            this._canProfile = this.getAttributeValue("CanProfile");

            var pus = <{ hasManagement: boolean; units: any[] }>JSON.parse(this.getAttributeValue("ProgramUnits"));
            this.programUnits = Enumerable.from(pus.units).select(unit => new ProgramUnit(this.service, this.routes, unit)).toArray();
        }

        get userId(): string {
            return this._userId;
        }

        get friendlyUserName(): string {
            return this._friendlyUserName;
        }

        get feedbackId(): string {
            return this._feedbackId;
        }

        get userSettingsId(): string {
            return this._userSettingsId;
        }

        get globalSearchId(): string {
            return this._globalSearchId;
        }

        get analyticsKey(): string {
            return this._analyticsKey;
        }

        get userSettings(): any {
            return this._userSettings;
        }

        get canProfile(): boolean {
            return this._canProfile;
        }

        get hasManagement(): boolean {
            return this._hasManagement;
        }

        get session(): Vidyano.PersistentObject {
            return this._session;
        }

        get routes(): Routes {
            return this._routes;
        }

        get poRe(): RegExp {
            return this._poRe;
        }

        get queryRe(): RegExp {
            return this._queryRe;
        }

        saveUserSettings(): Promise<any> {
            if (this.userSettingsId != "00000000-0000-0000-0000-000000000000") {
                return this.service.getPersistentObject(null, this.userSettingsId, null).then(po => {
                    po.attributes["Settings"].value = JSON.stringify(this.userSettings);
                    return po.save().then(() => this.userSettings);
                });
            }
            else
                localStorage["UserSettings"] = JSON.stringify(this.userSettings);

            return Promise.resolve(this.userSettings);
        }

        _updateSession(session: any) {
            var oldSession = this._session;

            if (!session) {
                if (this._session)
                    this._session = null;
            } else {
                if (this._session)
                    this._session.refreshFromResult(new PersistentObject(this.service, session));
                else
                    this._session = new PersistentObject(this.service, session);
            }

            if (oldSession != this._session)
                this.notifyPropertyChanged("session", this._session, oldSession);
        }
    }

    export class ProgramUnitItem extends ServiceObject {
        id: string;
        title: string;
        name: string;

        constructor(service: Service, unitItem: any, public path?: string) {
            super(service);

            this.id = unitItem.id;
            this.title = unitItem.title;
            this.name = unitItem.name;
        }
    }

    export class ProgramUnit extends ProgramUnitItem {
        private _id: string;
        offset: number;
        openFirst: boolean;
        items: ProgramUnitItem[];

        constructor(service: Service, routes: Routes, unit: any) {
            super(service, unit, unit.name);

            this._id = unit.id;
            this.offset = unit.offset;
            this.openFirst = unit.openFirst;

            if (unit.items) {
                this.items = [];
                var usedGroups = {};

                var unitItems = Enumerable.from<any>(unit.items);
                unitItems.forEach(itemData => {
                    if (itemData.group) {
                        var group = usedGroups[itemData.group.id];
                        if (!group) {
                            var groupItems = unitItems.where(groupItemData => groupItemData.group && groupItemData.group.id == itemData.group.id).select(groupItemData => this._createItem(routes, groupItemData)).toArray();
                            group = new ProgramUnitItemGroup(this.service, itemData.group, groupItems);
                            this.items.push(group);
                            usedGroups[itemData.group.id] = group;
                        }
                    }
                    else
                        this.items.push(this._createItem(routes, itemData));
                });
            }

            if (this.openFirst && this.items.length > 0)
                this.path = this.items[0].path;
        }

        private _createItem(routes: Routes, itemData: any): ProgramUnitItem {
            if (itemData.query)
                return new ProgramUnitItemQuery(this.service, routes, itemData, this);

            if (itemData.persistentObject)
                return new ProgramUnitItemPersistentObject(this.service, routes, itemData, this);

            return new ProgramUnitItemUrl(this.service, itemData);
        }
    }

    export class ProgramUnitItemGroup extends ProgramUnitItem {
        constructor(service: Service, unitItem: any, public items: ProgramUnitItem[]) {
            super(service, unitItem);
        }
    }

    export class ProgramUnitItemQuery extends ProgramUnitItem {
        queryId: string;

        constructor(service: Service, routes: Routes, unitItem: any, parent: ProgramUnit) {
            super(service, unitItem, parent.name + ProgramUnitItemQuery._getPath(routes, unitItem.query));

            this.queryId = unitItem.query;
        }

        private static _getPath(routes: Routes, id: string): string {
            var queries = routes.queries;
            for (var name in queries) {
                if (queries[name] === id)
                    return "/" + name;
            }

            return "/Query." + id;
        }
    }

    export class ProgramUnitItemPersistentObject extends ProgramUnitItem {
        persistentObjectId: string;
        persistentObjectObjectId: string;

        constructor(service: Service, routes: Routes, unitItem: any, parent: ProgramUnit) {
            super(service, unitItem, parent.name + ProgramUnitItemPersistentObject._getPath(routes, unitItem.persistentObject, unitItem.objectId));

            this.persistentObjectId = unitItem.persistentObject;
            this.persistentObjectObjectId = unitItem.objectId;
        }

        private static _getPath(routes: Routes, id: string, objectId: string): string {
            var persistentObjects = routes.persistentObjects;
            for (var name in persistentObjects) {
                if (persistentObjects[name] === id)
                    return "/" + name + (objectId ? "/" + objectId : "");
            }

            return "/PersistentObject." + id + (objectId ? "/" + objectId : "");
        }
    }

    export class ProgramUnitItemUrl extends ProgramUnitItem {
        constructor(service: Service, unitItem: any) {
            super(service, unitItem, unitItem.objectId);
        }
    }

    export class NoInternetMessage {
        static messages: linqjs.Dictionary<string, NoInternetMessage> = NoInternetMessage._getMessages();

        constructor(private language: string, public title: string, public message: string, public tryAgain: string) {
        }

        private static _getMessages(): linqjs.Dictionary<string, NoInternetMessage> {
            return Enumerable.from<NoInternetMessage>([
                new NoInternetMessage("en", "Unable to connect to the server.", "Please check your internet connection settings and try again.", "Try again"),
                new NoInternetMessage("ar", "غير قادر على الاتصال بالخادم", "يرجى التحقق من إعدادات الاتصال بإنترنت ثم حاول مرة أخرى", "حاول مرة أخرى"),
                new NoInternetMessage("bg", "Не може да се свърже със сървъра", "Проверете настройките на интернет връзката и опитайте отново", "Опитайте отново"),
                new NoInternetMessage("ca", "No es pot connectar amb el servidor", "Si us plau aturi les seves escenes de connexió d'internet i provi una altra vegada", "Provi una altra vegada"),
                new NoInternetMessage("cs", "Nelze se připojit k serveru", "Zkontrolujte nastavení připojení k Internetu a akci opakujte", "Zkuste to znovu"),
                new NoInternetMessage("da", "Kunne ikke oprettes forbindelse til serveren", "Kontroller indstillingerne for internetforbindelsen, og prøv igen", "Prøv igen"),
                new NoInternetMessage("nl", "Kan geen verbinding maken met de server", "Controleer de instellingen van uw internet-verbinding en probeer opnieuw", "Opnieuw proberen"),
                new NoInternetMessage("et", "Ei saa ühendust serveriga", "Palun kontrollige oma Interneti-ühenduse sätteid ja proovige uuesti", "Proovi uuesti"),
                new NoInternetMessage("fa", "قادر به اتصال به سرویس دهنده", "لطفاً تنظیمات اتصال اینترنت را بررسی کرده و دوباره سعی کنید", "دوباره امتحان کن"),
                new NoInternetMessage("fi", "Yhteyttä palvelimeen", "Tarkista internet-yhteysasetukset ja yritä uudelleen", "Yritä uudestaan"),
                new NoInternetMessage("fr", "Impossible de se connecter au serveur", "S'il vous plaît vérifier vos paramètres de connexion internet et réessayez", "Réessayez"),
                new NoInternetMessage("de", "Keine Verbindung zum Server herstellen", "Überprüfen Sie die Einstellungen für die Internetverbindung und versuchen Sie es erneut", "Wiederholen"),
                new NoInternetMessage("el", "Δεν είναι δυνατή η σύνδεση με το διακομιστή", "Ελέγξτε τις ρυθμίσεις σύνδεσης στο internet και προσπαθήστε ξανά", "Δοκίμασε ξανά"),
                new NoInternetMessage("ht", "Pat kapab pou li konekte li pou sèvè a", "Souple tcheke ou paramètres kouche sou entènèt Et eseye ankò", "eseye ankò"),
                new NoInternetMessage("he", "אין אפשרות להתחבר לשרת", "נא בדוק את הגדרות החיבור לאינטרנט ונסה שוב", "נסה שוב"),
                new NoInternetMessage("hi", "सर्वर से कनेक्ट करने में असमर्थ", "कृपया अपना इंटरनेट कनेक्शन सेटिंग्स की जाँच करें और पुन: प्रयास करें", "फिर कोशिश करो"),
                new NoInternetMessage("hu", "Nem lehet kapcsolódni a szerverhez", "Kérjük, ellenőrizze az internetes kapcsolat beállításait, és próbálja újra", "próbáld újra"),
                new NoInternetMessage("id", "Tidak dapat terhubung ke server", "Silakan periksa setelan sambungan internet Anda dan coba lagi", "Coba lagi"),
                new NoInternetMessage("it", "Impossibile connettersi al server", "Si prega di controllare le impostazioni della connessione internet e riprovare", "Riprova"),
                new NoInternetMessage("ja", "サーバーに接続できません。", "インターネット接続設定を確認して、やり直してください。", "もう一度やり直してください"),
                new NoInternetMessage("ko", "서버에 연결할 수 없습니다.", "인터넷 연결 설정을 확인 하 고 다시 시도 하십시오", "다시 시도"),
                new NoInternetMessage("lv", "Nevar izveidot savienojumu ar serveri", "Lūdzu, pārbaudiet interneta savienojuma iestatījumus un mēģiniet vēlreiz", "mēģini vēlreiz"),
                new NoInternetMessage("lt", "Nepavyko prisijungti prie serverio", "Patikrinkite interneto ryšio parametrus ir bandykite dar kartą", "pabandyk dar kartą"),
                new NoInternetMessage("no", "Kan ikke koble til serveren", "Kontroller innstillingene for Internett-tilkoblingen og prøv igjen", "prøv igjen"),
                new NoInternetMessage("pl", "Nie można połączyć się z serwerem", "Proszę sprawdzić ustawienia połączenia internetowego i spróbuj ponownie", "Próbuj ponownie"),
                new NoInternetMessage("pt", "Incapaz de conectar ao servidor", "Por favor, verifique as suas configurações de ligação à internet e tente novamente", "Tentar novamente"),
                new NoInternetMessage("ro", "Imposibil de conectat la server", "Vă rugăm să verificaţi setările de conexiune la internet şi încercaţi din nou", "încearcă din nou"),
                new NoInternetMessage("ru", "Не удается подключиться к серверу", "Пожалуйста, проверьте параметры подключения к Интернету и повторите попытку", "Повторить"),
                new NoInternetMessage("sk", "Nedá sa pripojiť k serveru", "Skontrolujte nastavenie internetového pripojenia a skúste to znova", "skús znova"),
                new NoInternetMessage("sl", "Ne morem se povezati s strežnikom", "Preverite nastavitve internetne povezave in poskusite znova", "poskusi znova"),
                new NoInternetMessage("es", "No se puede conectar al servidor", "Por favor, compruebe la configuración de conexión a internet e inténtelo de nuevo", "Vuelve a intentarlo"),
                new NoInternetMessage("sv", "Det gick inte att ansluta till servern", "Kontrollera inställningarna för Internetanslutningen och försök igen", "Försök igen"),
                new NoInternetMessage("th", "สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "กรุณาตรวจสอบการตั้งค่าการเชื่อมต่ออินเทอร์เน็ตของคุณ และลองอีกครั้ง", "ลองอีกครั้ง"),
                new NoInternetMessage("tr", "Sunucuya bağlantı kurulamıyor", "Lütfen Internet bağlantı ayarlarınızı denetleyin ve yeniden deneyin", "Yeniden Deneyin"),
                new NoInternetMessage("uk", "Не вдалося підключитися до сервера", "Перевірте параметри підключення до Інтернету та повторіть спробу", "Спробуй ще раз"),
                new NoInternetMessage("vi", "Không thể kết nối đến máy chủ", "Hãy kiểm tra cài đặt kết nối internet của bạn và thử lại", "Thử lại")
            ]).toDictionary(m => m.language, m => m);
        }
    }
}

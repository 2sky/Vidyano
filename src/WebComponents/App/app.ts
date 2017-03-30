/* tslint:disable:no-var-keyword */
var _gaq: any[];
/* tslint:enable:no-var-keyword */

namespace Vidyano {
    "use strict";

    export function debug(debug: boolean = true) {
        document.cookie = `useweb2home=${debug};path=/`;
    }
}

namespace Vidyano.WebComponents {
    "use strict";

    const base = document.head.querySelector("base") as HTMLBaseElement;
    const parser = document.createElement("a");
    parser.href = base.href;
    Path.routes.rootPath = parser.pathname[0] === "/" ? parser.pathname : `/${parser.pathname}`; // IE Bug: https://connect.microsoft.com/IE/Feedback/Details/1002846

    const hashBangRe = /(.+)#!\/(.*)/;
    if (hashBangRe.test(document.location.href)) {
        const hashBangParts = hashBangRe.exec(document.location.href);
        if (hashBangParts[2].startsWith("SignInWithToken/")) {
            history.replaceState(null, null, hashBangParts[1]);
            Service.token = hashBangParts[2].substr(16);
        }
        else
            history.replaceState(null, null, `${hashBangParts[1]}${hashBangParts[2]}`);
    }

    export class AppCacheEntry {
        constructor(public id: string) {
        }

        isMatch(entry: AppCacheEntry): boolean {
            return entry.id === this.id;
        }
    }

    export class PersistentObjectAppCacheEntry extends AppCacheEntry {
        private _persistentObject: Vidyano.PersistentObject;
        selectedMasterTab: Vidyano.PersistentObjectTab;
        selectedDetailTab: Vidyano.PersistentObjectTab;

        constructor(idOrPo: string | Vidyano.PersistentObject, public objectId?: string) {
            super(typeof idOrPo === "string" ? idOrPo : (idOrPo instanceof Vidyano.PersistentObject ? idOrPo.id : null));

            if (idOrPo instanceof Vidyano.PersistentObject) {
                this.persistentObject = idOrPo;
                this.objectId = this.persistentObject.objectId;
            }
        }

        get persistentObject(): Vidyano.PersistentObject {
            return this._persistentObject;
        }

        set persistentObject(po: Vidyano.PersistentObject) {
            if (po === this._persistentObject)
                return;

            this._persistentObject = po;
            this.selectedMasterTab = this.selectedDetailTab = null;
        }

        isMatch(entry: PersistentObjectAppCacheEntry): boolean {
            if (!(entry instanceof PersistentObjectAppCacheEntry))
                return false;

            if (entry.persistentObject != null && entry.persistentObject === this.persistentObject)
                return true;

            return (super.isMatch(entry) || (entry.persistentObject && this.id === entry.persistentObject.fullTypeName)) && (entry.objectId === this.objectId || StringEx.isNullOrEmpty(entry.objectId) && StringEx.isNullOrEmpty(this.objectId));
        }
    }

    export class PersistentObjectFromActionAppCacheEntry extends PersistentObjectAppCacheEntry {
        constructor(po: Vidyano.PersistentObject, public fromActionId?: string, public fromActionIdReturnPath?: string) {
            super(po);
        }

        isMatch(entry: PersistentObjectFromActionAppCacheEntry): boolean {
            if (!(entry instanceof PersistentObjectFromActionAppCacheEntry))
                return false;

            return this.fromActionId === entry.fromActionId || entry.persistentObject === this.persistentObject;
        }
    }

    export class QueryAppCacheEntry extends AppCacheEntry {
        query: Vidyano.Query;

        constructor(idOrQuery: string | Vidyano.Query) {
            super(typeof idOrQuery === "string" ? idOrQuery : null);

            if (idOrQuery instanceof Vidyano.Query)
                this.query = idOrQuery;
        }

        isMatch(entry: QueryAppCacheEntry): boolean {
            if (!(entry instanceof QueryAppCacheEntry))
                return false;

            if (entry.query === this.query)
                return true;

            return entry instanceof QueryAppCacheEntry && super.isMatch(entry);
        }
    }

    @WebComponent.register({
        properties: {
            uri: {
                type: String,
                reflectToAttribute: true,
                value: ""
            },
            hooks: {
                type: String,
                reflectToAttribute: true,
                value: null
            },
            noHistory: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            path: {
                type: String,
                reflectToAttribute: true
            },
            service: {
                type: Object,
                computed: "_computeService(uri, user, hooks, isAttached)"
            },
            user: {
                type: String,
                reflectToAttribute: true,
                value: null
            },
            keys: {
                type: String,
                readOnly: true
            },
            currentRoute: {
                type: Object,
                readOnly: true
            },
            application: Object,
            programUnit: {
                type: Object,
                computed: "_computeProgramUnit(service.application, path)"
            },
            noMenu: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            barebone: {
                type: Boolean,
                readOnly: true
            },
            initializing: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true,
                value: true
            },
            label: {
                type: String,
                reflectToAttribute: true
            },
            cacheSize: {
                type: Number,
                value: 25,
                reflectToAttribute: true
            },
            profilerLoaded: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            isProfiling: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeIsProfiling(service.isSignedIn, service.profile)"
            },
            signInImage: String,
            showMenu: {
                type: Boolean,
                computed: "_computeShowMenu(service.application, noMenu)"
            },
            isDesktop: {
                type: Boolean,
                reflectToAttribute: true
            },
            isTablet: {
                type: Boolean,
                reflectToAttribute: true
            },
            isPhone: {
                type: Boolean,
                reflectToAttribute: true
            },
            isTracking: {
                type: Boolean,
                reflectToAttribute: true
            },
            cookiePrefix: {
                type: String,
                reflectToAttribute: true,
                observer: "_cookiePrefixChanged"
            },
            themeColor: {
                type: String,
                reflectToAttribute: true,
                value: "#4682B4"
            },
            themeAccentColor: {
                type: String,
                reflectToAttribute: true,
                value: "#009688"
            },
            configs: String,
            updateAvailable: {
                type: Boolean,
                readOnly: true,
                value: false
            }
        },
        observers: [
            "_updateInitialize(serviceInitializer, appRoutesInitializer)",
            "_updateRoute(path, initializing)",
            "_hookWindowBeforeUnload(noHistory, isAttached)",
            "_cleanUpOnSignOut(service.isSignedIn)",
            "_resolveDependencies(service.application.hasManagement)",
            "_computeThemeColorVariants(themeColor, 'color', isAttached)",
            "_computeThemeColorVariants(themeAccentColor, 'accent-color', isAttached)",
            "_importConfigs(configs, isAttached)"
        ],
        hostAttributes: {
            "tabindex": "-1"
        },
        listeners: {
            "contextmenu": "_configureContextmenu",
            "click": "_anchorClickHandler",
            "app-update-available": "_updateAvailable"
        },
        forwardObservers: [
            "service.isSignedIn",
            "service.profile",
            "service.application"
        ]
    })
    export class App extends WebComponent {
        private _cache: AppCacheEntry[] = [];
        private _nodeObserver: PolymerDomChangeObserver;
        private _appRoutePresenter: Vidyano.WebComponents.AppRoutePresenter;
        private _initializeResolve: (app: Vidyano.Application) => void;
        private _initializeReject: (e: any) => void;
        private _initialize: Promise<Vidyano.Application> = new Promise((resolve, reject) => { this._initializeResolve = resolve; this._initializeReject = reject; });
        private _routeMap: { [key: string]: AppRoute } = {};
        private _routeUpdater: Promise<any> = Promise.resolve();
        private _keybindingRegistrations: { [key: string]: Keyboard.IKeybindingRegistration[]; } = {};
        private _beforeUnloadEventHandler: EventListener;
        private _activeDialogs: Dialog[] = [];
        private _updateAvailableSnoozeTimer: number;
        readonly initializing: boolean; private _setInitializing: (init: boolean) => void;
        readonly keys: string; private _setKeys: (keys: string) => void;
        readonly currentRoute: AppRoute; private _setCurrentRoute: (route: AppRoute) => void;
        readonly barebone: boolean; private _setBarebone: (barebone: boolean) => void;
        readonly profilerLoaded: boolean; private _setProfilerLoaded: (val: boolean) => void;
        readonly updateAvailable: boolean; private _setUpdateAvailable: (updateAvailable: boolean) => void;
        service: Vidyano.Service;
        programUnit: ProgramUnit;
        uri: string;
        hooks: string;
        noHistory: boolean;
        path: string;
        cacheSize: number;
        noMenu: boolean;
        label: string;
        isTracking: boolean;

        attached() {
            super.attached();

            window.addEventListener("storage", this._onSessionStorage.bind(this), false);

            this.set("appRoutesInitializer", new Promise(resolve => {
                const bareboneTemplate = <PolymerTemplate><Node>Polymer.dom(this).children.filter(c => c.tagName === "TEMPLATE" && c.getAttribute("is") === "dom-template")[0];
                this._setBarebone(!!bareboneTemplate);
                if (this.barebone) {
                    const appRouteTargetSetter = (e: CustomEvent) => {
                        this._appRoutePresenter = e.target as Vidyano.WebComponents.AppRoutePresenter;
                        this._distributeAppRoutes();

                        this.removeEventListener("app-route-presenter-attached", appRouteTargetSetter);
                        resolve(this._appRoutePresenter);
                    };

                    this.addEventListener("app-route-presenter-attached", appRouteTargetSetter.bind(this));

                    Polymer.dom(this.root).appendChild(bareboneTemplate.stamp({ app: this }).root);
                } else {
                    Polymer.dom(this).flush();

                    this._appRoutePresenter = Polymer.dom(this.root).querySelector("vi-app-route-presenter") as Vidyano.WebComponents.AppRoutePresenter;
                    this._distributeAppRoutes();

                    resolve(this._appRoutePresenter);
                }
            }));

            Vidyano.Path.rescue(() => {
                this.path = App.removeRootPath(Vidyano.Path.routes.current);
            });

            if (!this.noHistory) {
                Vidyano.Path.root(base.href);
                Vidyano.Path.history.listen();

                Vidyano.Path["dispatch"](document.location.toString().substr(base.href.length).replace(document.location.hash, ""));
            }

            if (!this.label)
                this.label = this.title;

            const keys = <any>this.$$("iron-a11y-keys");
            keys.target = document.body;
        }

        detached() {
            super.detached();

            if (this._nodeObserver) {
                Polymer.dom(this._appRoutePresenter).unobserveNodes(this._nodeObserver);
                this._nodeObserver = null;
            }
        }

        private _onSessionStorage(event: StorageEvent) {
            if (!event)
                event = <StorageEvent>window.event;

            if (event.newValue == null)
                return;

            if (event.key === "vi-signOut" && this.app.service && this.app.service.isSignedIn && Vidyano.cookiePrefix === event.newValue)
                this.redirectToSignOut();
        }

        get configuration(): AppConfig {
            return this.$$("vi-app-config") as AppConfig;
        }

        get initialize(): Promise<Vidyano.Application> {
            return this._initialize;
        }

        get routeMap(): { [key: string]: AppRoute } {
            return this._routeMap;
        }

        changePath(path: string, replaceCurrent: boolean = false) {
            path = path.trimStart("/");
            if (this.path === path)
                return;

            if (!this.noHistory) {
                if (!replaceCurrent)
                    Vidyano.Path.history.pushState(null, null, Path.routes.rootPath + path);
                else
                    Vidyano.Path.history.replaceState(null, null, Path.routes.rootPath + path);
            }
            else {
                this.path = path;
                if (replaceCurrent)
                    history.pushState("", document.title, window.location.pathname);
            }
        }

        getUrlForPersistentObject(id: string, objectId: string, pu: ProgramUnit = this.programUnit) {
            const persistentObjects = this.service.application.routes.persistentObjects;
            for (const type in persistentObjects) {
                if (persistentObjects[type] === id)
                    return (pu ? pu.name + "/" : "") + type + (objectId ? "/" + objectId : "");
            }

            return (pu ? pu.name + "/" : "") + `PersistentObject.${id}${objectId ? "/" + objectId : ""}`;
        }

        getUrlForQuery(id: string, pu: ProgramUnit = this.programUnit) {
            const queries = this.service.application.routes.persistentObjects;
            for (const name in queries) {
                if (queries[name] === id)
                    return (pu ? pu.name + "/" : "") + `${name}`;
            }

            return (pu ? pu.name + "/" : "") + `Query.${id}`;
        }

        getUrlForFromAction(id: string, pu: ProgramUnit = this.programUnit) {
            return (pu ? pu.name + "/" : "") + `FromAction/${id}`;
        }

        cache(entry: Vidyano.WebComponents.AppCacheEntry): Vidyano.WebComponents.AppCacheEntry {
            // Remove LRU from cache
            if (this._cache.length >= this.cacheSize)
                this._cache.splice(0, this._cache.length - this.cacheSize);

            let cacheEntry = this.cachePing(entry);
            if (!cacheEntry)
                this._cache.push(cacheEntry = entry);

            return cacheEntry;
        }

        cachePing(entry: Vidyano.WebComponents.AppCacheEntry): Vidyano.WebComponents.AppCacheEntry {
            const cacheEntry = Enumerable.from(this._cache).lastOrDefault(e => entry.isMatch(e));
            if (cacheEntry) {
                this._cache.remove(cacheEntry);
                this._cache.push(cacheEntry);
            }

            return cacheEntry;
        }

        cacheRemove(key: Vidyano.WebComponents.AppCacheEntry) {
            const entry = Enumerable.from(this._cache).firstOrDefault(e => key.isMatch(e));
            if (entry)
                this._cache.remove(entry);
        }

        get cacheEntries(): Vidyano.WebComponents.AppCacheEntry[] {
            return this._cache;
        }

        cacheClear() {
            this._cache = [];
        }

        createServiceHooks(): ServiceHooks {
            if (this.hooks) {
                const ctor = this.hooks.split(".").reduce((obj: any, path: string) => obj && obj[path], window);
                if (ctor)
                    return new ctor(this);
                else
                    console.error(`Service hooks "${this.hooks}" was not found.`);
            }

            return new AppServiceHooks(this);
        }

        redirectToSignIn(keepUrl: boolean = true) {
            (<AppServiceHooks>this.app.service.hooks).onRedirectToSignIn(keepUrl);
        }

        redirectToSignOut(keepUrl: boolean = true) {
            (<AppServiceHooks>this.app.service.hooks).onRedirectToSignOut(keepUrl);
        }

        async showDialog(dialog: Dialog): Promise<any> {
            Polymer.dom(this.root).appendChild(dialog);
            this._activeDialogs.push(dialog);

            try {
                return await dialog.open();
            }
            finally {
                Polymer.dom(this.root).removeChild(dialog);
                this._activeDialogs.pop();
            }
        }

        async showMessageDialog(options: Vidyano.WebComponents.IMessageDialogOptions): Promise<any> {
            await this.app.importComponent("MessageDialog");
            return this.showDialog(new Vidyano.WebComponents.MessageDialog(options));
        }

        showAlert(notification: string, type: Vidyano.NotificationType = Vidyano.NotificationType.Notice, duration: number = 3000) {
            switch (type) {
                case NotificationType.Error:
                    alertify.log(notification, "error", duration);
                    break;

                case NotificationType.OK:
                    alertify.log(notification, "success", duration);
                    break;

                case NotificationType.Warning:
                    alertify.log(notification, "warning", duration);
                    break;

                case NotificationType.Notice:
                    alertify.log(notification, "notice", duration);
                    break;
            }
        }

        async importComponent(component: string): Promise<any> {
            if (component.split(".").reduce((obj: any, path: string) => obj[path], Vidyano.WebComponents))
                return Promise.resolve(null);

            const vidyanoComponentFolder = component.replace(".", "/");
            const vidyanoComponent = vidyanoComponentFolder.split("/").reverse()[0].replace(/([A-Z])/g, m => "-" + m[0].toLowerCase()).substr(1);
            const href = this.resolveUrl(`../${vidyanoComponentFolder}/${vidyanoComponent}.html`);

            try {
                await this.importHref(href);
            }
            catch (e) {
                console.error(`Unable to load component ${component} via import ${href}`);
            }
        }

        private static _libs = {
            "alertify": "alertify.js/alertify.html",
            "codemirror": "codemirror/codemirror.html",
            "d3": "d3/d3.min.js",
            "iron-a11y-keys": "iron-a11y-keys/iron-a11y-keys.html",
            "iron-collapse": "iron-collapse/iron-collapse.html",
            "iron-list": "iron-list/iron-list.html",
            "iron-media-query": "iron-media-query/iron-media-query.html",
            "marked-element": "marked-element/marked-element.html",
            "masked-input": "MaskedInput/masked-input.html",
            "moment": "moment/moment.html",
            "paper-ripple": "paper-ripple/paper-ripple.html",
            "sortable": "sortable/sortable.html"
        };
        async importLib(lib: string): Promise<any> {
            const href = this.resolveUrl(`../../Libs/${App._libs[lib] || lib}`);

            try {
                await this.importHref(href);
            }
            catch (e) {
                console.error(`Unable to load support library ${lib} via import ${href}`);
            }
        }

        private _distributeAppRoutes() {
            this._nodeObserver = Polymer.dom(this._appRoutePresenter).observeNodes(this._nodesChanged.bind(this));
            Enumerable.from(this.queryAllEffectiveChildren("vi-app-route")).forEach(route => Polymer.dom(this._appRoutePresenter).appendChild(route));

            if (this.noHistory)
                this.changePath(this.path);
        }

        private _nodesChanged(info: PolymerDomChangedInfo) {
            info.addedNodes.filter(node => node instanceof Vidyano.WebComponents.AppRoute).forEach((appRoute: Vidyano.WebComponents.AppRoute) => {
                const route = App.removeRootPath(appRoute.route);

                if (!this._routeMap[route]) {
                    this._routeMap[route] = appRoute;
                    Vidyano.Path.map(Path.routes.rootPath + route).to(() => this.path = Vidyano.Path.routes.current);
                }
            });
        }

        private _computeIsProfiling(isSignedIn: boolean, profile: boolean): boolean {
            if (!isSignedIn || !profile)
                return false;

            this.importComponent("Profiler");
            return true;
        }

        private _cookiePrefixChanged(cookiePrefix: string) {
            Vidyano.cookiePrefix = cookiePrefix;
        }

        private async _importConfigs(configs: string, isAttached: boolean) {
            if (!configs || !isAttached)
                return;

            const doc = <HTMLDocument>await this.importHref(configs);
            Enumerable.from(doc.body.childNodes).forEach(c => Polymer.dom(this).appendChild(c));
        }

        private async _updateInitialize(...promises: Promise<any>[]) {
            try {
                if (this._initializeResolve) {
                    const results = await Promise.all(promises);
                    this._initializeResolve(results[0]);
                    this._initializeResolve = null;
                    this._initializeReject = null;
                }
                else {
                    this._initialize = Promise.all(promises).then((results: any[]) => {
                        this._setInitializing(false);
                        return results[0];
                    });

                    await this._initialize;
                }

                this._setInitializing(false);
            }
            catch (e) {
                const noInternet = Vidyano.NoInternetMessage.messages.get(navigator.language.split("-")[0].toLowerCase()) || Vidyano.NoInternetMessage.messages.get("en");

                await this.showMessageDialog({
                    title: e === noInternet.message ? noInternet.title : this.app.label || document.title,
                    message: e,
                    actions: [noInternet.tryAgain],
                    actionTypes: ["Danger"],
                    noClose: true
                });

                document.location.reload();
            }
        }

        private _computeService(uri: string, user: string, hooks: ServiceHooks): Vidyano.Service {
            const service = new Vidyano.Service(this.uri, this.createServiceHooks(), user);

            const path = this.noHistory ? this.path : App.removeRootPath(document.location.pathname);
            const skipDefaultCredentialLogin = path.startsWith("SignIn");

            this._setInitializing(true);
            this.set("serviceInitializer", service.initialize(skipDefaultCredentialLogin).then(() => {
                if (this.service === service)
                    return this.service.application;

                return null;
            }, e => {
                if (this.service === service) {
                    if (e !== "Session expired")
                        throw e;
                }

                return null;
            }));

            return service;
        }

        async reinitialize() {
            const uri = this.uri;
            this.uri = undefined;

            const currentLanguageMessages = this.service.language.messages;
            this.uri = uri;

            if (currentLanguageMessages) {
                await this.initialize;
                Object.keys(this.service.language.messages).forEach(k => currentLanguageMessages[k] = this.service.language.messages[k]);
                this.service.language.messages = currentLanguageMessages;
            }
        }

        private _anchorClickHandler(e: TapEvent, data: any) {
            if (e.defaultPrevented)
                return;

            const anchorParent = this.findParent((e: HTMLElement) => e.tagName === "A" && !!(<HTMLAnchorElement>e).href, e.target as HTMLElement) as HTMLAnchorElement;
            if (anchorParent && anchorParent.href.startsWith(Path.routes.root) && !anchorParent.hasAttribute("download") && !anchorParent.hasAttribute("external")) {
                let path = anchorParent.href.slice(Path.routes.root.length);
                if (path.startsWith("#!/"))
                    path = path.substr(3);

                if (Path.match(Path.routes.rootPath + path, true) != null || Path.match(Path.routes.rootPath + (this._convertPath(this.service.application, path)), true) != null) {
                    this.changePath(path);

                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }

        private _convertPath(application: Vidyano.Application, path: string): string {
            if (application) {
                let match = application.poRe.exec(path);
                if (match)
                    path = (match[1] || "") + "PersistentObject." + application.routes.persistentObjects[match[3]] + (match[4] || "");
                else {
                    match = application.queryRe.exec(path);
                    if (match)
                        path = (match[1] || "") + "Query." + application.routes.queries[match[3]];
                }
            }

            return path;
        }

        private _updateRoute(path: string, initializing: boolean) {
            if (initializing)
                return;

            let currentPath = this.path;
            this._routeUpdater = this._routeUpdater.then(async () => {
                if (currentPath !== this.path)
                    return;

                path = Vidyano.WebComponents.App.removeRootPath(this._convertPath(this.service.application, path));

                if (this.service && this.service.isSignedIn && path === "") {
                    let programUnit = this.programUnit;
                    if (!programUnit && this.service.application.programUnits.length > 0)
                        programUnit = this.service.application.programUnits[0];

                    if (programUnit && !this.barebone) {
                        if (programUnit.openFirst && programUnit.path && path !== programUnit.path) {
                            this.async(() => this.changePath(programUnit.path));
                            return;
                        }
                        else {
                            const config = this.app.configuration.getProgramUnitConfig(programUnit.name);
                            if (!!config && config.hasTemplate) {
                                this.async(() => this.changePath(programUnit.name));
                                return;
                            }
                        }
                    }
                }

                const mappedPathRoute = !!path || this.barebone ? Vidyano.Path.match(Path.routes.rootPath + path, true) : null;
                const newRoute = mappedPathRoute ? this._routeMap[App.removeRootPath(mappedPathRoute.path)] : null;

                if (!this.service.isSignedIn && (!newRoute || !newRoute.allowSignedOut)) {
                    this.redirectToSignIn();
                    return;
                }

                if (this.currentRoute) {
                    if (this.currentRoute === newRoute && this.currentRoute.matchesParameters(mappedPathRoute.params))
                        return;

                    if (!await this.currentRoute.deactivate(newRoute))
                        return;
                }

                Enumerable.from(Polymer.dom(this.root).querySelectorAll("[dialog]")).forEach((dialog: Vidyano.WebComponents.Dialog) => dialog.close());

                if (!!newRoute)
                    await newRoute.activate(mappedPathRoute.params);

                this._setCurrentRoute(newRoute);
                this._appRoutePresenter.notFound = !!path && !this.currentRoute;
            });
        }

        private _computeProgramUnit(application: Vidyano.Application, path: string): ProgramUnit {
            path = this._convertPath(application, path);

            const mappedPathRoute = Vidyano.Path.match(Path.routes.rootPath + App.removeRootPath(path), true);
            if (application) {
                if (mappedPathRoute && mappedPathRoute.params && mappedPathRoute.params.programUnitName)
                    return Enumerable.from(application.programUnits).firstOrDefault(pu => pu.name === mappedPathRoute.params.programUnitName);
                else if (application.programUnits.length > 0)
                    return application.programUnits[0];
            }

            return null;
        }

        private _computeShowMenu(application: Vidyano.Application, noMenu: boolean): boolean {
            const showMenu = application && !noMenu;
            if (showMenu)
                this.importComponent("Menu");

            return showMenu;
        }

        private _cleanUpOnSignOut(isSignedIn: boolean) {
            if (isSignedIn === false) {

                this.cacheClear();
                for (const route in this._routeMap)
                    this._routeMap[route].reset();

                this._setCurrentRoute(null);

                // Trigger sign out across tabs for the same base uri
                localStorage.setItem("vi-signOut", Vidyano.cookiePrefix);
                localStorage.removeItem("vi-signOut");
            }
        }

        private _hookWindowBeforeUnload(noHistory: boolean, isAttached: boolean) {
            if (this._beforeUnloadEventHandler) {
                window.removeEventListener("beforeunload", this._beforeUnloadEventHandler);
                this._beforeUnloadEventHandler = null;
            }

            if (!noHistory && isAttached)
                window.addEventListener("beforeunload", this._beforeUnloadEventHandler = this._beforeUnload.bind(this));
        }

        private _beforeUnload(e: Event) {
            if (this._cache.some(entry => entry instanceof Vidyano.WebComponents.PersistentObjectAppCacheEntry && !!entry.persistentObject && entry.persistentObject.isDirty && entry.persistentObject.actions.some(a => a.name === "Save" || a.name === "EndEdit")) && this.service) {
                const confirmationMessage = this.service.getTranslatedMessage("PagesWithUnsavedChanges");

                (e || window.event).returnValue = <any>confirmationMessage; // Gecko + IE
                return confirmationMessage; // Webkit, Safari, Chrome etc.
            }
        }

        private _registerKeybindings(registration: Keyboard.IKeybindingRegistration) {
            const currentKeys = this.keys ? this.keys.split(" ") : [];
            registration.keys.forEach(key => {
                registration.scope = <any>this.findParent(e => e instanceof AppRoute || e instanceof Dialog, registration.element);

                const registrations = this._keybindingRegistrations[key] || (this._keybindingRegistrations[key] = []);
                registrations.push(registration);

                currentKeys.push(key);
            });

            this._setKeys(Enumerable.from(currentKeys).distinct().toArray().join(" "));
        }

        private _unregisterKeybindings(registration: Keyboard.IKeybindingRegistration) {
            const currentKeys = this.keys.split(" ");

            registration.keys.forEach(key => {
                const registrations = this._keybindingRegistrations[key];
                registrations.remove(registration);

                if (registrations.length === 0) {
                    this._keybindingRegistrations[key] = undefined;
                    currentKeys.remove(key);
                }
            });

            this._setKeys(Enumerable.from(currentKeys).distinct().toArray().join(" "));
        }

        private _keysPressed(e: Keyboard.IKeysEvent) {
            if (!this._keybindingRegistrations[e.detail.combo])
                return;

            if (document.activeElement instanceof HTMLInputElement && !(e.detail.keyboardEvent.ctrlKey || e.detail.keyboardEvent.shiftKey || e.detail.keyboardEvent.altKey) && e.detail.key !== "esc")
                return;

            let combo = e.detail.combo;
            if (e.detail.keyboardEvent.ctrlKey && combo.indexOf("ctrl") < 0)
                combo = "ctrl+" + combo;
            if (e.detail.keyboardEvent.shiftKey && combo.indexOf("shift") < 0)
                combo = "shift+" + combo;
            if (e.detail.keyboardEvent.altKey && combo.indexOf("alt") < 0)
                combo = "alt+" + combo;

            let registrations = this._keybindingRegistrations[combo];
            if (!registrations)
                return;

            if (this._activeDialogs.length > 0) {
                const activeDialog = this._activeDialogs[this._activeDialogs.length - 1];
                registrations = registrations.filter(r => r.scope === activeDialog);
            }

            registrations = registrations.filter(reg => !reg.scope || (reg.scope instanceof AppRoute && (<AppRoute>reg.scope).active));
            const highestPriorityRegs = Enumerable.from(registrations).groupBy(r => r.priority, r => r).orderByDescending(kvp => kvp.key()).firstOrDefault();
            if (!highestPriorityRegs || highestPriorityRegs.isEmpty())
                return;

            const regs = highestPriorityRegs.toArray();
            if (regs.length > 1 && regs.some(r => !r.nonExclusive))
                return;

            regs.forEach(reg => {
                reg.listener(e);
            });
        }

        private _resolveDependencies(hasManagement: boolean) {
            this.importComponent("PopupMenu");
        }

        private _configureContextmenu(e: MouseEvent) {
            let configurableParent: IConfigurable;

            if (!this.service.application.hasManagement || window.getSelection().toString()) {
                e.stopImmediatePropagation();
                return;
            }

            const configureItems: WebComponent[] = [];

            let element = <Node>e.target;
            while (!!element && element !== this) {
                if (!!(<IConfigurable>element)._viConfigure) {
                    const actions: IConfigurableAction[] = [];
                    (<IConfigurable>element)._viConfigure(actions);

                    if (actions.length > 0) {
                        actions.forEach(action => {
                            let item: WebComponent;

                            if (!action.subActions)
                                item = new Vidyano.WebComponents.PopupMenuItem(action.label, action.icon, action.action);
                            else {
                                item = new Vidyano.WebComponents.PopupMenuItemSplit(action.label, action.icon, action.action);
                                action.subActions.forEach(subA => Polymer.dom(item).appendChild(new Vidyano.WebComponents.PopupMenuItem(subA.label, subA.icon, subA.action)));
                            }

                            configureItems.push(item);
                        });
                    }
                }

                element = element.parentNode || (<any>element).host;
            }

            if (configureItems.length === 0) {
                e.stopImmediatePropagation();
                return;
            }

            const popupMenuItem = <PopupMenuItem>this.$$("#viConfigure");
            this.empty(popupMenuItem);

            configureItems.forEach(item => Polymer.dom(popupMenuItem).appendChild(item));
        }

        private _computeThemeColorVariants(base: string, target: string, isAttached: boolean) {
            if (!isAttached || !base)
                return;

            if (!base.startsWith("#"))
                base = `#${base}`;

            const appColor = new AppColor(base);

            this.customStyle[`--theme-${target}`] = base;
            this.customStyle[`--theme-${target}-light`] = appColor.light;
            this.customStyle[`--theme-${target}-lighter`] = appColor.lighter;
            this.customStyle[`--theme-${target}-dark`] = appColor.dark;
            this.customStyle[`--theme-${target}-darker`] = appColor.darker;
            this.customStyle[`--theme-${target}-faint`] = appColor.faint;
            this.customStyle[`--theme-${target}-semi-faint`] = appColor.semiFaint;

            this.updateStyles();
        }

        private _updateAvailable() {
            if (this._updateAvailableSnoozeTimer)
                return;

            this._setUpdateAvailable(true);

            Polymer.dom(this).flush();
            this.async(() => this.$$("#update").classList.add("show"), 100);
        }

        private _refreshForUpdate() {
            document.location.reload(true);
        }

        private _refreshForUpdateDismiss() {
            if (this._updateAvailableSnoozeTimer)
                clearTimeout(this._updateAvailableSnoozeTimer);

            this._updateAvailableSnoozeTimer = setTimeout(() => {
                this._updateAvailableSnoozeTimer = null;
                this._updateAvailable();
            }, 300000);

            this.$$("#update").classList.remove("show");
            this.async(() => this._setUpdateAvailable(false), 500);
        }

        static removeRootPath(path: string = ""): string {
            if (path.startsWith(Path.routes.rootPath))
                return path.substr(Path.routes.rootPath.length);

            return path;
        }
    }

    export class AppServiceHooks extends Vidyano.ServiceHooks {
        constructor(public app: App) {
            super();
        }

        private _initializeGoogleAnalytics() {
            let addScript = false;
            if (typeof (_gaq) === "undefined") {
                _gaq = [];
                addScript = true;
            }

            _gaq.push(["_setAccount", this.app.service.application.analyticsKey]);
            _gaq.push(["_setDomainName", "none"]); // NOTE: Track all domains

            if (addScript) {
                const ga = document.createElement("script");
                ga.type = "text/javascript"; ga.async = true;
                ga.src = ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";

                const script = document.getElementsByTagName("script")[0];
                script.parentNode.insertBefore(ga, script);
            }
        }

        trackEvent(action: string, option: string, owner: ServiceObjectWithActions) {
            if (!this.app || !this.app.service || !this.app.service.application || !this.app.service.application.analyticsKey)
                return;

            this._initializeGoogleAnalytics();

            let page = "Unknown";
            let type = "Unknown";

            if (owner != null) {
                if (owner instanceof Vidyano.Query) {
                    page = "Query";
                    type = owner.persistentObject.type;
                }
                else if (owner instanceof Vidyano.PersistentObject) {
                    page = "PersistentObject";
                    type = owner.type;
                }
            }

            _gaq.push(["_setCustomVar", 1, "UserId", this.app.service.application.userId, 1]);
            _gaq.push(["_setCustomVar", 2, "Page", page, 2]);
            _gaq.push(["_setCustomVar", 3, "Type", type, 2]);
            _gaq.push(["_setCustomVar", 4, "Option", option, 2]);

            _gaq.push(["_trackEvent", "Action", action.split(".").pop()]);
        }

        trackPageView(path: string) {
            if (!this.app || !this.app.service || !this.app.service.application || !this.app.service.application.analyticsKey)
                return;

            path = Vidyano.WebComponents.App.removeRootPath(path);
            if (!path || path.startsWith("FromAction"))
                return;

            this._initializeGoogleAnalytics();

            _gaq.push(["_setCustomVar", 1, "UserId", this.app.service.application.userId, 1]);
            _gaq.push(["_trackPageview", path]);
        }

        getPersistentObjectConfig(persistentObject: Vidyano.PersistentObject, persistentObjectConfigs: PersistentObjectConfig[]): PersistentObjectConfig {
            const persistentObjectConfigsEnum = Enumerable.from(persistentObjectConfigs);
            return persistentObjectConfigsEnum.firstOrDefault(c => (c.id === persistentObject.id || c.type === persistentObject.type) && c.objectId === persistentObject.objectId) ||
                persistentObjectConfigsEnum.firstOrDefault(c => c.id === persistentObject.id || c.type === persistentObject.type);
        }

        getAttributeConfig(attribute: Vidyano.PersistentObjectAttribute, attributeConfigs: PersistentObjectAttributeConfig[]): PersistentObjectAttributeConfig {
            const attributeConfigsEnum = Enumerable.from(attributeConfigs);
            return attributeConfigsEnum.firstOrDefault(c => c.parentObjectId === attribute.parent.objectId && c.parentId === attribute.parent.id && (c.name === attribute.name || c.type === attribute.type)) ||
                attributeConfigsEnum.firstOrDefault(c => c.parentId === attribute.parent.id && (c.name === attribute.name || c.type === attribute.type)) ||
                attributeConfigsEnum.firstOrDefault(c => c.name === attribute.name && c.type === attribute.type && !c.parentId) ||
                attributeConfigsEnum.firstOrDefault(c => c.name === attribute.name && !c.parentId && !c.type) ||
                attributeConfigsEnum.firstOrDefault(c => c.type === attribute.type && !c.parentId && !c.name);
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab, tabConfigs: PersistentObjectTabConfig[]): PersistentObjectTabConfig {
            const tabConfigsEnum = Enumerable.from(tabConfigs);
            return tabConfigsEnum.firstOrDefault(c => c.name === tab.name && (c.type === tab.parent.type || c.type === tab.parent.fullTypeName || c.id === tab.parent.id) && c.objectId === tab.parent.objectId) ||
                tabConfigsEnum.firstOrDefault(c => c.name === tab.name && (c.type === tab.parent.type || c.type === tab.parent.fullTypeName || c.id === tab.parent.id));
        }

        getProgramUnitConfig(name: string, programUnitConfigs: ProgramUnitConfig[]): ProgramUnitConfig {
            return Enumerable.from(programUnitConfigs).firstOrDefault(c => c.name === name);
        }

        getQueryConfig(query: Vidyano.Query, queryConfigs: QueryConfig[]): QueryConfig {
            const queryConfigsEnum = Enumerable.from(queryConfigs);
            return queryConfigsEnum.firstOrDefault(c => c.id === query.id || c.name === query.name) ||
                queryConfigsEnum.firstOrDefault(c => c.type === query.persistentObject.type) ||
                queryConfigsEnum.firstOrDefault(c => !c.id && !c.name && !c.type);
        }

        getQueryChartConfig(type: string, queryChartConfigs: QueryChartConfig[]): QueryChartConfig {
            return Enumerable.from(queryChartConfigs).firstOrDefault(c => c.type === type);
        }

        onConstructQuery(service: Service, query: any, parent?: Vidyano.PersistentObject, asLookup: boolean = false, maxSelectedItems?: number): Vidyano.Query {
            const newQuery = super.onConstructQuery(service, query, parent, asLookup, maxSelectedItems);

            const queryConfig = this.app.configuration.getQueryConfig(newQuery);
            if (queryConfig) {
                if (queryConfig.defaultChart)
                    newQuery.defaultChartName = queryConfig.defaultChart;

                if (queryConfig.selectAll)
                    newQuery.selectAll.isAvailable = true;
            }

            return newQuery;
        }

        async onActionConfirmation(action: Action, option: number): Promise<boolean> {
            const result = await this.app.showMessageDialog({
                title: action.displayName,
                titleIcon: "Action_" + action.name,
                message: this.service.getTranslatedMessage(action.definition.confirmation, option >= 0 ? action.options[option] : undefined),
                actions: [action.displayName, this.service.getTranslatedMessage("Cancel")],
                actionTypes: action.name === "Delete" ? ["Danger"] : []
            });

            return result === 0;
        }

        async onAction(args: ExecuteActionArgs): Promise<Vidyano.PersistentObject> {
            if (args.action === "AddReference") {
                args.isHandled = true;

                const query = args.query.clone(true);
                query.search();

                await this.app.importComponent("SelectReferenceDialog");
                const result = await this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(query));
                if (result && result.length > 0) {
                    args.selectedItems = result;

                    return await args.executeServiceRequest();
                }
                else
                    return null;
            }
            else if (args.action === "ShowHelp") {
                // Only pass selected tab for actions on persistent objects
                if (!args.query) {
                    let cacheEntry = new PersistentObjectAppCacheEntry(args.persistentObject);
                    cacheEntry = <PersistentObjectAppCacheEntry>Enumerable.from(this.app.cacheEntries).firstOrDefault(ce => ce.isMatch(cacheEntry));

                    if (cacheEntry && cacheEntry.selectedMasterTab) {
                        if (!args.parameters)
                            args.parameters = {};

                        args.parameters["selectedMasterTab"] = cacheEntry.selectedMasterTab.name;
                    } else if (args.parameters && args.parameters["selectedMasterTab"])
                        args.parameters["selectedMasterTab"] = undefined;
                }

                return super.onAction(args);
            }

            return super.onAction(args);
        }

        async onOpen(obj: ServiceObject, replaceCurrent: boolean = false, fromAction: boolean = false) {
            if (obj instanceof Vidyano.PersistentObject) {
                const po = <Vidyano.PersistentObject>obj;

                if (po.stateBehavior.indexOf("AsWizard") >= 0) {
                    await this.app.importComponent("PersistentObjectWizardDialog");
                    await this.app.showDialog(new Vidyano.WebComponents.PersistentObjectWizardDialog(po));

                    return;
                }
                else if (po.stateBehavior.indexOf("OpenAsDialog") >= 0) {
                    await this.app.importComponent("PersistentObjectDialog");
                    await this.app.showDialog(new Vidyano.WebComponents.PersistentObjectDialog(po));

                    return;
                }

                let path: string;
                if (!fromAction) {
                    path = this.app.getUrlForPersistentObject(po.id, po.objectId);

                    const cacheEntry = new PersistentObjectAppCacheEntry(po);
                    const existing = this.app.cachePing(cacheEntry);
                    if (existing)
                        this.app.cacheRemove(existing);

                    this.app.cache(cacheEntry);
                }
                else {
                    const fromActionId = Unique.get();
                    path = this.app.getUrlForFromAction(fromActionId);

                    if (!po.isNew && po.objectId) {
                        const existingPoCacheEntry = this.app.cachePing(new PersistentObjectAppCacheEntry(po));
                        if (existingPoCacheEntry)
                            this.app.cacheRemove(existingPoCacheEntry);
                    }
                    else if (po.isBulkEdit) {
                        po.bulkObjectIds.forEach(poId => {
                            const existingPoCacheEntry = this.app.cachePing(new PersistentObjectAppCacheEntry(po.id, poId));
                            if (existingPoCacheEntry)
                                this.app.cacheRemove(existingPoCacheEntry);
                        });
                    }

                    this.app.cache(new PersistentObjectFromActionAppCacheEntry(po, fromActionId, this.app.path));
                }

                this.app.changePath(path, replaceCurrent);
            }
        }

        onClose(parent: Vidyano.ServiceObject) {
            if (parent instanceof Vidyano.PersistentObject) {
                const cacheEntry = <PersistentObjectFromActionAppCacheEntry>this.app.cachePing(new PersistentObjectFromActionAppCacheEntry(parent));
                if (cacheEntry instanceof PersistentObjectFromActionAppCacheEntry && cacheEntry.fromActionIdReturnPath) {
                    if (App.removeRootPath(this.app.getUrlForFromAction(cacheEntry.fromActionId)) === App.removeRootPath(this.app.path)) {
                        if (this.app.noHistory)
                            this.app.changePath(cacheEntry.fromActionIdReturnPath, true);
                        else
                            history.back();
                    }
                }
            }
        }

        onRedirectToSignIn(keepUrl: boolean) {
            this.app.changePath("SignIn" + (keepUrl && this.app.path ? "/" + encodeURIComponent(App.removeRootPath(this.app.path)).replace(/\./g, "%2E").replace("SignIn", "") : ""), true);
        }

        onRedirectToSignOut(keepUrl: boolean) {
            this.app.changePath("SignOut" + (keepUrl && this.app.path ? "/" + encodeURIComponent(App.removeRootPath(decodeURIComponent(this.app.path))).replace(/\./g, "%2E").replace("SignIn", "") : ""), true);
        }

        onMessageDialog(title: string, message: string, rich: boolean, ...actions: string[]): Promise<number> {
            return this.app.showMessageDialog({ title: title, message: message, rich: rich, actions: actions });
        }

        onShowNotification(notification: string, type: NotificationType, duration: number) {
            if (!duration || !notification)
                return;

            if (typeof notification === "object")
                notification = notification["message"];

            this.app.showAlert(notification, type, duration);
        }

        async onSelectReference(query: Vidyano.Query): Promise<QueryResultItem[]> {
            if (!query.hasSearched)
                query.search();

            await this.app.importComponent("SelectReferenceDialog");
            return this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(query, false, false, true));
        }

        onSessionExpired(): boolean {
            if (!this.app.barebone) {
                this.app.redirectToSignIn();
                return false;
            }

            this.app.service.signOut(true).then(() => this.app.reinitialize());

            return true;
        }

        onUpdateAvailable() {
            this.app.fire("app-update-available", null);
        }

        onNavigate(path: string, replaceCurrent: boolean = false) {
            this.app.changePath(Vidyano.WebComponents.App.removeRootPath(path), replaceCurrent);
        }

        onClientOperation(operation: ClientOperations.IClientOperation) {
            switch (operation.type) {
                case "Refresh":
                    const refresh = <ClientOperations.IRefreshOperation>operation;
                    if (refresh.queryId) {
                        const cacheEntry = <QueryAppCacheEntry>this.app.cachePing(new QueryAppCacheEntry(refresh.queryId));
                        if (cacheEntry && cacheEntry.query)
                            cacheEntry.query.search({ delay: refresh.delay });

                        const poCacheEntriesWithQueries = <PersistentObjectAppCacheEntry[]>this.app.cacheEntries.filter(e => e instanceof PersistentObjectAppCacheEntry && !!e.persistentObject && e.persistentObject.queries.length > 0);
                        poCacheEntriesWithQueries.forEach(poEntry => poEntry.persistentObject.queries.filter(q => q.id === refresh.queryId).forEach(q => q.search({ delay: refresh.delay })));
                    }
                    else {
                        const refreshPersistentObject = async () => {
                            const cacheEntry = <PersistentObjectAppCacheEntry>this.app.cachePing(new PersistentObjectAppCacheEntry(refresh.fullTypeName, refresh.objectId));
                            if (!cacheEntry || !cacheEntry.persistentObject)
                                return;

                            try {
                                const po = await this.app.service.getPersistentObject(cacheEntry.persistentObject.parent, cacheEntry.persistentObject.id, cacheEntry.persistentObject.objectId);
                                cacheEntry.persistentObject.refreshFromResult(po, true);
                            }
                            catch (e) {
                                cacheEntry.persistentObject.setNotification(e);
                            }
                        };

                        if (refresh.delay)
                            setTimeout(refreshPersistentObject, refresh.delay);
                        else
                            refreshPersistentObject();
                    }

                    break;

                default:
                    super.onClientOperation(operation);
                    break;
            }
        }

        async onQueryFileDrop(query: Vidyano.Query, name: string, contents: string): Promise<boolean> {
            const config = this.app.configuration.getQueryConfig(query);
            const newAction = <Vidyano.Action>query.actions["New"];

            const po = await newAction.execute({ skipOpen: true });
            return query.queueWork(async () => {
                const fileDropAttribute = po.getAttribute(config.fileDropAttribute);
                if (!fileDropAttribute)
                    return false;

                try {
                    await fileDropAttribute.setValue(`${name}|${contents}`);
                    return await po.save();
                }
                catch (e) {
                    query.setNotification(e);
                    return false;
                }
            }, true);
        }

        async onRetryAction(retry: IRetryAction): Promise<string> {
            if (retry.persistentObject) {
                await this.app.importComponent("RetryActionDialog");
                return this.app.showDialog(new Vidyano.WebComponents.RetryActionDialog(retry));
            }

            return super.onRetryAction(retry);
        }
    }
}
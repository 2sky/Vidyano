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

    const hashBangRe = /(.+)#!\/(.*)/;
    if (hashBangRe.test(document.location.href)) {
        const hashBangParts = hashBangRe.exec(document.location.href);
        if (hashBangParts[2].startsWith("SignInWithToken/")) {
            history.replaceState(null, null, hashBangParts[1]);
            Service.token = hashBangParts[2].substr(16);
        }
        else if (hashBangParts[2].startsWith("SignInWithAuthorizationHeader/")) {
            history.replaceState(null, null, hashBangParts[1]);
            Service.token = `JWT:${hashBangParts[2].substr(30)}`;
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
            path: {
                type: String,
                reflectToAttribute: true,
                observer: "_pathChanged",
                value: () => {
                    const base = document.head.querySelector("base") as HTMLBaseElement;
                    const parser = document.createElement("a");
                    parser.href = base.href;

                    Path.routes.rootPath = parser.pathname;
                    Path.root(base.href);
                    Path.history.listen();

                    return document.location.toString().substr(base.href.length).replace(document.location.hash, "");
                }
            },
            service: {
                type: Object,
                computed: "_computeInitialService(uri, hooks, isAttached)"
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
            isProfiling: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeIsProfiling(service.isSignedIn, service.profile)"
            },
            signInLogo: String,
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
            isIe: {
                type: Boolean,
                reflectToAttribute: true,
                value: () => navigator.userAgent.indexOf("Trident/7") !== -1
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
            },
            sensitive: {
                type: Boolean,
                reflectToAttribute: true,
                observer: "_sensitiveChanged"
            },
            sessionLost: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true,
                value: false
            }
        },
        observers: [
            "_hookWindowBeforeUnload(isAttached)",
            "_cleanUpOnSignOut(service.isSignedIn)",
            "_resolveDependencies(service.application.hasManagement)",
            "_computeThemeColorVariants(themeColor, 'color', isAttached)",
            "_computeThemeColorVariants(themeAccentColor, 'accent-color', isAttached)",
            "_importConfigs(configs, isAttached)",
            "_mediaQueryChanged(isDesktop, isTablet, isPhone)"
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
        private _initializeResolve: (app: Vidyano.Application) => void;
        private _initialize: Promise<Vidyano.Application> = new Promise(resolve => { this._initializeResolve = resolve; });
        private _keybindingRegistrations: { [key: string]: Keyboard.IKeybindingRegistration[]; } = {};
        private _beforeUnloadEventHandler: EventListener;
        private _activeDialogs: Dialog[] = [];
        private _updateAvailableSnoozeTimer: number;
        readonly initializing: boolean; private _setInitializing: (init: boolean) => void;
        readonly keys: string; private _setKeys: (keys: string) => void;
        readonly barebone: boolean; private _setBarebone: (barebone: boolean) => void;
        readonly updateAvailable: boolean; private _setUpdateAvailable: (updateAvailable: boolean) => void;
        readonly sessionLost: boolean; private _setSessionLost: (sessionLost: boolean) => void;
        readonly isIe: boolean;
        programUnit: ProgramUnit;
        uri: string;
        hooks: string;
        path: string;
        cacheSize: number;
        noMenu: boolean;
        label: string;
        isTracking: boolean;
        sensitive: boolean;

        async attached() {
            super.attached();

            window.addEventListener("storage", this._onSessionStorage.bind(this), false);

            const bareboneTemplate = <PolymerTemplate><Node>Polymer.dom(this).children.filter(c => c.tagName === "TEMPLATE" && c.getAttribute("is") === "dom-template")[0];
            this._setBarebone(!!bareboneTemplate);
            if (this.barebone)
                Polymer.dom(this.root).appendChild(bareboneTemplate.stamp({ app: this }).root);

            Vidyano.ServiceBus.subscribe("path-changed", (sender, message, details) => {
                if (sender === this)
                    return;

                this.path = details.path;
            }, true);

            Vidyano.Path.rescue(() => {
                const path = App.removeRootPath(Vidyano.Path.routes.current);
                if (!this.barebone) {
                    let mappedPath = this._convertPath(this.app.service.application, path);
                    if (mappedPath !== path)
                        Vidyano.Path["dispatch"](Vidyano.Path.routes.rootPath + mappedPath);
                    else if (path.contains("/")) {
                        const parts = path.split("/");
                        const kebabPath = [parts[0].toKebabCase(), parts[1].toKebabCase(), ...parts.slice(2)].join("/");
                        const mappedKebabPath = this._convertPath(this.app.service.application, kebabPath);
                        if (kebabPath !== mappedKebabPath) {
                            this.async(() => this.changePath(kebabPath, true));
                            return;
                        }
                    }
                }

                this.path = path;
            });

            if (!this.label)
                this.label = this.title;

            const keys = <any>this.$$("iron-a11y-keys");
            keys.target = document.body;
        }

        private _onSessionStorage(event: StorageEvent) {
            if (!event)
                event = <StorageEvent>window.event;

            if (event.newValue == null || (!event.newValue.startsWith("{") && Vidyano.cookiePrefix !== event.newValue))
                return;
            else if (event.newValue.startsWith("{")) {
                const value = JSON.parse(event.newValue);
                if (Vidyano.cookiePrefix !== value.cookiePrefix)
                    return;
            }

            if (event.key === "vi-signOut" && this.service && this.service.isSignedIn)
                this._setSessionLost(true);
            else if (this.sessionLost && event.key === "vi-setAuthToken") {
                const authTokenInfo = JSON.parse(event.newValue);

                this.service.authToken = authTokenInfo.authToken;
                this._setSessionLost(false);
            }
            else if (event.key === "vi-updateAvailable") {
                if (this.service != null)
                    this.service.hooks.onUpdateAvailable();
                else
                    this._updateAvailable();
            }
        }

        private _reload(e: TapEvent) {
            e.stopPropagation();

            document.location.reload();
        }

        get configuration(): AppConfig {
            return this.$$("vi-app-config") as AppConfig;
        }

        get initialize(): Promise<Vidyano.Application> {
            return this._initialize;
        }

        private async _pathChanged(path: string) {
            await this.initialize;

            if (path !== this.path)
                return;

            path = Vidyano.WebComponents.App.removeRootPath(this._convertPath(this.service.application, path));
            if (this.service && this.service.isSignedIn && path === "") {
                let programUnit = this.programUnit;
                if (!programUnit && this.service.application.programUnits.length > 0)
                    programUnit = this.service.application.programUnits[0];

                if (programUnit && !this.app.barebone) {
                    if (programUnit.openFirst && programUnit.path && path !== programUnit.path) {
                        this.async(() => this.changePath(programUnit.path));
                        return;
                    }
                    else {
                        const config = this.app.configuration.getProgramUnitConfig(programUnit.name);
                        if (!!config && config.hasTemplate) {
                            this.async(() => this.changePath(programUnit.path));
                            return;
                        }
                    }
                }
            }

            Vidyano.ServiceBus.send(this, "path-changed", { path: path });
        }

        changePath(path: string, replaceCurrent: boolean = false) {
            path = path.trimStart("/");
            if (this.path === path)
                return;

            if (!replaceCurrent)
                Vidyano.Path.history.pushState(null, null, Path.routes.rootPath + path);
            else
                Vidyano.Path.history.replaceState(null, null, Path.routes.rootPath + path);
        }

        getUrlForPersistentObject(id: string, objectId: string, pu: ProgramUnit = this.programUnit) {
            const persistentObjects = this.service.application.routes.persistentObjects;
            for (const type in persistentObjects) {
                if (persistentObjects[type] === id)
                    return (pu ? pu.nameKebab + "/" : "") + type + (objectId ? "/" + objectId : "");
            }

            return (pu ? pu.nameKebab + "/" : "") + `persistent-object.${id}${objectId ? "/" + objectId : ""}`;
        }

        getUrlForQuery(id: string, pu: ProgramUnit = this.programUnit) {
            const queries = this.service.application.routes.persistentObjects;
            for (const name in queries) {
                if (queries[name] === id)
                    return (pu ? pu.nameKebab + "/" : "") + `${name}`;
            }

            return (pu ? pu.nameKebab + "/" : "") + `query.${id}`;
        }

        getUrlForFromAction(id: string, pu: ProgramUnit = this.programUnit) {
            return (pu ? pu.nameKebab + "/" : "") + `from-action/${id}`;
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
            const cacheEntry = this._cache.slice().reverse().find(e => entry.isMatch(e));
            if (cacheEntry) {
                this._cache.remove(cacheEntry);
                this._cache.push(cacheEntry);
            }

            return cacheEntry;
        }

        cacheRemove(key: Vidyano.WebComponents.AppCacheEntry) {
            const entry = this._cache.find(e => key.isMatch(e));
            if (entry)
                this._cache.remove(entry);
        }

        get cacheEntries(): Vidyano.WebComponents.AppCacheEntry[] {
            return this._cache;
        }

        cacheClear() {
            this._cache = [];
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

        showAlert(notification: string, type: Vidyano.NotificationType = "Notice", duration: number = 3000) {
            alertify.log(notification, type.toLowerCase(), duration);
        }

        importComponent(...components: string[]): Promise<any> {
            return Promise.all(components.map(async component => {
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
            }));
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

        private _computeIsProfiling(isSignedIn: boolean, profile: boolean): boolean {
            if (!isSignedIn || !profile)
                return false;

            this.importComponent("Profiler");
            return true;
        }

        private _sensitiveChanged(sensitive: boolean) {
            const currentSensitiveCookie = !!BooleanEx.parse(Vidyano.cookie("sensitive"));
            if (currentSensitiveCookie !== sensitive)
                Vidyano.cookie("sensitive", String(sensitive));

            this.fire("sensitive-changed", sensitive, { bubbles: false });
        }

        private _cookiePrefixChanged(cookiePrefix: string) {
            Vidyano.cookiePrefix = cookiePrefix;
        }

        private async _importConfigs(configs: string, isAttached: boolean) {
            if (!configs || !isAttached)
                return;

            const doc = <HTMLDocument>await this.importHref(configs);
            Array.from(doc.body.childNodes).forEach(c => Polymer.dom(this).appendChild(c));
        }

        private _computeInitialService(uri: string, hooks: string, isAttached: boolean): Vidyano.Service {
            if (this.service) {
                console.warn("Service uri and hooks cannot be altered.");
                return this.service;
            }

            let hooksInstance: Vidyano.ServiceHooks;
            if (hooks) {
                const ctor = this.hooks.split(".").reduce((obj: any, path: string) => obj && obj[path], window);
                if (ctor)
                    hooksInstance = new ctor(this);
                else
                    console.error(`Service hooks "${this.hooks}" was not found.`);
            }
            else
                hooksInstance = new AppServiceHooks(this);

            const service = new Vidyano.Service(this.uri, hooksInstance);
            const path = App.removeRootPath(document.location.pathname);
            const skipDefaultCredentialLogin = path.startsWith("sign-in");

            this._setInitializing(true);
            service.initialize(skipDefaultCredentialLogin).then(async () => {
                if (this.service !== service)
                    return;

                if (hooksInstance instanceof Vidyano.WebComponents.AppServiceHooks)
                    await hooksInstance.onBeforeAppInitialized();

                this._initializeResolve(this.service.application);
                this._setInitializing(false);
            }, async e => {
                if (hooksInstance instanceof Vidyano.WebComponents.AppServiceHooks)
                    await hooksInstance.onAppInitializeFailed(e);
            });

            return service;
        }

        private _anchorClickHandler(e: TapEvent, data: any) {
            if (e.defaultPrevented)
                return;

            const anchorParent = this.findParent((e: HTMLElement) => e.tagName === "A" && !!(<HTMLAnchorElement>e).href, e.target as HTMLElement) as HTMLAnchorElement;
            if (anchorParent && anchorParent.href.startsWith(Path.routes.root || "") && !anchorParent.hasAttribute("download") && !(anchorParent.getAttribute("rel") || "").contains("external")) {
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
            if (application && !this.barebone) {
                let match = application.poRe.exec(path);
                if (match)
                    path = (match[1] || "") + "persistent-object." + application.routes.persistentObjects[match[3].toKebabCase()] + (match[4] || "");
                else {
                    match = application.queryRe.exec(path);
                    if (match)
                        path = (match[1] || "") + "query." + application.routes.queries[match[3].toKebabCase()];
                }
            }

            return path;
        }

        private _computeProgramUnit(application: Vidyano.Application, path: string): ProgramUnit {
            path = this._convertPath(application, path);

            const mappedPathRoute = Vidyano.Path.match(Path.routes.rootPath + App.removeRootPath(path), true);
            if (application) {
                if (mappedPathRoute && mappedPathRoute.params && mappedPathRoute.params.programUnitName)
                    return application.programUnits.find(pu => pu.nameKebab === mappedPathRoute.params.programUnitName || pu.name === mappedPathRoute.params.programUnitName) || application.programUnits[0];
                else if (application.programUnits.length > 0)
                    return application.programUnits[0];
            }

            return null;
        }

        private _computeShowMenu(application: Vidyano.Application, noMenu: boolean): boolean {
            if (!application || noMenu)
                return false;

            this.importComponent("Menu");
            return true;
        }

        private _cleanUpOnSignOut(isSignedIn: boolean) {
            if (isSignedIn === false) {

                this.cacheClear();

                // Trigger sign out across tabs for the same base uri
                localStorage.setItem("vi-signOut", Vidyano.cookiePrefix);
                localStorage.removeItem("vi-signOut");
            }
        }

        private _hookWindowBeforeUnload(isAttached: boolean) {
            if (this._beforeUnloadEventHandler) {
                window.removeEventListener("beforeunload", this._beforeUnloadEventHandler);
                this._beforeUnloadEventHandler = null;
            }

            if (isAttached)
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

            this._setKeys(currentKeys.distinct().join(" "));
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

            this._setKeys(currentKeys.distinct().join(" "));
        }

        private _mediaQueryChanged(isDesktop: boolean, isTablet: boolean, isPhone: boolean) {
            this.fire("media-query-changed", isDesktop ? "desktop" : (isTablet ? "tablet" : "phone"), { bubbles: false });
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
            const highestPriorityRegs = registrations.groupBy(r => r.priority).orderByDescending(kvp => kvp.key)[0];
            if (!highestPriorityRegs || !highestPriorityRegs.value.length)
                return;

            const regs = highestPriorityRegs;
            if (regs.value.length > 1 && regs.value.some(r => !r.nonExclusive))
                return;

            regs.value.forEach(reg => {
                reg.listener(e);
            });
        }

        private _resolveDependencies(hasManagement: boolean) {
            this.importComponent("PopupMenu");
        }

        private _configureContextmenu(e: MouseEvent) {
            if (!this.service || !this.service.application)
                return;

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
}
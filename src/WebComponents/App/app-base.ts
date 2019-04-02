interface Window {
    app: Vidyano.WebComponents.AppBase;
}

namespace Vidyano.WebComponents {
    const base = document.head.querySelector("base") as HTMLBaseElement;
    Path.routes.rootPath = base.href;

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

    @WebComponent.registerAbstract({
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
                readOnly: true
            },
            appRoutePresenter: {
                type: Object,
                readOnly: true
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
            initializing: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: true
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
            "_cleanUpOnSignOut(service.isSignedIn)",
            "_computeThemeColorVariants(themeColor, 'color', isConnected)",
            "_computeThemeColorVariants(themeAccentColor, 'accent-color', isConnected)",
            "_importConfigs(configs, isConnected)",
            "_mediaQueryChanged(isDesktop, isTablet, isPhone)"
        ],
        hostAttributes: {
            "tabindex": "-1"
        },
        listeners: {
            "app-route-presenter-connected": "_appRoutePresenterConnected",
            "click": "_anchorClickHandler",
            "app-update-available": "_updateAvailable"
        },
        forwardObservers: [
            "service.isSignedIn",
            "service.application"
        ]
    })
    export abstract class AppBase extends WebComponent {
        private _keybindingRegistrations: { [key: string]: Keyboard.IKeybindingRegistration[]; } = {};
        private _activeDialogs: Dialog[] = [];
        private _updateAvailableSnoozeTimer: number;
        private _setInitializing: (initializing: boolean) => void;
        readonly service: Vidyano.Service; private _setService: (service: Vidyano.Service) => void;
        readonly appRoutePresenter: Vidyano.WebComponents.AppRoutePresenter; private _setAppRoutePresenter: (appRoutePresenter: AppRoutePresenter) => void;
        readonly keys: string; private _setKeys: (keys: string) => void;
        readonly updateAvailable: boolean; private _setUpdateAvailable: (updateAvailable: boolean) => void;
        readonly sessionLost: boolean; private _setSessionLost: (sessionLost: boolean) => void;
        uri: string;
        hooks: string;
        noHistory: boolean;
        cacheSize: number;
        isTracking: boolean;
        sensitive: boolean;
        path: string;

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

        constructor() {
            super();

            window.app = this;
        }

        async connectedCallback() {
            let initialized: () => void;
            this.set("_initialize", new Promise(resolve => initialized = resolve).then(() => {
                this._setInitializing(false);
            }));

            const initializers: Promise<any>[] = [];
            if (this.appRoutePresenter == null) {
                initializers.push(new Promise(resolve => {
                    const task = () => {
                        if (this.appRoutePresenter != null)
                            resolve(this.appRoutePresenter);
                        else
                            Polymer.Async.timeOut.run(task, 250);
                    };

                    Polymer.Async.microTask.run(task);
                }));
            }

            if (this.service == null) {
                const serviceInitializer = new Promise(resolve => {
                    const task = async () => {
                        let hooks: ServiceHooks;
                        if (this.hooks) {
                            const ctor = this.hooks.split(".").reduce((obj: any, path: string) => obj && obj[path], window);
                            if (ctor)
                                hooks = new ctor(this);
                            else
                                Polymer.Async.timeOut.run(task, 250);
                        }
                        else
                            hooks = this._createServiceHooks();

                        if (this.service == null)
                            this._setService(new Vidyano.Service(this.uri, hooks));

                        super.connectedCallback();

                        const path = this.noHistory ? this.path : AppBase.removeRootPath(document.location.pathname);
                        await this.service.initialize(path.startsWith("SignIn"));

                        resolve(this.service);
                    };

                    Polymer.Async.microTask.run(task);
                });

                await serviceInitializer;
            }
            else
                super.connectedCallback();

            window.addEventListener("storage", this._onSessionStorage.bind(this), false);

            Vidyano.Path.rescue(() => {
                this.path = decodeURI(AppBase.removeRootPath(Vidyano.Path.routes.current));
            });

            if (!this.noHistory) {
                Vidyano.Path.root(base.href);
                Vidyano.Path.history.listen();

                Vidyano.Path["dispatch"](document.location.toString().substr(base.href.length).replace(document.location.hash, ""));
            }

            const keys = <any>this.shadowRoot.querySelector("iron-a11y-keys");
            keys.target = document.body;

            await Promise.all(initializers);
            initialized();

            if (this.noHistory)
                this.changePath(this.path);
        }

        get initialize(): Promise<any> {
            return this.get("_initialize");
        }

        private _appRoutePresenterConnected(e: CustomEvent) {
            const appRoutePresenter = <AppRoutePresenter>e.composedPath()[0];
            this._setAppRoutePresenter(appRoutePresenter);
        }

        protected _createServiceHooks(): ServiceHooks {
            return new AppServiceHooksBase(this);
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

        private _reload(e: Polymer.TapEvent) {
            e.stopPropagation();

            document.location.reload();
        }

        get configuration(): AppConfig {
            return this.shadowRoot.querySelector("vi-app-config") as AppConfig;
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

        async showDialog(dialog: Dialog): Promise<any> {
            this.shadowRoot.appendChild(dialog);
            this._activeDialogs.push(dialog);

            try {
                return await dialog.open();
            }
            finally {
                this.shadowRoot.removeChild(dialog);
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

        importComponent(...components: string[]): Promise<any> {
            return Promise.all(components.map(async component => {
                if (component.split(".").reduce((obj: any, path: string) => obj[path], Vidyano.WebComponents))
                    return Promise.resolve(null);

                const vidyanoComponentFolder = component.replace(".", "/");
                const vidyanoComponent = vidyanoComponentFolder.split("/").reverse()[0].replace(/([A-Z])/g, m => "-" + m[0].toLowerCase()).substr(1);
                const href = this.resolveUrl(`../${vidyanoComponentFolder}/${vidyanoComponent}.html`, Vidyano.WebComponents.App["importPath"]);

                try {
                    await this.importHref(href);
                }
                catch (e) {
                    console.error(`Unable to load component ${component} via import ${href}`);
                }
            }));
        }

        async importLib(lib: string): Promise<any> {
            const href = this.resolveUrl(`../../Libs/${App._libs[lib] || lib}`);

            try {
                await this.importHref(href);
            }
            catch (e) {
                console.error(`Unable to load support library ${lib} via import ${href}`);
            }
        }

        redirectToSignIn(keepUrl: boolean = true) {
            (<AppServiceHooks>this.service.hooks).onRedirectToSignIn(keepUrl);
        }

        redirectToSignOut(keepUrl: boolean = true) {
            (<AppServiceHooks>this.service.hooks).onRedirectToSignOut(keepUrl);
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

        private _anchorClickHandler(e: MouseEvent) {
            if (e.defaultPrevented)
                return;

            const path = e.composedPath();
            const anchorParent = <HTMLAnchorElement>path.find(el => el.tagName === "A");
            if (anchorParent && anchorParent.href.startsWith(Path.routes.root || "") && !anchorParent.hasAttribute("download") && !(anchorParent.getAttribute("rel") || "").contains("external")) {
                e.stopPropagation();
                e.preventDefault();

                let path = anchorParent.href.slice(Path.routes.root.length);
                if (path.startsWith("#!/"))
                    path = path.substr(3);

                this.changePath(path);
            }
        }

        private _updateAvailable() {
            if (this._updateAvailableSnoozeTimer)
                return;

            this._setUpdateAvailable(true);

            Polymer.flush();
            // TODO
            // this.async(() => this.shadowRoot.querySelector("#update").classList.add("show"), 100);
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

            this.shadowRoot.querySelector("#update").classList.remove("show");
            // TODO
            // this.async(() => this._setUpdateAvailable(false), 500);
        }

        private _computeThemeColorVariants(base: string, target: string, isConnected: boolean) {
            if (!isConnected || !base)
                return;

            if (!base.startsWith("#"))
                base = `#${base}`;

            const appColor = new AppColor(base);

            const customStyle = {};
            customStyle[`--theme-${target}`] = base;
            customStyle[`--theme-${target}-light`] = appColor.light;
            customStyle[`--theme-${target}-lighter`] = appColor.lighter;
            customStyle[`--theme-${target}-dark`] = appColor.dark;
            customStyle[`--theme-${target}-darker`] = appColor.darker;
            customStyle[`--theme-${target}-faint`] = appColor.faint;
            customStyle[`--theme-${target}-semi-faint`] = appColor.semiFaint;
            customStyle[`--theme-${target}-rgb`] = appColor.rgb;

            this.updateStyles(customStyle);
        }

        protected _cleanUpOnSignOut(isSignedIn: boolean) {
            if (isSignedIn === false) {
                // Trigger sign out across tabs for the same base uri
                localStorage.setItem("vi-signOut", Vidyano.cookiePrefix);
                localStorage.removeItem("vi-signOut");
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

        static removeRootPath(path: string = ""): string {
            if (path.startsWith(Path.routes.rootPath))
                return path.substr(Path.routes.rootPath.length);

            return path;
        }
    }
}

if (document.querySelector("body > vi-app"))
    Polymer.importHref(Polymer.ResolveUrl.pathFromUrl((<HTMLScriptElement>document.currentScript).src) + "app.html");
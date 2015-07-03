module Vidyano.WebComponents {
    var hashBang: string = "#!/";

    interface AppRouteComponentConstructor extends HTMLElement {
        new (): AppRouteComponentConstructor;
    }

    export class AppRoute extends WebComponent {
        private _constructor: AppRouteComponentConstructor;
        private _constructorChanged: boolean;
        private _parameters: { [key: string]: string } = {};
        active: boolean;

        private _setActive: (val: boolean) => void;

        constructor(public route: string, public component: string) {
            super();
        }

        attached() {
            super.attached();

            this.fire("app-route-add", { route: this.route, component: this.component });
        }

        activate(parameters: { [key: string]: string }): boolean {
            var component = <WebComponent><any>Polymer.dom(this).children[0];
            if (!component || this._constructorChanged) {
                this._constructorChanged = false;

                this.empty();
                component = <WebComponent><any>new this._constructor();
                Polymer.dom(this).appendChild(component);
            }

            if (component.fire("activating", { route: this, parameters: this._parameters = parameters }, { bubbles: false, cancelable: true }).defaultPrevented)
                return false;

            this._setActive(true);
            component.fire("activated", { route: this }, { bubbles: false, cancelable: false });

            return true;
        }

        deactivate() {
            this._setActive(false);
        }

        get parameters(): any {
            return this._parameters;
        }

        private _componentChanged() {
            this._constructor = <AppRouteComponentConstructor><any>this.component.split(".").reduce((obj: any, path: string) => obj[path], window);
            this._constructorChanged = true;
        }
    }

    export class AppCacheEntry {
        constructor(public id: string) {
        }

        isMatch(entry: AppCacheEntry): boolean {
            return entry.id == this.id;
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

            if (entry.persistentObject === this.persistentObject)
                return true;

            return super.isMatch(entry) && (entry.objectId === this.objectId || StringEx.isNullOrEmpty(entry.objectId) && StringEx.isNullOrEmpty(this.objectId));
        }
    }

    export class PersistentObjectFromActionAppCacheEntry extends PersistentObjectAppCacheEntry {
        constructor(po: Vidyano.PersistentObject, public fromActionId?: string, public fromActionIdReturnPath?: string) {
            super(po);
        }

        isMatch(entry: PersistentObjectFromActionAppCacheEntry): boolean {
            if (!(entry instanceof PersistentObjectFromActionAppCacheEntry))
                return false;

            return this.fromActionId == entry.fromActionId || entry.persistentObject === this.persistentObject;
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

    export class App extends WebComponent {
        private _cache: AppCacheEntry[] = [];
        private _initializationError: string;
        private _routeMap: { [key: string]: AppRoute } = {};
        private _keybindingRegistrations: { [key: string]: Keyboard.KeybindingRegistration[]; } = {};
        private routeMapVersion: number;
        private _configuration: AppConfig;
        service: Vidyano.Service;
        currentRoute: AppRoute;
        initializing: boolean;
        uri: string;
        noHistory: boolean;
        path: string;
        cacheSize: number;
        noMenu: boolean;
        programUnit: ProgramUnit;
        label: string;
        keys: string;

        private _setInitializing: (init: boolean) => void;
        private _setProgramUnit: (pu: ProgramUnit) => void;
        private _setRouteMapVersion: (version: number) => void;
        private _setKeys: (keys: string) => void;

        attached() {
            super.attached();

            if (!this.label)
                this.label = this.asElement.title;

            var keys = <any>this.$$("iron-a11y-keys");
            keys.target = document.body;
        }

        get configuration(): AppConfig {
            return this._configuration;
        }

        private _setConfiguration(config: AppConfig) {
            this._configuration = config;
        }

        changePath(path: string, replaceCurrent: boolean = false) {
            path = hashBang + App._stripHashBang(path);
            if (this.path === path)
                return;

            if (!this.noHistory) {
                if (!replaceCurrent)
                    Vidyano.Path.history.pushState(null, null, path);
                else
                    Vidyano.Path.history.replaceState(null, null, path);
            }
            else
                this.path = path;
        }

        getUrlForPersistentObject(id: string, objectId: string, pu: ProgramUnit = this.programUnit) {
            return (pu ? pu.name + "/" : "") + "PersistentObject." + id + "/" + objectId;
        }

        getUrlForQuery(id: string, pu: ProgramUnit = this.programUnit) {
            return (pu ? pu.name + "/" : "") + "Query." + id;
        }

        getUrlForFromAction(id: string, pu: ProgramUnit = this.programUnit) {
            return (pu ? pu.name + "/" : "") + "FromAction/" + id;
        }

        cache(entry: Vidyano.WebComponents.AppCacheEntry): Vidyano.WebComponents.AppCacheEntry {
            // Remove LRU from cache
            if (this._cache.length >= this.cacheSize)
                this._cache.splice(0, this._cache.length - this.cacheSize);

            var cacheEntry = this.cachePing(entry);
            if (!cacheEntry)
                this._cache.push(cacheEntry = entry);

            return cacheEntry;
        }

        cachePing(entry: Vidyano.WebComponents.AppCacheEntry): Vidyano.WebComponents.AppCacheEntry {
            var cacheEntry = Enumerable.from(this._cache).lastOrDefault(e => entry.isMatch(e));
            if (cacheEntry) {
                this._cache.remove(cacheEntry);
                this._cache.push(cacheEntry);
            }

            return cacheEntry;
        }

        cacheRemove(key: Vidyano.WebComponents.AppCacheEntry) {
            var entry = Enumerable.from(this._cache).firstOrDefault(e => key.isMatch(e));
            if (entry)
                this._cache.remove(entry);
        }

        cacheClear() {
            this._cache = [];
        }

        createServiceHooks(): ServiceHooks {
            return new AppServiceHooks(this);
        }

        redirectToSignIn(keepUrl: boolean = true) {
            this.changePath("SignIn" + (keepUrl && this.path ? "/" + encodeURIComponent(App._stripHashBang(this.path)).replace(/\./g, "%2E") : ""), true);
            for (var route in this._routeMap) {
                if (!App._stripHashBang(route).startsWith("SignIn"))
                    this._routeMap[route].empty();
            }
        }

        showMessageDialog(options: MessageDialogOptions): Promise<number> {
            var messageDialog = new Vidyano.WebComponents.MessageDialog();
            Polymer.dom(this).appendChild(messageDialog);

            return messageDialog.show(options).then(result => {
                Polymer.dom(this).removeChild(messageDialog);
                return result;
            }, e => {
                    Polymer.dom(this).removeChild(messageDialog);
                    throw e;
                });
        }

        private _computeService(uri: string, user: string): Vidyano.Service {
            var service = new Vidyano.Service(this.uri, this.createServiceHooks(), user);
            this._setInitializing(true);

            Promise.all([service.initialize(document.location.hash && App._stripHashBang(document.location.hash).startsWith("SignIn"))]).then(() => {
                if (this.service == service)
                    this._onInitialized();
            }, e => {
                    if (this.service === service) {
                        // TODO(sleeckx): Go to SignIn
                        this._initializationError = e;
                        this._onInitialized();
                    }
                });

            return service;
        }

        private _onInitialized() {
            Vidyano.Path.rescue(() => {
                this.path = App._stripHashBang(Vidyano.Path.routes.current);
            });

            if (!this.noHistory) {
                Vidyano.Path.root(hashBang + App._stripHashBang(this.path));
                Vidyano.Path.history.listen();
                Vidyano.Path.listen();
            }
            else
                this.changePath(this.path);

            this._setInitializing(false);
        }

        private _computeMappedRoute(path: string, routeMapVersion: number) {
            return Vidyano.Path.match(hashBang + App._stripHashBang(path), true);
        }

        private _computeCurrentRoute(mappedRoute: Route, path: string): AppRoute {
            var currentRoute = this.currentRoute;

            // Find route and activate
            if (mappedRoute) {
                var route = this._routeMap[hashBang + App._stripHashBang(mappedRoute.path)];
                if (route && route.activate(mappedRoute.params)) {
                    if (currentRoute && currentRoute != route)
                        currentRoute.deactivate();

                    currentRoute = route;
                }
            }
            else
                currentRoute = null;

            return currentRoute;
        }

        private _computeProgramUnit(mappedRoute: Route, path: string, application: Vidyano.Application): ProgramUnit {
            if (!mappedRoute || !application)
                return null;

            if (mappedRoute.params && mappedRoute.params.programUnitName)
                return Enumerable.from(application.programUnits).firstOrDefault(pu => pu.name == mappedRoute.params.programUnitName);
            else if (application.programUnits.length > 0)
                return application.programUnits[0];

            return null;
        }

        private _computeShowMenu(isSignedIn: boolean, noMenu: boolean): boolean {
            return isSignedIn && !noMenu;
        }

        private _start(initializing: boolean, path: string) {
            if (initializing)
                return;

            if (!this.service.isSignedIn && !App._stripHashBang(path).startsWith("SignIn")) {
                if (this.service.defaultUserName) {
                    this._setInitializing(true);
                    this.service.signInUsingDefaultCredentials().then(() => {
                        this._setInitializing(false);
                    });
                }
                else
                    this.redirectToSignIn();
            }
        }

        private _appRouteAdded(e: Event, detail: { route: string; component: string; }) {
            this.async(() => {
                if (this._routeMap[hashBang + App._stripHashBang(detail.route)] === undefined) {
                    Vidyano.Path.map(hashBang + App._stripHashBang(detail.route)).to(() => {
                        this.path = Vidyano.Path.routes.current;
                    });

                    this._routeMap[hashBang + App._stripHashBang(detail.route)] = <AppRoute><any>e.target;
                }

                this._setRouteMapVersion(this.routeMapVersion + 1);
            });
        }

        private _registerKeybindings(registration: Keyboard.KeybindingRegistration) {
            var currentKeys = this.keys ? this.keys.split(" ") : [];
            registration.keys.forEach(key => {
                var registrations = this._keybindingRegistrations[key] || (this._keybindingRegistrations[key] = []);
                registrations.push(registration);

                var e = registration.element;
                do {
                    if (e instanceof Vidyano.WebComponents.AppRoute) {
                        registration.appRoute = <Vidyano.WebComponents.AppRoute><any>e;
                        break;
                    }

                    e = e.parentElement;
                }
                while (e != null);

                currentKeys.push(key);
            });

            this._setKeys(Enumerable.from(currentKeys).distinct().toArray().join(" "));
        }

        private _unregisterKeybindings(registration: Keyboard.KeybindingRegistration) {
            var currentKeys = this.keys.split(" ");

            registration.keys.forEach(key => {
                var registrations = this._keybindingRegistrations[key];
                registrations.remove(registration);

                if (registrations.length == 0) {
                    this._keybindingRegistrations[key] = undefined;
                    currentKeys.remove(key);
                }
            });

            this._setKeys(Enumerable.from(currentKeys).distinct().toArray().join(" "));
        }

        private _keysPressed(e: Keyboard.KeysEvent) {
            if (!this._keybindingRegistrations[e.detail.combo])
                return;

            var activeRegs = this._keybindingRegistrations[e.detail.combo].filter(reg => !reg.appRoute || reg.appRoute.active);
            var highestPriorityRegs = Enumerable.from(activeRegs).groupBy(r => r.priority, r => r).orderByDescending(kvp => kvp.key()).firstOrDefault();
            if (!highestPriorityRegs || highestPriorityRegs.isEmpty())
                return;

            var regs = highestPriorityRegs.toArray();
            if (regs.length > 1 && regs.some(r => !r.nonExclusive))
                    return;

            regs.forEach(reg => {
                reg.listener(e);
            });
        }

        private static _stripHashBang(path: string): string {
            return path && path.replace(hashBang, "") || "";
        }
    }

    export class AppServiceHooks extends Vidyano.ServiceHooks {
        constructor(public app: App) {
            super();
        }

        onAction(args: ExecuteActionArgs): Promise<any> {
            if (args.action == "Delete") {
                return this.app.showMessageDialog({
                    title: this.service.getTranslatedMessage("Delete"),
                    titleIcon: "Icon_Action_Delete",
                    message: this.service.getTranslatedMessage("AskForDeleteItems"),
                    actions: [this.service.getTranslatedMessage("Delete"), this.service.getTranslatedMessage("Cancel")],
                    actionTypes: ["Danger", "Safe"]
                }).then(result => {
                    return result == 0 ? args.executeServiceRequest() : Promise.reject(null);
                });
            }
            else if (args.action == "AddReference") {
                var dialog = new Vidyano.WebComponents.SelectReferenceDialog();
                dialog.query = args.query.clone(true);
                dialog.query.search();

                Polymer.dom(this.app).appendChild(dialog);

                return dialog.show().then((result: QueryResultItem[]) => {
                    Polymer.dom(this.app).removeChild(dialog);

                    if (result && result.length > 0) {
                        args.selectedItems = result;
                        return args.executeServiceRequest();
                    }
                }).catch(e => {
                    Polymer.dom(this.app).removeChild(dialog);
                });
            }

            return super.onAction(args);
        }

        onOpen(obj: ServiceObject, replaceCurrent: boolean = false, fromAction: boolean = false) {
            if (obj instanceof Vidyano.PersistentObject) {
                var po = <Vidyano.PersistentObject>obj;
                var path: string;

                if (!fromAction) {
                    path = this.app.getUrlForPersistentObject(po.id, po.objectId);

                    var cacheEntry = new PersistentObjectAppCacheEntry(po);
                    var existing = this.app.cachePing(cacheEntry);
                    if (existing)
                        this.app.cacheRemove(existing);

                    this.app.cache(cacheEntry);
                }
                else {
                    var fromActionId = Unique.get();
                    path = this.app.getUrlForFromAction(fromActionId);
                    this.app.cache(new PersistentObjectFromActionAppCacheEntry(po, fromActionId, this.app.path));
                }

                this.app.changePath(path, replaceCurrent);
            }
        }

        onClose(parent: Vidyano.ServiceObject) {
            if (parent instanceof Vidyano.PersistentObject) {
                var cacheEntry = <PersistentObjectFromActionAppCacheEntry>this.app.cachePing(new PersistentObjectFromActionAppCacheEntry(parent));
                if (cacheEntry instanceof PersistentObjectFromActionAppCacheEntry && cacheEntry.fromActionIdReturnPath) {
                    this.app.cacheRemove(cacheEntry);
                    this.app.changePath(cacheEntry.fromActionIdReturnPath, true);
                }
            }
        }

        onMessageDialog(title: string, message: string, ...actions: string[]): Promise<number> {
            return this.app.showMessageDialog({ title: title, message: message, actions: actions });
        }

        onSessionExpired() {
            this.app.redirectToSignIn();
        }

        onNavigate(path: string, replaceCurrent: boolean = false) {
            this.app.changePath(path, replaceCurrent);
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.AppRoute, Vidyano.WebComponents, "vi", {
        properties: {
            route: {
                type: String,
                reflectToAttribute: true
            },
            component: {
                type: String,
                reflectToAttribute: true,
                observer: "_componentChanged"
            },
            active: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            }
        }
    });

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.App, Vidyano.WebComponents, "vi", {
        properties: {
            uri: {
                type: String,
                reflectToAttribute: true
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
                computed: "_computeService(uri, user)"
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
            mappedRoute: {
                type: Object,
                computed: "_computeMappedRoute(path, routeMapVersion)"
            },
            currentRoute: {
                type: Object,
                computed: "_computeCurrentRoute(mappedRoute, path)"
            },
            application: Object,
            programUnit: {
                type: Object,
                computed: "_computeProgramUnit(mappedRoute, path, service.application)"
            },
            noMenu: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            initializing: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
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
            routeMapVersion: {
                type: Number,
                readOnly: true,
                value: 0
            },
            signInImage: String,
            showMenu: {
                type: Boolean,
                computed: "_computeShowMenu(service.isSignedIn, noMenu)"
            }
        },
        observers: [
            "_start(initializing, path)"
        ],
        hostAttributes: {
            "theme-color-1": true,
            "tabindex": 0
        },
        listeners: {
            "app-route-add": "_appRouteAdded"
        },
        forwardObservers: [
            "service.isSignedIn",
            "service.application"
        ]
    });
}
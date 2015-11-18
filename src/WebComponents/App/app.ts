module Vidyano.WebComponents {
    var hashBang: string = "#!/";

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

    @WebComponent.register({
        properties: {
            uri: {
                type: String,
                reflectToAttribute: true
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
                computed: "_computeService(uri, user, hooks)"
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
                computed: "_computeProgramUnit(service.application, path, routeMapVersion)"
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
                computed: "_computeShowMenu(service.isSignedIn, noMenu, isAttached)"
            }
        },
        observers: [
            "_start(initializing, path)",
            "_updateRoute(path, routeMapVersion)"
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
    })
    export class App extends WebComponent {
        private _cache: AppCacheEntry[] = [];
        private _initializationError: string;
        private _routeMap: { [key: string]: AppRoute } = {};
        private _keybindingRegistrations: { [key: string]: Keyboard.KeybindingRegistration[]; } = {};
        private routeMapVersion: number;
        private _configuration: AppConfig;
        service: Vidyano.Service;
        programUnit: ProgramUnit;
        currentRoute: AppRoute;
        initializing: boolean;
        uri: string;
        hooks: string;
        noHistory: boolean;
        path: string;
        cacheSize: number;
        noMenu: boolean;
        label: string;
        keys: string;

        private _setInitializing: (init: boolean) => void;
        private _setRouteMapVersion: (version: number) => void;
        private _setKeys: (keys: string) => void;
        private _setProgramUnit: (pu: ProgramUnit) => void;
        private _setCurrentRoute: (route: AppRoute) => void;

        attached() {
            super.attached();

            if (!this.label)
                this.label = this.title;

            var keys = <any>this.$$("iron-a11y-keys");
            keys.target = document.body;
        }

        get configuration(): AppConfig {
            if (!this._configuration)
                this._configuration = <AppConfig>Polymer.dom(this.root).querySelector("vi-app-config");

            return this._configuration;
        }

        changePath(path: string, replaceCurrent: boolean = false) {
            path = hashBang + App.stripHashBang(path);
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
            var persistentObjects = this.service.application.routes.persistentObjects;
            for (var type in persistentObjects) {
                if (persistentObjects[type] === id)
                    return (pu ? pu.name + "/" : "") + type + (objectId ? "/" + objectId : "");
            }

            return (pu ? pu.name + "/" : "") + `PersistentObject.${id}${objectId ? "/" + objectId : ""}`;
        }

        getUrlForQuery(id: string, pu: ProgramUnit = this.programUnit) {
            var queries = this.service.application.routes.persistentObjects;
            for (var name in queries) {
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
            if (this.hooks) {
                var ctor = this.hooks.split(".").reduce((obj: any, path: string) => obj[path], window);
                if (ctor)
                    return new ctor(this);
            }

            return new AppServiceHooks(this);
        }

        redirectToSignIn(keepUrl: boolean = true) {
            this.changePath("SignIn" + (keepUrl && this.path ? "/" + encodeURIComponent(App.stripHashBang(this.path)).replace(/\./g, "%2E") : ""), true);
            for (var route in this._routeMap) {
                if (!App.stripHashBang(route).startsWith("SignIn"))
                    this._routeMap[route].empty();
            }
        }

        showDialog(dialog: Dialog, options?: DialogOptions): Promise<any> {
            var dialogHost = new Vidyano.WebComponents.DialogHost(dialog);

            Polymer.dom(this).appendChild(dialogHost);

            return dialogHost.show(options).then(result => {
                Polymer.dom(this).removeChild(dialogHost);

                return result;
            }).catch(e => {
                Polymer.dom(this).removeChild(dialogHost);
                if(e)
                    throw e;
            });
        }

        showMessageDialog(options: MessageDialogOptions): Promise<any> {
            return this.showDialog(new Vidyano.WebComponents.MessageDialog(), options);
        }

        private _computeService(uri: string, user: string): Vidyano.Service {
            var service = new Vidyano.Service(this.uri, this.createServiceHooks(), user);
            this._setInitializing(true);

            Promise.all([service.initialize(document.location.hash && App.stripHashBang(document.location.hash).startsWith("SignIn"))]).then(() => {
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
                this.path = App.stripHashBang(Vidyano.Path.routes.current);
            });

            if (!this.noHistory) {
                Vidyano.Path.root(hashBang + App.stripHashBang(this.path));
                Vidyano.Path.history.listen();
                Vidyano.Path.listen();
            }
            else
                this.changePath(this.path);

            this._setInitializing(false);
        }

        private _convertPath(application: Vidyano.Application, path: string) : string {
            if (application) {
                var match = application.poRe.exec(path);
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

        private _updateRoute(path: string) {
            path = this._convertPath(this.service.application, path);

            var mappedPathRoute = Vidyano.Path.match(hashBang + App.stripHashBang(path), true);
            var currentRoute = this.currentRoute;

            // Find route and activate
            if (mappedPathRoute) {
                var route = this._routeMap[hashBang + App.stripHashBang(mappedPathRoute.path)];
                if (route && route.activate(mappedPathRoute.params)) {
                    if (currentRoute && currentRoute != route)
                        currentRoute.deactivate();

                    this._setCurrentRoute(route);
                }
            }
            else
                this._setCurrentRoute(null);
        }

        private _computeProgramUnit(application: Vidyano.Application, path: string): ProgramUnit {
            path = this._convertPath(application, path);

            var mappedPathRoute = Vidyano.Path.match(hashBang + App.stripHashBang(path), true);

            if (mappedPathRoute && application) {
                if (mappedPathRoute.params && mappedPathRoute.params.programUnitName)
                    return Enumerable.from(application.programUnits).firstOrDefault(pu => pu.name == mappedPathRoute.params.programUnitName);
                else if (application.programUnits.length > 0)
                    return application.programUnits[0];
            }

            return null;
        }

        private _computeShowMenu(isSignedIn: boolean, noMenu: boolean): boolean {
            return isSignedIn && !noMenu;
        }

        private _start(initializing: boolean, path: string) {
            if (initializing)
                return;

            if (!this.service.isSignedIn && !App.stripHashBang(path).startsWith("SignIn")) {
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
                if (this._routeMap[hashBang + App.stripHashBang(detail.route)] === undefined) {
                    Vidyano.Path.map(hashBang + App.stripHashBang(detail.route)).to(() => {
                        this.path = Vidyano.Path.routes.current;
                    });

                    this._routeMap[hashBang + App.stripHashBang(detail.route)] = <AppRoute><any>e.target;
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

        static stripHashBang(path: string): string {
            return path && path.replace(hashBang, "") || "";
        }
    }

    export class AppServiceHooks extends Vidyano.ServiceHooks {
        constructor(public app: App) {
            super();
        }

        onConstructQuery(service: Service, query: any, parent?: Vidyano.PersistentObject, asLookup: boolean = false, maxSelectedItems?: number): Vidyano.Query {
            var newQuery = super.onConstructQuery(service, query, parent, asLookup, maxSelectedItems);

            var queryConfig = this.app.configuration.getQueryConfig(newQuery);
            if (queryConfig && queryConfig.defaultChart)
                newQuery.defaultChartName = queryConfig.defaultChart;

            return newQuery;
        }

        onActionConfirmation(action: Action): Promise<boolean> {
            return new Promise((resolve, reject) => {
                this.app.showMessageDialog({
                    title: action.displayName,
                    titleIcon: "Action" + action.name,
                    message: this.service.getTranslatedMessage(action.definition.confirmation),
                    actions: [action.displayName, this.service.getTranslatedMessage("Cancel")],
                    actionTypes: action.name == "Delete" ? ["Danger"] : []
                }).then(result => {
                    resolve(result == 0);
                }).catch(e => {
                    resolve(false);
                });
            });
        }

        onAction(args: ExecuteActionArgs): Promise<any> {
            if (args.action == "AddReference") {
                return new Promise((resolve, reject) => {
                    args.isHandled = true;

                    this.app.importHref(this.app.resolveUrl("../SelectReferenceDialog/select-reference-dialog.html"), () => {
                        var query = args.query.clone(true);
                        query.search();

                        this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(query)).then((result: QueryResultItem[]) => {
                            if (result && result.length > 0) {
                                args.selectedItems = result;

                                args.executeServiceRequest().then(result => {
                                    resolve(result);
                                }, e => {
                                    reject(e);
                                });
                            }
                            else
                                reject(null);
                        }, e => {
                            reject(e);
                        });
                    });
                });
            }

            return super.onAction(args);
        }

        onOpen(obj: ServiceObject, replaceCurrent: boolean = false, fromAction: boolean = false) {
            if (obj instanceof Vidyano.PersistentObject) {
                var po = <Vidyano.PersistentObject>obj;

                if (po.stateBehavior.indexOf("OpenAsDialog") >= 0) {
                    this.app.showDialog(new Vidyano.WebComponents.PersistentObjectDialog(po));
                    return;
                }

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

                    if (App.stripHashBang(this.app.getUrlForFromAction(cacheEntry.fromActionId)) == App.stripHashBang(this.app.path))
                        this.app.changePath(cacheEntry.fromActionIdReturnPath, true);
                }
            }
        }

        onMessageDialog(title: string, message: string, html: boolean, ...actions: string[]): Promise<number> {
            return this.app.showMessageDialog({ title: title, message: message, html: html, actions: actions });
        }

        onSessionExpired() {
            this.app.redirectToSignIn();
        }

        onNavigate(path: string, replaceCurrent: boolean = false) {
            this.app.changePath(path, replaceCurrent);
        }

        onClientOperation(operation: ClientOperations.ClientOperation) {
            switch (operation.type) {
                case "Refresh":
                    var refresh = <ClientOperations.RefreshOperation>operation;
                    if (refresh.queryId) {
                        var cacheEntry = <QueryAppCacheEntry>this.app.cachePing(new QueryAppCacheEntry(refresh.queryId));
                        if (cacheEntry && cacheEntry.query)
                            cacheEntry.query.search(refresh.delay);
                    }
                    else {
                        var refreshPersistentObject = () => {
                            var cacheEntry = <PersistentObjectAppCacheEntry>this.app.cachePing(new PersistentObjectAppCacheEntry(refresh.fullTypeName, refresh.objectId));
                            if (!cacheEntry || !cacheEntry.persistentObject)
                                return;

                            this.app.service.getPersistentObject(cacheEntry.persistentObject.parent, cacheEntry.persistentObject.id, cacheEntry.persistentObject.objectId).then(po => {
                                cacheEntry.persistentObject.refreshFromResult(po);
                            }, e => {
                                cacheEntry.persistentObject.setNotification(e);
                            });
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
    }
}

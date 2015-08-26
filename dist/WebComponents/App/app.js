var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var hashBang = "#!/";
        var AppRoute = (function (_super) {
            __extends(AppRoute, _super);
            function AppRoute(route, component) {
                _super.call(this);
                this.route = route;
                this.component = component;
                this._parameters = {};
            }
            AppRoute.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this.fire("app-route-add", { route: this.route, component: this.component });
            };
            AppRoute.prototype.activate = function (parameters) {
                if (parameters === void 0) { parameters = {}; }
                if (this.active && this._parameters && JSON.stringify(this._parameters) === JSON.stringify(parameters))
                    return false;
                var component = Polymer.dom(this).children[0];
                if (!component || this._constructorChanged) {
                    this._constructorChanged = false;
                    this.empty();
                    component = new this._constructor();
                    Polymer.dom(this).appendChild(component);
                }
                component._setApp(this.app);
                if (component.fire("activating", { route: this, parameters: this._parameters = parameters }, { bubbles: false, cancelable: true }).defaultPrevented)
                    return false;
                this._setActive(true);
                component.fire("activated", { route: this }, { bubbles: false, cancelable: false });
                return true;
            };
            AppRoute.prototype.deactivate = function () {
                this._setActive(false);
            };
            Object.defineProperty(AppRoute.prototype, "parameters", {
                get: function () {
                    return this._parameters;
                },
                enumerable: true,
                configurable: true
            });
            AppRoute.prototype._componentChanged = function () {
                this._constructor = this.component.split(".").reduce(function (obj, path) { return obj[path]; }, window);
                this._constructorChanged = true;
            };
            return AppRoute;
        })(WebComponents.WebComponent);
        WebComponents.AppRoute = AppRoute;
        var AppCacheEntry = (function () {
            function AppCacheEntry(id) {
                this.id = id;
            }
            AppCacheEntry.prototype.isMatch = function (entry) {
                return entry.id == this.id;
            };
            return AppCacheEntry;
        })();
        WebComponents.AppCacheEntry = AppCacheEntry;
        var PersistentObjectAppCacheEntry = (function (_super) {
            __extends(PersistentObjectAppCacheEntry, _super);
            function PersistentObjectAppCacheEntry(idOrPo, objectId) {
                _super.call(this, typeof idOrPo === "string" ? idOrPo : (idOrPo instanceof Vidyano.PersistentObject ? idOrPo.id : null));
                this.objectId = objectId;
                if (idOrPo instanceof Vidyano.PersistentObject) {
                    this.persistentObject = idOrPo;
                    this.objectId = this.persistentObject.objectId;
                }
            }
            Object.defineProperty(PersistentObjectAppCacheEntry.prototype, "persistentObject", {
                get: function () {
                    return this._persistentObject;
                },
                set: function (po) {
                    if (po === this._persistentObject)
                        return;
                    this._persistentObject = po;
                    this.selectedMasterTab = this.selectedDetailTab = null;
                },
                enumerable: true,
                configurable: true
            });
            PersistentObjectAppCacheEntry.prototype.isMatch = function (entry) {
                if (!(entry instanceof PersistentObjectAppCacheEntry))
                    return false;
                if (entry.persistentObject != null && entry.persistentObject === this.persistentObject)
                    return true;
                return (_super.prototype.isMatch.call(this, entry) || (entry.persistentObject && this.id === entry.persistentObject.fullTypeName)) && (entry.objectId === this.objectId || StringEx.isNullOrEmpty(entry.objectId) && StringEx.isNullOrEmpty(this.objectId));
            };
            return PersistentObjectAppCacheEntry;
        })(AppCacheEntry);
        WebComponents.PersistentObjectAppCacheEntry = PersistentObjectAppCacheEntry;
        var PersistentObjectFromActionAppCacheEntry = (function (_super) {
            __extends(PersistentObjectFromActionAppCacheEntry, _super);
            function PersistentObjectFromActionAppCacheEntry(po, fromActionId, fromActionIdReturnPath) {
                _super.call(this, po);
                this.fromActionId = fromActionId;
                this.fromActionIdReturnPath = fromActionIdReturnPath;
            }
            PersistentObjectFromActionAppCacheEntry.prototype.isMatch = function (entry) {
                if (!(entry instanceof PersistentObjectFromActionAppCacheEntry))
                    return false;
                return this.fromActionId == entry.fromActionId || entry.persistentObject === this.persistentObject;
            };
            return PersistentObjectFromActionAppCacheEntry;
        })(PersistentObjectAppCacheEntry);
        WebComponents.PersistentObjectFromActionAppCacheEntry = PersistentObjectFromActionAppCacheEntry;
        var QueryAppCacheEntry = (function (_super) {
            __extends(QueryAppCacheEntry, _super);
            function QueryAppCacheEntry(idOrQuery) {
                _super.call(this, typeof idOrQuery === "string" ? idOrQuery : null);
                if (idOrQuery instanceof Vidyano.Query)
                    this.query = idOrQuery;
            }
            QueryAppCacheEntry.prototype.isMatch = function (entry) {
                if (!(entry instanceof QueryAppCacheEntry))
                    return false;
                if (entry.query === this.query)
                    return true;
                return entry instanceof QueryAppCacheEntry && _super.prototype.isMatch.call(this, entry);
            };
            return QueryAppCacheEntry;
        })(AppCacheEntry);
        WebComponents.QueryAppCacheEntry = QueryAppCacheEntry;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                _super.apply(this, arguments);
                this._cache = [];
                this._routeMap = {};
                this._keybindingRegistrations = {};
            }
            App.prototype.attached = function () {
                _super.prototype.attached.call(this);
                if (!this.label)
                    this.label = this.asElement.title;
                var keys = this.$$("iron-a11y-keys");
                keys.target = document.body;
            };
            Object.defineProperty(App.prototype, "configuration", {
                get: function () {
                    return this._configuration;
                },
                enumerable: true,
                configurable: true
            });
            App.prototype._setConfiguration = function (config) {
                this._configuration = config;
            };
            App.prototype.changePath = function (path, replaceCurrent) {
                if (replaceCurrent === void 0) { replaceCurrent = false; }
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
            };
            App.prototype.getUrlForPersistentObject = function (id, objectId, pu) {
                if (pu === void 0) { pu = this.programUnit; }
                return (pu ? pu.name + "/" : "") + ("PersistentObject." + id + "/" + objectId);
            };
            App.prototype.getUrlForQuery = function (id, pu) {
                if (pu === void 0) { pu = this.programUnit; }
                return (pu ? pu.name + "/" : "") + ("Query." + id);
            };
            App.prototype.getUrlForFromAction = function (id, pu) {
                if (pu === void 0) { pu = this.programUnit; }
                return (pu ? pu.name + "/" : "") + ("FromAction/" + id);
            };
            App.prototype.cache = function (entry) {
                if (this._cache.length >= this.cacheSize)
                    this._cache.splice(0, this._cache.length - this.cacheSize);
                var cacheEntry = this.cachePing(entry);
                if (!cacheEntry)
                    this._cache.push(cacheEntry = entry);
                return cacheEntry;
            };
            App.prototype.cachePing = function (entry) {
                var cacheEntry = Enumerable.from(this._cache).lastOrDefault(function (e) { return entry.isMatch(e); });
                if (cacheEntry) {
                    this._cache.remove(cacheEntry);
                    this._cache.push(cacheEntry);
                }
                return cacheEntry;
            };
            App.prototype.cacheRemove = function (key) {
                var entry = Enumerable.from(this._cache).firstOrDefault(function (e) { return key.isMatch(e); });
                if (entry)
                    this._cache.remove(entry);
            };
            App.prototype.cacheClear = function () {
                this._cache = [];
            };
            App.prototype.createServiceHooks = function () {
                if (this.hooks) {
                    var ctor = this.hooks.split(".").reduce(function (obj, path) { return obj[path]; }, window);
                    if (ctor)
                        return new ctor(this);
                }
                return new AppServiceHooks(this);
            };
            App.prototype.redirectToSignIn = function (keepUrl) {
                if (keepUrl === void 0) { keepUrl = true; }
                this.changePath("SignIn" + (keepUrl && this.path ? "/" + encodeURIComponent(App.stripHashBang(this.path)).replace(/\./g, "%2E") : ""), true);
                for (var route in this._routeMap) {
                    if (!App.stripHashBang(route).startsWith("SignIn"))
                        this._routeMap[route].empty();
                }
            };
            App.prototype.showMessageDialog = function (options) {
                var _this = this;
                var messageDialog = new Vidyano.WebComponents.MessageDialog();
                Polymer.dom(this).appendChild(messageDialog);
                return messageDialog.show(options).then(function (result) {
                    Polymer.dom(_this).removeChild(messageDialog);
                    return result;
                }, function (e) {
                    Polymer.dom(_this).removeChild(messageDialog);
                    throw e;
                });
            };
            App.prototype._computeService = function (uri, user) {
                var _this = this;
                var service = new Vidyano.Service(this.uri, this.createServiceHooks(), user);
                this._setInitializing(true);
                Promise.all([service.initialize(document.location.hash && App.stripHashBang(document.location.hash).startsWith("SignIn"))]).then(function () {
                    if (_this.service == service)
                        _this._onInitialized();
                }, function (e) {
                    if (_this.service === service) {
                        _this._initializationError = e;
                        _this._onInitialized();
                    }
                });
                return service;
            };
            App.prototype._onInitialized = function () {
                var _this = this;
                Vidyano.Path.rescue(function () {
                    _this.path = App.stripHashBang(Vidyano.Path.routes.current);
                });
                if (!this.noHistory) {
                    Vidyano.Path.root(hashBang + App.stripHashBang(this.path));
                    Vidyano.Path.history.listen();
                    Vidyano.Path.listen();
                }
                else
                    this.changePath(this.path);
                this._setInitializing(false);
            };
            App.prototype._updateRoute = function (path) {
                var mappedPathRoute = Vidyano.Path.match(hashBang + App.stripHashBang(path), true);
                var currentRoute = this.currentRoute;
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
            };
            App.prototype._computeProgramUnit = function (application, path) {
                var mappedPathRoute = Vidyano.Path.match(hashBang + App.stripHashBang(path), true);
                if (mappedPathRoute && application) {
                    if (mappedPathRoute.params && mappedPathRoute.params.programUnitName)
                        return Enumerable.from(application.programUnits).firstOrDefault(function (pu) { return pu.name == mappedPathRoute.params.programUnitName; });
                    else if (application.programUnits.length > 0)
                        return application.programUnits[0];
                }
                return null;
            };
            App.prototype._computeShowMenu = function (isSignedIn, noMenu) {
                return isSignedIn && !noMenu;
            };
            App.prototype._start = function (initializing, path) {
                var _this = this;
                if (initializing)
                    return;
                if (!this.service.isSignedIn && !App.stripHashBang(path).startsWith("SignIn")) {
                    if (this.service.defaultUserName) {
                        this._setInitializing(true);
                        this.service.signInUsingDefaultCredentials().then(function () {
                            _this._setInitializing(false);
                        });
                    }
                    else
                        this.redirectToSignIn();
                }
            };
            App.prototype._appRouteAdded = function (e, detail) {
                var _this = this;
                this.async(function () {
                    if (_this._routeMap[hashBang + App.stripHashBang(detail.route)] === undefined) {
                        Vidyano.Path.map(hashBang + App.stripHashBang(detail.route)).to(function () {
                            _this.path = Vidyano.Path.routes.current;
                        });
                        _this._routeMap[hashBang + App.stripHashBang(detail.route)] = e.target;
                    }
                    _this._setRouteMapVersion(_this.routeMapVersion + 1);
                });
            };
            App.prototype._registerKeybindings = function (registration) {
                var _this = this;
                var currentKeys = this.keys ? this.keys.split(" ") : [];
                registration.keys.forEach(function (key) {
                    var registrations = _this._keybindingRegistrations[key] || (_this._keybindingRegistrations[key] = []);
                    registrations.push(registration);
                    var e = registration.element;
                    do {
                        if (e instanceof Vidyano.WebComponents.AppRoute) {
                            registration.appRoute = e;
                            break;
                        }
                        e = e.parentElement;
                    } while (e != null);
                    currentKeys.push(key);
                });
                this._setKeys(Enumerable.from(currentKeys).distinct().toArray().join(" "));
            };
            App.prototype._unregisterKeybindings = function (registration) {
                var _this = this;
                var currentKeys = this.keys.split(" ");
                registration.keys.forEach(function (key) {
                    var registrations = _this._keybindingRegistrations[key];
                    registrations.remove(registration);
                    if (registrations.length == 0) {
                        _this._keybindingRegistrations[key] = undefined;
                        currentKeys.remove(key);
                    }
                });
                this._setKeys(Enumerable.from(currentKeys).distinct().toArray().join(" "));
            };
            App.prototype._keysPressed = function (e) {
                if (!this._keybindingRegistrations[e.detail.combo])
                    return;
                var activeRegs = this._keybindingRegistrations[e.detail.combo].filter(function (reg) { return !reg.appRoute || reg.appRoute.active; });
                var highestPriorityRegs = Enumerable.from(activeRegs).groupBy(function (r) { return r.priority; }, function (r) { return r; }).orderByDescending(function (kvp) { return kvp.key(); }).firstOrDefault();
                if (!highestPriorityRegs || highestPriorityRegs.isEmpty())
                    return;
                var regs = highestPriorityRegs.toArray();
                if (regs.length > 1 && regs.some(function (r) { return !r.nonExclusive; }))
                    return;
                regs.forEach(function (reg) {
                    reg.listener(e);
                });
            };
            App.stripHashBang = function (path) {
                return path && path.replace(hashBang, "") || "";
            };
            return App;
        })(WebComponents.WebComponent);
        WebComponents.App = App;
        var AppServiceHooks = (function (_super) {
            __extends(AppServiceHooks, _super);
            function AppServiceHooks(app) {
                _super.call(this);
                this.app = app;
            }
            AppServiceHooks.prototype.onActionConfirmation = function (action) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    _this.app.showMessageDialog({
                        title: action.displayName,
                        titleIcon: "Icon_Action" + action.name,
                        message: _this.service.getTranslatedMessage(action.definition.confirmation),
                        actions: [action.displayName, _this.service.getTranslatedMessage("Cancel")],
                        actionTypes: action.name == "Delete" ? ["Danger"] : []
                    }).then(function (result) {
                        resolve(result == 0);
                    }).catch(function (e) {
                        resolve(false);
                    });
                });
            };
            AppServiceHooks.prototype.onAction = function (args) {
                var _this = this;
                if (args.action == "AddReference") {
                    var dialog = new Vidyano.WebComponents.SelectReferenceDialog();
                    dialog.query = args.query.clone(true);
                    dialog.query.search();
                    Polymer.dom(this.app).appendChild(dialog);
                    return dialog.show().then(function (result) {
                        Polymer.dom(_this.app).removeChild(dialog);
                        if (result && result.length > 0) {
                            args.selectedItems = result;
                            return args.executeServiceRequest();
                        }
                    }).catch(function (e) {
                        Polymer.dom(_this.app).removeChild(dialog);
                        return null;
                    });
                }
                return _super.prototype.onAction.call(this, args);
            };
            AppServiceHooks.prototype.onOpen = function (obj, replaceCurrent, fromAction) {
                var _this = this;
                if (replaceCurrent === void 0) { replaceCurrent = false; }
                if (fromAction === void 0) { fromAction = false; }
                if (obj instanceof Vidyano.PersistentObject) {
                    var po = obj;
                    if (po.stateBehavior.indexOf("OpenAsDialog") >= 0) {
                        var dialog = new Vidyano.WebComponents.PersistentObjectDialog();
                        Polymer.dom(this.app).appendChild(dialog);
                        Polymer.dom(this.app).flush();
                        return dialog.show(po).then(function (result) {
                            Polymer.dom(_this.app).removeChild(dialog);
                            return result;
                        }, function (e) {
                            Polymer.dom(_this.app).removeChild(dialog);
                            throw e;
                        });
                        return;
                    }
                    var path;
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
            };
            AppServiceHooks.prototype.onClose = function (parent) {
                if (parent instanceof Vidyano.PersistentObject) {
                    var cacheEntry = this.app.cachePing(new PersistentObjectFromActionAppCacheEntry(parent));
                    if (cacheEntry instanceof PersistentObjectFromActionAppCacheEntry && cacheEntry.fromActionIdReturnPath) {
                        this.app.cacheRemove(cacheEntry);
                        if (App.stripHashBang(this.app.getUrlForFromAction(cacheEntry.fromActionId)) == App.stripHashBang(this.app.path))
                            this.app.changePath(cacheEntry.fromActionIdReturnPath, true);
                    }
                }
            };
            AppServiceHooks.prototype.onMessageDialog = function (title, message, html) {
                var actions = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    actions[_i - 3] = arguments[_i];
                }
                return this.app.showMessageDialog({ title: title, message: message, html: html, actions: actions });
            };
            AppServiceHooks.prototype.onSessionExpired = function () {
                this.app.redirectToSignIn();
            };
            AppServiceHooks.prototype.onNavigate = function (path, replaceCurrent) {
                if (replaceCurrent === void 0) { replaceCurrent = false; }
                this.app.changePath(path, replaceCurrent);
            };
            AppServiceHooks.prototype.onClientOperation = function (operation) {
                var _this = this;
                switch (operation.type) {
                    case "Refresh":
                        var refresh = operation;
                        if (refresh.queryId) {
                            var cacheEntry = this.app.cachePing(new QueryAppCacheEntry(refresh.queryId));
                            if (cacheEntry && cacheEntry.query)
                                cacheEntry.query.search(refresh.delay);
                        }
                        else {
                            var refreshPersistentObject = function () {
                                var cacheEntry = _this.app.cachePing(new PersistentObjectAppCacheEntry(refresh.fullTypeName, refresh.objectId));
                                if (!cacheEntry || !cacheEntry.persistentObject)
                                    return;
                                _this.app.service.getPersistentObject(cacheEntry.persistentObject.parent, cacheEntry.persistentObject.id, cacheEntry.persistentObject.objectId).then(function (po) {
                                    cacheEntry.persistentObject.refreshFromResult(po);
                                }, function (e) {
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
                        _super.prototype.onClientOperation.call(this, operation);
                        break;
                }
            };
            return AppServiceHooks;
        })(Vidyano.ServiceHooks);
        WebComponents.AppServiceHooks = AppServiceHooks;
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
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

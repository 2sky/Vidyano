namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            cacheSize: {
                type: Number,
                value: 25,
                reflectToAttribute: true
            },
            path: {
                type: String,
                observer: "_pathChanged",
                reflectToAttribute: true
            },
            pathExtended: {
                type: String,
                observer: "_pathExtendedChanged"
            },
            programUnit: {
                type: Object,
                computed: "_computeProgramUnit(service.application, path)"
            },
            noMenu: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            label: {
                type: String,
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
                computed: "_computeShowMenu(service.application, noMenu, path)"
            }
        },
        observers: [
            "_hookWindowBeforeUnload(noHistory, isConnected)",
            "_resolveDependencies(service.application.hasManagement)"
        ],
        listeners: {
            "contextmenu": "_configureContextmenu"
        },
        forwardObservers: [
            "service.profile"
        ]
    })
    export class App extends AppBase {
        private _cache: AppCacheEntry[] = [];
        private _beforeUnloadEventHandler: EventListener;
        programUnit: ProgramUnit;
        noMenu: boolean;
        label: string;

        private constructor() {
            super();

            if (!this.label)
                this.label = this.title;
        }

        protected _createServiceHooks(): ServiceHooks {
            return new AppServiceHooks(this);
        }

        private _pathChanged(path: string) {
            this.set("pathExtended", this._convertPath(this.service.application, path));
        }

        private _pathExtendedChanged(pathExtended: string) {
            this.path = pathExtended;
        }

        private _computeProgramUnit(application: Vidyano.Application, path: string): ProgramUnit {
            path = this._convertPath(application, path);

            const mappedPathRoute = Vidyano.Path.match(Path.routes.rootPath + AppBase.removeRootPath(path), true);
            if (application) {
                if (mappedPathRoute && mappedPathRoute.params && mappedPathRoute.params.programUnitName)
                    return application.programUnits.find(pu => pu.name === mappedPathRoute.params.programUnitName);
                else if (application.programUnits.length > 0)
                    return application.programUnits[0];
            }

            return null;
        }

        private _computeShowMenu(application: Vidyano.Application, noMenu: boolean, path: string): boolean {
            const showMenu = application && !noMenu && path != null && !path.startsWith("SignIn") && !path.startsWith("SignOut");
            if (showMenu)
                this.importComponent("Menu");

            return showMenu;
        }

        private _hookWindowBeforeUnload(noHistory: boolean, isConnected: boolean) {
            if (this._beforeUnloadEventHandler) {
                window.removeEventListener("beforeunload", this._beforeUnloadEventHandler);
                this._beforeUnloadEventHandler = null;
            }

            if (!noHistory && isConnected)
                window.addEventListener("beforeunload", this._beforeUnloadEventHandler = this._beforeUnload.bind(this));
        }

        private _beforeUnload(e: Event) {
            if (this._cache.some(entry => entry instanceof Vidyano.WebComponents.AppCacheEntryPersistentObject && !!entry.persistentObject && entry.persistentObject.isDirty && entry.persistentObject.actions.some(a => a.name === "Save" || a.name === "EndEdit")) && this.service) {
                const confirmationMessage = this.service.getTranslatedMessage("PagesWithUnsavedChanges");

                (e || window.event).returnValue = <any>confirmationMessage; // Gecko + IE
                return confirmationMessage; // Webkit, Safari, Chrome etc.
            }
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

            const elements = e.composedPath();
            let element = elements.shift();
            while (!!element && element !== this) {
                if ((<any>element as IConfigurable)._viConfigure) {
                    const actions: IConfigurableAction[] = [];
                    (<IConfigurable><any>element)._viConfigure(actions);

                    if (actions.length > 0) {
                        actions.forEach(action => {
                            let item: WebComponent;

                            if (!action.subActions)
                                item = new Vidyano.WebComponents.PopupMenuItem(action.label, action.icon, action.action);
                            else {
                                item = new Vidyano.WebComponents.PopupMenuItemSplit(action.label, action.icon, action.action);
                                action.subActions.forEach(subA => item.appendChild(new Vidyano.WebComponents.PopupMenuItem(subA.label, subA.icon, subA.action)));
                            }

                            configureItems.push(item);
                        });
                    }
                }

                element = elements.shift();
            }

            if (configureItems.length === 0) {
                e.stopImmediatePropagation();
                return;
            }

            // TODO
            // const popupMenuItem = <PopupMenuItem>this.shadowRoot.querySelector("#viConfigure");
            // this.empty(popupMenuItem);

            // configureItems.forEach(item => Polymer.dom(popupMenuItem).appendChild(item));
        }

        protected _cleanUpOnSignOut(isSignedIn: boolean) {
            if (isSignedIn === false) {
                this.cacheClear();
                this.appRoutePresenter.clear();

                super._cleanUpOnSignOut(isSignedIn);
            }
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

        private _computeIsProfiling(isSignedIn: boolean, profile: boolean): boolean {
            if (!isSignedIn || !profile)
                return false;

            this.importComponent("Profiler");
            return true;
        }

        private async _importConfigs(configs: string, isConnected: boolean) {
            if (!configs || !isConnected)
                return;

            // TODO
            // const doc = <HTMLLinkElement>await this.importHref(configs);
            // Array.from(doc.body.childNodes).forEach(c => this.appendChild(c));
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

        private async _delegatePath(path: string, initializing: boolean) {
            if (initializing)
                return;

            let currentPath = this.path;
            const initial: Vidyano.PersistentObject = this.service["_initial"];
            if (initial != null)
                await (<AppServiceHooks>this.service.hooks).onInitial(initial);

            if (currentPath !== this.path)
                return;

            path = Vidyano.WebComponents.AppBase.removeRootPath(this._convertPath(this.service.application, path));

            if (this.service && this.service.isSignedIn && path === "") {
                let programUnit = this.programUnit;
                if (!programUnit && this.service.application.programUnits.length > 0)
                    programUnit = this.service.application.programUnits[0];

                if (programUnit) {
                    if (programUnit.openFirst && programUnit.path && path !== programUnit.path) {
                        Polymer.Async.microTask.run(() => this.changePath(programUnit.path));
                        return;
                    }
                    else {
                        const config = this.app.configuration.getProgramUnitConfig(programUnit.name);
                        if (!!config && config.hasTemplate) {
                            Polymer.Async.microTask.run(() => this.changePath(programUnit.name));
                            return;
                        }
                    }
                }
            }
        }

        private _resolveDependencies(hasManagement: boolean) {
            this.importComponent("PopupMenu");
        }
    }
}
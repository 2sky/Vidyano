namespace Vidyano.WebComponents {
    interface IPersistentObjectPresenterRouteParameters {
        id: string;
        objectId: string;
        fromActionId: string;
    }

    @WebComponent.register({
        properties: {
            persistentObjectId: {
                type: String,
                reflectToAttribute: true
            },
            persistentObjectObjectId: {
                type: String,
                reflectToAttribute: true
            },
            persistentObject: {
                type: Object,
                observer: "_persistentObjectChanged"
            },
            loading: {
                type: Boolean,
                readOnly: true,
                value: true,
                reflectToAttribute: true
            },
            templated: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            error: {
                type: String,
                readOnly: true
            }
        },
        observers: [
            "_updatePersistentObject(persistentObjectId, persistentObjectObjectId, isConnected)",
            "_updateTitle(persistentObject.isBreadcrumbSensitive, isAppSensitive)"
        ],
        listeners: {
            "app-route-activate": "_activate",
            "app-route-deactivate": "_deactivate"
        },
        keybindings: {
            "f2": {
                listener: "_edit",
                priority: 10
            },
            "ctrl+s": "_save",
            "esc": "_cancelSave"
        },
        sensitive: true
    })
    export class PersistentObjectPresenter extends WebComponent<App> implements IConfigurable {
        private _cacheEntry: AppCacheEntryPersistentObject;
        readonly loading: boolean; private _setLoading: (loading: boolean) => void;
        readonly templated: boolean; private _setTemplated: (templated: boolean) => void;
        readonly error: string; private _setError: (error: string) => void;
        persistentObjectId: string;
        persistentObjectObjectId: string;
        persistentObject: Vidyano.PersistentObject;

        private _activate(e: CustomEvent) {
            const { parameters }: { parameters: IPersistentObjectPresenterRouteParameters; } = e.detail;
            if (parameters.fromActionId) {
                if (this._cacheEntry = <AppCacheEntryPersistentObjectFromAction>this.app.cachePing(new AppCacheEntryPersistentObjectFromAction(undefined, parameters.fromActionId)))
                    this.persistentObject = this._cacheEntry.persistentObject;

                if (!this._cacheEntry) {
                    this.persistentObject = null;

                    this._setLoading(false);
                    this._setError(this.translateMessage("NotFound"));

                    return;
                }
            } else {
                const cacheEntry = new AppCacheEntryPersistentObject(parameters.id, parameters.objectId);
                this._cacheEntry = <AppCacheEntryPersistentObject>this.app.cachePing(cacheEntry);
                if (!this._cacheEntry)
                    this.app.cache(this._cacheEntry = cacheEntry);

                if (this._cacheEntry.persistentObject)
                    this.persistentObject = this._cacheEntry.persistentObject;
                else {
                    this.persistentObject = this.persistentObjectObjectId = this.persistentObjectId = undefined;
                    this.persistentObjectObjectId = this._cacheEntry.objectId || "";
                    this.persistentObjectId = this._cacheEntry.id;
                }

                this.fire("title-changed", { title: this.persistentObject ? this.persistentObject.breadcrumb : null }, { bubbles: true });
            }
        }

        private async _deactivate(e: CustomEvent) {
            const route = <AppRoute>this.parentNode;
            const currentPath = AppBase.removeRootPath(route.path);
            const newPath = AppBase.removeRootPath(this.app.path);

            if (this.persistentObject && this.persistentObject.isDirty && this.persistentObject.actions.some(a => a.name === "Save" || a.name === "EndEdit") && currentPath !== newPath) {
                e.preventDefault();

                const result = await this.app.showMessageDialog( {
                    title: this.service.getTranslatedMessage("PagesWithUnsavedChanges"),
                    noClose: true,
                    message: this.service.getTranslatedMessage("ConfirmLeavePage"),
                    actions: [
                        this.service.getTranslatedMessage("StayOnThisPage"),
                        this.service.getTranslatedMessage("LeaveThisPage")
                    ]
                });

                if (result === 1) {
                    this.app.cacheEntries.forEach(entry => {
                        if (entry instanceof Vidyano.WebComponents.AppCacheEntryPersistentObject && !!entry.persistentObject && entry.persistentObject.isDirty && entry.persistentObject.actions.some(a => a.name === "Save" || a.name === "EndEdit")) {
                            if (entry.persistentObject.isNew)
                                this.app.cacheRemove(entry);
                            else
                                entry.persistentObject.cancelEdit();
                        }
                    });

                    this.app.changePath(newPath);
                    route.deactivator(true);
                }
                else {
                    route.deactivator(false);
                    this.app.changePath(currentPath);
                }
            }
        }

        private async _updatePersistentObject(persistentObjectId: string, persistentObjectObjectId: string, isConnected: boolean) {
            this._setError(null);

            if (!this.isConnected || (this.persistentObject && this.persistentObject.id === persistentObjectId && this.persistentObject.objectId === persistentObjectObjectId))
                return;

            if (persistentObjectId != null) {
                this._setLoading(true);

                try {
                    const po = await this.service.getPersistentObject(null, persistentObjectId, persistentObjectObjectId);
                    const cacheEntry = <AppCacheEntryPersistentObject>this.app.cache(new AppCacheEntryPersistentObject(persistentObjectId, persistentObjectObjectId));

                    cacheEntry.persistentObject = po;

                    if (persistentObjectId === this.persistentObjectId && persistentObjectObjectId === this.persistentObjectObjectId) {
                        this.persistentObject = po;
                        this._cacheEntry = cacheEntry;
                    }
                }
                catch (e) {
                    this._setError(e);
                    this._setLoading(false);
                }
            }
            else
                this.persistentObject = null;
        }

        private async _persistentObjectChanged(persistentObject: Vidyano.PersistentObject, oldPersistentObject: Vidyano.PersistentObject) {
            this._setError(null);

            if (oldPersistentObject)
                this.empty();

            if (persistentObject) {
                const config = this.app.configuration.getPersistentObjectConfig(persistentObject);
                this._setTemplated(!!config && config.hasTemplate);

                if (this.templated) {
                    this.appendChild(config.stamp(persistentObject, config.as || "persistentObject"));
                    this._setLoading(false);
                }
                else {
                    await this.app.importComponent("PersistentObject");
                    this._renderPersistentObject(persistentObject);
                }

                this._updateTitle(persistentObject.isBreadcrumbSensitive, this.isAppSensitive);
            }
        }

        private _updateTitle(isBreadcrumbSensitive: boolean, isAppSensitive: boolean) {
            if (!this.persistentObject)
                return;

            this.fire("title-changed", { title: isBreadcrumbSensitive && isAppSensitive ? null : this.persistentObject.breadcrumb }, { bubbles: true });
        }

        private async _renderPersistentObject(persistentObject: Vidyano.PersistentObject) {
            if (persistentObject !== this.persistentObject)
                return;

            const persistentObjectComponent = new Vidyano.WebComponents.PersistentObject();
            persistentObjectComponent.persistentObject = persistentObject;
            this.appendChild(persistentObjectComponent);

            this._setLoading(false);
        }

        private _edit() {
            if (!this.persistentObject)
                return;

            const action = <Vidyano.Action>this.persistentObject.actions["Edit"];
            if (action)
                action.execute();
        }

        private _save() {
            if (!this.persistentObject)
                return;

            const action = <Vidyano.Action>(this.persistentObject.actions["Save"] || this.persistentObject.actions["EndEdit"]);
            if (action)
                action.execute();
        }

        private _cancelSave() {
            if (!this.persistentObject)
                return;

            const action = <Vidyano.Action>(this.persistentObject.actions["CancelEdit"] || this.persistentObject.actions["CancelSave"]);
            if (action)
                action.execute();
        }

        _viConfigure(actions: IConfigurableAction[]) {
            if (this.persistentObject.isSystem)
                return;

            actions.push({
                label: `Persistent Object: ${this.persistentObject.type}`,
                icon: "viConfigure",
                action: () => {
                    this.app.changePath(`Management/PersistentObject.316b2486-df38-43e3-bee2-2f7059334992/${this.persistentObject.id}`);
                }
            });
        }
    }
}
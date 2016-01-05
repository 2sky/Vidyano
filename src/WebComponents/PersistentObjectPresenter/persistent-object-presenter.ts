module Vidyano.WebComponents {
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
            error: {
                type: String,
                readOnly: true
            },
            hasError: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasError(error)"
            }
        },
        observers: [
            "_computePersistentObject(persistentObjectId, persistentObjectObjectId, isAttached)"
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
        }
    })
    export class PersistentObjectPresenter extends WebComponent {
        private static _persistentObjectComponentLoader: Promise<any>;
        private _cacheEntry: PersistentObjectAppCacheEntry;
        persistentObjectId: string;
        persistentObjectObjectId: string;
        persistentObject: Vidyano.PersistentObject;

        private _setLoading: (loading: boolean) => void;
        private _setError: (error: string) => void;

        private _activate(e: CustomEvent) {
            const route = <AppRoute>Polymer.dom(this).parentNode;

            if (route.parameters.fromActionId) {
                if (this._cacheEntry = <PersistentObjectFromActionAppCacheEntry>route.app.cachePing(new PersistentObjectFromActionAppCacheEntry(undefined, route.parameters.fromActionId)))
                    this.persistentObject = this._cacheEntry.persistentObject;

                if (!this.persistentObject) {
                    this._setLoading(false);
                    this.app.redirectToNotFound();

                    return;
                }
            } else {
                var cacheEntry = new PersistentObjectAppCacheEntry(route.parameters.id, route.parameters.objectId);
                this._cacheEntry = <PersistentObjectAppCacheEntry>route.app.cachePing(cacheEntry);
                if (!this._cacheEntry)
                    route.app.cache(this._cacheEntry = cacheEntry);

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

        private _deactivate(e: CustomEvent) {
            if (this.persistentObject && this.persistentObject.isDirty && this.persistentObject.actions.some(a => a.name === "Save" || a.name === "EndEdit")) {
                e.preventDefault();

                const route = <AppRoute>Polymer.dom(this).parentNode;
                const newPath = this.app.path;

                this.app.changePath(route.path);

                this.app.showMessageDialog( {
                    title: this.app.service.getTranslatedMessage("PagesWithUnsavedChanges"),
                    noClose: true,
                    message: this.app.service.getTranslatedMessage("ConfirmLeavePage"),
                    actions: [
                        this.app.service.getTranslatedMessage("StayOnThisPage"),
                        this.app.service.getTranslatedMessage("LeaveThisPage")
                    ]
                }).then(result => {
                    if (result === 1) {
                        Enumerable.from(this.app.cacheEntries).toArray().forEach(entry => {
                            if (entry instanceof Vidyano.WebComponents.PersistentObjectAppCacheEntry && !!entry.persistentObject && entry.persistentObject.isDirty && entry.persistentObject.actions.some(a => a.name === "Save" || a.name === "EndEdit")) {
                                if (entry.persistentObject.isNew)
                                    this.app.cacheRemove(entry);
                                else
                                    entry.persistentObject.cancelEdit();
                            }
                        });

                        this.app.changePath(newPath);
                        route.deactivator(true);
                    }
                    else
                        route.deactivator(false);
                });
            }
        }

        private _computePersistentObject() {
            if (this.persistentObject && this.persistentObject.objectId == this.persistentObjectId && this.persistentObject.objectId == this.persistentObjectObjectId)
                return;

            var persistentObjectId = this.persistentObjectId;
            var persistentObjectObjectId = this.persistentObjectObjectId;

            if (persistentObjectId != null) {
                this._setLoading(true);
                this.app.service.getPersistentObject(null, persistentObjectId, persistentObjectObjectId).then(po => {
                    var cacheEntry = <PersistentObjectAppCacheEntry>this.app.cache(new PersistentObjectAppCacheEntry(po.id, po.objectId));
                    cacheEntry.persistentObject = po;

                    if (persistentObjectId == this.persistentObjectId && persistentObjectObjectId == this.persistentObjectObjectId) {
                        this.persistentObject = po;
                        this._cacheEntry = cacheEntry;
                    }
                }, e => {
                        this._setError(e);
                        this._setLoading(false);
                    });
            }
            else
                this.persistentObject = null;
        }

        private _computeHasError(error: string): boolean {
            return !StringEx.isNullOrEmpty(error);
        }

        private _persistentObjectChanged(persistentObject: Vidyano.PersistentObject, oldPersistentObject: Vidyano.PersistentObject) {
            if (oldPersistentObject)
                this.empty();

            if (persistentObject) {
                if (!Vidyano.WebComponents.PersistentObjectPresenter._persistentObjectComponentLoader) {
                    Vidyano.WebComponents.PersistentObjectPresenter._persistentObjectComponentLoader = new Promise(resolve => {
                        this.importHref(this.resolveUrl("../PersistentObject/persistent-object.html"), e => {
                            resolve(true);
                        }, err => {
                                console.error(err);
                                resolve(false);
                            });
                    });
                }

                this._renderPersistentObject(persistentObject);
            }

            this.fire("title-changed", { title: persistentObject ? persistentObject.breadcrumb : null }, { bubbles: true });
        }

        private _renderPersistentObject(persistentObject: Vidyano.PersistentObject) {
            Vidyano.WebComponents.PersistentObjectPresenter._persistentObjectComponentLoader.then(() => {
                if (persistentObject !== this.persistentObject)
                    return;

                var persistentObjectComponent = new Vidyano.WebComponents.PersistentObject();
                persistentObjectComponent.persistentObject = persistentObject;
                Polymer.dom(this).appendChild(persistentObjectComponent);

                this._setLoading(false);
            });
        }

        private _edit() {
            if (!this.persistentObject)
                return;

            var action = <Vidyano.Action>this.persistentObject.actions["Edit"];
            if (action)
                action.execute();
        }

        private _save() {
            if (!this.persistentObject)
                return;

            var action = <Vidyano.Action>(this.persistentObject.actions["Save"] || this.persistentObject.actions["EndEdit"]);
            if (action)
                action.execute();
        }

        private _cancelSave() {
            if (!this.persistentObject)
                return;

            var action = <Vidyano.Action>(this.persistentObject.actions["CancelEdit"] || this.persistentObject.actions["CancelSave"]);
            if (action)
                action.execute();
        }
    }
}
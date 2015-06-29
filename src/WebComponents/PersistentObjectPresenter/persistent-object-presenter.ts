module Vidyano.WebComponents {
    export class PersistentObjectPresenter extends WebComponent {
        private _cacheEntry: PersistentObjectAppCacheEntry;
        persistentObjectId: string;
        persistentObjectObjectId: string;
        persistentObject: Vidyano.PersistentObject;

        private _setLoading: (loading: boolean) => void;
        private _setError: (error: string) => void;
        
        private _activating(e: CustomEvent, detail: { route: AppRoute; parameters: { id?: string; objectId?: string; fromActionId?: string; }; }) {
            this._setError(null);

            if (detail.parameters.fromActionId) {
                if (this._cacheEntry = <PersistentObjectFromActionAppCacheEntry>detail.route.app.cachePing(new PersistentObjectFromActionAppCacheEntry(undefined, detail.parameters.fromActionId)))
                    this.persistentObject = this._cacheEntry.persistentObject;

                if (!this.persistentObject) {
                    this._setLoading(false);
                    this._setError(this.translations.UnableToLoadObject);
                }
            } else {
                var cacheEntry = new PersistentObjectAppCacheEntry(detail.parameters.id, detail.parameters.objectId);
                this._cacheEntry = <PersistentObjectAppCacheEntry>detail.route.app.cachePing(cacheEntry);
                if (!this._cacheEntry)
                    detail.route.app.cache(this._cacheEntry = cacheEntry);

                if (this._cacheEntry.persistentObject)
                    this.persistentObject = this._cacheEntry.persistentObject;
                else {
                    this.persistentObject = this.persistentObjectObjectId = this.persistentObjectId = undefined;
                    this.persistentObjectObjectId = this._cacheEntry.objectId || "";
                    this.persistentObjectId = this._cacheEntry.id;
                }
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

        private _persistentObjectChanged(newPersistentObject: Vidyano.PersistentObject, oldPersistentObject: Vidyano.PersistentObject) {
            if (oldPersistentObject)
                this.empty();

            if (this.persistentObject) {
                var persistentObject = new Vidyano.WebComponents.PersistentObject();
                persistentObject.persistentObject = this.persistentObject;
                Polymer.dom(this).appendChild(persistentObject.asElement);
            }

            this._setLoading(false);
        }
    }

    WebComponent.register(PersistentObjectPresenter, WebComponents, "vi", {
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
            "activating": "_activating"
        }
    });
}
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var PersistentObjectPresenter = (function (_super) {
            __extends(PersistentObjectPresenter, _super);
            function PersistentObjectPresenter() {
                _super.apply(this, arguments);
            }
            PersistentObjectPresenter.prototype._activating = function (e, detail) {
                this._setError(null);
                if (detail.parameters.fromActionId) {
                    if (this._cacheEntry = detail.route.app.cachePing(new WebComponents.PersistentObjectFromActionAppCacheEntry(undefined, detail.parameters.fromActionId)))
                        this.persistentObject = this._cacheEntry.persistentObject;
                    if (!this.persistentObject) {
                        this._setLoading(false);
                        this._setError(this.translations.UnableToLoadObject);
                    }
                }
                else {
                    var cacheEntry = new WebComponents.PersistentObjectAppCacheEntry(detail.parameters.id, detail.parameters.objectId);
                    this._cacheEntry = detail.route.app.cachePing(cacheEntry);
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
            };
            PersistentObjectPresenter.prototype._computePersistentObject = function () {
                var _this = this;
                if (this.persistentObject && this.persistentObject.objectId == this.persistentObjectId && this.persistentObject.objectId == this.persistentObjectObjectId)
                    return;
                var persistentObjectId = this.persistentObjectId;
                var persistentObjectObjectId = this.persistentObjectObjectId;
                if (persistentObjectId != null) {
                    this._setLoading(true);
                    this.app.service.getPersistentObject(null, persistentObjectId, persistentObjectObjectId).then(function (po) {
                        var cacheEntry = _this.app.cache(new WebComponents.PersistentObjectAppCacheEntry(po.id, po.objectId));
                        cacheEntry.persistentObject = po;
                        if (persistentObjectId == _this.persistentObjectId && persistentObjectObjectId == _this.persistentObjectObjectId) {
                            _this.persistentObject = po;
                            _this._cacheEntry = cacheEntry;
                        }
                    }, function (e) {
                        _this._setError(e);
                        _this._setLoading(false);
                    });
                }
                else
                    this.persistentObject = null;
            };
            PersistentObjectPresenter.prototype._computeHasError = function (error) {
                return !StringEx.isNullOrEmpty(error);
            };
            PersistentObjectPresenter.prototype._persistentObjectChanged = function (persistentObject, oldPersistentObject) {
                var _this = this;
                if (oldPersistentObject)
                    this.empty();
                if (persistentObject) {
                    if (!Vidyano.WebComponents.PersistentObjectPresenter._persistentObjectComponentLoader) {
                        Vidyano.WebComponents.PersistentObjectPresenter._persistentObjectComponentLoader = new Promise(function (resolve) {
                            _this.importHref(_this.resolveUrl("../PersistentObject/persistent-object.html"), function (e) {
                                resolve(true);
                            }, function (err) {
                                console.error(err);
                                resolve(false);
                            });
                        });
                    }
                    this._renderPersistentObject(persistentObject);
                }
            };
            PersistentObjectPresenter.prototype._renderPersistentObject = function (persistentObject) {
                var _this = this;
                Vidyano.WebComponents.PersistentObjectPresenter._persistentObjectComponentLoader.then(function () {
                    if (persistentObject !== _this.persistentObject)
                        return;
                    var persistentObjectComponent = new Vidyano.WebComponents.PersistentObject();
                    persistentObjectComponent.persistentObject = persistentObject;
                    Polymer.dom(_this).appendChild(persistentObjectComponent);
                    _this._setLoading(false);
                });
            };
            return PersistentObjectPresenter;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectPresenter = PersistentObjectPresenter;
        WebComponents.WebComponent.register(PersistentObjectPresenter, WebComponents, "vi", {
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
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

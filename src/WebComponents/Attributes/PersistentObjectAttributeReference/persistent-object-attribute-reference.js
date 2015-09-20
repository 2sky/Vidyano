var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var Attributes;
        (function (Attributes) {
            var PersistentObjectAttributeReference = (function (_super) {
                __extends(PersistentObjectAttributeReference, _super);
                function PersistentObjectAttributeReference() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeReference.prototype.attached = function () {
                    _super.prototype.attached.call(this);
                    this._update();
                };
                PersistentObjectAttributeReference.prototype._attributeChanged = function () {
                    _super.prototype._attributeChanged.call(this);
                    this._update();
                };
                PersistentObjectAttributeReference.prototype._valueChanged = function (newValue) {
                    this._update();
                    if (this.attribute && newValue !== this.attribute.value) {
                        this.attribute.setValue(newValue, true);
                    }
                };
                PersistentObjectAttributeReference.prototype._objectIdChanged = function () {
                    if (this.attribute && this.attribute.objectId !== this.objectId)
                        this.attribute.changeReference(this.objectId ? [this.objectId] : []);
                };
                PersistentObjectAttributeReference.prototype._filterBlur = function () {
                    var _this = this;
                    if (!this.attribute)
                        return;
                    if (!StringEx.isNullOrEmpty(this.filter) && this.filter != this.attribute.value) {
                        this.attribute.lookup.textSearch = 'vi-breadcrumb:"' + this.filter + '"';
                        this.attribute.lookup.search().then(function (result) {
                            if (result.length == 0)
                                _this.filter = _this.attribute.value;
                            else if (result.length == 1)
                                _this.attribute.changeReference([result[0]]).then(function () { return _this._update(); });
                            else {
                                _this.attribute.lookup.textSearch = _this.filter;
                                _this._browseReference(true).catch(function () {
                                    _this.filter = _this.attribute.value;
                                });
                            }
                        });
                    }
                    else
                        this.filter = this.attribute.value;
                };
                PersistentObjectAttributeReference.prototype._editingChanged = function () {
                    this._update();
                };
                PersistentObjectAttributeReference.prototype._browseReference = function (throwExceptions) {
                    var _this = this;
                    this.attribute.lookup.selectedItems = [];
                    this.attribute.lookup.search();
                    return this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(this.attribute.lookup)).then(function (result) {
                        if (!result) {
                            if (throwExceptions === true)
                                return Promise.reject("Nothing selected");
                            return Promise.resolve();
                        }
                        return _this.attribute.changeReference(result).then(function () {
                            _this._update();
                        });
                    });
                };
                PersistentObjectAttributeReference.prototype._addNewReference = function (e) {
                    this.attribute.addNewReference();
                };
                PersistentObjectAttributeReference.prototype._clearReference = function (e) {
                    var _this = this;
                    this.attribute.changeReference([]).then(function () { return _this._update(); });
                };
                PersistentObjectAttributeReference.prototype._update = function () {
                    var hasReference = this.attribute instanceof Vidyano.PersistentObjectAttributeWithReference;
                    if (hasReference && this.attribute.objectId !== this.objectId)
                        this.objectId = this.attribute ? this.attribute.objectId : null;
                    if (hasReference && this.attribute.lookup && this.attribute.lookup.canRead && this.attribute.objectId && this.app)
                        this.href = "#!/" + this.app.getUrlForPersistentObject(this.attribute.lookup.persistentObject.id, this.attribute.objectId);
                    else
                        this.href = null;
                    this.filter = hasReference ? this.attribute.value : "";
                    this._setCanClear(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && !this.attribute.isRequired && !StringEx.isNullOrEmpty(this.href) && !this.attribute.selectInPlace);
                    this._setCanAddNewReference(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && this.attribute.canAddNewReference);
                    this._setCanBrowseReference(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && !this.attribute.selectInPlace);
                };
                PersistentObjectAttributeReference.prototype._open = function (e) {
                    var _this = this;
                    this.attribute.getPersistentObject().then(function (po) {
                        if (po)
                            _this.attribute.service.hooks.onOpen(po, false, true);
                    });
                    e.preventDefault();
                };
                PersistentObjectAttributeReference = __decorate([
                    Attributes.PersistentObjectAttribute.register({
                        properties: {
                            href: String,
                            canClear: {
                                type: Boolean,
                                readOnly: true
                            },
                            canAddNewReference: {
                                type: Boolean,
                                readOnly: true
                            },
                            canBrowseReference: {
                                type: Boolean,
                                readOnly: true
                            },
                            filter: {
                                type: String,
                                notify: true
                            },
                            objectId: {
                                type: String,
                                observer: "_objectIdChanged",
                                value: null
                            },
                            selectInPlace: {
                                type: Boolean,
                                reflectToAttribute: true,
                                computed: "attribute.selectInPlace"
                            }
                        },
                        observers: [
                            "_update(attribute.isReadOnly)"
                        ]
                    })
                ], PersistentObjectAttributeReference);
                return PersistentObjectAttributeReference;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeReference = PersistentObjectAttributeReference;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

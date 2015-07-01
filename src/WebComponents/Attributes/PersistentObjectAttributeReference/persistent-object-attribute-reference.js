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
                    if (this.referenceAttribute && this.referenceAttribute.objectId !== this.objectId)
                        this.referenceAttribute.changeReference(this.objectId ? [this.objectId] : []);
                };
                PersistentObjectAttributeReference.prototype._filterBlur = function () {
                    var _this = this;
                    if (!this.referenceAttribute)
                        return;
                    if (!StringEx.isNullOrEmpty(this.filter) && this.filter != this.referenceAttribute.value) {
                        this.referenceAttribute.lookup.textSearch = 'vi-breadcrumb:"' + this.filter + '"';
                        this.referenceAttribute.lookup.search().then(function (result) {
                            if (result.length == 0)
                                _this.filter = _this.referenceAttribute.value;
                            else if (result.length == 1)
                                _this.referenceAttribute.changeReference([result[0]]).then(function () { return _this._update(); });
                            else {
                                _this.referenceAttribute.lookup.textSearch = _this.filter;
                                _this._browseReference().catch(function () {
                                    _this.filter = _this.referenceAttribute.value;
                                });
                            }
                        });
                    }
                    else
                        this.filter = this.referenceAttribute.value;
                };
                PersistentObjectAttributeReference.prototype._editingChanged = function () {
                    this._update();
                };
                PersistentObjectAttributeReference.prototype._browseReference = function () {
                    var _this = this;
                    this.referenceAttribute.lookup.selectedItems = [];
                    this.referenceAttribute.lookup.search();
                    var dialog = this.$$("#browseReferenceDialog");
                    return dialog.show().then(function (result) {
                        if (!result)
                            return Promise.reject();
                        _this.referenceAttribute.changeReference(result).then(function () {
                            _this._update();
                        });
                    });
                };
                PersistentObjectAttributeReference.prototype._addNewReference = function (e) {
                    this.referenceAttribute.addNewReference();
                };
                PersistentObjectAttributeReference.prototype._clearReference = function (e) {
                    var _this = this;
                    this.referenceAttribute.changeReference([]).then(function () { return _this._update(); });
                };
                PersistentObjectAttributeReference.prototype._update = function () {
                    var hasReference = this.referenceAttribute instanceof Vidyano.PersistentObjectAttributeWithReference;
                    if (hasReference && this.referenceAttribute.objectId != this.objectId)
                        this.objectId = this.referenceAttribute ? this.referenceAttribute.objectId : null;
                    if (hasReference && this.referenceAttribute.lookup && this.referenceAttribute.objectId && this.app)
                        this.href = "#!/" + this.app.getUrlForPersistentObject(this.referenceAttribute.lookup.persistentObject.id, this.referenceAttribute.objectId);
                    else
                        this.href = null;
                    this.filter = hasReference ? this.referenceAttribute.value : "";
                    this._setCanClear(hasReference && this.referenceAttribute.parent.isEditing && !this.referenceAttribute.isReadOnly && !this.referenceAttribute.isRequired && !StringEx.isNullOrEmpty(this.href) && !this.referenceAttribute.selectInPlace);
                    this._setCanAddNewReference(hasReference && this.referenceAttribute.parent.isEditing && !this.referenceAttribute.isReadOnly && this.referenceAttribute.canAddNewReference);
                    this._setCanBrowseReference(hasReference && this.referenceAttribute.parent.isEditing && !this.referenceAttribute.isReadOnly && !this.referenceAttribute.selectInPlace);
                };
                PersistentObjectAttributeReference.prototype._open = function (e) {
                    var _this = this;
                    this.referenceAttribute.getPersistentObject().then(function (po) {
                        if (po)
                            _this.referenceAttribute.service.hooks.onOpen(po, false, true);
                    });
                    e.preventDefault();
                };
                return PersistentObjectAttributeReference;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeReference = PersistentObjectAttributeReference;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeReference, {
                properties: {
                    href: String,
                    referenceAttribute: {
                        type: Object,
                        computed: "_forwardComputed(attribute)"
                    },
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
                        observer: "_objectIdChanged"
                    },
                    selectInPlace: {
                        type: Boolean,
                        reflectToAttribute: true,
                        computed: "referenceAttribute.selectInPlace"
                    }
                }
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

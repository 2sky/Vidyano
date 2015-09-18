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
            var PersistentObjectAttributeUser = (function (_super) {
                __extends(PersistentObjectAttributeUser, _super);
                function PersistentObjectAttributeUser() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeUser.prototype._browseReference = function () {
                    var _this = this;
                    this.app.service.getQuery(this.attribute.getTypeHint("IncludeGroups") === "True" ? "98b12f32-3f2d-4f54-b963-cb9206f74355" : "273a8302-ddc8-43db-a7f6-c3c28fc8f593", true).then(function (query) {
                        query.maxSelectedItems = 1;
                        var dialog = _this.$$("#browseReferenceDialog");
                        dialog.query = query;
                        dialog.show().then(function (result) {
                            if (!result)
                                return;
                            _this._setNewUser(result[0].id, result[0].getValue("FriendlyName") || result[0].breadcrumb);
                        }).catch();
                    });
                };
                PersistentObjectAttributeUser.prototype._clearReference = function () {
                    this._setNewUser(null, null);
                };
                PersistentObjectAttributeUser.prototype._setNewUser = function (id, name) {
                    this.value = id;
                    this.notifyPath("attribute.options", this.attribute.options[0] = name);
                };
                PersistentObjectAttributeUser.prototype._computeFriendlyName = function (options) {
                    return options && options.length > 0 ? options[0] : "";
                };
                PersistentObjectAttributeUser.prototype._computeCanClear = function (isRequired, value) {
                    return !isRequired && !StringEx.isNullOrEmpty(value);
                };
                PersistentObjectAttributeUser.prototype._computeCanBrowseReference = function (isReadOnly) {
                    return !isReadOnly;
                };
                PersistentObjectAttributeUser = __decorate([
                    Attributes.PersistentObjectAttribute.register({
                        properties: {
                            friendlyName: {
                                type: String,
                                computed: "_computeFriendlyName(attribute.options)"
                            },
                            canClear: {
                                type: Boolean,
                                computed: "_computeCanClear(attribute.isRequired, value)"
                            },
                            canBrowseReference: {
                                type: Boolean,
                                computed: "_computeCanBrowseReference(attribute.isReadOnly)",
                            },
                        }
                    })
                ], PersistentObjectAttributeUser);
                return PersistentObjectAttributeUser;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeUser = PersistentObjectAttributeUser;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

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
            var PersistentObjectAttributeCommonMark = (function (_super) {
                __extends(PersistentObjectAttributeCommonMark, _super);
                function PersistentObjectAttributeCommonMark() {
                    var _this = this;
                    _super.call(this);
                    this.importHref(this.resolveUrl("../../../Libs/marked-element/marked-element.html"), function (e) {
                        _this._setMarkedElementLoaded(true);
                    });
                }
                PersistentObjectAttributeCommonMark.prototype._editTextAreaBlur = function () {
                    if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                        this.attribute.setValue(this.value = this.attribute.value, true);
                };
                PersistentObjectAttributeCommonMark.prototype._computeNotEditing = function (markedElementLoaded, editing) {
                    return markedElementLoaded && !editing;
                };
                PersistentObjectAttributeCommonMark = __decorate([
                    Attributes.PersistentObjectAttribute.register({
                        properties: {
                            markedElementLoaded: {
                                type: Boolean,
                                readOnly: true
                            },
                            notEditing: {
                                type: Boolean,
                                computed: "_computeNotEditing(markedElementLoaded, editing)"
                            }
                        }
                    })
                ], PersistentObjectAttributeCommonMark);
                return PersistentObjectAttributeCommonMark;
            })(Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeCommonMark = PersistentObjectAttributeCommonMark;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

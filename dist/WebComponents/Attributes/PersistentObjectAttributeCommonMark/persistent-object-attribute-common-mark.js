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
                return PersistentObjectAttributeCommonMark;
            })(Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeCommonMark = PersistentObjectAttributeCommonMark;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeCommonMark, {
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
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

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
            var PersistentObjectAttributeImage = (function (_super) {
                __extends(PersistentObjectAttributeImage, _super);
                function PersistentObjectAttributeImage() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeImage.prototype._change = function (e) {
                    var _this = this;
                    this.attribute.parent.queueWork(function () {
                        return new Promise(function (resolve, reject) {
                            var input = e.target;
                            if (input.files && input.files.length == 1) {
                                var fr = new FileReader();
                                fr.readAsDataURL(input.files[0]);
                                fr.onload = function () {
                                    resolve(_this.value = fr.result.match(/,(.*)$/)[1]);
                                };
                                fr.onerror = function () {
                                    reject(fr.error);
                                };
                            }
                        });
                    }, true);
                };
                PersistentObjectAttributeImage.prototype._clear = function () {
                    this.value = null;
                };
                PersistentObjectAttributeImage.prototype._computeCanClear = function (value) {
                    return !StringEx.isNullOrEmpty(value);
                };
                PersistentObjectAttributeImage.prototype._computeImage = function (value) {
                    return value ? "background-image: url(" + value.asDataUri() + ")" : "";
                };
                return PersistentObjectAttributeImage;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeImage = PersistentObjectAttributeImage;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeImage, {
                properties: {
                    canClear: {
                        type: Boolean,
                        computed: "_computeCanClear(value)"
                    },
                    image: {
                        type: String,
                        computed: "_computeImage(value)"
                    }
                }
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

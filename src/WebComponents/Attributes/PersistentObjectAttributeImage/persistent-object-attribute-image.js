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
                PersistentObjectAttributeImage.prototype._attributeChanged = function () {
                    if (this._pasteListener) {
                        document.removeEventListener("paste", this._pasteListener, false);
                        this._pasteListener = null;
                    }
                    if (this.attribute && this.attribute.getTypeHint("AllowPaste") == "true") {
                        this._pasteListener = this._pasteAuto.bind(this);
                        document.addEventListener("paste", this._pasteListener, false);
                    }
                };
                PersistentObjectAttributeImage.prototype.detached = function () {
                    if (this._pasteListener) {
                        document.removeEventListener("paste", this._pasteListener, false);
                        this._pasteListener = null;
                    }
                    _super.prototype.detached.call(this);
                };
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
                PersistentObjectAttributeImage.prototype._pasteAuto = function (e) {
                    if (this.readOnly || !this.editing)
                        return;
                    if (e.clipboardData) {
                        var items = e.clipboardData.items;
                        if (items) {
                            for (var i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf("image") !== -1) {
                                    var blob = items[i].getAsFile();
                                    var URLObj = window["URL"] || window["webkitURL"];
                                    var source = URLObj.createObjectURL(blob);
                                    this._pasteCreateImage(source);
                                }
                            }
                            e.preventDefault();
                        }
                    }
                };
                PersistentObjectAttributeImage.prototype._pasteCreateImage = function (source) {
                    var _this = this;
                    var pastedImage = new Image();
                    pastedImage.onload = function () {
                        var canvas = document.createElement("canvas");
                        canvas.width = pastedImage.width;
                        canvas.height = pastedImage.height;
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(pastedImage, 0, 0);
                        _this.value = canvas.toDataURL().match(/,(.*)$/)[1];
                    };
                    pastedImage.src = source;
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

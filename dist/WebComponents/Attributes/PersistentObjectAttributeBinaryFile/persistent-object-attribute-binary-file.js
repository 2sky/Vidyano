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
            var PersistentObjectAttributeBinaryFile = (function (_super) {
                __extends(PersistentObjectAttributeBinaryFile, _super);
                function PersistentObjectAttributeBinaryFile() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeBinaryFile.prototype._change = function (e) {
                    var targetInput = e.target;
                    if (targetInput.files && targetInput.files.length > 0)
                        this.value = targetInput.files[0].name;
                };
                PersistentObjectAttributeBinaryFile.prototype._registerInput = function (attribute, isAttached) {
                    if (this._inputAttribute) {
                        this._inputAttribute.clearRegisteredInput();
                        this._inputAttribute = null;
                    }
                    if (this._inputContainer)
                        this._inputContainer.textContent = "";
                    if (attribute && isAttached) {
                        this._inputAttribute = attribute;
                        var input = document.createElement("input");
                        this._inputAttribute.registerInput(input);
                        input.type = "file";
                        if (!this._inputContainer) {
                            this._inputContainer = document.createElement("div");
                            this._inputContainer.setAttribute("upload", "");
                            Polymer.dom(this).appendChild(this._inputContainer);
                        }
                        this._inputContainer.appendChild(input);
                    }
                };
                PersistentObjectAttributeBinaryFile.prototype._clear = function () {
                    this.value = null;
                };
                PersistentObjectAttributeBinaryFile.prototype._computeCanClear = function (value, readOnly) {
                    return !readOnly && !StringEx.isNullOrEmpty(value);
                };
                PersistentObjectAttributeBinaryFile.prototype._computeFileName = function (value) {
                    if (StringEx.isNullOrEmpty(value))
                        return "";
                    return value.split("|")[0];
                };
                return PersistentObjectAttributeBinaryFile;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeBinaryFile = PersistentObjectAttributeBinaryFile;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeBinaryFile, {
                properties: {
                    canClear: {
                        type: Boolean,
                        computed: "_computeCanClear(value, readOnly)"
                    },
                    fileName: {
                        type: String,
                        computed: "_computeFileName(value)"
                    }
                },
                observers: [
                    "_registerInput(attribute, isAttached)"
                ]
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

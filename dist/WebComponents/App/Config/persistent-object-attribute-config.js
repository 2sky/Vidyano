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
        var PersistentObjectAttributeConfig = (function (_super) {
            __extends(PersistentObjectAttributeConfig, _super);
            function PersistentObjectAttributeConfig() {
                _super.apply(this, arguments);
            }
            PersistentObjectAttributeConfig.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._setTemplate(Polymer.dom(this).querySelector("template"));
            };
            PersistentObjectAttributeConfig.prototype.calculateHeight = function (attr) {
                if (!this._calculateHeight) {
                    if (/d+/.test(this.height)) {
                        var height = parseInt(this.height);
                        this._calculateHeight = function () { return height; };
                    }
                    else
                        this._calculateHeight = new Function("attr", "return " + this.height);
                }
                return this._calculateHeight(attr);
            };
            PersistentObjectAttributeConfig.prototype.calculateWidth = function (attr) {
                if (!this._calculateWidth) {
                    if (/d+/.test(this.width)) {
                        var width = parseInt(this.width);
                        this._calculateWidth = function () { return width; };
                    }
                    else
                        this._calculateWidth = new Function("attr", "return " + this.width);
                }
                return this._calculateWidth(attr);
            };
            return PersistentObjectAttributeConfig;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectAttributeConfig = PersistentObjectAttributeConfig;
        WebComponents.WebComponent.register(PersistentObjectAttributeConfig, WebComponents, "vi", {
            properties: {
                type: String,
                name: String,
                parentId: String,
                parentObjectId: String,
                height: {
                    type: String,
                    value: "2"
                },
                width: {
                    type: String,
                    value: "1"
                },
                template: {
                    type: Object,
                    readOnly: true
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

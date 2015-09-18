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
            PersistentObjectAttributeConfig = __decorate([
                WebComponents.WebComponent.register({
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
                })
            ], PersistentObjectAttributeConfig);
            return PersistentObjectAttributeConfig;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectAttributeConfig = PersistentObjectAttributeConfig;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

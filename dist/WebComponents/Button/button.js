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
        var Button = (function (_super) {
            __extends(Button, _super);
            function Button() {
                _super.apply(this, arguments);
            }
            Button.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._setCustomLayout(Polymer.dom(this).children.length > 0);
            };
            Button = __decorate([
                WebComponents.WebComponent.register({
                    extends: "button",
                    properties: {
                        disabled: {
                            type: Boolean,
                            reflectToAttribute: true
                        },
                        inverse: {
                            type: String,
                            reflectToAttribute: true
                        },
                        customLayout: {
                            type: Boolean,
                            readOnly: true,
                            reflectToAttribute: true
                        },
                        icon: String,
                        label: String
                    }
                })
            ], Button);
            return Button;
        })(WebComponents.WebComponent);
        WebComponents.Button = Button;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

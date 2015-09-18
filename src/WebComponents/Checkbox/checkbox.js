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
        var Checkbox = (function (_super) {
            __extends(Checkbox, _super);
            function Checkbox() {
                _super.apply(this, arguments);
            }
            Checkbox.prototype.toggle = function () {
                if (this.disabled)
                    return;
                this.checked = !!!this.checked;
            };
            Checkbox.prototype._computeIsNull = function (checked) {
                return checked !== false && checked !== true;
            };
            Checkbox = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        checked: {
                            type: Boolean,
                            reflectToAttribute: true,
                            notify: true
                        },
                        label: String,
                        isNull: {
                            type: Boolean,
                            value: true,
                            computed: "_computeIsNull(checked)"
                        },
                        disabled: {
                            type: Boolean,
                            reflectToAttribute: true
                        }
                    },
                    listeners: {
                        "tap": "toggle"
                    }
                })
            ], Checkbox);
            return Checkbox;
        })(WebComponents.WebComponent);
        WebComponents.Checkbox = Checkbox;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

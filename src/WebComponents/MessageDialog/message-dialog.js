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
        var MessageDialog = (function (_super) {
            __extends(MessageDialog, _super);
            function MessageDialog() {
                _super.apply(this, arguments);
            }
            MessageDialog.prototype.show = function (options) {
                this._setOptions(options);
                if (options.html)
                    this.$["pre"].innerHTML = options.message;
                else
                    this.$["pre"].textContent = options.message;
                var dialog = this.$["dialog"];
                this._dialog = dialog.show(options);
                return this._dialog.result;
            };
            MessageDialog.prototype._close = function () {
                this._dialog.reject();
            };
            MessageDialog.prototype._hasHeaderIcon = function (options) {
                return this.options && typeof this.options.titleIcon == "string";
            };
            MessageDialog.prototype._getActionType = function (options, index) {
                if (!options || !options.actionTypes)
                    return undefined;
                return options.actionTypes[index];
            };
            MessageDialog.prototype._onSelectAction = function (e) {
                this._dialog.resolve(e.model.index);
                e.stopPropagation();
            };
            MessageDialog.prototype._isFirst = function (index) {
                return index === 0;
            };
            MessageDialog = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        options: {
                            type: Object,
                            readOnly: true
                        }
                    },
                    hostAttributes: {
                        "dialog": ""
                    },
                    keybindings: {
                        "esc": {
                            listener: "_close",
                            priority: Number.MAX_VALUE
                        }
                    }
                })
            ], MessageDialog);
            return MessageDialog;
        })(WebComponents.WebComponent);
        WebComponents.MessageDialog = MessageDialog;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

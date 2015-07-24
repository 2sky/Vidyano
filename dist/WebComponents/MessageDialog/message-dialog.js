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
        var MessageDialog = (function (_super) {
            __extends(MessageDialog, _super);
            function MessageDialog() {
                _super.apply(this, arguments);
            }
            MessageDialog.prototype.show = function (options) {
                this._setOptions(options);
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
            return MessageDialog;
        })(WebComponents.WebComponent);
        WebComponents.MessageDialog = MessageDialog;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.MessageDialog, Vidyano.WebComponents, "vi", {
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
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

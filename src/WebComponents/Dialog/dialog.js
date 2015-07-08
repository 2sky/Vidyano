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
        var DialogInstance = (function () {
            function DialogInstance(options, result, _resolve, _reject) {
                this.options = options;
                this.result = result;
                this._resolve = _resolve;
                this._reject = _reject;
            }
            DialogInstance.prototype.resolve = function (result) {
                this._resolve(result);
            };
            DialogInstance.prototype.reject = function (error) {
                this._reject(error);
            };
            return DialogInstance;
        })();
        WebComponents.DialogInstance = DialogInstance;
        var Dialog = (function (_super) {
            __extends(Dialog, _super);
            function Dialog() {
                _super.apply(this, arguments);
            }
            Dialog.prototype.show = function (options) {
                var _this = this;
                if (options === void 0) { options = {}; }
                var resolve;
                var reject;
                var promise = new Promise(function (_resolve, _reject) {
                    resolve = _resolve;
                    reject = _reject;
                    _this._setAutoSize(options.autoSize);
                    _this._setShown(true);
                }).then(function (result) {
                    _this._setShown(false);
                    return result;
                }).catch(function (e) {
                    _this._setShown(false);
                    reject(e);
                });
                this.set("_instance", new DialogInstance(options, promise, resolve, reject));
                return this._instance;
            };
            Dialog.prototype._close = function () {
                this._setShown(false);
                this._instance.reject();
            };
            Dialog.prototype._track = function (e, detail) {
                if (detail.state == "track") {
                    this._set_translate({
                        x: this._translate.x + detail.ddx,
                        y: this._translate.y + detail.ddy
                    });
                }
                else if (detail.state == "start") {
                    if (!this._translate)
                        this._set_translate({ x: 0, y: 0 });
                    this._setDragging(true);
                }
                else if (detail.state == "end")
                    this._setDragging(false);
            };
            Dialog.prototype._translateChanged = function () {
                var dialog = this.$["dialog"];
                dialog.style.webkitTransform = dialog.style.transform = "translate(" + this._translate.x + "px, " + this._translate.y + "px)";
            };
            return Dialog;
        })(WebComponents.WebComponent);
        WebComponents.Dialog = Dialog;
        WebComponents.WebComponent.register(Dialog, WebComponents, "vi", {
            properties: {
                shown: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                autoSize: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                dragging: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                _translate: {
                    type: Object,
                    readOnly: true,
                    observer: "_translateChanged"
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

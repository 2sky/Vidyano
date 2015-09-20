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
            Dialog.prototype._show = function (e, details) {
                this._instance = details;
                this.show(details.options);
            };
            Object.defineProperty(Dialog.prototype, "instance", {
                get: function () {
                    return this._instance;
                },
                enumerable: true,
                configurable: true
            });
            Dialog.prototype.show = function (options) {
            };
            Dialog.prototype.close = function (result) {
                this._instance.resolve(result);
            };
            Dialog.prototype.cancel = function (result) {
                this._instance.reject(result);
            };
            Dialog.register = function (info) {
                if (info === void 0) { info = {}; }
                if (typeof info == "function")
                    return Dialog.register({})(info);
                return function (obj) {
                    info.properties = info.properties || {};
                    info.properties["dialog"] = {
                        type: Boolean,
                        readOnly: true,
                        reflectToAttribute: true,
                        value: true
                    };
                    info.listeners = info.listeners || {};
                    info.listeners["show"] = "_show";
                    info.keybindings = info.keybindings || {};
                    if (!info.keybindings["esc"]) {
                        info.keybindings["esc"] = {
                            listener: "cancel",
                            priority: Number.MAX_VALUE
                        };
                    }
                    return WebComponents.WebComponent.register(obj, info);
                };
            };
            return Dialog;
        })(WebComponents.WebComponent);
        WebComponents.Dialog = Dialog;
        var DialogHost = (function (_super) {
            __extends(DialogHost, _super);
            function DialogHost(_dialog) {
                _super.call(this);
                this._dialog = _dialog;
                Polymer.dom(this).appendChild(_dialog);
            }
            DialogHost.prototype._translateChanged = function () {
                this._dialog.style.webkitTransform = this._dialog.style.transform = "translate(" + this._translate.x + "px, " + this._translate.y + "px)";
            };
            DialogHost.prototype._track = function (e) {
                var detail = e.detail;
                if (detail.state == "track") {
                    this._set_translate({
                        x: this._translate.x + detail.ddx,
                        y: this._translate.y + detail.ddy
                    });
                }
                else if (detail.state == "start") {
                    if (!this._translate)
                        this._set_translate({ x: 0, y: 0 });
                    this._dialog.setAttribute("dragging", "");
                }
                else if (detail.state == "end")
                    this._dialog.removeAttribute("dragging");
            };
            DialogHost.prototype.show = function (options) {
                var _this = this;
                if (options === void 0) { options = {}; }
                var header = this.querySelector("[dialog] > header");
                if (header) {
                    var trackHandler;
                    Polymer.Gestures.add(header, "track", trackHandler = this._track.bind(this));
                }
                var resolve;
                var reject;
                var promise = new Promise(function (_resolve, _reject) {
                    resolve = _resolve;
                    reject = _reject;
                    _this._setShown(true);
                }).then(function (result) {
                    if (trackHandler)
                        Polymer.Gestures.remove(header, "track", trackHandler);
                    _this._setShown(false);
                    Polymer.dom(_this).removeChild(_this._dialog);
                    _this._dialog = null;
                    return result;
                }).catch(function (e) {
                    if (trackHandler)
                        Polymer.Gestures.remove(header, "track", trackHandler);
                    _this._setShown(false);
                    Polymer.dom(_this).removeChild(_this._dialog);
                    _this._dialog = null;
                    throw e;
                });
                this._dialog.fire("show", new DialogInstance(options, promise, resolve, reject), { bubbles: false });
                return promise;
            };
            DialogHost = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        "shown": {
                            type: Boolean,
                            readOnly: true,
                            reflectToAttribute: true
                        },
                        "_translate": {
                            type: Object,
                            readOnly: true,
                            observer: "_translateChanged"
                        }
                    }
                })
            ], DialogHost);
            return DialogHost;
        })(WebComponents.WebComponent);
        WebComponents.DialogHost = DialogHost;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

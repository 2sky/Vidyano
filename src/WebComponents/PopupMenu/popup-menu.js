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
        var PopupMenu = (function (_super) {
            __extends(PopupMenu, _super);
            function PopupMenu() {
                _super.apply(this, arguments);
            }
            PopupMenu.prototype.popup = function () {
                return this.$["popup"].popup();
            };
            PopupMenu.prototype._hookContextMenu = function (isAttached, contextMenu) {
                if (isAttached && contextMenu)
                    this.parentElement.addEventListener("contextmenu", this._openContextEventListener = this._openContext.bind(this));
                else if (this._openContextEventListener) {
                    this.parentElement.removeEventListener("contextmenu", this._openContextEventListener);
                    this._openContextEventListener = undefined;
                }
            };
            PopupMenu.prototype._openContext = function (e) {
                if (!this.contextMenuOnly)
                    return true;
                if (e.which == 3 && (!this.shiftKey || e.shiftKey) && (!this.ctrlKey || e.ctrlKey)) {
                    var popup = this.$["popup"];
                    this.$["popup"].style.left = e.pageX + "px";
                    this.$["popup"].style.top = e.pageY + "px";
                    if (!popup.open)
                        popup.popup();
                    else
                        popup.close();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            };
            PopupMenu.prototype._alignmentChanged = function () {
                this.$["popup"].contentAlign = this.rightAlign ? "right" : "";
            };
            PopupMenu.prototype._mouseenter = function () {
                if (this.openOnHover)
                    this.popup();
            };
            PopupMenu.prototype._mousemove = function (e) {
                e.stopPropagation();
            };
            PopupMenu = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        disabled: {
                            type: Boolean,
                            reflectToAttribute: true
                        },
                        openOnHover: {
                            type: Boolean,
                            reflectToAttribute: true
                        },
                        contextMenuOnly: {
                            type: Boolean,
                            reflectToAttribute: true,
                            value: false
                        },
                        shiftKey: Boolean,
                        ctrlKey: Boolean,
                        rightAlign: {
                            type: Boolean,
                            reflectToAttribute: true,
                            observer: "_alignmentChanged"
                        }
                    },
                    observers: [
                        "_hookContextMenu(isAttached, contextMenuOnly)"
                    ],
                    listeners: {
                        "mouseenter": "_mouseenter",
                        "mousemove": "_mousemove"
                    }
                })
            ], PopupMenu);
            return PopupMenu;
        })(WebComponents.WebComponent);
        WebComponents.PopupMenu = PopupMenu;
        var PopupMenuItem = (function (_super) {
            __extends(PopupMenuItem, _super);
            function PopupMenuItem() {
                _super.apply(this, arguments);
            }
            PopupMenuItem.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this.split = Polymer.dom(this).children.length > 0;
            };
            PopupMenuItem.prototype._splitTap = function (e) {
                e.stopPropagation();
            };
            PopupMenuItem = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        label: String,
                        icon: String,
                        iconSpace: {
                            type: Boolean,
                            reflectToAttribute: true
                        },
                        split: {
                            type: Boolean,
                            reflectToAttribute: true
                        }
                    }
                })
            ], PopupMenuItem);
            return PopupMenuItem;
        })(WebComponents.WebComponent);
        WebComponents.PopupMenuItem = PopupMenuItem;
        var PopupMenuItemSeparator = (function (_super) {
            __extends(PopupMenuItemSeparator, _super);
            function PopupMenuItemSeparator() {
                _super.apply(this, arguments);
            }
            PopupMenuItemSeparator = __decorate([
                WebComponents.WebComponent.register()
            ], PopupMenuItemSeparator);
            return PopupMenuItemSeparator;
        })(WebComponents.WebComponent);
        WebComponents.PopupMenuItemSeparator = PopupMenuItemSeparator;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

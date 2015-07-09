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
        var PopupMenu = (function (_super) {
            __extends(PopupMenu, _super);
            function PopupMenu() {
                _super.apply(this, arguments);
            }
            PopupMenu.prototype._hookContextMenu = function (isAttached, contextMenu) {
                if (isAttached && contextMenu)
                    this.asElement.parentElement.addEventListener("contextmenu", this._openContextEventListener = this._openContext.bind(this));
                else if (this._openContextEventListener) {
                    this.asElement.parentElement.removeEventListener("contextmenu", this._openContextEventListener);
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
            return PopupMenu;
        })(WebComponents.WebComponent);
        WebComponents.PopupMenu = PopupMenu;
        var PopupMenuItem = (function (_super) {
            __extends(PopupMenuItem, _super);
            function PopupMenuItem() {
                _super.apply(this, arguments);
            }
            return PopupMenuItem;
        })(WebComponents.WebComponent);
        WebComponents.PopupMenuItem = PopupMenuItem;
        var PopupMenuItemSeparator = (function (_super) {
            __extends(PopupMenuItemSeparator, _super);
            function PopupMenuItemSeparator() {
                _super.apply(this, arguments);
            }
            return PopupMenuItemSeparator;
        })(WebComponents.WebComponent);
        WebComponents.PopupMenuItemSeparator = PopupMenuItemSeparator;
        WebComponents.WebComponent.register(PopupMenu, WebComponents, "vi", {
            properties: {
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
            ]
        });
        WebComponents.WebComponent.register(PopupMenuItem, WebComponents, "vi", {
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
        });
        WebComponents.WebComponent.register(PopupMenuItemSeparator, WebComponents, "vi");
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

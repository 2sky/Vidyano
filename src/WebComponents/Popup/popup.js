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
        var _documentClosePopupListener;
        var a = 0;
        document.addEventListener("mousedown", _documentClosePopupListener = function (e) {
            var el = e.target;
            var popup;
            while (true) {
                if (!el || el == document) {
                    WebComponents.Popup.closeAll();
                    break;
                }
                else if (el instanceof WebComponents.Popup && el.open)
                    break;
                else if (el.popup instanceof WebComponents.Popup && el.popup.open)
                    break;
                else
                    el = el.parentElement;
            }
        });
        document.addEventListener("touchstart", _documentClosePopupListener);
        var Popup = (function (_super) {
            __extends(Popup, _super);
            function Popup() {
                _super.apply(this, arguments);
            }
            Popup.prototype._setOpen = function (val) { };
            Popup.prototype.popup = function () {
                var _this = this;
                if (this.open)
                    return Promise.resolve();
                return new Promise(function (resolve) {
                    _this._resolver = resolve;
                    _this._open();
                });
            };
            Popup.prototype._hookTapAndHoverEvents = function () {
                this._header = Polymer.dom(this.root).querySelector("[toggle]") || this.asElement.parentElement;
                if (this._header == this.asElement.parentElement)
                    this._header.popup = this;
                if (this.isAttached) {
                    if (this.openOnHover) {
                        this._header.addEventListener("mouseenter", this._enterHandler = this._onOpen.bind(this));
                        this.asElement.addEventListener("mouseleave", this._leaveHandler = this.close.bind(this));
                    }
                    else
                        this._header.addEventListener("tap", this._tapHandler = this._tap.bind(this));
                }
                else {
                    if (this._enterHandler) {
                        this._header.removeEventListener("mouseenter", this._enterHandler);
                        this._enterHandler = undefined;
                    }
                    if (this._leaveHandler) {
                        this.asElement.removeEventListener("mouseleave", this._leaveHandler);
                        this._leaveHandler = undefined;
                    }
                    if (this._tapHandler) {
                        this._header.removeEventListener("tap", this._tapHandler);
                        this._tapHandler = undefined;
                    }
                }
            };
            Popup.prototype._tap = function (e) {
                if (this.disabled)
                    return;
                if (this.open) {
                    if (!this.sticky)
                        this.close();
                    return;
                }
                var el = e.target;
                do {
                    if (el == this._header) {
                        this._onOpen(e);
                        e.stopPropagation();
                        break;
                    }
                    el = el.parentElement;
                } while (el && el != this.asElement);
            };
            Popup.prototype._onOpen = function (e) {
                if (!this.open)
                    this._open(!this._findParentPopup() ? "vertical" : "horizontal");
                e.stopPropagation();
                e.preventDefault();
            };
            Popup.prototype._open = function (orientation) {
                if (orientation === void 0) { orientation = "vertical"; }
                if (this.open || this.asElement.hasAttribute("disabled"))
                    return;
                this._currentOrientation = orientation;
                if (this.fire("popup-opening", null, { bubbles: false, cancelable: true }).defaultPrevented)
                    return;
                // Close non-parent popups
                var parentPopup = this._findParentPopup();
                var firstOpenNonParentChild = Popup._openPopups[parentPopup == null ? 0 : Popup._openPopups.indexOf(parentPopup) + 1];
                if (firstOpenNonParentChild != null)
                    firstOpenNonParentChild.close();
                // Position content
                var root = this._header;
                var rootSizeTracker = this.$["toggleSizeTracker"];
                rootSizeTracker.measure();
                var content = this.$["content"];
                var rootRect = root.getBoundingClientRect();
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var contentWidth = content.offsetWidth;
                var contentHeight = content.offsetHeight;
                var alignments = (this.contentAlign || "").toUpperCase().split(" ");
                var alignCenter = alignments.indexOf("CENTER") >= 0;
                var alignRight = alignments.indexOf("RIGHT") >= 0;
                if (orientation == "vertical") {
                    if (alignRight ? (rootRect.right - contentWidth) < 0 : rootRect.left + contentWidth <= windowWidth) {
                        // Left-align
                        var left = rootRect.left;
                        if (alignments.indexOf("CENTER") >= 0)
                            left = Math.max(0, left - contentWidth / 2 + rootRect.width / 2);
                        content.style.left = left + "px";
                        content.style.right = "auto";
                        content.classList.add("left");
                        content.classList.remove("right");
                    }
                    else {
                        // Right-align
                        content.style.left = "auto";
                        content.style.right = Math.max(windowWidth - (rootRect.left + rootRect.width), 0) + "px";
                        content.classList.add("right");
                        content.classList.remove("left");
                    }
                    if (rootRect.top + rootRect.height + contentHeight < windowHeight) {
                        // Top-align
                        content.style.top = (rootRect.top + rootRect.height) + "px";
                        content.style.bottom = "auto";
                        content.classList.add("top");
                        content.classList.remove("bottom");
                    }
                    else {
                        // Bottom-align
                        content.style.top = "auto";
                        content.style.bottom = Math.max(windowHeight - rootRect.top, 0) + "px";
                        content.classList.add("bottom");
                        content.classList.remove("top");
                    }
                }
                else if (orientation == "horizontal") {
                    if (alignRight ? (rootRect.right - contentWidth) < 0 : rootRect.left + rootRect.width + contentWidth <= windowWidth) {
                        // Left-align
                        content.style.left = (rootRect.left + rootRect.width) + "px";
                        content.style.right = "auto";
                        content.classList.add("left");
                        content.classList.remove("right");
                    }
                    else {
                        // Right-align
                        content.style.left = "auto";
                        content.style.right = Math.max(windowWidth - rootRect.left, 0) + "px";
                        content.classList.add("right");
                        content.classList.remove("left");
                    }
                    if (rootRect.top + contentHeight < windowHeight) {
                        // Top-align
                        content.style.top = rootRect.top + "px";
                        content.style.bottom = "auto";
                        content.classList.add("top");
                        content.classList.remove("bottom");
                    }
                    else {
                        // Bottom-align
                        content.style.top = "auto";
                        content.style.bottom = Math.max(windowHeight - rootRect.top, 0) + "px";
                        content.classList.add("bottom");
                        content.classList.remove("top");
                    }
                }
                this._setOpen(true);
                Popup._openPopups.push(this);
                this.fire("popup-opened", null, { bubbles: false, cancelable: false });
            };
            Popup.prototype.close = function () {
                if (this.fire("popup-closing", null, { bubbles: false, cancelable: true }).defaultPrevented)
                    return;
                if (this._closeOnMoveoutTimer) {
                    clearTimeout(this._closeOnMoveoutTimer);
                    this._closeOnMoveoutTimer = undefined;
                }
                var openChild = Popup._openPopups[Popup._openPopups.indexOf(this) + 1];
                if (openChild != null)
                    openChild.close();
                this._setOpen(false);
                if (this._resolver)
                    this._resolver();
                Popup._openPopups.remove(this);
                this.fire("popup-closed", null, { bubbles: false, cancelable: false });
            };
            Popup.prototype._findParentPopup = function () {
                var self = this.asElement;
                var element = self.parentNode;
                while (element != null && Popup._openPopups.indexOf(element) == -1)
                    element = element.host || element.parentNode;
                return element;
            };
            Popup.prototype._toggleSizeChanged = function (e, detail) {
                if (!this.autoSizeContent) {
                    if (this._currentOrientation == "vertical")
                        this.$["content"].style.minWidth = detail.width + "px";
                    else
                        this.$["content"].style.minHeight = detail.height + "px";
                }
                else {
                    if (this._currentOrientation == "vertical")
                        this.$["content"].style.width = detail.width + "px";
                    else
                        this.$["content"].style.height = detail.height + "px";
                }
                e.stopPropagation();
            };
            Popup.prototype._catchContentClick = function (e) {
                if (this.sticky)
                    e.stopPropagation();
            };
            Popup.prototype._contentMouseEnter = function (e) {
                if (this._closeOnMoveoutTimer) {
                    var content = this.$["content"];
                    if (e.srcElement != content)
                        return;
                    clearTimeout(this._closeOnMoveoutTimer);
                    this._closeOnMoveoutTimer = undefined;
                }
            };
            Popup.prototype._contentMouseLeave = function (e) {
                var _this = this;
                var content = this.$["content"];
                if (e.srcElement != content)
                    return;
                if (!this.openOnHover && !this.sticky) {
                    this._closeOnMoveoutTimer = setTimeout(function () {
                        _this.close();
                    }, 300);
                }
            };
            Popup.prototype._contentMousemove = function (e) {
                if (this.open)
                    e.stopPropagation();
            };
            Popup.prototype._hasHeader = function (header) {
                return header != null && header.length > 0;
            };
            Popup.closeAll = function () {
                var rootPopup = Popup._openPopups[0];
                if (rootPopup)
                    rootPopup.close();
            };
            Popup._openPopups = [];
            return Popup;
        })(WebComponents.WebComponent);
        WebComponents.Popup = Popup;
        WebComponents.WebComponent.register(Popup, WebComponents, "vi", {
            properties: {
                disabled: {
                    type: Boolean,
                    reflectToAttribute: true
                },
                open: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                sticky: {
                    type: Boolean,
                    reflectToAttribute: true
                },
                autoSizeContent: {
                    type: Boolean,
                    reflectToAttribute: true
                },
                openOnHover: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false
                },
                header: String,
                contentAlign: {
                    type: String,
                    reflectToAttribute: true
                }
            },
            observers: [
                "_hookTapAndHoverEvents(isAttached, openOnHover)"
            ],
            listeners: {
                "tap": "_tap"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

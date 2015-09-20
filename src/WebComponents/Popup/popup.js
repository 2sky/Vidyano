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
        var _documentClosePopupListener;
        document.addEventListener("mousedown", _documentClosePopupListener = function (e) {
            var el = e.target;
            var popup;
            while (true) {
                if (!el || el == document) {
                    WebComponents.PopupCore.closeAll();
                    break;
                }
                else if (el.__Vidyano_WebComponents_PopupCore__Instance__ && el.open)
                    break;
                else if (el.popup && el.popup.__Vidyano_WebComponents_PopupCore__Instance__ && el.popup.open)
                    break;
                else
                    el = el.parentElement;
            }
        });
        document.addEventListener("touchstart", _documentClosePopupListener);
        var PopupCore = (function (_super) {
            __extends(PopupCore, _super);
            function PopupCore() {
                _super.apply(this, arguments);
                this.__Vidyano_WebComponents_PopupCore__Instance__ = true;
            }
            PopupCore.prototype.popup = function (target) {
                var _this = this;
                if (this.open)
                    return Promise.resolve();
                return new Promise(function (resolve) {
                    _this._resolver = resolve;
                    _this._open(target);
                });
            };
            PopupCore.prototype._open = function (target, content) {
                if (content === void 0) { content = this; }
                if (this.open || this.hasAttribute("disabled"))
                    return;
                this._currentOrientation = this.orientation.toUpperCase() === "AUTO" ? !this._findParentPopup() ? "vertical" : "horizontal" : this.orientation.toLowerCase();
                if (this.fire("popup-opening", null, { bubbles: false, cancelable: true }).defaultPrevented)
                    return;
                var parentPopup = this._findParentPopup();
                var firstOpenNonParentChild = Popup._openPopups[parentPopup == null ? 0 : Popup._openPopups.indexOf(parentPopup) + 1];
                if (firstOpenNonParentChild != null)
                    firstOpenNonParentChild.close();
                var _a = this._getTargetRect(target), targetRect = _a.targetRect, transformedRect = _a.transformedRect;
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var contentWidth = content.offsetWidth;
                var contentHeight = content.offsetHeight;
                var alignments = (this.contentAlign || "").toUpperCase().split(" ");
                var alignCenter = alignments.indexOf("CENTER") >= 0;
                var alignRight = alignments.indexOf("RIGHT") >= 0;
                if (this._currentOrientation == "vertical") {
                    if (alignRight ? (targetRect.right - contentWidth) < 0 : targetRect.left + (transformedRect ? transformedRect.left : 0) + contentWidth <= windowWidth) {
                        var left = targetRect.left;
                        if (alignments.indexOf("CENTER") >= 0)
                            left = Math.max(0, left - contentWidth / 2 + targetRect.width / 2);
                        content.style.left = left + "px";
                        content.style.right = "auto";
                        content.classList.add("left");
                        content.classList.remove("right");
                    }
                    else {
                        content.style.left = "auto";
                        content.style.right = Math.max((!transformedRect ? windowWidth : transformedRect.width) - (targetRect.left + targetRect.width), 0) + "px";
                        content.classList.add("right");
                        content.classList.remove("left");
                    }
                    if (targetRect.top + targetRect.height + contentHeight < windowHeight) {
                        content.style.top = (targetRect.top + targetRect.height) + "px";
                        content.style.bottom = "auto";
                        content.classList.add("top");
                        content.classList.remove("bottom");
                    }
                    else {
                        content.style.top = "auto";
                        content.style.bottom = Math.max(windowHeight - targetRect.top, 0) + "px";
                        content.classList.add("bottom");
                        content.classList.remove("top");
                    }
                }
                else if (this._currentOrientation == "horizontal") {
                    if (alignRight ? (targetRect.right - contentWidth) < 0 : targetRect.left + targetRect.width + contentWidth <= windowWidth) {
                        content.style.left = (targetRect.left + targetRect.width) + "px";
                        content.style.right = "auto";
                        content.classList.add("left");
                        content.classList.remove("right");
                    }
                    else {
                        content.style.left = "auto";
                        content.style.right = Math.max(windowWidth - targetRect.left, 0) + "px";
                        content.classList.add("right");
                        content.classList.remove("left");
                    }
                    if (targetRect.top + contentHeight < windowHeight) {
                        content.style.top = targetRect.top + "px";
                        content.style.bottom = "auto";
                        content.classList.add("top");
                        content.classList.remove("bottom");
                    }
                    else {
                        content.style.top = "auto";
                        content.style.bottom = Math.max(windowHeight - targetRect.top, 0) + "px";
                        content.classList.add("bottom");
                        content.classList.remove("top");
                    }
                }
                this._currentTarget = target;
                this._currentContent = content;
                this._setOpen(true);
                PopupCore._openPopups.push(this);
                this.fire("popup-opened", null, { bubbles: false, cancelable: false });
            };
            PopupCore.prototype._getTargetRect = function (target) {
                var targetRect = target.getBoundingClientRect();
                if (target === this) {
                    targetRect = {
                        left: targetRect.left,
                        top: targetRect.top,
                        bottom: targetRect.top,
                        right: targetRect.left,
                        width: 0,
                        height: 0
                    };
                }
                if (Popup._isBuggyGetBoundingClientRect === undefined) {
                    var outer = document.createElement("div");
                    outer.style.webkitTransform = outer.style.transform = "translate(-100px, -100px)";
                    var inner = document.createElement("div");
                    inner.style.position = "fixed";
                    outer.appendChild(inner);
                    document.body.appendChild(outer);
                    var outerRect = outer.getBoundingClientRect();
                    var innerRect = inner.getBoundingClientRect();
                    document.body.removeChild(outer);
                    Popup._isBuggyGetBoundingClientRect = outerRect.left === innerRect.left;
                }
                if (Popup._isBuggyGetBoundingClientRect) {
                    var parent = this.parentElement;
                    while (parent != null) {
                        var computedStyle = getComputedStyle(parent, null), transform = (computedStyle.transform || computedStyle.webkitTransform);
                        if (transform.startsWith("matrix")) {
                            var transformedParentRect = parent.getBoundingClientRect();
                            return {
                                targetRect: {
                                    top: targetRect.top - transformedParentRect.top,
                                    left: targetRect.left - transformedParentRect.left,
                                    right: targetRect.right - transformedParentRect.right,
                                    bottom: targetRect.bottom - transformedParentRect.bottom,
                                    width: targetRect.width,
                                    height: targetRect.height
                                },
                                transformedRect: transformedParentRect
                            };
                        }
                        parent = parent.parentElement;
                    }
                }
                return { targetRect: targetRect };
            };
            PopupCore.prototype.close = function () {
                if (this.fire("popup-closing", null, { bubbles: false, cancelable: true }).defaultPrevented)
                    return;
                if (!this.open && this._closeOnMoveoutTimer) {
                    clearTimeout(this._closeOnMoveoutTimer);
                    this._closeOnMoveoutTimer = undefined;
                }
                var openChild = Popup._openPopups[Popup._openPopups.indexOf(this) + 1];
                if (openChild != null)
                    openChild.close();
                this._currentTarget = this._currentContent = null;
                this._setOpen(false);
                if (this._resolver)
                    this._resolver();
                Popup._openPopups.remove(this);
                this.fire("popup-closed", null, { bubbles: false, cancelable: false });
            };
            PopupCore.prototype._findParentPopup = function () {
                var element = this.parentNode;
                while (element != null && Popup._openPopups.indexOf(element) == -1)
                    element = element.host || element.parentNode;
                return element;
            };
            PopupCore.prototype._catchContentClick = function (e) {
                if (this.sticky)
                    e.stopPropagation();
            };
            PopupCore.prototype._contentMouseEnter = function (e) {
                if (this._setHover)
                    this._setHover(true);
                if (this._closeOnMoveoutTimer) {
                    clearTimeout(this._closeOnMoveoutTimer);
                    this._closeOnMoveoutTimer = undefined;
                }
            };
            PopupCore.prototype._contentMouseLeave = function (e) {
                var _this = this;
                if (this._setHover)
                    this._setHover(false);
                if (!this.sticky) {
                    this._closeOnMoveoutTimer = setTimeout(function () {
                        _this.close();
                    }, 300);
                }
            };
            PopupCore.prototype._hoverChanged = function (hover) {
                this.toggleAttribute("hover", hover, this._currentTarget);
            };
            PopupCore.closeAll = function (parent) {
                var rootPopup = Popup._openPopups[0];
                if (rootPopup && (!parent || Popup._isDescendant(parent, rootPopup)))
                    rootPopup.close();
            };
            PopupCore._isDescendant = function (parent, child) {
                var node = child.parentNode;
                while (node != null) {
                    if (node == parent)
                        return true;
                    node = node.parentNode;
                }
                return false;
            };
            PopupCore._openPopups = [];
            PopupCore = __decorate([
                WebComponents.WebComponent.register({
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
                        contentAlign: {
                            type: String,
                            reflectToAttribute: true
                        },
                        orientation: {
                            type: String,
                            reflectToAttribute: true,
                            value: "auto"
                        },
                        hover: {
                            type: Boolean,
                            reflectToAttribute: true,
                            readOnly: true,
                            observer: "_hoverChanged"
                        }
                    },
                    listeners: {
                        "mouseenter": "_contentMouseEnter",
                        "mouseleave": "_contentMouseLeave",
                        "click": "_catchContentClick"
                    }
                })
            ], PopupCore);
            return PopupCore;
        })(WebComponents.WebComponent);
        WebComponents.PopupCore = PopupCore;
        var Popup = (function (_super) {
            __extends(Popup, _super);
            function Popup() {
                _super.apply(this, arguments);
            }
            Popup.prototype.popup = function () {
                return _super.prototype.popup.call(this, this._header);
            };
            Popup.prototype._open = function (target) {
                _super.prototype._open.call(this, target, this.$["content"]);
                var rootSizeTracker = this.$["toggleSizeTracker"];
                rootSizeTracker.measure();
            };
            Popup.prototype._hookTapAndHoverEvents = function () {
                this._header = Polymer.dom(this.root).querySelector("[toggle]") || this.parentElement;
                if (this._header == this.parentElement)
                    this._header.popup = this;
                if (this.isAttached) {
                    if (this.openOnHover) {
                        this._header.addEventListener("mouseenter", this._enterHandler = this._onOpen.bind(this));
                        this.addEventListener("mouseleave", this._leaveHandler = this.close.bind(this));
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
                        this.removeEventListener("mouseleave", this._leaveHandler);
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
                } while (el && el != this);
            };
            Popup.prototype._onOpen = function (e) {
                if (!this.open)
                    this._open(this._header);
                e.stopPropagation();
                e.preventDefault();
            };
            Popup.prototype._contentMouseLeave = function (e) {
                if (this.openOnHover)
                    return;
                _super.prototype._contentMouseLeave.call(this, e);
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
            Popup = __decorate([
                WebComponents.WebComponent.register({
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
                        contentAlign: {
                            type: String,
                            reflectToAttribute: true
                        },
                        orientation: {
                            type: String,
                            reflectToAttribute: true,
                            value: "auto"
                        }
                    },
                    observers: [
                        "_hookTapAndHoverEvents(isAttached, openOnHover)"
                    ],
                    listeners: {
                        "tap": "_tap"
                    }
                })
            ], Popup);
            return Popup;
        })(PopupCore);
        WebComponents.Popup = Popup;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

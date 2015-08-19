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
        var Scroller = (function (_super) {
            __extends(Scroller, _super);
            function Scroller() {
                _super.apply(this, arguments);
            }
            Scroller.prototype.scrollToTop = function () {
                this.$["wrapper"].scrollTop = 0;
            };
            Scroller.prototype.scrollToBottom = function () {
                this.$["wrapper"].scrollTop = this.innerHeight;
            };
            Scroller.prototype._outerSizeChanged = function (e, detail) {
                if (!this._scrollbarWidth) {
                    var wrapper = this.$["wrapper"];
                    wrapper.style.marginRight = -(this._scrollbarWidth = WebComponents.scrollbarWidth() || 20) + "px";
                    wrapper.style.marginBottom = -this._scrollbarWidth + "px";
                }
                this._setOuterWidth(detail.width);
                this._setOuterHeight(detail.height);
                this._updateScrollOffsets();
                e.stopPropagation();
            };
            Scroller.prototype._innerSizeChanged = function (e, detail) {
                this._setInnerWidth(detail.width);
                this._setInnerHeight(detail.height);
                this._updateScrollOffsets();
                e.stopPropagation();
            };
            Scroller.prototype._updateVerticalScrollbar = function (outerHeight, innerHeight, verticalScrollOffset, noVertical) {
                var height = outerHeight < innerHeight ? outerHeight / innerHeight * outerHeight : 0;
                if (height !== this._verticalScrollHeight) {
                    if (height > 0 && height < Scroller._minBarSize)
                        height = Scroller._minBarSize;
                    else
                        height = Math.floor(height);
                    if (height !== this._verticalScrollHeight) {
                        this._verticalScrollHeight = height;
                        this._verticalScrollSpace = outerHeight - height;
                        this.$["vertical"].style.height = height + "px";
                    }
                }
                this._setVertical(!noVertical && height > 0);
                var verticalScrollTop = verticalScrollOffset === 0 ? 0 : Math.round((1 / ((innerHeight - outerHeight) / verticalScrollOffset)) * this._verticalScrollSpace);
                if (verticalScrollTop !== this._verticalScrollTop) {
                    this._verticalScrollTop = verticalScrollTop;
                    this.$["vertical"].style.top = verticalScrollTop + "px";
                }
                this._setScrollTopShadow(verticalScrollTop > 0);
                this._setScrollBottomShadow(innerHeight - outerHeight - this.$["wrapper"].scrollTop > 0);
            };
            Scroller.prototype._updateHorizontalScrollbar = function (outerWidth, innerWidth, horizontalScrollOffset, noHorizontal) {
                var width = outerWidth < innerWidth ? outerWidth / innerWidth * outerWidth : 0;
                if (width !== this._horizontalScrollWidth) {
                    if (width > 0 && width < Scroller._minBarSize)
                        width = Scroller._minBarSize;
                    else
                        width = Math.floor(width);
                    if (width !== this._horizontalScrollWidth) {
                        this._horizontalScrollWidth = width;
                        this._horizontalScrollSpace = outerWidth - width;
                        this.$["horizontal"].style.width = width + "px";
                    }
                }
                this._setHorizontal(!noHorizontal && width > 0);
                var horizontalScrollLeft = horizontalScrollOffset === 0 ? 0 : Math.round((1 / ((innerWidth - outerWidth) / horizontalScrollOffset)) * this._horizontalScrollSpace);
                if (horizontalScrollLeft !== this._horizontalScrollLeft) {
                    this._horizontalScrollLeft = horizontalScrollLeft;
                    this.$["horizontal"].style.left = horizontalScrollLeft + "px";
                }
            };
            Scroller.prototype._trackVertical = function (e, detail) {
                var wrapper = this.$["wrapper"];
                if (detail.state == "start") {
                    this._setScrolling(true);
                    this._trackStart = this._verticalScrollTop;
                }
                else if (detail.state == "track") {
                    var newVerticalScrollTop = this._trackStart + detail.dy;
                    wrapper.scrollTop = newVerticalScrollTop === 0 ? 0 : (this.innerHeight - this.outerHeight) * ((1 / this._verticalScrollSpace) * newVerticalScrollTop);
                }
                else if (detail.state == "end") {
                    this._setScrolling(false);
                    this._trackStart = undefined;
                }
                e.preventDefault();
                e.detail.sourceEvent.preventDefault();
            };
            Scroller.prototype._trackHorizontal = function (e, detail) {
                var wrapper = this.$["wrapper"];
                if (detail.state == "start") {
                    this._setScrolling(true);
                    this._trackStart = this._horizontalScrollLeft;
                }
                else if (detail.state == "track") {
                    var newHorizontalScrollLeft = this._trackStart + detail.dx;
                    wrapper.scrollLeft = newHorizontalScrollLeft === 0 ? 0 : (this.innerWidth - this.outerWidth) * ((1 / this._horizontalScrollSpace) * newHorizontalScrollLeft);
                }
                else if (detail.state == "end") {
                    this._setScrolling(false);
                    this._trackStart = undefined;
                }
                e.preventDefault();
                e.detail.sourceEvent.preventDefault();
            };
            Scroller.prototype._trapEvent = function (e) {
                e.preventDefault();
            };
            Scroller.prototype._scroll = function (e) {
                WebComponents.Popup.closeAll(this);
                this._updateScrollOffsets();
            };
            Scroller.prototype._updateScrollOffsets = function () {
                var wrapper = this.$["wrapper"];
                if (this.vertical)
                    this.verticalScrollOffset = wrapper.scrollTop;
                if (this.horizontal)
                    this.horizontalScrollOffset = wrapper.scrollLeft;
            };
            Scroller.prototype._verticalScrollOffsetChanged = function (newVerticalScrollOffset) {
                var wrapper = this.$["wrapper"];
                if (!this.vertical || wrapper.scrollTop === newVerticalScrollOffset)
                    return;
                wrapper.scrollTop = newVerticalScrollOffset;
            };
            Scroller.prototype._horizontalScrollOffsetChanged = function (newHorizontalScrollOffset) {
                var wrapper = this.$["wrapper"];
                if (!this.vertical || wrapper.scrollLeft === newHorizontalScrollOffset)
                    return;
                wrapper.scrollLeft = newHorizontalScrollOffset;
            };
            Scroller.prototype._mouseenter = function () {
                this._setHovering(true);
            };
            Scroller.prototype._mouseleave = function () {
                this._setHovering(false);
            };
            Scroller.prototype._verticalScrollbarParentTap = function (e) {
                var event = e.detail.sourceEvent;
                if (event.offsetY) {
                    if (event.offsetY > this._verticalScrollTop + this._verticalScrollHeight)
                        this.$["wrapper"].scrollTop += this.$["wrapper"].scrollHeight * 0.1;
                    else if (event.offsetY < this._verticalScrollTop)
                        this.$["wrapper"].scrollTop -= this.$["wrapper"].scrollHeight * 0.1;
                    e.stopPropagation();
                }
            };
            Scroller.prototype._horizontalScrollbarParentTap = function (e) {
                var event = e.detail.sourceEvent;
                if (event.offsetX) {
                    if (event.offsetX > this._horizontalScrollLeft + this._horizontalScrollLeft)
                        this.$["wrapper"].scrollLeft += this.$["wrapper"].scrollWidth * 0.1;
                    else if (event.offsetX < this._horizontalScrollLeft)
                        this.$["wrapper"].scrollLeft -= this.$["wrapper"].scrollWidth * 0.1;
                    e.stopPropagation();
                }
            };
            Scroller._minBarSize = 20;
            return Scroller;
        })(WebComponents.WebComponent);
        WebComponents.Scroller = Scroller;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Scroller, Vidyano.WebComponents, "vi", {
            properties: {
                hovering: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                scrolling: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                outerWidth: {
                    type: Number,
                    readOnly: true
                },
                outerHeight: {
                    type: Number,
                    readOnly: true
                },
                innerWidth: {
                    type: Number,
                    readOnly: true
                },
                innerHeight: {
                    type: Number,
                    readOnly: true
                },
                horizontal: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                noHorizontal: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false
                },
                vertical: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                noVertical: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false
                },
                scrollbars: {
                    type: String,
                    reflectToAttribute: true
                },
                verticalScrollOffset: {
                    type: Number,
                    value: 0,
                    notify: true,
                    observer: "_verticalScrollOffsetChanged"
                },
                horizontalScrollOffset: {
                    type: Number,
                    value: 0,
                    notify: true,
                    observer: "_horizontalScrollOffsetChanged"
                },
                scrollTopShadow: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true,
                },
                scrollBottomShadow: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                forceScrollbars: {
                    type: Boolean,
                    reflectToAttribute: true
                }
            },
            forwardObservers: [
                "attribute.objects"
            ],
            observers: [
                "_updateVerticalScrollbar(outerHeight, innerHeight, verticalScrollOffset, noVertical)",
                "_updateHorizontalScrollbar(outerWidth, innerWidth, horizontalScrollOffset, noHorizontal)"
            ],
            listeners: {
                "mouseenter": "_mouseenter",
                "mouseleave": "_mouseleave",
                "scroll": "_trapEvent"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

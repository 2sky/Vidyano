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
            Scroller.prototype._outerSizeChanged = function (e, detail) {
                var wrapper = this.$["wrapper"];
                if (!this._scrollbarWidth)
                    wrapper.style.marginRight = -(this._scrollbarWidth = WebComponents.scrollbarWidth() || 20) + "px";
                wrapper.style.width = (detail.width + this._scrollbarWidth) + "px";
                wrapper.style.height = (detail.height + this._scrollbarWidth) + "px";
                this._setOuterWidth(detail.width);
                this._setOuterHeight(detail.height);
                e.stopPropagation();
            };
            Scroller.prototype._innerSizeChanged = function (e, detail) {
                this._setInnerWidth(detail.width);
                this._setInnerHeight(detail.height);
                e.stopPropagation();
            };
            Scroller.prototype._updateVerticalScrollHeight = function (outerHeight, innerHeight) {
                var visibleRatio = innerHeight > outerHeight ? outerHeight / innerHeight : 0;
                var newHeight = Math.floor(visibleRatio * outerHeight);
                if (newHeight !== this._verticalScrollbarHeight) {
                    this._verticalScrollbarHeight = newHeight;
                    this.$["vertical"].style.height = Math.max(newHeight, newHeight > 0 ? 20 : 0) + "px";
                    this._setVertical(newHeight > 0);
                }
            };
            Scroller.prototype._updateHorizontalScrollWidth = function (outerWidth, innerWidth) {
                var visibleRatio = innerWidth > outerWidth ? outerWidth / innerWidth : 0;
                var newWidth = Math.floor(visibleRatio * outerWidth);
                if (newWidth !== this._horizontalScrollbarWidth) {
                    this._horizontalScrollbarWidth = newWidth;
                    this.$["horizontal"].style.width = Math.max(newWidth, newWidth > 0 ? 20 : 0) + "px";
                    this._setHorizontal(newWidth > 0);
                }
            };
            Scroller.prototype._trackVertical = function (e, detail) {
                var wrapper = this.$["wrapper"];
                if (detail.state == "start")
                    this._setScrolling(true);
                else if (detail.state == "track")
                    wrapper.scrollTop += ((outerHeight - this._verticalScrollbarHeight) / this._verticalScrollbarHeight) * detail.ddy;
                else if (detail.state == "end")
                    this._setScrolling(false);
            };
            Scroller.prototype._trackHorizontal = function (e, detail) {
                var wrapper = this.$["wrapper"];
                if (detail.state == "start")
                    this._setScrolling(true);
                else if (detail.state == "track")
                    wrapper.scrollLeft += ((outerWidth - this._horizontalScrollbarWidth) / this._horizontalScrollbarWidth) * detail.ddx;
                else if (detail.state == "end")
                    this._setScrolling(false);
            };
            Scroller.prototype._scroll = function (e) {
                this.$["vertical"].style.top = ((this.$["wrapper"].scrollTop / (this.outerHeight + (this._verticalScrollbarHeight < 20 ? 20 - this._verticalScrollbarHeight : 0))) * this._verticalScrollbarHeight) + "px";
                this.$["horizontal"].style.left = ((this.$["wrapper"].scrollLeft / this.outerWidth + (this._horizontalScrollbarWidth < 20 ? 20 : 0)) * this._horizontalScrollbarWidth) + "px";
            };
            Scroller.prototype._mouseenter = function () {
                this._setHovering(true);
            };
            Scroller.prototype._mouseleave = function () {
                this._setHovering(false);
            };
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
                vertical: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                }
            },
            observers: [
                "_updateVerticalScrollHeight(outerHeight, innerHeight)",
                "_updateHorizontalScrollWidth(outerWidth, innerWidth)"
            ],
            listeners: {
                "mouseenter": "_mouseenter",
                "mouseleave": "_mouseleave"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

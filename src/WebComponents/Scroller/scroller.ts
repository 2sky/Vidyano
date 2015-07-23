module Vidyano.WebComponents {
    export class Scroller extends WebComponent {
        private _setHovering: (hovering: boolean) => void;
        private _setScrolling: (scrolling: boolean) => void;
        private _scrollbarWidth: number;
        private _verticalScrollbarHeight: number;
        private _horizontalScrollbarWidth: number;
        outerWidth: number;
        outerHeight: number;
        innerWidth: number;
        innerHeight: number;

        private _setOuterWidth: (width: number) => void;
        private _setOuterHeight: (height: number) => void;
        private _setInnerWidth: (width: number) => void;
        private _setInnerHeight: (height: number) => void;
        private _setHorizontal: (val: boolean) => void;
        private _setVertical: (val: boolean) => void;

        private _outerSizeChanged(e: Event, detail: { width: number; height: number }) {
            var wrapper = this.$["wrapper"];

            if (!this._scrollbarWidth)
                wrapper.style.marginRight = -(this._scrollbarWidth = scrollbarWidth() || 20) + "px";

            wrapper.style.width = (detail.width + this._scrollbarWidth) + "px";
            wrapper.style.height = (detail.height + this._scrollbarWidth) + "px";

            this._setOuterWidth(detail.width);
            this._setOuterHeight(detail.height);

            e.stopPropagation();
        }

        private _innerSizeChanged(e: Event, detail: { width: number; height: number }) {
            this._setInnerWidth(detail.width);
            this._setInnerHeight(detail.height);

            e.stopPropagation();
        }

        private _updateVerticalScrollHeight(outerHeight: number, innerHeight: number) {
            var visibleRatio = innerHeight > outerHeight ? outerHeight / innerHeight : 0;
            var newHeight = Math.floor(visibleRatio * outerHeight);
            if (newHeight !== this._verticalScrollbarHeight) {
                this._verticalScrollbarHeight = newHeight;
                this.$["vertical"].style.height = Math.max(newHeight, newHeight > 0 ? 20 : 0) + "px";
                this._setVertical(newHeight > 0);
            }
        }

        private _updateHorizontalScrollWidth(outerWidth: number, innerWidth: number) {
            var visibleRatio = innerWidth > outerWidth ? outerWidth / innerWidth : 0;
            var newWidth = Math.floor(visibleRatio * outerWidth);
            if (newWidth !== this._horizontalScrollbarWidth) {
                this._horizontalScrollbarWidth = newWidth;
                this.$["horizontal"].style.width = Math.max(newWidth, newWidth > 0 ? 20 : 0) + "px";
                this._setHorizontal(newWidth > 0);
            }
        }

        private _trackVertical(e: CustomEvent, detail: PolymerTrackDetail) {
            var wrapper = this.$["wrapper"];

            if (detail.state == "start")
                this._setScrolling(true);
            else if (detail.state == "track")
                wrapper.scrollTop += ((outerHeight - this._verticalScrollbarHeight) / this._verticalScrollbarHeight) * detail.ddy;
            else if (detail.state == "end")
                this._setScrolling(false);
        }

        private _trackHorizontal(e: CustomEvent, detail: PolymerTrackDetail) {
            var wrapper = this.$["wrapper"];

            if (detail.state == "start")
                this._setScrolling(true);
            else if (detail.state == "track")
                wrapper.scrollLeft += ((outerWidth - this._horizontalScrollbarWidth) / this._horizontalScrollbarWidth) * detail.ddx;
            else if (detail.state == "end")
                this._setScrolling(false);
        }

        private _scroll(e: Event) {
            this.$["vertical"].style.top = ((this.$["wrapper"].scrollTop / (this.outerHeight + (this._verticalScrollbarHeight < 20 ? 20 - this._verticalScrollbarHeight : 0))) * this._verticalScrollbarHeight) + "px";
            this.$["horizontal"].style.left = ((this.$["wrapper"].scrollLeft / this.outerWidth + (this._horizontalScrollbarWidth < 20 ? 20 : 0)) * this._horizontalScrollbarWidth) + "px";
        }

        private _mouseenter() {
            this._setHovering(true);
        }

        private _mouseleave() {
            this._setHovering(false);
        }
    }

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
}
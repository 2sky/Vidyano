module Vidyano.WebComponents {
    export class Scroller extends WebComponent {
        private static _minBarSize: number = 20;
        private _setHovering: (hovering: boolean) => void;
        private _setScrolling: (scrolling: boolean) => void;
        private _scrollbarWidth: number;
        private _verticalScrollHeight: number;
        private _verticalScrollTop: number;
        private _verticalScrollSpace: number;
        private _horizontalScrollWidth: number;
        private _horizontalScrollLeft: number;
        private _horizontalScrollSpace: number;
        private _trackStart: number;
        outerWidth: number;
        outerHeight: number;
        innerWidth: number;
        innerHeight: number;
        horizontal: boolean;
        vertical: boolean;
        scrollbars: string;

        private _setOuterWidth: (width: number) => void;
        private _setOuterHeight: (height: number) => void;
        private _setInnerWidth: (width: number) => void;
        private _setInnerHeight: (height: number) => void;
        private _setHorizontal: (val: boolean) => void;
        private _setVertical: (val: boolean) => void;
        private _setHorizontalScrollLeft: (val: number) => void;
        private _setVerticalScrollTop: (val: number) => void;
        private _setScrollTopShadow: (val: boolean) => void;
        private _setScrollBottomShadow: (val: boolean) => void;

        scrollToTop() {
            this.$["wrapper"].scrollTop = 0;
        }

        scrollToBottom() {
            this.$["wrapper"].scrollTop = this.innerHeight;
        }

        private _outerSizeChanged(e: Event, detail: { width: number; height: number }) {
            if (!this._scrollbarWidth) {
                var wrapper = this.$["wrapper"];

                wrapper.style.marginRight = -(this._scrollbarWidth = scrollbarWidth() || 20) + "px";
                wrapper.style.marginBottom = -this._scrollbarWidth + "px";
            }

            this._setOuterWidth(detail.width);
            this._setOuterHeight(detail.height);

            this._updateScrollOffsets();

            e.stopPropagation();
        }

        private _innerSizeChanged(e: Event, detail: { width: number; height: number }) {
            this._setInnerWidth(detail.width);
            this._setInnerHeight(detail.height);

            this._updateScrollOffsets();

            e.stopPropagation();
        }

        private _updateVerticalScrollbar(outerHeight: number, innerHeight: number, verticalScrollTop: number) {
            var height = outerHeight < innerHeight ? outerHeight / innerHeight * outerHeight : 0;
            if (height !== this._verticalScrollHeight) {
                if (height > 0 && height < Scroller._minBarSize)
                    height = Scroller._minBarSize;
                else
                    height = Math.floor(height);

                if (height !== this._verticalScrollHeight) {
                    this._verticalScrollHeight = height;
                    this._verticalScrollSpace = this.outerHeight - height;
                    this.$["vertical"].style.height = `${height}px`;

                    this._setVertical(height > 0);
                }
            }

            if (verticalScrollTop !== this._verticalScrollTop) {
                this._verticalScrollTop = verticalScrollTop;
                this.$["vertical"].style.top = `${verticalScrollTop}px`;
            }

            this._setScrollTopShadow(verticalScrollTop > 0);
            this._setScrollBottomShadow(innerHeight - outerHeight - this.$["wrapper"].scrollTop > 0);
        }

        private _updateHorizontalScrollbar(outerWidth: number, innerWidth: number, horizontalScrollLeft: number) {
            var width = outerWidth < innerWidth ? outerWidth / innerWidth * outerWidth : 0;
            if (width !== this._horizontalScrollWidth) {
                if (width > 0 && width < Scroller._minBarSize)
                    width = Scroller._minBarSize;
                else
                    width = Math.floor(width);

                if (width !== this._horizontalScrollWidth) {
                    this._horizontalScrollWidth = width;
                    this._horizontalScrollSpace = this.outerWidth - width;
                    this.$["horizontal"].style.width = `${width}px`;

                    this._setHorizontal(width > 0);
                }
            }

            if (horizontalScrollLeft !== this._horizontalScrollLeft) {
                this._horizontalScrollLeft = horizontalScrollLeft;
                this.$["horizontal"].style.left = `${horizontalScrollLeft}px`;
            }
        }

        private _trackVertical(e: CustomEvent, detail: PolymerTrackDetail) {
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
        }

        private _trackHorizontal(e: CustomEvent, detail: PolymerTrackDetail) {
            var wrapper = this.$["wrapper"];

            if (detail.state == "start") {
                this._setScrolling(true);
                this._trackStart = this._horizontalScrollLeft;
            }
            else if (detail.state == "track") {
                var newHorizontalScrollTop = this._trackStart + detail.dy;
                wrapper.scrollTop = newHorizontalScrollTop === 0 ? 0 : (this.innerWidth - this.outerWidth) * ((1 / this._horizontalScrollSpace) * newHorizontalScrollTop);
            }
            else if (detail.state == "end") {
                this._setScrolling(false);
                this._trackStart = undefined;
            }

            e.preventDefault();
            e.detail.sourceEvent.preventDefault();
        }

        private _trapEvent(e: Event) {
            e.preventDefault();
        }

        private _scroll(e: Event) {
            Popup.closeAll();

            this._updateScrollOffsets();
        }

        private _updateScrollOffsets() {
            var wrapper = this.$["wrapper"];
            if (this.vertical)
                this._setVerticalScrollTop(wrapper.scrollTop === 0 ? 0 : Math.round((1 / ((this.innerHeight - this.outerHeight) / wrapper.scrollTop)) * this._verticalScrollSpace));

            if (this.horizontal)
                this._setHorizontalScrollLeft(wrapper.scrollLeft === 0 ? 0 : Math.round((1 / ((this.innerWidth - this.outerWidth) / wrapper.scrollLeft)) * this._horizontalScrollSpace));
        }

        private _mouseenter() {
            this._setHovering(true);
        }

        private _mouseleave() {
            this._setHovering(false);
        }

        private _verticalScrollbarParentTap(e: TapEvent) {
            var event = <MouseEvent>e.detail.sourceEvent;
            if (event.offsetY) {
                if (event.offsetY > this._verticalScrollTop + this._verticalScrollHeight)
                    this.$["wrapper"].scrollTop += this.$["wrapper"].scrollHeight * 0.1;
                else if (event.offsetY < this._verticalScrollTop)
                    this.$["wrapper"].scrollTop -= this.$["wrapper"].scrollHeight * 0.1;

                e.stopPropagation();
            }
        }

        private _horizontalScrollbarParentTap(e: TapEvent) {
            var event = <MouseEvent>e.detail.sourceEvent;
            if (event.offsetX) {
                if (event.offsetX > this._horizontalScrollLeft + this._horizontalScrollLeft)
                    this.$["wrapper"].scrollLeft += this.$["wrapper"].scrollWidth * 0.1;
                else if (event.offsetX < this._horizontalScrollLeft)
                    this.$["wrapper"].scrollLeft -= this.$["wrapper"].scrollWidth * 0.1;

                e.stopPropagation();
            }
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
            },
            scrollbars: {
                type: String,
                reflectToAttribute: true
            },
            verticalScrollTop: {
                type: Number,
                readOnly: true,
                value: 0
            },
            horizontalScrollLeft: {
                type: Number,
                readOnly: true,
                value: 0
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
            }
        },
        forwardObservers: [
            "attribute.objects"
        ],
        observers: [
            "_updateVerticalScrollbar(outerHeight, innerHeight, verticalScrollTop)",
            "_updateHorizontalScrollbar(outerWidth, innerWidth, horizontalScrollTop)"
        ],
        listeners: {
            "mouseenter": "_mouseenter",
            "mouseleave": "_mouseleave",
            "scroll": "_trapEvent"
        }
    });
}
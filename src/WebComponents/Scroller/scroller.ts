namespace Vidyano.WebComponents {
    "use strict";

    interface IZenscroll {
        toY(y: number);
    }

    class Zenscroll {
        createScroller: (el: HTMLElement, duration: number, edgeOffset: number) => IZenscroll;
    }

    declare var zenscroll: Zenscroll;

    @WebComponent.register({
        properties: {
            hovering: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            scrolling: {
                type: String,
                readOnly: true,
                reflectToAttribute: true
            },
            atTop: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: true
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
            alignVerticalScrollbar: {
                type: String,
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
            noScrollShadow: {
                type: Boolean,
                reflectToAttribute: true
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
            },
            hiddenScrollbars: {
                type: Boolean,
                readOnly: true,
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
    })
    export class Scroller extends WebComponent {
        private static _minBarSize: number = 20;
        private _setHovering: (hovering: boolean) => void;
        private _setScrolling: (scrolling: string) => void;
        private _verticalScrollHeight: number;
        private _verticalScrollTop: number;
        private _verticalScrollSpace: number;
        private _horizontalScrollWidth: number;
        private _horizontalScrollLeft: number;
        private _horizontalScrollSpace: number;
        private _trackStart: number;
        private _zenscroll: IZenscroll;
        outerWidth: number;
        outerHeight: number;
        innerWidth: number;
        innerHeight: number;
        horizontal: boolean;
        noHorizontal: boolean;
        vertical: boolean;
        noVertical: boolean;
        horizontalScrollOffset: number;
        verticalScrollOffset: number;
        forceScrollbars: boolean;
        noScrollShadow: boolean;

        private _setAtTop: (atTop: boolean) => void;
        private _setOuterWidth: (width: number) => void;
        private _setOuterHeight: (height: number) => void;
        private _setInnerWidth: (width: number) => void;
        private _setInnerHeight: (height: number) => void;
        private _setHorizontal: (val: boolean) => void;
        private _setVertical: (val: boolean) => void;
        private _setScrollTopShadow: (val: boolean) => void;
        private _setScrollBottomShadow: (val: boolean) => void;
        private _setHiddenScrollbars: (val: boolean) => void;

        get scroller(): HTMLElement {
            // NOTE: This property is used by other components to determine the scrolling parent.
            return this.$["wrapper"];
        }

        private _initializeZenscroll(): Promise<any> {
            if (!this._zenscroll) {
                return new Promise(resolve => this.importHref(this.resolveUrl("zenscroller.html"), () => {
                    this._zenscroll = zenscroll.createScroller(this.$["wrapper"], 500, 0);
                    resolve(true);
                }));
            }

            return Promise.resolve(true);
        }

        scrollToTop(animated?: boolean) {
            if (animated) {
                this._initializeZenscroll().then(() => {
                    this._zenscroll.toY(0);
                });
            }
            else
                this.$["wrapper"].scrollTop = 0;
        }

        scrollToBottom(animated?: boolean) {
            if (animated) {
                this._initializeZenscroll().then(() => {
                    this._zenscroll.toY(this.innerHeight);
                });
            }
            else
                this.$["wrapper"].scrollTop = this.innerHeight;
        }

        private _outerSizeChanged(e: Event, detail: { width: number; height: number }) {
            this._setHiddenScrollbars(!parseInt(this.getComputedStyleValue("--theme-scrollbar-width")));

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

        private _updateVerticalScrollbar(outerHeight: number, innerHeight: number, verticalScrollOffset: number, noVertical: boolean) {
            let height = outerHeight < innerHeight ? outerHeight / innerHeight * outerHeight : 0;
            if (height !== this._verticalScrollHeight) {
                if (height > 0 && height < Scroller._minBarSize)
                    height = Scroller._minBarSize;
                else
                    height = Math.floor(height);

                this._verticalScrollSpace = outerHeight - height;

                if (height !== this._verticalScrollHeight) {
                    this._verticalScrollHeight = height;
                    this.$["vertical"].style.height = `${height}px`;
                }
            }

            this._setVertical(!noVertical && height > 0);

            const verticalScrollTop = verticalScrollOffset === 0 ? 0 : Math.round((1 / ((innerHeight - outerHeight) / verticalScrollOffset)) * this._verticalScrollSpace);
            if (verticalScrollTop !== this._verticalScrollTop)
                this.$["vertical"].style.transform = `translate3d(0, ${this._verticalScrollTop = verticalScrollTop}px, 0)`;

            this._setScrollTopShadow(!this.noScrollShadow && verticalScrollTop > 0);
            this._setScrollBottomShadow(!this.noScrollShadow && innerHeight - verticalScrollOffset - outerHeight > 0);
        }

        private _updateHorizontalScrollbar(outerWidth: number, innerWidth: number, horizontalScrollOffset: number, noHorizontal: boolean) {
            let width = outerWidth < innerWidth ? outerWidth / innerWidth * outerWidth : 0;
            if (width !== this._horizontalScrollWidth) {
                if (width > 0 && width < Scroller._minBarSize)
                    width = Scroller._minBarSize;
                else
                    width = Math.floor(width);

                this._horizontalScrollSpace = outerWidth - width;

                if (width !== this._horizontalScrollWidth) {
                    this._horizontalScrollWidth = width;
                    this.$["horizontal"].style.width = `${width}px`;
                }
            }

            this._setHorizontal(!noHorizontal && width > 0);

            const horizontalScrollLeft = horizontalScrollOffset === 0 ? 0 : Math.round((1 / ((innerWidth - outerWidth) / horizontalScrollOffset)) * this._horizontalScrollSpace);
            if (horizontalScrollLeft !== this._horizontalScrollLeft)
                this.$["horizontal"].style.transform = `translate3d(${this._horizontalScrollLeft = horizontalScrollLeft}px, 0, 0)`;
        }

        private _trackVertical(e: PolymerTrackEvent, detail: PolymerTrackDetail) {
            const wrapper = this.$["wrapper"];

            if (detail.state === "start") {
                this.app.isTracking = true;
                this._setScrolling("vertical");
                this._trackStart = this._verticalScrollTop;
            }
            else if (detail.state === "track") {
                const newVerticalScrollTop = this._trackStart + detail.dy;
                wrapper.scrollTop = newVerticalScrollTop === 0 ? 0 : (this.innerHeight - this.outerHeight) * ((1 / this._verticalScrollSpace) * newVerticalScrollTop);
            }
            else if (detail.state === "end") {
                this._setScrolling(null);
                this._trackStart = undefined;
                this.app.isTracking = false;
            }

            e.preventDefault();

            if (e.detail.sourceEvent)
                e.detail.sourceEvent.preventDefault();
        }

        private _trackHorizontal(e: CustomEvent, detail: PolymerTrackDetail) {
            const wrapper = this.$["wrapper"];

            if (detail.state === "start") {
                this.app.isTracking = true;
                this._setScrolling("horizontal");
                this._trackStart = this._horizontalScrollLeft;
            }
            else if (detail.state === "track") {
                const newHorizontalScrollLeft = this._trackStart + detail.dx;
                wrapper.scrollLeft = newHorizontalScrollLeft === 0 ? 0 : (this.innerWidth - this.outerWidth) * ((1 / this._horizontalScrollSpace) * newHorizontalScrollLeft);
            }
            else if (detail.state === "end") {
                this._setScrolling(null);
                this._trackStart = undefined;
                this.app.isTracking = false;
            }

            e.preventDefault();

            if (e.detail.sourceEvent)
                e.detail.sourceEvent.preventDefault();
        }

        private _trapEvent(e: Event) {
            this.scrollTop = this.scrollLeft = 0;

            e.preventDefault();
            e.stopPropagation();
        }

        private _scroll(e: Event) {
            Popup.closeAll(this);
            this._updateScrollOffsets();
        }

        private _updateScrollOffsets() {
            const wrapper = this.$["wrapper"];
            if (this.vertical)
                this._setAtTop((this.verticalScrollOffset = wrapper.scrollTop) === 0);

            if (this.horizontal)
                this.horizontalScrollOffset = wrapper.scrollLeft;
        }

        private _verticalScrollOffsetChanged(newVerticalScrollOffset: number) {
            const wrapper = this.$["wrapper"];
            if (wrapper.scrollTop === newVerticalScrollOffset)
                return;

            wrapper.scrollTop = newVerticalScrollOffset;
        }

        private _horizontalScrollOffsetChanged(newHorizontalScrollOffset: number) {
            const wrapper = this.$["wrapper"];
            if (wrapper.scrollLeft === newHorizontalScrollOffset)
                return;

            wrapper.scrollLeft = newHorizontalScrollOffset;
        }

        private _mouseenter() {
            this._setHovering(true);
        }

        private _mouseleave() {
            this._setHovering(false);
        }

        private _verticalScrollbarParentTap(e: TapEvent) {
            const event = <MouseEvent>e.detail.sourceEvent;
            if (event.offsetY) {
                if (event.offsetY > this._verticalScrollTop + this._verticalScrollHeight)
                    this.$["wrapper"].scrollTop += this.$["wrapper"].scrollHeight * 0.1;
                else if (event.offsetY < this._verticalScrollTop)
                    this.$["wrapper"].scrollTop -= this.$["wrapper"].scrollHeight * 0.1;

                e.stopPropagation();
            }
        }

        private _horizontalScrollbarParentTap(e: TapEvent) {
            const event = <MouseEvent>e.detail.sourceEvent;
            if (event.offsetX) {
                if (event.offsetX > this._horizontalScrollLeft + this._horizontalScrollLeft)
                    this.$["wrapper"].scrollLeft += this.$["wrapper"].scrollWidth * 0.1;
                else if (event.offsetX < this._horizontalScrollLeft)
                    this.$["wrapper"].scrollLeft -= this.$["wrapper"].scrollWidth * 0.1;

                e.stopPropagation();
            }
        }
    }
}
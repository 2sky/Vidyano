interface IResizeObserver {
    observe: (target: HTMLElement) => void;
    unobserve: (target: HTMLElement) => void;
}

declare class ResizeObserver implements IResizeObserver {
    constructor(observer: (entries: { target: HTMLElement; contentRect: ClientRect }[]) => void);
    observe: (target: HTMLElement) => void;
    unobserve: (target: HTMLElement) => void;
}

namespace Vidyano.WebComponents {
    "use strict";

    const requestFrame = (function () {
        const raf = window.requestAnimationFrame || (<any>window).mozRequestAnimationFrame || (<any>window).webkitRequestAnimationFrame ||
            function (fn) { return window.setTimeout(fn, 20); };
        return function (fn) { return raf(fn); };
    })();

    const cancelFrame = (function () {
        const cancel = window.cancelAnimationFrame || (<any>window).mozCancelAnimationFrame || (<any>window).webkitCancelAnimationFrame ||
            window.clearTimeout;
        return function (id) { return cancel(id); };
    })();

    let observer: IResizeObserver;
    if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(entries => {
            entries.forEach(e => {
                const tracker = <SizeTracker>Enumerable.from(e.target.children).firstOrDefault(e => e instanceof SizeTracker);
                if (tracker)
                    tracker["_triggerSizeChanged"](e.contentRect);
            });
        });
    }

    @WebComponent.register({
        properties: {
            deferred: {
                type: Boolean,
                reflectToAttribute: true
            },
            size: {
                type: Object,
                readOnly: true,
                notify: true
            },
            triggerZero: {
                type: Boolean,
                reflectToAttribute: true
            },
            bubbles: {
                type: Boolean,
                reflectToAttribute: true
            },
            noResizeObserver: {
                type: Boolean,
                readOnly: true
            }
        }
    })
    export class SizeTracker extends WebComponent {
        private _resizeTimer: number;
        private _resizeTimerQueuedElements: HTMLElement[] = [];
        private _resizeLast: ISize;
        private _resizeRAF: Function;
        private _scrollListener: EventListener;
        private _isActive: boolean;
        readonly size: ISize; private _setSize: (size: ISize) => void;
        readonly noResizeObserver: boolean; private _setNoResizeObserver: (noResizeObserver: boolean) => void;
        deferred: boolean;
        triggerZero: boolean;
        bubbles: boolean;

        attached() {
            super.attached();

            if (this.deferred)
                return;

            this.measure();
        }

        detached() {
            super.detached();

            if (observer)
                observer.unobserve(this.parentElement);
            else if (this._scrollListener) {
                this.$["root"].removeEventListener("scroll", this._scrollListener);
                this._scrollListener = undefined;
            }
        }

        measure() {
            if (!this._isActive) {
                this.deferred = false;

                if (observer)
                    observer.observe(this.parentElement);
                else {
                    this._setNoResizeObserver(true);
                    this.$["resizeObserverShim"]["render"]();
                    this.$["root"] = <HTMLElement>Polymer.dom(this.root).querySelector("#root");
                    this.$["expand"] = <HTMLElement>Polymer.dom(this.root).querySelector("#expand");
                    this.$["expandChild"] = <HTMLElement>Polymer.dom(this.root).querySelector("#expandChild");
                    this.$["contract"] = <HTMLElement>Polymer.dom(this.root).querySelector("#contract");
                }

                this._isActive = true;
            }

            if (this.noResizeObserver) {
                if (!this._scrollListener) {
                    this._resetTriggers(this.$["root"]);
                    this.$["root"].addEventListener("scroll", this._scrollListener = this._onScroll.bind(this), true);

                    this._triggerSizeChanged();
                }
            }
            else if (this._resizeLast) {
                this._setSize(this._resizeLast);
                this.fire("sizechanged", this._resizeLast, { onNode: this, bubbles: !!this.bubbles });
            }
        }

        private _onScroll(e: UIEvent) {
            if (this._resizeRAF)
                cancelFrame(this._resizeRAF);

            this._resizeRAF = requestFrame(() => {
                this._resetTriggers(this.$["root"]);
                this._triggerSizeChanged();
            });
        }

        private _triggerSizeChanged(cr?: { width: number; height: number; }) {
            if (!cr)
                cr = { width: this.$["root"].offsetWidth, height: this.$["root"].offsetHeight };

            if (!this._resizeLast || cr.width !== this._resizeLast.width || cr.height !== this._resizeLast.height) {
                this._resizeLast = {
                    width: cr.width,
                    height: cr.height
                };

                if ((this._resizeLast.width === 0 || this._resizeLast.height === 0) && !this.triggerZero)
                    return;

                this._setSize(this._resizeLast);
                this.fire("sizechanged", this._resizeLast, { onNode: this, bubbles: !!this.bubbles });
            }
        }

        private _resizeTimerMicroTask() {
            this._resizeTimerQueuedElements.slice().forEach(element => this._resetTriggers(element));
        }

        private _resetTriggers(element: HTMLElement) {
            this.$["contract"].scrollLeft = this.$["contract"].scrollWidth;
            this.$["contract"].scrollTop = this.$["contract"].scrollHeight;

            const width = this.$["expand"].offsetWidth;
            const height = this.$["expand"].offsetHeight;

            if (!width || !height) {
                if (!(<any>element).__resizeTimerQueued__) {
                    this._resizeTimerQueuedElements.push(element);
                    (<any>element).__resizeTimerQueued__ = true;
                }

                if (!this._resizeTimer)
                    this._resizeTimer = setInterval(this._resizeTimerMicroTask.bind(this), 250);
            }
            else if ((<any>element).__resizeTimerQueued__) {
                this._resizeTimerQueuedElements.splice(this._resizeTimerQueuedElements.indexOf(element), 1);
                (<any>element).__resizeTimerQueued__ = false;
                if (this._resizeTimerQueuedElements.length === 0) {
                    clearInterval(this._resizeTimer);
                    this._resizeTimer = null;
                }
            }

            if (!(<any>this.$["expandChild"]).__resizeLast__)
                (<any>this.$["expandChild"]).__resizeLast__ = {};

            if ((<any>this.$["expandChild"]).__resizeLast__.width !== width + 1)
                this.$["expandChild"].style.width = ((<any>this.$["expandChild"]).__resizeLast__.width = width + 1) + "px";

            if ((<any>this.$["expandChild"]).__resizeLast__.height !== height + 1)
                this.$["expandChild"].style.height = ((<any>this.$["expandChild"]).__resizeLast__.height = height + 1) + "px";

            this.$["expand"].scrollLeft = this.$["expand"].scrollWidth;
            this.$["expand"].scrollTop = this.$["expand"].scrollHeight;
        }
    }
}
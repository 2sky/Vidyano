module Vidyano.WebComponents {
    var requestFrame = (function () {
        var raf = window.requestAnimationFrame || (<any>window).mozRequestAnimationFrame || (<any>window).webkitRequestAnimationFrame ||
            function (fn) { return window.setTimeout(fn, 20); };
        return function (fn) { return raf(fn); };
    })();

    var cancelFrame = (function () {
        var cancel = window.cancelAnimationFrame || (<any>window).mozCancelAnimationFrame || (<any>window).webkitCancelAnimationFrame ||
            window.clearTimeout;
        return function (id) { return cancel(id); };
    })();

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
            }
        }
    })
    export class SizeTracker extends WebComponent {
        private _resizeTimer: number;
        private _resizeTimerQueuedElements: HTMLElement[] = [];
        private _resizeLast: { width: number; height: number };
        private _resizeRAF: Function;
        private _scrollListener: EventListener;
        deferred: boolean;
        triggerZero: boolean;

        private _setSize: (size: Vidyano.WebComponents.Size) => void;

        attached() {
            if (this.deferred)
                return;

            this.measure();
        }

        detached() {
            if (this._scrollListener) {
                this.$["root"].removeEventListener('scroll', this._scrollListener);
                this._scrollListener = undefined;
            }
        }

        measure() {
            this.deferred = false;

            var root = <any>this.$["root"];
            if (!this._scrollListener) {
                this._resetTriggers(root);
                root.addEventListener('scroll', this._scrollListener = this._onScroll.bind(this), true);
            }

            this._triggerSizeChanged();
        }

        private _onScroll(e: UIEvent) {
            if (this._resizeRAF)
                cancelFrame(this._resizeRAF);

            this._resizeRAF = requestFrame(() => {
                this._resetTriggers(this.$["root"]);
                this._triggerSizeChanged();
            });
        }

        private _triggerSizeChanged() {
            var root = this.$["root"];
            if (!this._resizeLast || root.offsetWidth !== this._resizeLast.width || root.offsetHeight !== this._resizeLast.height) {
                this._resizeLast = {
                    width: root.offsetWidth,
                    height: root.offsetHeight
                };

                if ((this._resizeLast.width === 0 || this._resizeLast.height === 0 ) && !this.triggerZero)
                    return;

                this._setSize(this._resizeLast);
                this.fire("sizechanged", this._resizeLast, { onNode: this, bubbles: false });
            }
        }

        private _resizeTimerMicroTask() {
            this._resizeTimerQueuedElements.slice().forEach(element => this._resetTriggers(element));
        }

        private _resetTriggers(element: HTMLElement) {
            var expand = <HTMLElement>element.querySelector("#expand"),
                contract = <HTMLElement>element.querySelector("#contract"),
                expandChild = <HTMLElement>element.querySelector("#expandChild");

            contract.scrollLeft = contract.scrollWidth;
            contract.scrollTop = contract.scrollHeight;

            var width = expand.offsetWidth;
            var height = expand.offsetHeight;

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
                if (this._resizeTimerQueuedElements.length == 0) {
                    clearInterval(this._resizeTimer);
                    this._resizeTimer = null;
                }
            }

            if (!(<any>expandChild).__resizeLast__)
                (<any>expandChild).__resizeLast__ = {};

            if ((<any>expandChild).__resizeLast__.width != width + 1)
                expandChild.style.width = ((<any>expandChild).__resizeLast__.width = width + 1) + 'px';

            if ((<any>expandChild).__resizeLast__.height != height + 1)
                expandChild.style.height = ((<any>expandChild).__resizeLast__.height = height + 1) + 'px';

            expand.scrollLeft = expand.scrollWidth;
            expand.scrollTop = expand.scrollHeight;
        }
    }
}
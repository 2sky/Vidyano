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
    export interface SizeTrackerEvent extends CustomEvent {
        detail: ISize;
    }

    let observer: IResizeObserver;

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
        private _resizeAfHandle: number;
        private _scrollListener: EventListener;
        private _isActive: boolean;
        readonly size: ISize; private _setSize: (size: ISize) => void;
        readonly noResizeObserver: boolean; private _setNoResizeObserver: (noResizeObserver: boolean) => void;
        deferred: boolean;
        triggerZero: boolean;
        bubbles: boolean;

        connectedCallback() {
            super.connectedCallback();

            if (this.deferred)
                return;

            this.measure();
        }

        disconnectedCallback() {
            super.disconnectedCallback();

            if (observer)
                observer.unobserve(this.parentElement);
            else if (this._scrollListener) {
                this.$.root.removeEventListener("scroll", this._scrollListener);
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
                    this.$.resizeObserverShim["render"]();
                    this.$.root = <HTMLElement>this.shadowRoot.querySelector("#root");
                    this.$.expand = <HTMLElement>this.shadowRoot.querySelector("#expand");
                    this.$.expandChild = <HTMLElement>this.shadowRoot.querySelector("#expandChild");
                    this.$.contract = <HTMLElement>this.shadowRoot.querySelector("#contract");
                }

                this._isActive = true;
            }

            if (this.noResizeObserver) {
                if (!this._scrollListener) {
                    this._resetTriggers(this.$.root);
                    this.$.root.addEventListener("scroll", this._scrollListener = this._onScroll.bind(this), true);

                    this._triggerSizeChanged();
                }
            }
            else if (this._resizeLast) {
                this._setSize(this._resizeLast);
                this.fire("sizechanged", this._resizeLast, { node: this, bubbles: !!this.bubbles });
            }
        }

        private _onScroll(e: UIEvent) {
            if (this._resizeAfHandle)
                Polymer.Async.animationFrame.cancel(this._resizeAfHandle);

            this._resizeAfHandle = Polymer.Async.animationFrame.run(() => {
                this._resetTriggers(this.$.root);
                this._triggerSizeChanged();
            });
        }

        private _triggerSizeChanged(cr?: { width: number; height: number; }) {
            if (!cr)
                cr = { width: this.$.root.offsetWidth, height: this.$.root.offsetHeight };

            if (!this._resizeLast || cr.width !== this._resizeLast.width || cr.height !== this._resizeLast.height) {
                this._resizeLast = {
                    width: cr.width,
                    height: cr.height
                };

                if ((this._resizeLast.width === 0 || this._resizeLast.height === 0) && !this.triggerZero)
                    return;

                this._setSize(this._resizeLast);
                this.fire("sizechanged", this._resizeLast, { node: this, bubbles: !!this.bubbles });
            }
        }

        private _resizeTimerMicroTask() {
            this._resizeTimerQueuedElements.slice().forEach(element => this._resetTriggers(element));
        }

        private _resetTriggers(element: HTMLElement) {
            this.$.contract.scrollLeft = this.$.contract.scrollWidth;
            this.$.contract.scrollTop = this.$.contract.scrollHeight;

            const width = this.$.expand.offsetWidth;
            const height = this.$.expand.offsetHeight;

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

            if (!(<any>this.$.expandChild).__resizeLast__)
                (<any>this.$.expandChild).__resizeLast__ = {};

            if ((<any>this.$.expandChild).__resizeLast__.width !== width + 1)
                this.$.expandChild.style.width = ((<any>this.$.expandChild).__resizeLast__.width = width + 1) + "px";

            if ((<any>this.$.expandChild).__resizeLast__.height !== height + 1)
                this.$.expandChild.style.height = ((<any>this.$.expandChild).__resizeLast__.height = height + 1) + "px";

            this.$.expand.scrollLeft = this.$.expand.scrollWidth;
            this.$.expand.scrollTop = this.$.expand.scrollHeight;
        }
    }
}
namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            intersecting: {
                type: Boolean,
                reflectToAttribute: true
            },
            intersected: {
                type: Boolean,
                reflectToAttribute: true
            },
            ratio: {
                type: Number,
                reflectToAttribute: true,
                value: null
            },
            continuous: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
        },
        observers: [
            "_observe(isAttached, ratio)"
        ]
    })
    export class ScrollIntersection extends WebComponent {
        private _intersectionObserver: IntersectionObserver;
        intersecting: boolean;
        intersected: boolean;
        continuous: boolean;

        detached() {
            if (this._intersectionObserver != null) {
                this._intersectionObserver.disconnect();
                this._intersectionObserver = null;
            }

            super.detached();
        }

        get intersectionObserver(): IntersectionObserver {
            if (!this._intersectionObserver) {
                this._intersectionObserver = new IntersectionObserver(this._intersected.bind(this));
            }

            return this._intersectionObserver;
        }

        private _intersected(entries: IntersectionObserverEntry[]) {
            let intersected: boolean;

            entries.filter(e => e.target instanceof Vidyano.WebComponents.ScrollIntersection).forEach(e => {
                const target = <ScrollIntersection>e.target;
                target.intersecting = e.isIntersecting;
                intersected = target.intersected = target.intersected || e.isIntersecting;
            });

            if (intersected && !this.continuous) {
                this._intersectionObserver.disconnect();
                this._intersectionObserver = null;
            }
        }

        private _observe(isAttached: boolean, ratio: number) {
            if (IntersectionObserver === undefined)
                return;

            if (isAttached) {
                if (this._intersectionObserver) {
                    this._intersectionObserver.disconnect();
                    this._intersectionObserver = null;
                }

                const parentScroller = <Scroller>this.findParent(e => e instanceof Vidyano.WebComponents.Scroller);
                if (parentScroller == null)
                    return;

                this._intersectionObserver = new IntersectionObserver(this._intersected.bind(this), {
                    root: parentScroller.scroller,
                    threshold: !isNaN(ratio) ? ratio : 0
                });

                this._intersectionObserver.observe(this);
            }
            else if (this._intersectionObserver != null) {
                this._intersectionObserver.disconnect();
                this._intersectionObserver = null;
            }
        }
    }
}
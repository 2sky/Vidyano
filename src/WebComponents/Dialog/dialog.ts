namespace Vidyano.WebComponents {
    @WebComponent.registerAbstract({
        properties: {
            noHeader: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        listeners: {
            "sizechanged": "_dialogSizeChanged",
            "iron-overlay-closed": "_onClosed"
        },
        behaviors: [
            Polymer["IronOverlayBehavior"],
            Polymer["IronResizableBehavior"]
        ],
        hostAttributes: {
            "dialog": "",
            "with-backdrop": ""
        },
        keybindings: {
            "esc": "_esc"
        }
    })
    export abstract class Dialog extends WebComponent {
        private _sizeTracker: Vidyano.WebComponents.SizeTracker;
        private _translatePosition: IPosition;
        private _resolve: Function;
        private opened: boolean;
        noCancelOnOutsideClick: boolean;
        noCancelOnEscKey: boolean;
        noHeader: boolean;

        connectedCallback() {
            if (!this._sizeTracker) {
                this.shadowRoot.appendChild(this._sizeTracker = new Vidyano.WebComponents.SizeTracker());
                this._sizeTracker.bubbles = true;
            }

            // NOTE: Fix for https://github.com/PolymerElements/iron-overlay-behavior/issues/124
            (<any>this)._manager._overlayWithBackdrop = function () {
                for (let i = this._overlays.length - 1; i >= 0; i--) {
                    if (this._overlays[i].withBackdrop) {
                        return this._overlays[i];
                    }
                }
            };

            // By default, don't cancel dialog on outside click.
            this.noCancelOnOutsideClick = true;

            super.connectedCallback();
        }

        async open(): Promise<any> {
            let trackHandler: Function;
            const header = <HTMLElement>this.shadowRoot.querySelector("header");
            if (header)
                Polymer.Gestures.add(header, "track", trackHandler = this._track.bind(this));

            const result = await new Promise(resolve => {
                this._resolve = resolve;

                Polymer["IronOverlayBehaviorImpl"].open.apply(this);
            });

            if (trackHandler)
                Polymer.Gestures.remove(header, "track", trackHandler);

            Polymer["IronOverlayBehaviorImpl"].close.apply(this);
            return result;
        }

        private _esc(e: KeyboardEvent) {
            if (!this.noCancelOnEscKey)
                this.cancel();
        }

        close(result?: any) {
            this._resolve(result);
        }

        cancel() {
            Polymer["IronOverlayBehaviorImpl"].cancel.apply(this);
        }

        private _onClosed() {
            this._resolve();
        }

        private _dialogSizeChanged(e: SizeTrackerEvent) {
            (<any>this).notifyResize();

            e.stopPropagation();
        }

        private _track(e: Polymer.TrackEvent) {
            if (e.detail.state === "track" && this._translatePosition && this.app.isTracking) {
                this._translate({
                    x: this._translatePosition.x + e.detail.ddx,
                    y: this._translatePosition.y + e.detail.ddy
                });
            }
            else if (e.detail.state === "start") {
                if (!(<HTMLElement>(e.sourceEvent.target)).tagName.startsWith("H")) {
                    e.stopPropagation();
                    e.preventDefault();

                    return;
                }

                this.app.isTracking = true;
                if (!this._translatePosition)
                    this._translate({ x: 0, y: 0 });

                this.setAttribute("dragging", "");
            }
            else if (e.detail.state === "end") {
                this.removeAttribute("dragging");
                this.app.isTracking = false;
            }
        }

        private _translate(position: IPosition) {
            this._translatePosition = position;
            this.style.webkitTransform = this.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }

        protected _translateReset() {
            if (!this._translatePosition)
                return;

            this._translatePosition = null;
            this.style.webkitTransform = this.style.transform = "";
        }
    }
}
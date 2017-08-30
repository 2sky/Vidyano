namespace Vidyano.WebComponents {
    "use strict";

    export abstract class Dialog extends WebComponent {
        private _sizeTracker: Vidyano.WebComponents.SizeTracker;
        private _translatePosition: IPosition;
        private _resolve: Function;
        private opened: boolean;
        noCancelOnOutsideClick: boolean;
        noCancelOnEscKey: boolean;
        noHeader: boolean;

        protected cancel: () => void;

        connectedCallback() {
            if (!this._sizeTracker) {
                Polymer.dom(this.root).appendChild(this._sizeTracker = new Vidyano.WebComponents.SizeTracker());
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
            const header = <HTMLElement>Polymer.dom(this.root).querySelector("header");
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
            this.close();
        }

        close(result?: any) {
            this._resolve(result);
        }

        private _onClosed() {
            this._resolve();
        }

        private _dialogSizeChanged(e: CustomEvent, details: ISize) {
            (<any>this).notifyResize();

            e.stopPropagation();
        }

        private _track(e: PolymerTrackEvent) {
            const detail = <PolymerTrackDetail>e.detail;

            if (detail.state === "track" && this._translatePosition && this.app.isTracking) {
                this._translate({
                    x: this._translatePosition.x + detail.ddx,
                    y: this._translatePosition.y + detail.ddy
                });
            }
            else if (detail.state === "start") {
                if (!(<HTMLElement>(e.detail.sourceEvent.target)).tagName.startsWith("H")) {
                    e.stopPropagation();
                    e.preventDefault();

                    return;
                }

                this.app.isTracking = true;
                if (!this._translatePosition)
                    this._translate({ x: 0, y: 0 });

                this.setAttribute("dragging", "");
            }
            else if (detail.state === "end") {
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

        static register(info: IWebComponentRegistrationInfo | Function = {}, prefix?: string): any {
            if (typeof info === "function")
                return Dialog.register({})(info);

            return (obj: Function) => {
                info.properties = info.properties || {};

                info.properties["noHeader"] = {
                    type: Boolean,
                    reflectToAttribute: true
                };

                info.listeners = info.listeners || {};
                info.listeners["sizechanged"] = "_dialogSizeChanged";
                info.listeners["iron-overlay-closed"] = "_onClosed";

                info.behaviors = info.behaviors || [];
                info.behaviors.push(Polymer["IronOverlayBehavior"]);
                info.behaviors.push(Polymer["IronResizableBehavior"]);

                info.hostAttributes = info.hostAttributes || {};
                info.hostAttributes["dialog"] = "";
                info.hostAttributes["with-backdrop"] = "";

                info.keybindings = info.keybindings || {};
                info.keybindings["esc"] = {
                    listener: "_esc"
                };

                return WebComponent.register(obj, info, prefix);
            };
        }
    }
}
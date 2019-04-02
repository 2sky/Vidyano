namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            hasOverflow: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            }
        },
        listeners: {
            "sizechanged": "_childSizechanged"
        }
    })
    export class Overflow extends WebComponent {
        private _overflownChildren: HTMLElement[];
        private _visibibleSizeChangedSkip: { width: number; height: number };
        private _previousHeight: number;
        readonly hasOverflow: boolean; private _setHasOverflow: (val: boolean) => void;

        private _visibleContainerSizeChanged(e: Event, detail: { width: number; height: number }) {
            this.$.visible.style.maxWidth = `${detail.width}px`;

            if (this._previousHeight !== detail.height)
                this.$.first.style.height = `${this._previousHeight = detail.height}px`;
        }

        private _childSizechanged() {
            this._setHasOverflow(false);
        }

        private _visibleSizeChanged(e: Event, detail: { width: number; height: number }) {
            const popup = <WebComponents.Popup><any>this.$.overflowPopup;
            if (popup.open)
                return;

            Polymer.Async.animationFrame.run(() => {
                const children = this._getChildren();
                children.forEach(child => child.removeAttribute("slot"));

                this._setHasOverflow(children.some(child => child.offsetTop > 0));
            });
        }

        protected _getChildren(): HTMLElement[] {
            const visibleSlot = <HTMLSlotElement>this.$.visible;
            const overflowSlot = <HTMLSlotElement>this.$.overflow;

            return <HTMLElement[]>visibleSlot.assignedNodes().concat(visibleSlot.assignedNodes()).filter(child => child instanceof HTMLElement);
        }

        private _popupOpening() {
            this._overflownChildren = this._getChildren().filter(child => child.offsetTop > 0);
            this._overflownChildren.forEach(child => child.setAttribute("slot", "overflow"));

            Polymer.flush();
        }

        private _popupClosed() {
            this._overflownChildren.forEach(child => child.removeAttribute("slot"));
            Polymer.flush();

            this._setHasOverflow(this._overflownChildren.some(child => child.offsetTop > 0));
        }
    }
}
namespace Vidyano.WebComponents {
    "use strict";

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

            requestAnimationFrame(() => {
                const children = this._getChildren();
                children.forEach(child => {
                    Polymer.dom(child).removeAttribute("overflow");
                });

                this._setHasOverflow(children.some(child => child.offsetTop > 0));
            });
        }

        protected _getChildren(): HTMLElement[] {
            return [].concat(...Array.from(Polymer.dom(this).children).filter(c => c.tagName !== "TEMPLATE").map(element => {
                if (element.tagName === "CONTENT")
                    return Array.from(Polymer.dom(element).getDistributedNodes()).filter(c => c.tagName !== "TEMPLATE");

                return [element];
            })).map(child => <HTMLElement>child);
        }

        private _popupOpening() {
            this._overflownChildren = this._getChildren();
            this._overflownChildren.forEach(child => {
                if (child.offsetTop > 0)
                    Polymer.dom(child).setAttribute("overflow", "");
            });

            Polymer.dom(this).flush();
        }

        private _popupClosed() {
            this._overflownChildren.forEach(child => {
                Polymer.dom(child).removeAttribute("overflow");
            });

            Polymer.dom(this).flush();

            this._setHasOverflow(this._overflownChildren.some(child => child.offsetTop > 0));
        }

        private async _popup(e: Event) {
            e.stopPropagation();

            const children = this._getChildren();
            children.forEach(child => {
                if (child.offsetTop > 0)
                    Polymer.dom(child).setAttribute("overflow", "");
            });

            Polymer.dom(this).flush();

            const popup = <WebComponents.Popup><any>this.$.overflowPopup;
            await popup.popup();

            children.forEach(child => {
                Polymer.dom(child).removeAttribute("overflow");
            });

            Polymer.dom(this).flush();
            this._setHasOverflow(children.some(child => child.offsetTop > 0));
        }
    }
}
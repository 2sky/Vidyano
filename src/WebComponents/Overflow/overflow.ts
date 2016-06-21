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
        private _overflownChildren: linqjs.Enumerable<HTMLElement>;
        private _visibibleSizeChangedSkip: { width: number; height: number };
        private _previousHeight: number;
        hasOverflow: boolean;

        private _setHasOverflow: (val: boolean) => void;

        private _visibleContainerSizeChanged(e: Event, detail: { width: number; height: number }) {
            this.$["visible"].style.maxWidth = `${detail.width}px`;

            if (this._previousHeight !== detail.height)
                this.$["first"].style.height = `${this._previousHeight = detail.height}px`;
        }

        private _childSizechanged() {
            this._setHasOverflow(false);
        }

        private _visibleSizeChanged(e: Event, detail: { width: number; height: number }) {
            const popup = <WebComponents.Popup><any>this.$["overflowPopup"];
            if (popup.open)
                return;

            requestAnimationFrame(() => {
                const children = this._getChildren();
                children.forEach(child => {
                    Polymer.dom(child).removeAttribute("overflow");
                });

                this._setHasOverflow(children.toArray().some(child => child.offsetTop > 0));
            });
        }

        protected _getChildren(): linqjs.Enumerable<HTMLElement> {
            return Enumerable.from(Enumerable.from(Polymer.dom(this).children).where(c => c.tagName !== "TEMPLATE").selectMany(element => {
                if (element.tagName === "CONTENT")
                    return Enumerable.from(Polymer.dom(element).getDistributedNodes()).where(c => c.tagName !== "TEMPLATE").toArray();

                return [element];
            }).select(child => <HTMLElement>child).toArray());
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

            this._setHasOverflow(this._overflownChildren.toArray().some(child => child.offsetTop > 0));
        }

        private _popup(e: Event) {
            const children = this._getChildren();
            children.forEach(child => {
                if (child.offsetTop > 0)
                    Polymer.dom(child).setAttribute("overflow", "");
            });

            Polymer.dom(this).flush();

            const popup = <WebComponents.Popup><any>this.$["overflowPopup"];
            popup.popup().then(() => {
                children.forEach(child => {
                    Polymer.dom(child).removeAttribute("overflow");
                });

                Polymer.dom(this).flush();
                this._setHasOverflow(children.toArray().some(child => child.offsetTop > 0));
            });

            e.stopPropagation();
        }
    }
}
namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            },
            openOnHover: {
                type: Boolean,
                reflectToAttribute: true
            },
            contextMenuOnly: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            shiftKey: Boolean,
            ctrlKey: Boolean,
            rightAlign: {
                type: Boolean,
                reflectToAttribute: true,
                observer: "_alignmentChanged"
            },
            open: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        observers: [
            "_hookContextMenu(isConnected, contextMenuOnly)"
        ],
        listeners: {
            "mouseenter": "_mouseenter",
            "mousemove": "_mousemove"
        }
    })
    export class PopupMenu extends WebComponent {
        private _openContextEventListener: EventListener;
        contextMenuOnly: boolean;
        shiftKey: boolean;
        ctrlKey: boolean;
        rightAlign: boolean;
        openOnHover: boolean;
        open: boolean;

        popup(): Promise<any> {
            return (<Popup>this.$.popup).popup();
        }

        private _hookContextMenu(isConnected: boolean, contextMenu: boolean) {
            if (isConnected && contextMenu)
                this.domHost.addEventListener("contextmenu", this._openContextEventListener = this._openContext.bind(this));
            else if (this._openContextEventListener) {
                this.domHost.removeEventListener("contextmenu", this._openContextEventListener);
                this._openContextEventListener = undefined;
            }
        }

        private _openContext(e: MouseEvent): boolean {
            if (!this.contextMenuOnly)
                return true;

            if (e.which === 3 && !!this.shiftKey === !!e.shiftKey && !!this.ctrlKey === !!e.ctrlKey) {
                const popup = <Popup><any>this.$.popup;

                popup.style.left = e.pageX + "px";
                popup.style.top = e.pageY + "px";

                if (!popup.open)
                    popup.popup();
                else
                    popup.close();

                e.preventDefault();
                e.stopPropagation();

                return false;
            }
        }

        private _alignmentChanged() {
            (<Popup><any>this.$.popup).contentAlign = this.rightAlign ? "right" : "";
        }

        private _mouseenter() {
            if (this.openOnHover)
                this.popup();
        }

        private _mousemove(e: MouseEvent) {
            e.stopPropagation();
        }
    }

    @WebComponent.register({
        properties: {
            label: String,
            icon: String,
            noIcon: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            checked: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            hasChildren: {
                type: Boolean,
                reflectToAttribute: true,
                value: false,
                readOnly: true
            }
        },
        listeners: {
            "tap": "_onTap"
        }
    })
    export class PopupMenuItem extends WebComponent {
        private _observer: Polymer.FlattenedNodesObserver;
        readonly hasChildren: boolean; private _setHasChildren: (hasChildren: boolean) => void;
        checked: boolean;

        constructor(public label?: string, public icon?: string, private _action?: () => void) {
            super();
        }

        connectedCallback() {
            super.connectedCallback();

            const subItems = <HTMLSlotElement>this.$.subItems;
            this._observer = new Polymer.FlattenedNodesObserver(this.$.subItems, info => {
                this._setHasChildren(subItems.assignedNodes({ flatten: true }).length > 0);
            });
        }

        disconnectedCallback() {
            this._observer.disconnect();
            super.disconnectedCallback();
        }

        private _onTap(e: Polymer.TapEvent) {
            if (this._action) {
                this._action();
                Vidyano.WebComponents.Popup.closeAll();

                e.stopPropagation();
                e.preventDefault();
            }
        }

        private _catchTap(e: Polymer.TapEvent) {
            if (!this.hasChildren)
                return;

            if ((<PopupMenu>this.$.popup).open) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }
    }

    @WebComponent.register({
        properties: {
            label: String,
            icon: String,
            checked: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            hasChildren: {
                type: Boolean,
                reflectToAttribute: true,
                value: false,
                readOnly: true
            }
        },
        listeners: {
            "tap": "_onTap"
        }
    })
    export class PopupMenuItemSplit extends WebComponent {
        private _observer: Polymer.FlattenedNodesObserver;
        readonly hasChildren: boolean; private _setHasChildren: (hasChildren: boolean) => void;
        checked: boolean;

        constructor(public label?: string, public icon?: string, private _action?: () => void) {
            super();
        }

        connectedCallback() {
            super.connectedCallback();

            const subItems = <HTMLSlotElement>this.$.subItems;
            this._observer = new Polymer.FlattenedNodesObserver(this.$.subItems, info => {
                this._setHasChildren(subItems.assignedNodes({ flatten: true }).length > 0);
            });
        }

        disconnectedCallback() {
            this._observer.disconnect();
            super.disconnectedCallback();
        }

        private _onTap(e: Polymer.TapEvent) {
            if (this._action) {
                this._action();
                Vidyano.WebComponents.Popup.closeAll();

                e.stopPropagation();
                e.preventDefault();
            }
        }

        private _splitTap(e: Event) {
            e.stopPropagation();
        }
    }

    @WebComponent.register({
        properties: {
            label: String,
            icon: String
        },
        listeners: {
            "tap": "_onTap"
        }
    })
    export class PopupMenuItemWithActions extends WebComponent {
        constructor(public label?: string, public icon?: string, private _action?: () => void) {
            super();
        }

        private _onTap(e: Polymer.TapEvent) {
            if (this._action) {
                this._action();
                Vidyano.WebComponents.Popup.closeAll();

                e.preventDefault();
                e.stopPropagation();
            }
        }

        private _actionsTap(e: Polymer.TapEvent) {
            Vidyano.WebComponents.Popup.closeAll();
            e.stopPropagation();
        }

        private _catch(e: Event) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    @WebComponent.register()
    export class PopupMenuItemSeparator extends WebComponent {
    }
}
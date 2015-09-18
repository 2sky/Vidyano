module Vidyano.WebComponents {
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
            }
        },
        observers: [
            "_hookContextMenu(isAttached, contextMenuOnly)"
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

        popup(): Promise<any> {
            return (<Popup><any>this.$["popup"]).popup();
        }

        private _hookContextMenu(isAttached: boolean, contextMenu: boolean) {
            if (isAttached && contextMenu)
                this.parentElement.addEventListener("contextmenu", this._openContextEventListener = this._openContext.bind(this));
            else if (this._openContextEventListener) {
                this.parentElement.removeEventListener("contextmenu", this._openContextEventListener);
                this._openContextEventListener = undefined;
            }
        }

        private _openContext(e: MouseEvent): boolean {
            if (!this.contextMenuOnly)
                return true;

            if (e.which == 3 && (!this.shiftKey || e.shiftKey) && (!this.ctrlKey || e.ctrlKey)) {
                var popup = <WebComponents.Popup><any>this.$["popup"];

                this.$["popup"].style.left = e.pageX + "px";
                this.$["popup"].style.top = e.pageY + "px";

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
            (<Popup><any>this.$["popup"]).contentAlign = this.rightAlign ? "right" : "";
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
            iconSpace: {
                type: Boolean,
                reflectToAttribute: true
            },
            split: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    })
    export class PopupMenuItem extends WebComponent {
        label: string;
        split: boolean;

        attached() {
            super.attached();

            this.split = Polymer.dom(this).children.length > 0;
        }

        private _splitTap(e: Event) {
            e.stopPropagation();
        }
    }

    @WebComponent.register()
    export class PopupMenuItemSeparator extends WebComponent {
    }
}
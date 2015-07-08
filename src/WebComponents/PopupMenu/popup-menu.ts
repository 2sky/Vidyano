module Vidyano.WebComponents {
    export class PopupMenu extends WebComponent {
        private _openContextEventListener: EventListener;
        contextMenuOnly: boolean;
        shiftKey: boolean;
        ctrlKey: boolean;
        rightAlign: boolean;

        private _hookContextMenu(isAttached: boolean, contextMenu: boolean) {
            if (isAttached && contextMenu)
                this.asElement.parentElement.addEventListener("contextmenu", this._openContextEventListener = this._openContext.bind(this));
            else if (this._openContextEventListener) {
                this.asElement.parentElement.removeEventListener("contextmenu", this._openContextEventListener);
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
    }

    export class PopupMenuItem extends WebComponent {
        label: string;
    }

    export class PopupMenuItemSeparator extends WebComponent {
    }

    WebComponent.register(PopupMenu, WebComponents, "vi", {
        properties: {
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
        ]
    });

    WebComponent.register(PopupMenuItem, WebComponents, "vi", {
        properties: {
            icon: String,
            label: String
        }
    });

    WebComponent.register(PopupMenuItemSeparator, WebComponents, "vi");
}
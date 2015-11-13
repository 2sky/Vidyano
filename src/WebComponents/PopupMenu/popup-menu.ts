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
            return (<Popup>this.$["popup"]).popup();
        }

        private _popupOpening() {
            var children = Enumerable.from(Polymer.dom(this.$["popup"]).querySelector("[content]").children).where((c: HTMLElement) => c.tagName === "VI-POPUP-MENU-ITEM" && c.style.display !== "none").toArray();

            var hasIcons = children.filter(c => c.hasAttribute("icon")).length > 0;
            var hasSplits = children.filter(c => c.hasAttribute("split")).length > 0;

            children.forEach((c: PopupMenuItem) => {
                c.toggleAttribute("icon-space", hasIcons && (!c.icon || !Icon.Exists(c.icon)));
                c.toggleAttribute("split-space", hasSplits && !c.split);
            });
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
                var popup = <Popup><any>this.$["popup"];

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
            checked: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            split: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
        }
    })
    export class PopupMenuItem extends WebComponent {
        label: string;
        icon: string;
        checked: boolean;
        split: boolean;

        private _splitTap(e: Event) {
            e.stopPropagation();
        }
    }

    @WebComponent.register()
    export class PopupMenuItemSeparator extends WebComponent {
    }
}
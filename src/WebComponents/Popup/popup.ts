module Vidyano.WebComponents {
    var _documentClosePopupListener: EventListener;
    var a = 0;
    document.addEventListener("mousedown", _documentClosePopupListener = e => {
        var el = <HTMLElement>e.target;
        var popup: Popup;

        while (true) {
            if (!el || el == <any>document) {
                WebComponents.Popup.closeAll();
                break;
            }
            else if (el instanceof WebComponents.Popup && (<WebComponents.Popup><any>el).open)
                break;
            else if ((<any>el).popup instanceof WebComponents.Popup && (<WebComponents.Popup>(<any>el).popup).open)
                break;
            else
                el = el.parentElement;
        }
    });
    document.addEventListener("touchstart", _documentClosePopupListener);

    export class Popup extends WebComponent {
        private static _openPopups: Vidyano.WebComponents.Popup[] = [];
        private _tapHandler: EventListener;
        private _enterHandler: EventListener;
        private _leaveHandler: EventListener;
        private _resolver: Function;
        private _closeOnMoveoutTimer: number;
        private _currentOrientation: string;
        private _header: HTMLElement;
        contentAlign: string;
        sticky: boolean;
        open: boolean;
        autoSizeContent: boolean;
        openOnHover: boolean;

        private _setOpen(val: boolean) { }

        popup(): Promise<any> {
            if (this.open)
                return Promise.resolve();

            return new Promise(resolve => {
                this._resolver = resolve;
                this._open();
            });
        }

        private _hookTapAndHoverEvents() {
            this._header = <HTMLElement>Polymer.dom(this).querySelector("[header]") || this.asElement.parentElement;

            if (this._header == this.asElement.parentElement)
                (<any>this._header).popup = this;

            if (this.isAttached) {
                if (this.openOnHover) {
                    this.asElement.addEventListener("mouseenter", this._enterHandler = this._onOpen.bind(this))
                    this.asElement.addEventListener("mouseleave", this._leaveHandler = this.close.bind(this));
                }
                else
                    this._header.addEventListener("tap", this._tapHandler = this._tap.bind(this));
            }
            else {
                if (this._enterHandler) {
                    this.asElement.removeEventListener("mouseenter", this._enterHandler);
                    this._enterHandler = undefined;
                }

                if (this._leaveHandler) {
                    this.asElement.removeEventListener("mouseleave", this._leaveHandler);
                    this._leaveHandler = undefined
                }

                if (this._tapHandler) {
                    this._header.removeEventListener("tap", this._tapHandler);
                    this._tapHandler = undefined
                }
            }
        }

        private _tap(e: CustomEvent) {
            if (this.open) {
                if(!this.sticky)
                    this.close();

                return;
            }

            var el = <HTMLElement>e.target;
            do {
                if (el == this._header) {
                    this._onOpen(e);

                    e.stopPropagation();
                    break;
                }

                el = el.parentElement;
            }
            while (el && el != this.asElement);
        }

        private _onOpen(e: Event) {
            if (!this.open)
                this._open(!this._findParentPopup() ? "vertical" : "horizontal");

            e.stopPropagation();
            e.preventDefault();
        }

        private _open(orientation: string = "vertical") {
            if (this.open || this.asElement.hasAttribute("disabled"))
                return;

            this._currentOrientation = orientation;

            if (this.fire("popup-opening", null, { bubbles: false, cancelable: true }).defaultPrevented)
                return;

            // Close non-parent popups
            var parentPopup = this._findParentPopup();
            var firstOpenNonParentChild = Popup._openPopups[parentPopup == null ? 0 : Popup._openPopups.indexOf(parentPopup) + 1];
            if (firstOpenNonParentChild != null)
                firstOpenNonParentChild.close();

            // Position content
            var root = this._header;

            var rootSizeTracker = <WebComponents.SizeTracker><any>this.$["toggleSizeTracker"];
            rootSizeTracker.measure();

            var content = this.$["content"];

            var rootRect = root.getBoundingClientRect();
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            var contentWidth = content.offsetWidth;
            var contentHeight = content.offsetHeight;

            var alignments = (this.contentAlign || "").toUpperCase().split(" ");
            var alignCenter = alignments.indexOf("CENTER") >= 0;
            var alignRight = alignments.indexOf("RIGHT") >= 0;
             
            if (orientation == "vertical") {
                if (alignRight ? (rootRect.right - contentWidth) < 0 : rootRect.left + contentWidth <= windowWidth) {
                    // Left-align
                    var left = rootRect.left;
                    if (alignments.indexOf("CENTER") >= 0)
                        left = Math.max(0, left - contentWidth / 2 + rootRect.width / 2);

                    content.style.left = left + "px";
                    content.style.right = "auto";

                    content.classList.add("left");
                    content.classList.remove("right");
                }
                else {
                    // Right-align
                    content.style.left = "auto";
                    content.style.right = Math.max(windowWidth - (rootRect.left + rootRect.width), 0) + "px";

                    content.classList.add("right");
                    content.classList.remove("left");
                }

                if (rootRect.top + rootRect.height + contentHeight < windowHeight) {
                    // Top-align
                    content.style.top = (rootRect.top + rootRect.height) + "px";
                    content.style.bottom = "auto";

                    content.classList.add("top");
                    content.classList.remove("bottom");
                }
                else {
                    // Bottom-align
                    content.style.top = "auto";
                    content.style.bottom = Math.max(windowHeight - rootRect.top, 0) + "px";

                    content.classList.add("bottom");
                    content.classList.remove("top");
                }
            }
            else if (orientation == "horizontal") {
                if (alignRight ? (rootRect.right - contentWidth) < 0 : rootRect.left + rootRect.width + contentWidth <= windowWidth) {
                    // Left-align
                    content.style.left = (rootRect.left + rootRect.width) + "px";
                    content.style.right = "auto";

                    content.classList.add("left");
                    content.classList.remove("right");
                }
                else {
                    // Right-align
                    content.style.left = "auto";
                    content.style.right = Math.max(windowWidth - rootRect.left, 0) + "px";

                    content.classList.add("right");
                    content.classList.remove("left");
                }

                if (rootRect.top + contentHeight < windowHeight) {
                    // Top-align
                    content.style.top = rootRect.top + "px";
                    content.style.bottom = "auto";

                    content.classList.add("top");
                    content.classList.remove("bottom");
                }
                else {
                    // Bottom-align
                    content.style.top = "auto";
                    content.style.bottom = Math.max(windowHeight - rootRect.top, 0) + "px";

                    content.classList.add("bottom");
                    content.classList.remove("top");
                }
            }

            this._setOpen(true);
            Popup._openPopups.push(this);

            this.fire("popup-opened", null, { bubbles: false, cancelable: false });
        }

        close() {
            if (this.fire("popup-closing", null, { bubbles: false, cancelable: true }).defaultPrevented)
                return;

            if (this._closeOnMoveoutTimer) {
                clearTimeout(this._closeOnMoveoutTimer);
                this._closeOnMoveoutTimer = undefined;
            }

            var openChild = Popup._openPopups[Popup._openPopups.indexOf(this) + 1];
            if (openChild != null)
                openChild.close();

            this._setOpen(false);
            if (this._resolver)
                this._resolver();

            Popup._openPopups.remove(this);

            this.fire("popup-closed", null, { bubbles: false, cancelable: false });
        }

        protected _findParentPopup(): Popup {
            var self = this.asElement;
            var element = <Node>self.parentNode;
            while (element != null && Popup._openPopups.indexOf(<any>element) == -1)
                element = (<any>element).host || element.parentNode;

            return <Popup><any>element;
        }

        private _toggleSizeChanged(e: Event, detail: { width: number; height: number }) {
            if (!this.autoSizeContent) {
                if (this._currentOrientation == "vertical")
                    this.$["content"].style.minWidth = detail.width + "px";
                else
                    this.$["content"].style.minHeight = detail.height + "px";
            }
            else {
                if (this._currentOrientation == "vertical")
                    this.$["content"].style.width = detail.width + "px";
                else
                    this.$["content"].style.height = detail.height + "px";
            }

            e.stopPropagation();
        }

        private _catchContentClick(e?: Event) {
            if (this.sticky)
                e.stopPropagation();
        }

        private _contentMouseEnter(e: MouseEvent) {
            if (this._closeOnMoveoutTimer) {
                var content = this.$["content"];
                if (e.srcElement != content)
                    return;

                clearTimeout(this._closeOnMoveoutTimer);
                this._closeOnMoveoutTimer = undefined;
            }
        }

        private _contentMouseLeave(e: MouseEvent) {
            var content = this.$["content"];
            if (e.srcElement != content)
                return;

            if (!this.openOnHover && !this.sticky) {
                this._closeOnMoveoutTimer = setTimeout(() => {
                    this.close();
                }, 300);
            }
        }

        private _contentMousemove(e: MouseEvent) {
            if (this.open)
                e.stopPropagation();
        }

        private _hasHeader(header: string): boolean {
            return header != null && header.length > 0;
        }

        static closeAll() {
            var rootPopup = Popup._openPopups[0];
            if (rootPopup)
                rootPopup.close();
        }
    }

    WebComponent.register(Popup, WebComponents, "vi", {
        properties: {
            open: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            sticky: {
                type: Boolean,
                reflectToAttribute: true
            },
            autoSizeContent: {
                type: Boolean,
                reflectToAttribute: true
            },
            openOnHover: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            header: String,
            contentAlign: {
                type: String,
                reflectToAttribute: true
            }
        },
        observers: [
            "_hookTapAndHoverEvents(isAttached, openOnHover)"
        ],
        listeners: {
            "tap": "_tap"
        }
    });
}
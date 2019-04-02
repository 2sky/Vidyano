namespace Vidyano.WebComponents {
    let _documentClosePopupListener: EventListener;
    document.addEventListener("mousedown", _documentClosePopupListener = e => {
        const path = e.composedPath().slice();
        do {
            const el = path.shift();
            if (!el || el === <any>document) {
                WebComponents.PopupCore.closeAll();
                break;
            }
            else if ((<any>el).__Vidyano_WebComponents_PopupCore__Instance__ && (<WebComponents.PopupCore><any>el).open)
                break;
            else if ((<any>el).popup && (<any>el).popup.__Vidyano_WebComponents_PopupCore__Instance__ && (<WebComponents.PopupCore>(<any>el).popup).open)
                break;
        }
        while (true);
    });
    document.addEventListener("touchstart", _documentClosePopupListener);

    @WebComponent.register({
        properties: {
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            },
            open: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                notify: true
            },
            sticky: {
                type: Boolean,
                reflectToAttribute: true
            },
            contentAlign: {
                type: String,
                reflectToAttribute: true
            },
            orientation: {
                type: String,
                reflectToAttribute: true,
                value: "auto"
            },
            hover: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true,
                observer: "_hoverChanged"
            },
            closeDelay: {
                type: Number,
                value: 500
            }
        }
    })
    export class PopupCore extends WebComponent {
        private static _isBuggyGetBoundingClientRect: boolean;
        private static _openPopups: Vidyano.WebComponents.PopupCore[] = [];

        private __Vidyano_WebComponents_PopupCore__Instance__ = true;
        private _resolver: Function;
        private _closeOnMoveoutTimer: number;
        private _currentTarget: HTMLElement | WebComponent;
        private _currentContent: HTMLElement;
        protected _currentOrientation: string;
        readonly open: boolean; protected _setOpen: (val: boolean) => void;
        readonly hover: boolean; private _setHover: (val: boolean) => void;
        orientation: string;
        contentAlign: string;
        disabled: boolean;
        sticky: boolean;
        boundingTarget: HTMLElement;
        closeDelay: number;

        popup(target: HTMLElement | WebComponent): Promise<any> {
            if (this.open)
                return Promise.resolve();

            return new Promise(resolve => {
                this._resolver = resolve;
                this._open(target);
            });
        }

        protected _open(target: HTMLElement | WebComponent, content: HTMLElement = this) {
            this._currentOrientation = this.orientation.toUpperCase() === "AUTO" ? !this._findParentPopup() ? "vertical" : "horizontal" : this.orientation.toLowerCase();

            if (this.open || this.hasAttribute("disabled") || this.fire("popup-opening", null, { bubbles: false, cancelable: true }).defaultPrevented)
                return;

            // Close non-parent popups
            const parentPopup = this._findParentPopup();
            const firstOpenNonParentChild = PopupCore._openPopups[parentPopup == null ? 0 : PopupCore._openPopups.indexOf(parentPopup) + 1];
            if (firstOpenNonParentChild != null)
                firstOpenNonParentChild.close();

            // Position content
            const {targetRect, transformedRect} = this._getTargetRect(<HTMLElement>target);
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const contentWidth = content.offsetWidth;
            const contentHeight = content.offsetHeight;

            let boundWidth = windowWidth;
            let boundHeight = windowHeight;
            let boundLeft = 0;
            if (this.boundingTarget) {
                const boundTargetRectInfo = this._getTargetRect(this.boundingTarget);
                boundWidth = boundTargetRectInfo.targetRect.right;
                boundHeight = boundTargetRectInfo.targetRect.bottom;
                boundLeft = boundTargetRectInfo.targetRect.left;

                if (boundTargetRectInfo.transformedRect) {
                    boundWidth += boundTargetRectInfo.transformedRect.right;
                    boundHeight += boundTargetRectInfo.transformedRect.bottom;
                    boundLeft += boundTargetRectInfo.transformedRect.left;
                }
            }

            const alignments = (this.contentAlign || "").toUpperCase().split(" ");
            const alignCenter = alignments.indexOf("CENTER") >= 0;
            const alignRight = alignments.indexOf("RIGHT") >= 0;

            let maxContentHeight = "none";
            if (this._currentOrientation === "vertical") {
                if (alignRight ? (targetRect.right + (transformedRect ? transformedRect.right : 0) - contentWidth) < 0 : targetRect.left + (transformedRect ? transformedRect.left : 0) + contentWidth <= boundWidth) {
                    // Left-align
                    let left = targetRect.left;
                    if (this.boundingTarget && transformedRect && (left + transformedRect.left < boundLeft))
                        left += boundLeft - left - transformedRect.left;

                    if (alignments.indexOf("CENTER") >= 0)
                        left = Math.max(0, left - contentWidth / 2 + targetRect.width / 2);

                    content.style.left = left + "px";
                    content.style.right = "auto";

                    content.classList.add("left");
                    content.classList.remove("right");
                }
                else {
                    // Right-align
                    content.style.left = "auto";

                    let right = (!transformedRect ? windowWidth : transformedRect.width) - (targetRect.left + targetRect.width);
                    if (this.boundingTarget)
                        right += (transformedRect ? transformedRect.left : 0) + targetRect.left + targetRect.width - boundWidth;

                    if (right < 0)
                        right = 0;

                    content.style.right = right + "px";
                    content.classList.add("right");
                    content.classList.remove("left");
                }

                if (targetRect.top + targetRect.height + contentHeight < boundHeight || targetRect.top - contentHeight < 0) {
                    // Top-align
                    content.style.top = (targetRect.top + targetRect.height) + "px";
                    content.style.bottom = "auto";

                    content.classList.add("top");
                    content.classList.remove("bottom");

                    maxContentHeight = `${boundHeight - targetRect.top - targetRect.height}px`;
                }
                else {
                    // Bottom-align
                    content.style.top = "auto";
                    const bottom = Math.max(windowHeight - targetRect.top, 0);
                    content.style.bottom = `${bottom}px`;

                    content.classList.add("bottom");
                    content.classList.remove("top");

                    maxContentHeight = `${windowHeight - bottom}px`;
                }
            }
            else if (this._currentOrientation === "horizontal") {
                if (alignRight ? (targetRect.right - contentWidth) < 0 : targetRect.left + targetRect.width + contentWidth <= boundWidth) {
                    // Left-align
                    content.style.left = (targetRect.left + targetRect.width) + "px";
                    content.style.right = "auto";

                    content.classList.add("left");
                    content.classList.remove("right");
                }
                else {
                    // Right-align
                    content.style.left = "auto";
                    content.style.right = Math.max(windowWidth - targetRect.left, 0) + "px";

                    content.classList.add("right");
                    content.classList.remove("left");
                }

                content.style.top = targetRect.top + "px";
                content.style.bottom = "auto";

                content.classList.add("top");
                content.classList.remove("bottom");

                if (targetRect.top + contentHeight > boundHeight || targetRect.top + contentHeight > windowHeight) {
                    let newTop = Math.min(boundHeight, windowHeight) - contentHeight;
                    if (newTop < 0) {
                        newTop = 0;
                        maxContentHeight = `${Math.min(boundHeight, windowHeight)}px`;
                    }

                    content.style.top = `${newTop}px`;
                }
            }

            const contentChild = <HTMLElement>this.querySelector("[content]");
            if (contentChild) {
                const definedMaxHeight = parseInt(getComputedStyle(contentChild).maxHeight);
                if (isNaN(definedMaxHeight) || definedMaxHeight > parseInt(maxContentHeight))
                    contentChild.style.maxHeight = maxContentHeight;
            }

            this._currentTarget = target;
            this._currentContent = content;

            this._setOpen(true);
            PopupCore._openPopups.push(this);

            this.fire("popup-opened", null, { bubbles: false, cancelable: false });
        }

        protected _getTargetRect(target: HTMLElement): { targetRect: ClientRect, transformedRect?: ClientRect } {
            let targetRect = target.getBoundingClientRect();
            if (target === this) {
                targetRect = {
                    left: targetRect.left,
                    top: targetRect.top,
                    bottom: targetRect.top,
                    right: targetRect.left,
                    width: 0,
                    height: 0
                };
            }

            if (PopupCore._isBuggyGetBoundingClientRect === undefined) {
                const outer = document.createElement("div");
                outer.style.webkitTransform = outer.style.transform = "translate(-100px, -100px)";

                const inner = document.createElement("div");
                inner.style.position = "fixed";

                outer.appendChild(inner);

                document.body.appendChild(outer);
                const outerRect = outer.getBoundingClientRect();
                const innerRect = inner.getBoundingClientRect();
                document.body.removeChild(outer);

                PopupCore._isBuggyGetBoundingClientRect = outerRect.left === innerRect.left;
            }

            if (PopupCore._isBuggyGetBoundingClientRect) {
                let parent = this.findParent(p => p === target) != null ? target.parentElement : this.parentElement;
                while (parent != null) {
                    const computedStyle = getComputedStyle(parent, null),
                        transform = <string>(computedStyle.transform || computedStyle.webkitTransform);

                    if (transform.startsWith("matrix")) {
                        const transformedParentRect = parent.getBoundingClientRect();

                        return {
                            targetRect: {
                                top: targetRect.top - transformedParentRect.top,
                                left: targetRect.left - transformedParentRect.left,
                                right: targetRect.right - transformedParentRect.right,
                                bottom: targetRect.bottom - transformedParentRect.bottom,
                                width: targetRect.width,
                                height: targetRect.height
                            },
                            transformedRect: transformedParentRect
                        };
                    }

                    parent = parent.parentElement;
                }
            }

            return { targetRect: targetRect };
        }

        close() {
            if (!this.open || this.fire("popup-closing", null, { bubbles: false, cancelable: true }).defaultPrevented)
                return;

            if (!this.open && this._closeOnMoveoutTimer) {
                clearTimeout(this._closeOnMoveoutTimer);
                this._closeOnMoveoutTimer = undefined;
            }

            const openChild = PopupCore._openPopups[PopupCore._openPopups.indexOf(this) + 1];
            if (openChild != null)
                openChild.close();

            this._currentTarget = this._currentContent = null;
            this._setOpen(false);
            this._setHover(false);

            if (this._resolver)
                this._resolver();

            PopupCore._openPopups.remove(this);

            this.fire("popup-closed", null, { bubbles: false, cancelable: false });
        }

        protected _findParentPopup(): Popup {
            let element = this.parentNode;
            while (element != null && PopupCore._openPopups.indexOf(<any>element) === -1)
                element = (<any>element).host || element.parentNode;

            return <Popup><any>element;
        }

        private _catchContentClick(e?: Event) {
            if (this.sticky)
                e.stopPropagation();
        }

        protected _contentMouseEnter(e: MouseEvent) {
            if (this._setHover)
                this._setHover(true);

            if (this._closeOnMoveoutTimer) {
                clearTimeout(this._closeOnMoveoutTimer);
                this._closeOnMoveoutTimer = undefined;
            }
        }

        protected _contentMouseLeave(e: MouseEvent) {
            if (e.relatedTarget == null) {
                e.stopPropagation();
                return;
            }

            if (!this.sticky) {
                this._closeOnMoveoutTimer = setTimeout(() => {
                    this.close();
                }, this.closeDelay);
            }
        }

        private _hoverChanged(hover: boolean) {
            if (!this._currentTarget)
                return;

            if (hover)
                this._currentTarget.setAttribute("hover", "");
            else
                this._currentTarget.removeAttribute("hover");
        }

        static closeAll(parent?: HTMLElement | WebComponent) {
            const rootPopup = PopupCore._openPopups[0];
            if (rootPopup && (!parent || PopupCore._isDescendant(<HTMLElement>parent, rootPopup)))
                rootPopup.close();
        }

        private static _isDescendant(parent: HTMLElement, child: HTMLElement): boolean {
            let node = child.parentNode;
            while (node != null) {
                if (node === parent)
                    return true;

                node = node.parentNode;
            }

            return false;
        }
    }

    @WebComponent.register({
        properties: {
            autoSizeContent: {
                type: Boolean,
                reflectToAttribute: true
            },
            openOnHover: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            closeDelay: {
                type: Number,
                value: 500
            }
        },
        observers: [
            "_hookTapAndHoverEvents(isConnected, openOnHover)"
        ],
        listeners: {
            "tap": "_tap"
        }
    })
    export class Popup extends PopupCore {
        private _tapHandler: EventListener;
        private _enterHandler: EventListener;
        private _leaveHandler: EventListener;
        private _header: HTMLElement;
        autoSizeContent: boolean;
        openOnHover: boolean;

        popup(): Promise<any> {
            return super.popup(this._header);
        }

        protected _open(target: HTMLElement | WebComponent) {
            super._open(target, this.$.content);

            const rootSizeTracker = <WebComponents.SizeTracker><any>this.$.toggleSizeTracker;
            rootSizeTracker.measure();
        }

        private _hookTapAndHoverEvents() {
            this._header = <HTMLElement>this.shadowRoot.querySelector("[toggle]") || this.parentElement;

            if (this._header === this.parentElement)
                (<any>this._header).popup = this;

            if (this.isConnected) {
                if (this.openOnHover) {
                    this._header.addEventListener("mouseenter", this._enterHandler = this._onOpen.bind(this));
                    this.addEventListener("mouseleave", this._leaveHandler = this.close.bind(this));
                }
                else
                    this._header.addEventListener("tap", this._tapHandler = this._tap.bind(this));
            }
            else {
                if (this._enterHandler) {
                    this._header.removeEventListener("mouseenter", this._enterHandler);
                    this._enterHandler = undefined;
                }

                if (this._leaveHandler) {
                    this.removeEventListener("mouseleave", this._leaveHandler);
                    this._leaveHandler = undefined;
                }

                if (this._tapHandler) {
                    this._header.removeEventListener("tap", this._tapHandler);
                    this._tapHandler = undefined;
                }
            }
        }

        private _tap(e: CustomEvent) {
            if (this.disabled)
                return;

            if (this.open) {
                if (!this.sticky)
                    this.close();

                return;
            }

            const path = e.composedPath().slice();
            do {
                if (this._header !== path.shift())
                    continue;

                this._onOpen(e);

                e.stopPropagation();
                break;
            }
            while (path.length);
        }

        private _onOpen(e: Event) {
            if (!this.open)
                this._open(this._header);

            e.stopPropagation();
            e.preventDefault();
        }

        protected _contentMouseLeave(e: MouseEvent) {
            if (this.openOnHover)
                return;

            super._contentMouseLeave(e);
        }

        private _toggleSizeChanged(e: Event, detail: { width: number; height: number }) {
            if (!this.autoSizeContent) {
                if (this._currentOrientation === "vertical") {
                    let minWidth = detail.width;
                    if (this.boundingTarget) {
                        const maxWidth = this._getTargetRect(this.boundingTarget).targetRect.width;
                        if (maxWidth > 0) {
                            this.$.content.style.maxWidth = maxWidth + "px";

                            if (minWidth > maxWidth)
                                minWidth = maxWidth;
                        }
                        else
                            this.$.content.style.maxWidth = "initial";
                    }

                    this.$.content.style.minWidth = minWidth + "px";
                }
                else
                    this.$.content.style.minHeight = detail.height + "px";
            }
            else {
                if (this._currentOrientation === "vertical") {
                    if (this.boundingTarget)
                        this.$.content.style.maxWidth = this._getTargetRect(this.boundingTarget).targetRect.width + "px";

                    this.$.content.style.width = detail.width + "px";
                }
                else
                    this.$.content.style.height = detail.height + "px";
            }

            e.stopPropagation();
        }

        static closeAll(parent?: HTMLElement | WebComponent) {
            PopupCore.closeAll(parent);
        }
    }
}

namespace Vidyano.WebComponents {
    type SlideInState = "closed" | "opening" | "open" | "closing";
    export type SlideInDirection = "ltr" | "rtl";

    export const SlideInProperties = {
        properties: {
            open: {
                type: Boolean,
                reflectToAttribute: true,
                value: false,
                notify: true
            },
            state: {
                type: String,
                reflectToAttribute: true,
                readOnly: true,
                value: "closed"
            },
            direction: {
                type: String,
                reflectToAttribute: true,
                value: "rtl"
            }
        },
        observers: [
            "_updateVisibility(open, state)"
        ],
        keybindings: {
            "esc": "close"
        },
        hostAttributes: {
            "vi-slide-in": ""
        }
    }

    @Vidyano.WebComponents.WebComponent.register(SlideInProperties)
    export class SlideIn extends Vidyano.WebComponents.WebComponent {
        readonly state: SlideInState; private _setState: (state: SlideInState) => void;
        open: boolean;
        direction: SlideInDirection;

        attached() {
            const content = document.createElement("div");
            content.id = "content";
            content.className = "flex layout horizontal";

            Polymer.dom(this.root).appendChild(content);
            Polymer.dom(this.root).children.filter(child => child !== content).forEach(child => content.appendChild(child));

            super.attached();
        }

        private _updateVisibility(open: boolean, state: SlideInState) {
            if (open && state === "open")
                return;

            if (!open && state === "closed")
                return;

            if (open) {
                if (state === "closed")
                    this._setState("opening");
                else if (state === "opening") {
                    setTimeout(() => {
                        if (open && state === "opening")
                            this._setState("open");
                    }, 300);
                }
            }
            else {
                if (state === "open") {
                    this.customStyle["--vi-slide-in--closing-width"] = `${this.offsetWidth}px`;
                    this.updateStyles();

                    this._setState("closing");
                }
                else if (state === "closing") {
                    setTimeout(() => {
                        if (!open && state === "closing")
                            this._setState("closed");
                    }, 200);
                }
            }
        }

        private close() {
            this.open = false;
        }
    }
}
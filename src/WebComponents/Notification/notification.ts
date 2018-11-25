namespace Vidyano.WebComponents {
    "use strict";

    const findUriLabel = /\[url:([^|]+)\|((https?:\/\/[-\w]+(\.[-\w]+)*(:\d+)?(\/#?!?[^\.\s]*(\.[^\.\s]+)*)?)|(#!\/)?[^\]]+)]/g;
    const findUri = /(https?:\/\/[-\w]+(\.[-\w]+)*(:\d+)?(\/#?!?[^\.\s]*(\.[^\.\s]+)*)?)/g;
    const findNewLine = /\r?\n|\r/g;

    @WebComponent.register({
        properties: {
            serviceObject: Object,
            type: {
                type: Number,
                reflectToAttribute: true,
                computed: "serviceObject.notificationType"
            },
            text: {
                type: String,
                notify: true,
                observer: "_textChanged",
                computed: "_computeText(serviceObject.notification)",
                value: null
            },
            hidden: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHidden(text, serviceObject.notificationDuration)",
                value: true
            },
            icon: {
                type: String,
                computed: "_computeIcon(type)"
            },
            isOverflowing: {
                type: Boolean,
                readOnly: true
            },
            noClose: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        forwardObservers: [
            "serviceObject.notification",
            "serviceObject.notificationType",
            "serviceObject.notificationDuration"
        ]
    })
    export class Notification extends WebComponent {
        readonly isOverflowing: boolean; private _setIsOverflowing: (val: boolean) => void;
        serviceObject: Vidyano.ServiceObjectWithActions;
        type: string;
        text: string;

        private _close() {
            this.serviceObject.setNotification(null);
        }

        private _moreInfo(e: Event) {
            if (!this.isOverflowing || (<HTMLElement>e.target).tagName === "A")
                return;

            this.app.showMessageDialog({
                title: this.app.translateMessage(this.type),
                titleIcon: `Notification_${this.type}`,
                message: this.text.replace(findNewLine, "<br />").replace(/class="style-scope vi-notification"/g, "class=\"style-scope vi-message-dialog\""),
                rich: true,
                actions: [this.translations.OK]
            });
        }

        private _trackerSizeChanged(e: Event) {
            this._setTextOverflow();

            e.stopPropagation();
        }

        private _textChanged() {
            this._setTextOverflow();
        }

        private _setTextOverflow() {
            if (!this.text)
                return;

            const text = <HTMLSpanElement>this.$.text;

            if (this.text.contains("<br>"))
                this._setIsOverflowing(true);
            else {
                text.innerHTML = this.text;
                this._setIsOverflowing(text.offsetWidth < text.scrollWidth);
            }

            text.style.cursor = this.isOverflowing ? "pointer" : "auto";
        }

        private _computeText(notification: string): string {
            if (!notification)
                return null;

            const html = this._escapeHTML(notification).replace(findUriLabel, "<a class=\"style-scope vi-notification\" href=\"$2\" title=\"\">$1</a>");
            if (notification === html)
                return notification.replace(findUri, "<a class=\"style-scope vi-notification\" href=\"$1\" title=\"\">$1</a>");

            return html;
        }

        private _textInline(text: string): string {
            return text && text.replace(/<br>/g, " ");
        }

        private _computeHidden(text: string, duration: number): boolean {
            return text == null || duration > 0;
        }

        private _computeIcon(type: NotificationType): string {
            return `Notification_${this.type}`;
        }
    }
}
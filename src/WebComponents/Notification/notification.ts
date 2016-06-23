namespace Vidyano.WebComponents {
    "use strict";

    const findUriLabel = /\[url:([^|]+)\|((https?:\/\/[-\w]+(\.[-\w]+)*(:\d+)?(\/#?!?[^\.\s]*(\.[^\.\s]+)*)?)|#!\/[^\]]+)]/g;
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
                computed: "_computeText(serviceObject.notification)"
            },
            shown: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeShown(text)"
            },
            icon: {
                type: String,
                computed: "_computeIcon(type)"
            },
            isOverflowing: {
                type: Boolean,
                readOnly: true
            }
        },
        forwardObservers: [
            "serviceObject.notification",
            "serviceObject.notificationType"
        ]
    })
    export class Notification extends WebComponent {
        serviceObject: Vidyano.ServiceObjectWithActions;
        isOverflowing: boolean;
        type: string;
        text: string;

        private _setIsOverflowing: (val: boolean) => void;

        private _close() {
            this.serviceObject.setNotification(null);
        }

        private _moreInfo(e: Event) {
            if (this.isOverflowing) {
                let header: string;
                let headerIcon: string;
                switch (this._getIconType(this.type)) {
                    case NotificationType.Error: {
                        header = this.app.translateMessage(NotificationType[NotificationType.Error]);
                        headerIcon = NotificationType[NotificationType.Error];
                        break;
                    }
                    case NotificationType.Notice: {
                        header = this.app.translateMessage(NotificationType[NotificationType.Notice]);
                        headerIcon = NotificationType[NotificationType.Notice];
                        break;
                    }
                    case NotificationType.OK: {
                        header = this.app.translateMessage(NotificationType[NotificationType.OK]);
                        headerIcon = NotificationType[NotificationType.OK];
                        break;
                    }
                    case NotificationType.Warning: {
                        header = this.app.translateMessage(NotificationType[NotificationType.Warning]);
                        headerIcon = NotificationType[NotificationType.Warning];
                        break;
                    }
                }

                this.app.showMessageDialog({
                    title: header,
                    titleIcon: "Notification_" + headerIcon,
                    message: this.text.replace(findNewLine, "<br />").replace(/class="style-scope vi-notification"/g, "class=\"style-scope vi-message-dialog\""),
                    rich: true,
                    actions: [this.translations.OK]
                });
            }
        }

        private _trackerSizeChanged(e: Event) {
            this._setTextOverflow();

            e.stopPropagation();
        }

        private _textChanged() {
            this._setTextOverflow();
        }

        private _setTextOverflow() {
            const text = <HTMLSpanElement>this.$["text"];
            text.innerHTML = this.text;
            this._setIsOverflowing(text.offsetWidth < text.scrollWidth);
            text.style.cursor = this.isOverflowing ? "pointer" : "auto";
        }

        private _computeText(notification: string): string {
            if (notification) {
                notification = this._escapeHTML(notification);

                const html2 = notification.replace(findUriLabel, "<a class=\"style-scope vi-notification\" href=\"$2\" title=\"\">$1</a>");
                if (notification === html2)
                    notification = notification.replace(findUri, "<a class=\"style-scope vi-notification\" href=\"$1\" title=\"\">$1</a>");
                else
                    notification = html2;
            }

            return notification;
        }

        private _computeShown(text: string): boolean {
            return text ? true : false;
        }

        private _getIconType(type: NotificationType | string): NotificationType {
            switch (type) {
                case NotificationType[NotificationType.Error]:
                case NotificationType.Error:
                    return NotificationType.Error;
                case NotificationType[NotificationType.Notice]:
                case NotificationType.Notice:
                    return NotificationType.Notice;
                case NotificationType[NotificationType.OK]:
                case NotificationType.OK:
                    return NotificationType.OK;
                case NotificationType[NotificationType.Warning]:
                case NotificationType.Warning:
                    return NotificationType.Warning;
            }
        }

        private _computeIcon(type: NotificationType | string): string {
            switch (this._getIconType(type)) {
                case NotificationType.Error:
                    return "Notification_Error";
                case NotificationType.Notice:
                    return "Notification_Notice";
                case NotificationType.OK:
                    return "Notification_OK";
                case NotificationType.Warning:
                    return "Notification_Warning";
            }
        }
    }
}
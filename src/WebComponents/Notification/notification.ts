module Vidyano.WebComponents {
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
                var header: string;
                var headerIcon: string;
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
                    titleIcon: "Icon_Notification_" + headerIcon,
                    message: this.text,
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
            var text = <HTMLSpanElement>this.$["text"];
            this._setIsOverflowing(text.offsetWidth < text.scrollWidth);
            this.$["text"].style.cursor = this.isOverflowing ? "pointer" : "auto";
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
                    return "Icon_Notification_Error";
                case NotificationType.Notice:
                    return "Icon_Notification_Notice";
                case NotificationType.OK:
                    return "Icon_Notification_OK";
                case NotificationType.Warning:
                    return "Icon_Notification_Warning";
            }
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Notification, Vidyano.WebComponents, "vi", {
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
                computed: "serviceObject.notification"
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
    });
}
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var Notification = (function (_super) {
            __extends(Notification, _super);
            function Notification() {
                _super.apply(this, arguments);
            }
            Notification.prototype._close = function () {
                this.serviceObject.setNotification(null);
            };
            Notification.prototype._moreInfo = function (e) {
                if (this.isOverflowing) {
                    var header;
                    var headerIcon;
                    switch (this._getIconType(this.type)) {
                        case Vidyano.NotificationType.Error: {
                            header = this.app.translateMessage(Vidyano.NotificationType[Vidyano.NotificationType.Error]);
                            headerIcon = Vidyano.NotificationType[Vidyano.NotificationType.Error];
                            break;
                        }
                        case Vidyano.NotificationType.Notice: {
                            header = this.app.translateMessage(Vidyano.NotificationType[Vidyano.NotificationType.Notice]);
                            headerIcon = Vidyano.NotificationType[Vidyano.NotificationType.Notice];
                            break;
                        }
                        case Vidyano.NotificationType.OK: {
                            header = this.app.translateMessage(Vidyano.NotificationType[Vidyano.NotificationType.OK]);
                            headerIcon = Vidyano.NotificationType[Vidyano.NotificationType.OK];
                            break;
                        }
                        case Vidyano.NotificationType.Warning: {
                            header = this.app.translateMessage(Vidyano.NotificationType[Vidyano.NotificationType.Warning]);
                            headerIcon = Vidyano.NotificationType[Vidyano.NotificationType.Warning];
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
            };
            Notification.prototype._trackerSizeChanged = function (e) {
                this._setTextOverflow();
                e.stopPropagation();
            };
            Notification.prototype._textChanged = function () {
                this._setTextOverflow();
            };
            Notification.prototype._setTextOverflow = function () {
                var text = this.$["text"];
                this._setIsOverflowing(text.offsetWidth < text.scrollWidth);
                this.$["text"].style.cursor = this.isOverflowing ? "pointer" : "auto";
            };
            Notification.prototype._computeShown = function (text) {
                return text ? true : false;
            };
            Notification.prototype._getIconType = function (type) {
                switch (type) {
                    case Vidyano.NotificationType[Vidyano.NotificationType.Error]:
                    case Vidyano.NotificationType.Error:
                        return Vidyano.NotificationType.Error;
                    case Vidyano.NotificationType[Vidyano.NotificationType.Notice]:
                    case Vidyano.NotificationType.Notice:
                        return Vidyano.NotificationType.Notice;
                    case Vidyano.NotificationType[Vidyano.NotificationType.OK]:
                    case Vidyano.NotificationType.OK:
                        return Vidyano.NotificationType.OK;
                    case Vidyano.NotificationType[Vidyano.NotificationType.Warning]:
                    case Vidyano.NotificationType.Warning:
                        return Vidyano.NotificationType.Warning;
                }
            };
            Notification.prototype._computeIcon = function (type) {
                switch (this._getIconType(type)) {
                    case Vidyano.NotificationType.Error:
                        return "Icon_Notification_Error";
                    case Vidyano.NotificationType.Notice:
                        return "Icon_Notification_Notice";
                    case Vidyano.NotificationType.OK:
                        return "Icon_Notification_OK";
                    case Vidyano.NotificationType.Warning:
                        return "Icon_Notification_Warning";
                }
            };
            return Notification;
        })(WebComponents.WebComponent);
        WebComponents.Notification = Notification;
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
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

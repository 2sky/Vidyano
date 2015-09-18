var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var findUriLabel = /\[url:([^|]+)\|((https?:\/\/[-\w]+(\.[-\w]+)*(:\d+)?(\/#?!?[^\.\s]*(\.[^\.\s]+)*)?)|#!\/[^\]]+)]/g;
        var findUri = /(https?:\/\/[-\w]+(\.[-\w]+)*(:\d+)?(\/#?!?[^\.\s]*(\.[^\.\s]+)*)?)/g;
        var findNewLine = /\r?\n|\r/g;
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
                        titleIcon: "Notification_" + headerIcon,
                        message: this.text.replace(findNewLine, "<br />").replace(/class="style-scope vi-notification"/g, "class=\"style-scope vi-message-dialog\""),
                        html: true,
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
                text.innerHTML = this.text;
                this._setIsOverflowing(text.offsetWidth < text.scrollWidth);
                text.style.cursor = this.isOverflowing ? "pointer" : "auto";
            };
            Notification.prototype._computeText = function (notification) {
                if (notification) {
                    var html2 = notification.replace(findUriLabel, "<a class=\"style-scope vi-notification\" href=\"$2\" title=\"\">$1</a>");
                    if (notification == html2)
                        notification = notification.replace(findUri, "<a class=\"style-scope vi-notification\" href=\"$1\" title=\"\">$1</a>");
                    else
                        notification = html2;
                }
                return notification;
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
                        return "Notification_Error";
                    case Vidyano.NotificationType.Notice:
                        return "Notification_Notice";
                    case Vidyano.NotificationType.OK:
                        return "Notification_OK";
                    case Vidyano.NotificationType.Warning:
                        return "Notification_Warning";
                }
            };
            Notification = __decorate([
                WebComponents.WebComponent.register({
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
            ], Notification);
            return Notification;
        })(WebComponents.WebComponent);
        WebComponents.Notification = Notification;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

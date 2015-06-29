var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var TimePicker = (function (_super) {
            __extends(TimePicker, _super);
            function TimePicker() {
                _super.apply(this, arguments);
            }
            TimePicker.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._updateTime();
            };
            TimePicker.prototype._timeChanged = function () {
                this._updateTime();
            };
            TimePicker.prototype._tap = function (e, detail, sender) {
                var source;
                if (e.srcElement.tagName == "SPAN") {
                    var parent = e.srcElement.parentNode;
                    if (parent.classList && parent.classList.contains("item"))
                        source = parent;
                }
                else {
                    var parent = e.srcElement;
                    if (parent.classList && parent.classList.contains("item"))
                        source = parent;
                }
                if (!source)
                    return;
                var newTime = new Date();
                if (this.time) {
                    newTime.netOffset(this.time.netOffset());
                    newTime.netType(this.time.netType());
                    newTime.setFullYear(this.time.getFullYear(), this.time.getMonth(), this.time.getDate());
                    newTime.setHours(this.time.getHours(), this.time.getMinutes(), 0, 0);
                }
                else
                    newTime.setHours(0, 0, 0, 0);
                if (this.state == "hours") {
                    this._setHours(parseInt(source.getAttribute("data-hours"), 10));
                    newTime.setHours(this.hours);
                    this.state = "minutes";
                }
                else if (this.state == "minutes") {
                    this._setMinutes(parseInt(source.getAttribute("data-minutes"), 10));
                    newTime.setMinutes(this.minutes);
                }
                this.time = newTime;
                e.stopPropagation();
            };
            TimePicker.prototype._switch = function (e, detail) {
                var target = e.target;
                if (target.classList.contains("hours"))
                    this.state = "hours";
                else if (target.classList.contains("minutes"))
                    this.state = "minutes";
                e.stopPropagation();
            };
            TimePicker.prototype._updateTime = function () {
                var _this = this;
                this._setHours(this.time ? this.time.getHours() : 0);
                this._setMinutes(this.time ? this.time.getMinutes() : 0);
                var items = this.asElement.querySelectorAll(".item");
                [].forEach.apply(items, [function (item) {
                        var hours = parseInt(item.getAttribute("data-hours"), 10);
                        var minutes = parseInt(item.getAttribute("data-minutes"), 10);
                        if (hours == _this.hours || minutes == _this.minutes)
                            item.classList.add("active");
                        else
                            item.classList.remove("active");
                    }]);
            };
            TimePicker.prototype._catchClick = function (e) {
                e.stopPropagation();
            };
            TimePicker.prototype._zeroPrefix = function (n) {
                return n < 10 ? '0' + n : n.toString();
            };
            return TimePicker;
        })(WebComponents.WebComponent);
        WebComponents.TimePicker = TimePicker;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.TimePicker, Vidyano.WebComponents, "vi", {
            properties: {
                time: {
                    type: Date,
                    notify: true,
                    observer: "_timeChanged"
                },
                state: {
                    type: String,
                    reflectToAttribute: true,
                    value: "hours"
                },
                hours: {
                    type: Number,
                    readOnly: true
                },
                minutes: {
                    type: Number,
                    readOnly: true
                }
            },
            listeners: {
                "click": "_catchClick"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

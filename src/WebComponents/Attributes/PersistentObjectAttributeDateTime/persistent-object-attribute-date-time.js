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
        var Attributes;
        (function (Attributes) {
            var PersistentObjectAttributeDateTime = (function (_super) {
                __extends(PersistentObjectAttributeDateTime, _super);
                function PersistentObjectAttributeDateTime() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeDateTime.prototype._dateComponentAttached = function () {
                    this._dateInput = Polymer.dom(this.root).querySelector("#date");
                    this._renderSelectedDate(true, false);
                };
                PersistentObjectAttributeDateTime.prototype._timeComponentAttached = function () {
                    this._timeInput = Polymer.dom(this.root).querySelector("#time");
                    this._renderSelectedDate(false, true);
                };
                PersistentObjectAttributeDateTime.prototype._editingChanged = function () {
                    _super.prototype._editingChanged.call(this);
                    if (!this.editing) {
                        this._dateInput = this._timeInput = undefined;
                        return;
                    }
                    else {
                        this._setHasInvalidDate(false);
                        this._setHasInvalidTime(false);
                    }
                    if (this.hasDateComponent)
                        this._renderSelectedDate(true);
                    if (this.hasTimeComponent)
                        this._renderSelectedDate(false, true);
                };
                PersistentObjectAttributeDateTime.prototype._valueChanged = function (newValue) {
                    _super.prototype._valueChanged.call(this, newValue);
                    if (this.attribute && this.value) {
                        if (this.attribute.type == "Time" || this.attribute.type == "NullableTime") {
                            if (this.value && typeof this.value == "string") {
                                var parts = this.value.split(/[:.]/);
                                var time = new Date();
                                time.setHours(parseInt(parts[1], 10), parseInt(parts[2], 10), parseInt(parts[3], 10), parseInt(parts[4].substr(0, 3), 10));
                                this.selectedDate = time;
                            }
                            else
                                this.selectedDate = null;
                        }
                        else
                            this.selectedDate = this.value;
                    }
                    else
                        this.selectedDate = null;
                    this._syncedSelectedDate = this.selectedDate;
                };
                PersistentObjectAttributeDateTime.prototype._selectedDateChanged = function () {
                    if (this._syncedSelectedDate != this.selectedDate) {
                        if ((!this.hasDateComponent || !this.hasInvalidDate) && (!this.hasTimeComponent || !this.hasInvalidTime)) {
                            if (this.selectedDate != null && (this.attribute.type == "Time" || this.attribute.type == "NullableTime")) {
                                var newTimeValue = StringEx.format("0:{0:D2}:{1:D2}:{2:D2}.{3:D3}0000", this.selectedDate.getHours(), this.selectedDate.getMinutes(), this.selectedDate.getSeconds(), this.selectedDate.getMilliseconds());
                                if (!this.value || this.value.substr(0, newTimeValue.length - 4) != newTimeValue.substr(0, newTimeValue.length - 4))
                                    this.value = newTimeValue;
                            }
                            else
                                this.value = this.selectedDate;
                        }
                    }
                    this._renderSelectedDate();
                };
                PersistentObjectAttributeDateTime.prototype._clear = function () {
                    this.value = null;
                };
                PersistentObjectAttributeDateTime.prototype._renderSelectedDate = function (forceDate, forceTime) {
                    if (!forceDate && !forceTime && this._lastRenderedSelectedDate == this.selectedDate)
                        return;
                    var dateMoment;
                    if (this.selectedDate)
                        dateMoment = moment(this.selectedDate);
                    if (this.hasDateComponent && this._dateInput && !this.hasInvalidDate && (this._lastRenderedSelectedDate != this.selectedDate || forceDate)) {
                        if (dateMoment) {
                            var newDate = dateMoment.format(Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase());
                            if (newDate != this._dateInput.value) {
                                var selectionStart = this._dateInput.selectionStart;
                                var selectionEnd = this._dateInput.selectionEnd;
                                this._dateInput.value = newDate;
                                this._dateInput.selectionStart = selectionStart;
                                this._dateInput.selectionEnd = selectionEnd;
                            }
                        }
                        else
                            this._dateInput.value = this._computeDateFormat();
                    }
                    if (this.hasTimeComponent && this._timeInput && !this.hasInvalidTime && (this._lastRenderedSelectedDate != this.selectedDate || forceTime)) {
                        var newTime = dateMoment ? dateMoment.format("HH" + Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator + "mm") : this._computeTimeFormat();
                        if (newTime != this._timeInput.value) {
                            var selectionStart = this._timeInput.selectionStart;
                            var selectionEnd = this._timeInput.selectionEnd;
                            this._timeInput.value = newTime;
                            this._timeInput.selectionStart = selectionStart;
                            this._timeInput.selectionEnd = selectionEnd;
                        }
                    }
                    this._lastRenderedSelectedDate = this.selectedDate;
                };
                PersistentObjectAttributeDateTime.prototype._dateFilled = function (e, detail) {
                    if (this.hasTimeComponent && this._dateInput.selectionStart == this._dateInput.value.length) {
                        this._timeInput.focus();
                        this._timeInput.selectionStart = 0;
                    }
                    this._isDateFilled = true;
                    this._updateSelectedDate(detail.value);
                    e.stopPropagation();
                };
                PersistentObjectAttributeDateTime.prototype._timeChanged = function (e, detail) {
                    this._selectedDateChanged();
                    e.stopPropagation();
                };
                PersistentObjectAttributeDateTime.prototype._timeFilled = function (e, detail) {
                    this._isTimeFilled = true;
                    this._updateSelectedDate(undefined, detail.value);
                    e.stopPropagation();
                };
                PersistentObjectAttributeDateTime.prototype._updateSelectedDate = function (date, time) {
                    var dateMoment;
                    var timeMoment;
                    var newDate = new Date();
                    if (this.selectedDate) {
                        newDate.setFullYear(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate());
                        newDate.setHours(this.selectedDate.getHours(), this.selectedDate.getMinutes(), this.selectedDate.getSeconds(), this.selectedDate.getMilliseconds());
                        newDate.netOffset(this.selectedDate.netOffset());
                        newDate.netType(this.selectedDate.netType());
                    }
                    if (this.hasDateComponent && this._isDateFilled && date) {
                        dateMoment = moment(date, Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase());
                        this._setHasInvalidDate(!dateMoment.isValid());
                        if (!this.hasInvalidDate)
                            newDate.setFullYear(dateMoment.year(), dateMoment.month(), dateMoment.date());
                    }
                    if (this.hasTimeComponent && this._isTimeFilled && time) {
                        timeMoment = moment(time, "HH:mm");
                        this._setHasInvalidTime(!timeMoment.isValid());
                        if (!this.hasInvalidTime)
                            newDate.setHours(timeMoment.hours(), timeMoment.minutes(), 0, 0);
                    }
                    this.selectedDate = newDate;
                };
                PersistentObjectAttributeDateTime.prototype._computeHasComponent = function (target, component) {
                    return target && target.type.contains(component);
                };
                PersistentObjectAttributeDateTime.prototype._computeDateFormat = function () {
                    return Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toLowerCase().replace(/[ymd]/g, "_");
                };
                PersistentObjectAttributeDateTime.prototype._computeDateSeparator = function () {
                    return Vidyano.CultureInfo.currentCulture.dateFormat.dateSeparator;
                };
                PersistentObjectAttributeDateTime.prototype._computeTimeFormat = function () {
                    return "__" + Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator + "__";
                };
                PersistentObjectAttributeDateTime.prototype._computeTimeSeparator = function () {
                    return Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator;
                };
                PersistentObjectAttributeDateTime.prototype._computeCanClear = function (value, required) {
                    return value != null && !required;
                };
                return PersistentObjectAttributeDateTime;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeDateTime = PersistentObjectAttributeDateTime;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeDateTime, {
                properties: {
                    selectedDate: {
                        type: Object,
                        observer: "_selectedDateChanged"
                    },
                    time: {
                        type: Object
                    },
                    hasDateComponent: {
                        type: Boolean,
                        computed: "_computeHasComponent(attribute, 'Date')"
                    },
                    hasTimeComponent: {
                        type: Boolean,
                        computed: "_computeHasComponent(attribute, 'Time')"
                    },
                    dateFormat: {
                        type: String,
                        computed: "_computeDateFormat(isAttached)"
                    },
                    dateSeparator: {
                        type: String,
                        computed: "_computeDateSeparator(isAttached)"
                    },
                    timeFormat: {
                        type: String,
                        computed: "_computeTimeFormat(isAttached)"
                    },
                    timeSeparator: {
                        type: String,
                        computed: "_computeTimeSeparator(isAttached)"
                    },
                    hasInvalidDate: {
                        type: Boolean,
                        readOnly: true,
                        reflectToAttribute: true
                    },
                    hasInvalidTime: {
                        type: Boolean,
                        readOnly: true,
                        reflectToAttribute: true
                    },
                    canClear: {
                        type: Boolean,
                        computed: "_computeCanClear(attribute.value, attribute.isRequired)"
                    }
                }
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

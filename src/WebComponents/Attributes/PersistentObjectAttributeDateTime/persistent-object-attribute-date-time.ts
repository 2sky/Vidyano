namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
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
                computed: "_computeDateFormat(isConnected)"
            },
            dateSeparator: {
                type: String,
                computed: "_computeDateSeparator(isConnected)"
            },
            timeFormat: {
                type: String,
                computed: "_computeTimeFormat(isConnected)"
            },
            timeSeparator: {
                type: String,
                computed: "_computeTimeSeparator(isConnected)"
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
            },
            monthMode: {
                type: Boolean,
                computed: "_computeMonthMode(attribute.typeHints.displayformat)"
            },
            minDate: {
                type: Object,
                computed: "_computeMinMaxDate(attribute.typeHints.mindate)"
            },
            maxDate: {
                type: Object,
                computed: "_computeMinMaxDate(attribute.typeHints.maxdate)"
            }
        },
        forwardObservers: [
            "attribute.typeHints"
        ]
    })
    export class PersistentObjectAttributeDateTime extends WebComponents.Attributes.PersistentObjectAttribute {
        private _dateInput: HTMLInputElement;
        private _timeInput: HTMLInputElement;
        private _syncedSelectedDate: any;
        private _lastRenderedSelectedDate: any;
        private _isDateFilled: boolean;
        private _isTimeFilled: boolean;
        private _skipBlurRefreshUpdate: boolean;
        readonly hasInvalidTime: boolean; private _setHasInvalidTime: (invalid: boolean) => void;
        readonly hasInvalidDate: boolean; private _setHasInvalidDate: (invalid: boolean) => void;
        readonly hasTimeComponent: boolean;
        readonly hasDateComponent: boolean;
        readonly monthMode: boolean;
        selectedDate: Date;

        get dateInput(): HTMLInputElement {
            return this._dateInput || (this._dateInput = <HTMLInputElement>Polymer.dom(this.root).querySelector("#date"));
        }

        get timeInput(): HTMLInputElement {
            return this._timeInput || (this._timeInput = <HTMLInputElement>Polymer.dom(this.root).querySelector("#time"));
        }

        private _focused(e: FocusEvent) {
            const target = <HTMLInputElement>e.target;

            if ((target.id === "date" && !this._isDateFilled) || (target.id === "time" && !this._isTimeFilled))
                target.selectionStart = target.selectionEnd = 0;
        }

        protected _editingChanged() {
            super._editingChanged();

            Polymer.flush();

            if (this.editing) {
                this._setHasInvalidDate(false);
                this._setHasInvalidTime(false);
            }

            if (this.hasDateComponent)
                this._renderSelectedDate(true);

            if (this.hasTimeComponent)
                this._renderSelectedDate(false, true);
        }

        protected _valueChanged(newValue: any, oldValue: any) {
            super._valueChanged(newValue, oldValue);

            if (this.attribute && this.value) {
                if (this.attribute.type === "Time" || this.attribute.type === "NullableTime") {
                    if (this.value && typeof this.value === "string") {
                        const parts = (<string>this.value).split(/[:.]/);
                        const time = new Date();
                        time.setHours(parseInt(parts[1], 10), parseInt(parts[2], 10), parseInt(parts[3], 10), parseInt(parts[4].substr(0, 3), 10));

                        this.selectedDate = time;
                    }
                    else
                        this.selectedDate = null;
                }
                else
                    this.selectedDate = <Date>this.value;
            }
            else
                this.selectedDate = null;

            this._syncedSelectedDate = this.selectedDate;
        }

        private _selectedDateChanged() {
            if (this._syncedSelectedDate !== this.selectedDate) {
                if ((!this.hasDateComponent || !this.hasInvalidDate) && (!this.hasTimeComponent || !this.hasInvalidTime)) {
                    if (this.selectedDate != null && (this.attribute.type === "Time" || this.attribute.type === "NullableTime")) {
                        const newTimeValue = StringEx.format("0:{0:D2}:{1:D2}:{2:D2}.{3:D3}0000", this.selectedDate.getHours(), this.selectedDate.getMinutes(), this.selectedDate.getSeconds(), this.selectedDate.getMilliseconds());
                        if (!this.value || (<string>this.value).substr(0, newTimeValue.length - 4) !== newTimeValue.substr(0, newTimeValue.length - 4))
                            this.attribute.setValue(newTimeValue, true).catch(Vidyano.noop);
                    }
                    else
                        this.attribute.setValue(this.selectedDate, this.monthMode).catch(Vidyano.noop);
                }
            }

            this._renderSelectedDate();
        }

        private _inputBlur() {
            if (!this._skipBlurRefreshUpdate && this.attribute.isValueChanged && document.activeElement !== this._dateInput && document.activeElement !== this._timeInput)
                this.attribute.setValue(this.selectedDate, true).catch(Vidyano.noop);
        }

        private _clear() {
            this.attribute.setValue(null, true).catch(Vidyano.noop);
        }

        private _renderSelectedDate(forceDate?: boolean, forceTime?: boolean) {
            if (!forceDate && !forceTime && this._lastRenderedSelectedDate === this.selectedDate)
                return;

            let dateMoment: moment.Moment;

            if (this.selectedDate)
                dateMoment = moment(this.selectedDate);

            if (this.hasDateComponent && this.dateInput && !this.hasInvalidDate && (this._lastRenderedSelectedDate !== this.selectedDate || forceDate)) {
                if (dateMoment) {
                    const newDate = dateMoment.format(Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase());
                    if (newDate !== this.dateInput.value) {
                        const selectionStart = this.dateInput.selectionStart;
                        const selectionEnd = this.dateInput.selectionEnd;
                        this.dateInput.value = newDate;

                        if (selectionStart > 0)
                            this.dateInput.selectionStart = selectionStart;

                        if (selectionEnd > 0)
                            this.dateInput.selectionEnd = selectionEnd;
                    }
                }
                else
                    this.dateInput.value = this._computeDateFormat();
            }

            if (this.hasTimeComponent && this.timeInput && !this.hasInvalidTime && (this._lastRenderedSelectedDate !== this.selectedDate || forceTime)) {
                const newTime = dateMoment ? dateMoment.format("HH" + Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator + "mm") : this._computeTimeFormat();
                if (newTime !== this.timeInput.value) {
                    const selectionStart = this.timeInput.selectionStart;
                    const selectionEnd = this.timeInput.selectionEnd;
                    this.timeInput.value = newTime;

                    if (selectionStart > 0)
                        this.timeInput.selectionStart = selectionStart;

                    if (selectionEnd > 0)
                        this.timeInput.selectionEnd = selectionEnd;
                }
            }

            this._lastRenderedSelectedDate = this.selectedDate;
        }

        private _dateFilled(e: Event, detail: any) {
            if (this.hasTimeComponent && this.dateInput.selectionStart === this.dateInput.value.length) {
                try {
                    this._skipBlurRefreshUpdate = true;
                    this.timeInput.focus();
                }
                finally {
                    this._skipBlurRefreshUpdate = false;
                }
                this.timeInput.selectionStart = 0;
            }

            this._isDateFilled = true;
            this._updateSelectedDate(detail.value);

            e.stopPropagation();
        }

        private _timeChanged(e: Event, detail: any) {
            this._selectedDateChanged();

            e.stopPropagation();
        }

        private _timeFilled(e: Event, detail: any) {
            this._isTimeFilled = true;
            this._updateSelectedDate(undefined, detail.value);

            e.stopPropagation();
        }

        private _updateSelectedDate(date: string, time?: string) {
            let dateMoment: moment.Moment;
            let timeMoment: moment.Moment;
            const newDate = new Date();
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
        }

        private _computeHasComponent(target: Vidyano.PersistentObjectAttribute, component: string): boolean {
            return target && target.type.contains(component);
        }

        private _computeDateFormat(): string {
            return Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toLowerCase().replace(/[ymd]/g, "_");
        }

        private _computeDateSeparator(): string {
            return Vidyano.CultureInfo.currentCulture.dateFormat.dateSeparator;
        }

        private _computeTimeFormat(): string {
            return "__" + Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator + "__";
        }

        private _computeTimeSeparator(): string {
            return Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator;
        }

        private _computeCanClear(value: Date, required: boolean): boolean {
            return value != null && !required;
        }

        private _computeMonthMode(displayFormat: string): boolean {
            if (!displayFormat)
                return false;

            return displayFormat === "{0:y}";
        }

        private _computeMinMaxDate(date: string): Date {
            if (!date)
                return null;

            return moment(date, "YYYY-MM-DD").toDate();
        }

        private _previousMonth(e: TapEvent) {
            const selectedDate = this.selectedDate ? moment(this.selectedDate) : moment().startOf("month");
            this.selectedDate = selectedDate.subtract(1, "month").toDate();
        }

        private _nextMonth(e: TapEvent) {
            const selectedDate = this.selectedDate ? moment(this.selectedDate) : moment().startOf("month");
            this.selectedDate = selectedDate.add(1, "month").toDate();
        }
    }
}
namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            selectedDate: Object,
            selectedTime: Object,
            hasDateComponent: {
                type: Boolean,
                computed: "_computeHasComponent(attribute, 'Date', isAttached)"
            },
            hasTimeComponent: {
                type: Boolean,
                computed: "_computeHasComponent(attribute, 'Time', isAttached)"
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
            isInvalid: {
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
        observers: [
            "_selectedDateChanged(selectedDate, hasDateComponent, hasTimeComponent)",
            "_selectedTimeChanged(selectedTime, hasDateComponent, hasTimeComponent)"
        ],
        forwardObservers: [
            "attribute.typeHints"
        ]
    })
    export class PersistentObjectAttributeDateTime extends WebComponents.Attributes.PersistentObjectAttribute {
        private _valueChangedBlock: boolean;
        private _dateInput: HTMLInputElement;
        private _timeInput: HTMLInputElement;
        private _lastRenderedSelectedDate: any;
        private _isDateFilled: boolean;
        private _isTimeFilled: boolean;
        private _skipBlurRefreshUpdate: boolean;
        readonly isInvalid: boolean; private _setIsInvalid: (invalid: boolean) => void;
        readonly hasTimeComponent: boolean;
        readonly hasDateComponent: boolean;
        readonly monthMode: boolean;
        readonly dateFormat: string;
        readonly dateSeparator: string;
        readonly timeFormat: string;
        readonly timeSeparator: string;
        readonly minDate: Date;
        readonly maxDate: Date;
        selectedDate: Date;
        selectedTime: Date;

        get dateInput(): HTMLInputElement {
            if (!this._dateInput) {
                Polymer.dom(this).flush();
                this._dateInput = <HTMLInputElement>Polymer.dom(this.root).querySelector("#date");
            }

            return this._dateInput;
        }

        get timeInput(): HTMLInputElement {
            if (!this._timeInput) {
                Polymer.dom(this).flush();
                this._timeInput = <HTMLInputElement>Polymer.dom(this.root).querySelector("#time");
            }

            return this._timeInput;
        }

        private _focused(e: FocusEvent) {
            const target = <HTMLInputElement>e.target;

            if ((target.id === "date" && !this._isDateFilled) || (target.id === "time" && !this._isTimeFilled))
                target.selectionStart = target.selectionEnd = 0;
        }

        protected _editingChanged() {
            super._editingChanged();

            Polymer.dom(this).flush();

            if (this.editing)
                this._setIsInvalid(false);
        }

        protected _valueChanged(value: Date, oldValue: any) {
            super._valueChanged(value, oldValue);

            try {
                this._valueChangedBlock = true;

                if (this.attribute && value) {
                    this.selectedDate = this.attribute.type.contains("Date") ? value : null;

                    if (this.attribute.type === "Time" || this.attribute.type === "NullableTime") {
                        const parts = (<string>this.value).split(/[:.]/);
                        const startIndex = parts.length - 4;

                        const time = new Date();
                        time.setHours(parseInt(parts[startIndex], 10), parseInt(parts[startIndex + 1], 10), parseInt(parts[startIndex + 2], 10), parseInt(parts[startIndex + 3].substr(0, 3), 10));

                        this.selectedTime = time;
                    }
                    else
                        this.selectedTime = this.attribute.type.contains("Time") ? value : null;
                }
                else
                    this.selectedDate = this.selectedTime = null;
            }
            finally {
                this._setIsInvalid(false);
                this._valueChangedBlock = false;
            }
        }

        private _selectedDateChanged(selectedDate: Date, hasDateComponent: boolean, hasTimeComponent: boolean) {
            if (!hasDateComponent)
                return;

            if (!this._valueChangedBlock) {
                let skipSet: boolean;
                const newValue = new Date(selectedDate.getTime());
                if (this.hasTimeComponent) {
                    if (this.selectedTime)
                        newValue.setHours(this.selectedTime.getHours(), this.selectedTime.getMinutes(), this.selectedTime.getSeconds(), this.selectedTime.getMilliseconds());
                    else if (typeof this.attribute.typeHints.newtime === "string") {
                        const time = this.attribute.typeHints.newtime.split(/[:.]/);
                        while (time.length < 4)
                            time.push("0");

                        newValue.setHours(parseInt(time[0], 10), parseInt(time[1], 10), parseInt(time[2], 10), parseInt(time[3].substr(0, 3), 10));
                    }
                }

                return this._guardedSetValue(newValue);
            }

            if (!this.monthMode) {
                const newDate = selectedDate ? moment(selectedDate).format(Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase()) : this.dateFormat;
                const selectionStart = this.dateInput.selectionStart;
                const selectionEnd = this.dateInput.selectionEnd;

                if (newDate !== this.dateInput.value)
                    this.dateInput.value = newDate;

                if (selectionStart > 0)
                    this.dateInput.selectionStart = selectionStart;

                if (selectionEnd > 0)
                    this.dateInput.selectionEnd = selectionEnd;
            }
        }

        private _selectedTimeChanged(selectedTime: Date, hasDateComponent: boolean, hasTimeComponent: boolean) {
            if (!hasTimeComponent)
                return;

            if (!this._valueChangedBlock) {
                if (hasDateComponent) {
                    if (selectedTime) {
                        const newValue = new Date((this.selectedDate || new Date()).getTime());
                        newValue.setHours(selectedTime.getHours(), this.selectedTime.getMinutes(), selectedTime.getSeconds(), selectedTime.getMilliseconds());

                        return this._guardedSetValue(newValue);
                    }
                }
                else if (selectedTime) {
                    const newTimeValue = StringEx.format("0:{0:D2}:{1:D2}:{2:D2}.{3:D3}0000", selectedTime.getHours(), selectedTime.getMinutes(), selectedTime.getSeconds(), selectedTime.getMilliseconds());
                    if (!this.value || (<string>this.value).substr(0, newTimeValue.length - 4) !== newTimeValue.substr(0, newTimeValue.length - 4))
                        return this._guardedSetValue(newTimeValue);
                }
                else
                    return this._guardedSetValue(null);
            }

            const newTime = selectedTime ? StringEx.format(`{0:D2}${Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator}{1:D2}`, selectedTime.getHours(), selectedTime.getMinutes()) : this.timeFormat;
            const selectionStart = this.timeInput.selectionStart;
            const selectionEnd = this.timeInput.selectionEnd;

            if (newTime !== this.timeInput.value)
                this.timeInput.value = newTime;

            if (selectionStart > 0)
                this.timeInput.selectionStart = selectionStart;

            if (selectionEnd > 0)
                this.timeInput.selectionEnd = selectionEnd;
        }

        private _guardedSetValue(value: Date | string) {
            if (value instanceof Date) {
                if (this.minDate && value < this.minDate)
                    return this._setIsInvalid(true);

                if (this.maxDate && value > this.maxDate)
                    return this._setIsInvalid(true);
            }
            else
                this._setIsInvalid(false);

            this.attribute.setValue(value, document.activeElement !== this.dateInput && document.activeElement !== this.timeInput);
        }

        private _clear() {
            this.attribute.setValue(null, true).catch(Vidyano.noop);
        }

        private _dateFilled(e: Event, detail: IMaskedInputFilled) {
            const dateMoment = moment(detail.value, Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase(), true);
            if (this._isDateFilled = dateMoment.isValid()) {
                this.selectedDate = dateMoment.toDate();

                if (this.hasTimeComponent && this.dateInput.selectionStart === this.dateInput.value.length) {
                    try {
                        this._skipBlurRefreshUpdate = true;
                        if (!this.selectedTime) {
                            this.timeInput.value = this.attribute.typeHints.newTime || moment(new Date()).format("HH:mm");
                            (<MaskedInput><any>this.timeInput).fire("filled", { value: this.timeInput.value });
                        }

                        this.timeInput.focus();
                        this.timeInput.selectionStart = 0;
                        this.timeInput.selectionEnd = this.timeInput.value.length;
                    }
                    finally {
                        this._skipBlurRefreshUpdate = false;
                    }
                }
            }
            else
                this._setIsInvalid(true);

            e.stopPropagation();
        }

        private _timeFilled(e: Event, detail: IMaskedInputFilled) {
            const timeMoment = moment(detail.value, Vidyano.CultureInfo.currentCulture.dateFormat.shortTimePattern, true);

            if (this._isTimeFilled = timeMoment.isValid())
                this.selectedTime = timeMoment.toDate();
            else
                this._setIsInvalid(true);

            e.stopPropagation();
        }

        private _computeHasComponent(target: Vidyano.PersistentObjectAttribute, component: string): boolean {
            Polymer.dom(this).flush();

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
            const selectedDateMoment = this.selectedDate ? moment(this.selectedDate) : moment().startOf("month");
            const newSelectedDate = selectedDateMoment.subtract(1, "month").toDate();
            if (this.minDate && newSelectedDate < this.minDate)
                return;

            this.selectedDate = newSelectedDate;
        }

        private _nextMonth(e: TapEvent) {
            const selectedDateMoment = this.selectedDate ? moment(this.selectedDate) : moment().startOf("month");
            const newSelectedDate = selectedDateMoment.add(1, "month").toDate();
            if (this.maxDate && newSelectedDate > this.maxDate)
                return;

            this.selectedDate = newSelectedDate;
        }
    }
}
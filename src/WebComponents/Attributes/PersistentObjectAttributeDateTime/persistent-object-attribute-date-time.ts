namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            selectedDate: Object,
            selectedTime: Object,
            hasDateComponent: {
                type: Boolean,
                computed: "_computeHasComponent(attribute, 'Date', isConnected)"
            },
            hasTimeComponent: {
                type: Boolean,
                computed: "_computeHasComponent(attribute, 'Time', isConnected)"
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
                computed: "_computeMonthMode(attribute.typeHints)"
            },
            minDate: {
                type: Object,
                computed: "_computeMinMaxDate(attribute.typeHints, 'mindate')"
            },
            maxDate: {
                type: Object,
                computed: "_computeMinMaxDate(attribute.typeHints, 'maxdate')"
            }
        },
        observers: [
            "_selectedDateChanged(selectedDate, hasDateComponent, hasTimeComponent)",
            "_selectedTimeChanged(selectedTime, hasDateComponent, hasTimeComponent)",
            "_renderDate(selectedDate, hasDateComponent, readOnly, editing)",
            "_renderTime(selectedTime, hasDateComponent, hasTimeComponent, readOnly, editing)"
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
        private _pendingRefresh: boolean;
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
                Polymer.flush();

                this._dateInput = <HTMLInputElement>this.shadowRoot.querySelector("input.date");
                const maskedDateInput = MaskedInput({
                    elm: this._dateInput,
                    format: this.dateFormat,
                    sep: this.dateSeparator,
                    onfilled: this._dateFilled.bind(this)
                });
            }

            return this._dateInput;
        }

        get timeInput(): HTMLInputElement {
            if (!this._timeInput) {
                Polymer.flush();

                this._timeInput = <HTMLInputElement>this.shadowRoot.querySelector("input.time");
                const maskedTimeInput = MaskedInput({
                    elm: this._timeInput,
                    format: this.timeFormat,
                    sep: this.timeSeparator,
                    onfilled: this._timeFilled.bind(this)
                });
            }

            return this._timeInput;
        }

        private _focused(e: FocusEvent) {
            const input = <HTMLInputElement>e.target;

            if ((input.id === "date" && !this._isDateFilled) || (input.id === "time" && !this._isTimeFilled))
                input.selectionStart = input.selectionEnd = 0;
        }

        protected _editingChanged() {
            super._editingChanged();

            Polymer.flush();

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
            if (!hasDateComponent || this._valueChangedBlock)
                return;

            if (selectedDate) {
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

                this._guardedSetValue(newValue);
            }
            else
                this._guardedSetValue(null);
        }

        private _selectedTimeChanged(selectedTime: Date, hasDateComponent: boolean, hasTimeComponent: boolean) {
            if (!hasTimeComponent || this._valueChangedBlock)
                return;

            if (hasDateComponent) {
                if (selectedTime) {
                    const newValue = new Date((this.selectedDate || new Date()).getTime());
                    newValue.setHours(selectedTime.getHours(), this.selectedTime.getMinutes(), selectedTime.getSeconds(), selectedTime.getMilliseconds());

                    this._guardedSetValue(newValue);
                }
            }
            else if (selectedTime) {
                const newTimeValue = StringEx.format("0:{0:D2}:{1:D2}:{2:D2}.{3:D3}0000", selectedTime.getHours(), selectedTime.getMinutes(), selectedTime.getSeconds(), selectedTime.getMilliseconds());
                if (!this.value || (<string>this.value).substr(0, newTimeValue.length - 4) !== newTimeValue.substr(0, newTimeValue.length - 4))
                    this._guardedSetValue(newTimeValue);
            }
            else
                this._guardedSetValue(null);
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

            let allowRefresh = this.monthMode;
            if (!allowRefresh && !this.isInvalid) {
                allowRefresh = value && !this.value;
                if (!allowRefresh) {
                    allowRefresh = (this.hasTimeComponent && (<TimePicker>this.shadowRoot.querySelector("#timepicker")).isOpen) || (this.hasDateComponent && (<DatePicker>this.shadowRoot.querySelector("#datepicker")).isOpen);
                    if (!allowRefresh)
                        allowRefresh = document.activeElement !== this.dateInput && document.activeElement !== this.timeInput;
                }
            }

            this._pendingRefresh = this.attribute.triggersRefresh && !allowRefresh;
            this.attribute.setValue(value, allowRefresh);
        }

        private _renderDate(selectedDate: Date, hasDateComponent: boolean, readOnly: boolean, editing: boolean) {
            if (!editing || !hasDateComponent || this.monthMode)
                return;

            let newDate: string;
            if (selectedDate)
                newDate = moment(selectedDate).format(Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase());
            else if (!readOnly)
                newDate = this.dateFormat;
            else
                newDate = "—";

            this._setInputValue(this.dateInput, newDate);
        }

        private _renderTime(selectedTime: Date, hasDateComponent: boolean, hasTimeComponent: boolean, readOnly: boolean, editing: boolean) {
            if (!editing || !hasTimeComponent)
                return;

            let newTime: string;
            if (selectedTime)
                newTime = StringEx.format(`{0:D2}${Vidyano.CultureInfo.currentCulture.dateFormat.timeSeparator}{1:D2}`, selectedTime.getHours(), selectedTime.getMinutes());
            else if (!readOnly)
                newTime = this.timeFormat;
            else
                newTime = hasDateComponent ? "" : "—";

            this._setInputValue(this.timeInput, newTime);
        }

        private _setInputValue(input: HTMLInputElement, value: string) {
            if (input.value === value)
                return;

            const selection = document.activeElement === input ? { start: 0, end: 0 } : null;
            if (selection != null) {
                selection.start = input.selectionStart;
                selection.end = input.selectionEnd;
            }

            input.value = value;

            if (selection != null) {
                if (selection.start > 0)
                    input.selectionStart = selection.start;

                if (selection.end > 0)
                    input.selectionEnd = selection.end;
            }
        }

        private _clear() {
            this.attribute.setValue(null, true).catch(Vidyano.noop);
        }

        private _dateFilled() {
            const dateMoment = moment(this.dateInput.value, Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase(), true);
            if (this._isDateFilled = dateMoment.isValid()) {
                this.selectedDate = dateMoment.toDate();

                if (this.hasTimeComponent && this.dateInput.selectionStart === this.dateInput.value.length) {
                    try {
                        this._skipBlurRefreshUpdate = true;
                        if (!this.selectedTime) {
                            this.timeInput.value = this.attribute.typeHints.newTime || moment(new Date()).format("HH:mm");
                            //(<MaskedInput><any>this.timeInput).fire("filled", { value: this.timeInput.value });
                        }

                        this._focusElement(this.timeInput);
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
        }

        private _timeFilled() {
            const timeMoment = moment(this.timeInput.value, Vidyano.CultureInfo.currentCulture.dateFormat.shortTimePattern, true);

            if (this._isTimeFilled = timeMoment.isValid())
                this.selectedTime = timeMoment.toDate();
            else
                this._setIsInvalid(true);
        }

        private _keydown(e: KeyboardEvent) {
            if (!this.editing || this.readOnly)
                return;

            const input = <HTMLInputElement>e.target;
            if (!input.value)
                return;

            if (input === this.timeInput && (e.keyCode === Vidyano.WebComponents.Keyboard.KeyCodes.backspace || e.keyCode === Vidyano.WebComponents.Keyboard.KeyCodes.leftarrow)) {
                if (input.selectionStart === 0 && input.selectionEnd === 0 && this.hasDateComponent) {
                    this._focusElement(this.dateInput);
                    this.dateInput.selectionStart = this.dateInput.selectionEnd = this.dateInput.value.length;

                    e.stopImmediatePropagation();
                    e.preventDefault();

                    return;
                }
            }

            if (input === this.dateInput && input.value && e.keyCode === Vidyano.WebComponents.Keyboard.KeyCodes.rightarrow) {
                if (input.selectionStart === input.value.length && input.selectionEnd === input.value.length && this.hasTimeComponent) {
                    this._focusElement(this.timeInput);
                    this.timeInput.selectionStart = this.timeInput.selectionEnd = 0;

                    e.stopImmediatePropagation();
                    e.preventDefault();

                    return;
                }
            }

            if (e.keyCode === Vidyano.WebComponents.Keyboard.KeyCodes.backspace && input.selectionStart === 0 && input.selectionEnd === input.value.length) {
                input.value = input === this.dateInput ? this.dateFormat : this.timeFormat;
                input.selectionStart = input.selectionEnd = 0;
            }
        }

        private _keyup(e: KeyboardEvent) {
            if (e.keyCode === Vidyano.WebComponents.Keyboard.KeyCodes.backspace && this.attribute.type.startsWith("Nullable")) {
                if (!this.hasDateComponent || (this.hasDateComponent && this.dateInput.value === this.dateFormat)) {
                    if (!this.hasTimeComponent || (this.hasTimeComponent && this.timeInput.value === this.timeFormat))
                        this._guardedSetValue(null);
                }
            }
        }

        private _blur(e: FocusEvent) {
            if (!this.editing || this.readOnly || e.relatedTarget === this.dateInput || e.relatedTarget === this.timeInput)
                return;

            this._renderDate(this.selectedDate, this.hasDateComponent, this.readOnly, this.editing);
            this._renderTime(this.selectedTime, this.hasDateComponent, this.hasTimeComponent, this.readOnly, this.editing);

            this._setIsInvalid(false);

            if (this._pendingRefresh)
                this._guardedSetValue(this.value);
        }

        private _computeHasComponent(target: Vidyano.PersistentObjectAttribute, component: string): boolean {
            Polymer.flush();
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

        private _computeMonthMode(typeHints: any): boolean {
            if (!typeHints.displayFormat)
                return false;

            return typeHints.displayFormat === "{0:y}";
        }

        private _computeMinMaxDate(typeHints: any, hint: string): Date {
            const date = typeHints[hint];
            if (!date)
                return null;

            return moment(date, "YYYY-MM-DD").toDate();
        }

        private _previousMonth() {
            const selectedDateMoment = this.selectedDate ? moment(this.selectedDate) : moment().startOf("month");
            const newSelectedDate = selectedDateMoment.subtract(1, "month").toDate();
            if (this.minDate && newSelectedDate < this.minDate)
                return;

            this.selectedDate = newSelectedDate;
        }

        private _nextMonth() {
            const selectedDateMoment = this.selectedDate ? moment(this.selectedDate) : moment().startOf("month");
            const newSelectedDate = selectedDateMoment.add(1, "month").toDate();
            if (this.maxDate && newSelectedDate > this.maxDate)
                return;

            this.selectedDate = newSelectedDate;
        }
    }
}
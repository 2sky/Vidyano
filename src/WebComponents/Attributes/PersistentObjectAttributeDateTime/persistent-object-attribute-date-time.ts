module Vidyano.WebComponents.Attributes {
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
    })
    export class PersistentObjectAttributeDateTime extends WebComponents.Attributes.PersistentObjectAttribute {
        private _dateInput: HTMLInputElement;
        private _timeInput: HTMLInputElement;
		private _syncedSelectedDate: any;
		private _lastRenderedSelectedDate: any;
		private _isDateFilled: boolean;
		private _isTimeFilled: boolean;
        hasTimeComponent: boolean;
        hasInvalidTime: boolean;
        hasDateComponent: boolean;
        hasInvalidDate: boolean;
        selectedDate: Date;

        private _setHasInvalidTime: (invalid: boolean) => void;
        private _setHasInvalidDate: (invalid: boolean) => void;

        private _dateComponentAttached() {
            this._dateInput = <HTMLInputElement>Polymer.dom(this.root).querySelector("#date");
            this._renderSelectedDate(true, false);
        }

        private _timeComponentAttached() {
            this._timeInput = <HTMLInputElement>Polymer.dom(this.root).querySelector("#time");
            this._renderSelectedDate(false, true);
        }

        protected _editingChanged() {
            super._editingChanged();

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
        }

        protected _valueChanged(newValue: any) {
            super._valueChanged(newValue);

            if (this.attribute && this.value) {
                if (this.attribute.type == "Time" || this.attribute.type == "NullableTime") {
                    if (this.value && typeof this.value == "string") {
                        var parts = (<string>this.value).split(/[:.]/);
                        var time = new Date();
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
			if (this._syncedSelectedDate != this.selectedDate) {
                if ((!this.hasDateComponent || !this.hasInvalidDate) && (!this.hasTimeComponent || !this.hasInvalidTime)) {
                    if (this.selectedDate != null && (this.attribute.type == "Time" || this.attribute.type == "NullableTime")) {
                        var newTimeValue = StringEx.format("0:{0:D2}:{1:D2}:{2:D2}.{3:D3}0000", this.selectedDate.getHours(), this.selectedDate.getMinutes(), this.selectedDate.getSeconds(), this.selectedDate.getMilliseconds());
                        if (!this.value || (<string>this.value).substr(0, newTimeValue.length - 4) != newTimeValue.substr(0, newTimeValue.length - 4))
                            this.attribute.setValue(newTimeValue, true);
                    }
					else
                        this.attribute.setValue(this.selectedDate, true);
				}
			}

			this._renderSelectedDate();
		}

        private _clear() {
            this.attribute.setValue(null, true);
		}

		private _renderSelectedDate(forceDate?: boolean, forceTime?: boolean) {
			if (!forceDate && !forceTime && this._lastRenderedSelectedDate == this.selectedDate)
                return;

			var dateMoment: moment.Moment;

			if (this.selectedDate)
				dateMoment = moment(this.selectedDate);

            if (this.hasDateComponent && this._dateInput && !this.hasInvalidDate && (this._lastRenderedSelectedDate != this.selectedDate || forceDate)) {
				if (dateMoment) {
					var newDate = dateMoment.format(Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern.toUpperCase());
					if (newDate != this._dateInput.value) {
                        var selectionStart = this._dateInput.selectionStart;
                        var selectionEnd = this._dateInput.selectionEnd;
                        this._dateInput.value = newDate;
                        this._dateInput.selectionStart = selectionStart
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
                    this._timeInput.selectionStart = selectionStart
                    this._timeInput.selectionEnd = selectionEnd;
				}
			}

			this._lastRenderedSelectedDate = this.selectedDate;
		}

        private _dateFilled(e: Event, detail: any) {
			if (this.hasTimeComponent && this._dateInput.selectionStart == this._dateInput.value.length) {
				this._timeInput.focus();
				this._timeInput.selectionStart = 0;
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
			var dateMoment: moment.Moment;
			var timeMoment: moment.Moment;
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
    }
}
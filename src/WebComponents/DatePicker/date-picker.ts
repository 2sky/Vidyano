module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            zoom: {
                type: String,
                reflectToAttribute: true,
                observer: "_zoomChanged"
            },
            selectedDate: {
                type: Object,
                notify: true,
                observer: "_selectedDateChanged"
            }
        },
        listeners: {
            "click": "_catchClick"
        }
    })
    export class DatePicker extends WebComponent {
        private _today = new Date();
        private _daysBody: HTMLElement;
        private _monthsAndYearsBody: HTMLElement;
        private _dayCells: HTMLDivElement[][];
        private _monthsAndYearsCells: HTMLDivElement[];
        private _currentDate: Date;
        private _minYears: number;
        header: string;
        zoom: string;
        selectedDate: Date;

        attached() {
            super.attached();

            if (!this._daysBody) {
                var table = <HTMLTableElement>this.$["days"];
                this._daysBody = table.createTBody();
                this._dayCells = [];

                var fragment = document.createDocumentFragment();
                for (var w = 0; w < 6; w++) {
                    var cells = [];
                    var tr = document.createElement("tr");

                    for (var d = 0; d < 7; d++) {
                        var td = document.createElement("td");

                        var day = document.createElement("div");
                        cells.push(day);

                        td.appendChild(day);
                        tr.appendChild(td);
                    }

                    this._dayCells.push(cells);
                    fragment.appendChild(tr);
                }

                this._daysBody.appendChild(fragment);

                fragment = document.createDocumentFragment();
                for (var i = 0; i < 7; i++) {
                    var th = document.createElement("th");
                    th.textContent = Vidyano.CultureInfo.currentCulture.dateFormat.shortDayNames[i];

                    fragment.appendChild(th);
                }

                table.tHead.appendChild(fragment);
            }

            if (!this._monthsAndYearsBody) {
                this._monthsAndYearsBody = <HTMLElement>this.$["monthsAndYears"];
                this._monthsAndYearsCells = [];

                var fragment = document.createDocumentFragment();
                for (var y = 0; y < 4; y++) {
                    var row = document.createElement("div");
                    row.className = "row flex horizontal layout";

                    for (var d = 0; d < 3; d++) {
                        var year = document.createElement("div");
                        year.className = "col flex";

                        this._monthsAndYearsCells.push(year);
                        row.appendChild(year);
                    }

                    fragment.appendChild(row);
                }

                this._monthsAndYearsBody.appendChild(fragment);
            }

            this.zoom = "days";
        }

        private _zoomChanged() {
            this._render();
        }

        private _selectedDateChanged() {
            this._currentDate = this.selectedDate ? new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()) : null;
            this._render();
        }

        private _render(zoom: string = this.zoom) {
            if (!this._currentDate)
                this._currentDate = new Date();

            var year = this._currentDate.getFullYear();
            var month = this._currentDate.getMonth();
            var day = this._currentDate.getDate();

            if (zoom == "days") {
                this.header = Vidyano.CultureInfo.currentCulture.dateFormat.monthNames[month] + " " + year;

                var totalDays = [31, moment([year]).isLeapYear() ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                var daysInMonth = totalDays[month];
                var firstWeekDay = new Date(year, month, 1).getDay();
                var firstWeekDayIsSunday = Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek == 0;

                var prevMonth = month > 0 ? month - 1 : 11;
                var prevMonthYear = prevMonth == 11 ? this._currentDate.getFullYear() - 1 : this._currentDate.getFullYear();
                var daysInPrevMonth = totalDays[prevMonth];
                var weekDay = (!firstWeekDayIsSunday ? firstWeekDay + 6 : firstWeekDay) % 7;
                for (var i = 0; i < (weekDay > 0 ? weekDay : 7); i++) {
                    var prevDay = daysInPrevMonth - (weekDay - i - 1 + (weekDay > 0 ? 0 : 7));
                    this._dayCells[0][i].textContent = prevDay.toString();
                    this._dayCells[0][i].setAttribute("data-day", prevDay.toString());
                    this._dayCells[0][i].setAttribute("data-month", prevMonth.toString());
                    this._dayCells[0][i].setAttribute("data-year", prevMonthYear.toString());
                    this._dayCells[0][i].className = this._getDayClass(prevDay, prevMonth, prevMonthYear, "previous");
                }

                var week = 0;
                var day = 1;
                do {
                    weekDay %= 7;

                    if (weekDay == 0)
                        week++;

                    this._dayCells[week][weekDay].textContent = day.toString();
                    this._dayCells[week][weekDay].setAttribute("data-day", day.toString());
                    this._dayCells[week][weekDay].setAttribute("data-month", month.toString());
                    this._dayCells[week][weekDay].setAttribute("data-year", year.toString());
                    this._dayCells[week][weekDay].className = this._getDayClass(day, this._currentDate.getMonth(), this._currentDate.getFullYear());

                    weekDay++;
                }
                while (++day <= daysInMonth);

                var nextMonth = month < 11 ? month + 1 : 0;
                var nextMonthYear = nextMonth == 0 ? this._currentDate.getFullYear() + 1 : this._currentDate.getFullYear();
                for (var i = weekDay + 1; i <= 7; i++) {
                    var nextDay = day = i - weekDay;
                    this._dayCells[week][i - 1].textContent = nextDay.toString();
                    this._dayCells[week][i - 1].setAttribute("data-day", nextDay.toString());
                    this._dayCells[week][i - 1].setAttribute("data-month", nextMonth.toString());
                    this._dayCells[week][i - 1].setAttribute("data-year", nextMonthYear.toString());
                    this._dayCells[week][i - 1].className = this._getDayClass(nextDay, nextMonth, nextMonthYear, "next");
                }

                if (++week < 6) {
                    if (day + 1 > daysInMonth)
                        day = 0;

                    for (var i = 1; i <= 7; i++) {
                        var nextDay = day + i;
                        this._dayCells[week][i - 1].textContent = nextDay.toString();
                        this._dayCells[week][i - 1].setAttribute("data-day", nextDay.toString());
                        this._dayCells[week][i - 1].setAttribute("data-month", nextMonth.toString());
                        this._dayCells[week][i - 1].setAttribute("data-year", nextMonthYear.toString());
                        this._dayCells[week][i - 1].className = this._getDayClass(nextDay, nextMonth, nextMonth == 0 ? this._currentDate.getFullYear() + 1 : this._currentDate.getFullYear(), "next");
                    }
                }

                this._minYears = this._currentDate.getFullYear() - 4;
            }
            else if (zoom == "months") {
                this.header = year.toString();
                for (var i = 0; i < 12; i++) {
                    this._monthsAndYearsCells[i].textContent = Vidyano.CultureInfo.currentCulture.dateFormat.shortMonthNames[i];
                    this._monthsAndYearsCells[i].setAttribute("data-value", i.toString());
                    if (this._currentDate.getFullYear() == year && this._currentDate.getMonth() == i)
                        this._monthsAndYearsCells[i].className = "current";
                    else
                        this._monthsAndYearsCells[i].className = "";
                }

                this._minYears = this._currentDate.getFullYear() - 4;
            }
            else if (zoom == "years") {
                this.header = this._minYears.toString() + " - " + (this._minYears + 12).toString();
                for (var i = 0; i < 12; i++) {
                    this._monthsAndYearsCells[i].textContent = (this._minYears + i).toString();
                    this._monthsAndYearsCells[i].setAttribute("data-value", (this._minYears + i).toString());
                    if (this._minYears + i == this._currentDate.getFullYear())
                        this._monthsAndYearsCells[i].className = "current";
                    else
                        this._monthsAndYearsCells[i].className = "";
                }
            }
        }

        private _getDayClass(day: number, month: number, year: number, baseClass?: string): string {
            var classNames = [];
            if (baseClass)
                classNames.push(baseClass);

            if (this._today.getDate() == day && this._today.getMonth() == month && this._today.getFullYear() == year)
                classNames.push("today");

            if (this.selectedDate && this.selectedDate.getDate() == day && this.selectedDate.getMonth() == month && this.selectedDate.getFullYear() == year) {
                classNames.push("selected");
            }

            return classNames.join(" ");
        }

        private _forward(e: Event) {
            if (this.zoom == "days")
                this._currentDate.setMonth(this._currentDate.getMonth() + 1);
            else if (this.zoom == "months")
                this._currentDate.setFullYear(this._currentDate.getFullYear() + 1);
            else if (this.zoom == "years")
                this._minYears += 12;

            this._render();

            e.stopPropagation();
        }

        private _fastForward(e: Event) {
            this._currentDate.setFullYear(this._currentDate.getFullYear() + 1);
            this._render();

            e.stopPropagation();
        }

        private _backward(e: Event) {
            if (this.zoom == "days")
                this._currentDate.setMonth(this._currentDate.getMonth() - 1);
            else if (this.zoom == "months")
                this._currentDate.setFullYear(this._currentDate.getFullYear() - 1);
            else if (this.zoom == "years")
                this._minYears -= 12;

            this._render();

            e.stopPropagation();
        }

        private _fastBackward(e: Event) {
            this._currentDate.setFullYear(this._currentDate.getFullYear() - 1);
            this._render();

            e.stopPropagation();
        }

        private _zoomOut(e: Event) {
            if (this.zoom == "days")
                this.zoom = "months";
            else if (this.zoom == "months")
                this.zoom = "years"

            e.stopPropagation();
        }

        private _select(e: Event) {
            if (this.zoom == "days") {
                if (e.srcElement.hasAttribute("data-day")) {
                    this._currentDate.setDate(parseInt(e.srcElement.getAttribute("data-day"), 10));
                    this._currentDate.setMonth(parseInt(e.srcElement.getAttribute("data-month"), 10));
                    this._currentDate.setFullYear(parseInt(e.srcElement.getAttribute("data-year"), 10));

                    var newDate = new Date(this._currentDate.getFullYear(), this._currentDate.getMonth(), this._currentDate.getDate());
                    if (this.selectedDate) {
                        newDate.setHours(this.selectedDate.getHours(), this.selectedDate.getMinutes(), this.selectedDate.getSeconds(), this.selectedDate.getMilliseconds());
                        newDate.netOffset(this.selectedDate.netOffset());
                        newDate.netType(this.selectedDate.netType());
                    }

                    this.selectedDate = newDate;
                    this._render();
                }
            } else if (e.srcElement.hasAttribute("data-value")) {
                var value = parseInt(e.srcElement.getAttribute("data-value"), 10);
                if (this.zoom == "months") {
                    this._currentDate.setMonth(value);
                    this.zoom = "days";
                }
                else if (this.zoom == "years") {
                    this._currentDate.setFullYear(value);
                    this.zoom = "months";
                }
            }

            e.stopPropagation();
        }

        private _catchClick(e: MouseEvent) {
            e.stopPropagation();
        }
    }
}
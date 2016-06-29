namespace Vidyano.WebComponents {
    "use strict";

    interface IDatePickerCell {
        type: string;
        content?: string;
        date?: moment.Moment;
        monthOffset?: number;
    }

    @WebComponent.register({
        properties: {
            zoom: {
                type: String,
                reflectToAttribute: true,
                observer: "_zoomChanged"
            },
            currentDate: {
                type: Object,
                readOnly: true
            },
            selectedDate: {
                type: Object,
                notify: true
            },
            selectedDateMoment: {
                type: Object,
                computed: "_computeMoment(selectedDate)"
            },
            today: {
                type: Object,
                readOnly: true
            },
            monthMode: {
                type: Boolean,
                value: false
            },
            cells: {
                type: Array,
                readOnly: true
            },
            header: {
                type: String,
                computed: "_computeHeader(zoom, currentDate)"
            }
        },
        observers: [
            "_render(cells, currentDate)"
        ],
        listeners: {
            "click": "_catchClick"
        }
    })
    export class DatePicker extends WebComponent {
        private _daysBody: HTMLElement;
        private _monthsAndYearsBody: HTMLElement;
        private _dayCells: HTMLDivElement[][];
        private _monthsAndYearsCells: HTMLDivElement[];
        private _minYears: number;
        private _scopedClassName: string;
        header: string;
        zoom: string;
        selectedDate: Date;
        monthMode: boolean;
        currentDate: moment.Moment;
        cells: IDatePickerCell[];

        private _setCells: (cells: IDatePickerCell[]) => void;
        private _setCurrentDate: (date: moment.Moment) => void;
        private _setToday: (date: moment.Moment) => void;

        attached() {
            super.attached();

            this.zoom = this.monthMode ? "months" : "days";
            this._setToday(moment(new Date()));
            this._setCurrentDate(moment(new Date()));
        }

        private _zoomChanged(zoom: string) {
            if (zoom === "days") {
                let dayNames = Vidyano.CultureInfo.currentCulture.dateFormat.shortDayNames.slice();
                if (Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek > 0)
                    dayNames = dayNames.slice(Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek).concat(dayNames.slice(0, Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek));

                const cells: IDatePickerCell[] = dayNames.map(d => {
                    return {
                        type: "weekday",
                        content: d
                    };
                });

                cells.push(...Enumerable.range(1, 42).select(d => {
                    return { type: "day" };
                }).toArray());

                this._setCells(cells);
            }
            else if (zoom === "months") {
                this._setCells(Enumerable.range(1, 12).select(d => {
                    return { type: "month" };
                }).toArray());
            }
        }

        private _render(cells: IDatePickerCell[], currentDate: Date) {
            if (this.zoom === "days") {
                if (cells.length !== 42 + 7)
                    return;

                const currentDateMoment = moment(currentDate);
                const loop = currentDateMoment.clone().startOf("month").startOf(Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek > 0 ? "isoWeek" : "week");
                const end = loop.clone().add(6, "weeks");

                let index = 7; // Skip weekday cells
                do {
                    this.set(`cells.${index}.date`, loop.clone());
                    this.set(`cells.${index}.content`, loop.format("D"));
                    this.set(`cells.${index}.monthOffset`, loop.isSame(currentDateMoment, "month") ? 0 : (loop.isBefore(currentDateMoment) ? -1 : 1));

                    index++;
                    loop.add(1, "days");
                }
                while (loop.isBefore(end));
            }
            else if (this.zoom === "months") {
                const currentDateMoment = moment(currentDate);
                const loop = currentDateMoment.clone().startOf("year");
                const end = loop.clone().add(12, "months");

                let index = 0;
                do {
                    this.set(`cells.${index}.date`, loop.clone());
                    this.set(`cells.${index}.content`, Vidyano.CultureInfo.currentCulture.dateFormat.monthNames[index]);

                    index++;
                    loop.add(1, "months");
                }
                while (loop.isBefore(end));
            }
        }

        private _isSelected(date: moment.Moment, selectedDate: moment.Moment): boolean {
            return date.isSame(selectedDate, "day");
        }

        private _isToday(date: moment.Moment, today: moment.Moment): boolean {
            return date.isSame(today, "day");
        }

        private _isOther(monthOffset: number): boolean {
            return !!monthOffset;
        }

        private _computeMoment(date: Date): moment.Moment {
            return moment(date);
        }

        private _computeHeader(zoom: string, currentDate: moment.Moment): string {
            if (zoom === "days")
                return `${CultureInfo.currentCulture.dateFormat.monthNames[currentDate.month()]} ${currentDate.year()}`;
            else if (zoom === "months")
                return `${currentDate.year()}`;

            return null;
        }

        private _slow(e: Event) {
            const amount = parseInt((<Vidyano.WebComponents.Button>e.currentTarget).getAttribute("n"));

            if (this.zoom === "days")
                this.currentDate.add(amount, "months");
            else if(this.zoom === "months")
                this.currentDate.add(amount, "years");
            else
                this.currentDate.add(amount * 12, "years");

            this._setCurrentDate(this.currentDate.clone());

            e.stopPropagation();
        }

        private _fast(e: Event) {
            const amount = parseInt((<Vidyano.WebComponents.Button>e.currentTarget).getAttribute("n"));
            this._setCurrentDate(this.currentDate.add(amount, "years").clone());

            e.stopPropagation();
        }

        private _zoomOut(e: Event) {
            if (this.zoom === "days")
                this.zoom = "months";
            else if (this.zoom === "months")
                this.zoom = "years";

            e.stopPropagation();
        }

        private _select(e: TapEvent) {
            const cell = <IDatePickerCell>e.model.cell;

            if (this.zoom === "days") {
                const newSelectedDate = moment(this.selectedDate);
                newSelectedDate.date(cell.date.date());
                newSelectedDate.month(cell.date.month());
                newSelectedDate.year(cell.date.year());

                this.selectedDate = newSelectedDate.clone().toDate();
            }
            else if (this.zoom === "months") {
                this._setCurrentDate(this.currentDate.month(cell.date.month()).clone());
                this.zoom = "days";
            }

            e.stopPropagation();
        }

        //private _selectedDateChanged() {
        //    this._currentDate = this.selectedDate ? new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()) : null;
        //    this.__render();
        //}

        //private __render(selectedDate: Date = this.selectedDate, zoom: string = this.zoom, monthMode: boolean = this.monthMode) {
        //    return;

        //    if (!this._currentDate)
        //        this._currentDate = new Date();

        //    if (zoom === "days" && monthMode) {
        //        this.zoom = "months";
        //        return;
        //    }

        //    if (!this._daysBody) {
        //        const table = <HTMLTableElement>this.$["days"];
        //        this._scopedClassName = table.className;

        //        Polymer.dom(table).appendChild(this._daysBody = document.createElement("tbody"));

        //        this._dayCells = [];

        //        let fragment = document.createDocumentFragment();
        //        for (let w = 0; w < 6; w++) {
        //            const cells = [];
        //            const tr = document.createElement("tr");

        //            for (let d = 0; d < 7; d++) {
        //                const td = document.createElement("td");

        //                const day = document.createElement("div");
        //                cells.push(day);

        //                td.appendChild(day);
        //                tr.appendChild(td);
        //            }

        //            this._dayCells.push(cells);
        //            fragment.appendChild(tr);
        //        }

        //        Polymer.dom(this._daysBody).appendChild(fragment);

        //        fragment = document.createDocumentFragment();

        //        let dayNames = Vidyano.CultureInfo.currentCulture.dateFormat.shortDayNames.slice();
        //        if (Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek > 0)
        //            dayNames = dayNames.slice(Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek).concat(dayNames.slice(0, Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek));

        //        for (let i = 0; i < 7; i++) {
        //            const th = document.createElement("th");
        //            th.textContent = dayNames[i];

        //            fragment.appendChild(th);
        //        }

        //        Polymer.dom(table.tHead).appendChild(fragment);
        //    }

        //    if (!this._monthsAndYearsBody) {
        //        this._monthsAndYearsBody = <HTMLElement>this.$["monthsAndYears"];
        //        this._monthsAndYearsCells = [];

        //        const fragment = document.createDocumentFragment();
        //        for (let y = 0; y < 4; y++) {
        //            const row = document.createElement("div");
        //            row.className = `${this._scopedClassName} row flex horizontal layout`;

        //            for (let d = 0; d < 3; d++) {
        //                const year = document.createElement("div");
        //                year.className = `${this._scopedClassName} col flex`;

        //                this._monthsAndYearsCells.push(year);
        //                row.appendChild(year);
        //            }

        //            fragment.appendChild(row);
        //        }

        //        Polymer.dom(this._monthsAndYearsBody).appendChild(fragment);
        //    }

        //    const year = this._currentDate.getFullYear();
        //    const month = this._currentDate.getMonth();
        //    let day = this._currentDate.getDate();

        //    if (zoom === "days") {
        //        this.header = Vidyano.CultureInfo.currentCulture.dateFormat.monthNames[month] + " " + year;

        //        const totalDays = [31, moment([year]).isLeapYear() ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        //        const daysInMonth = totalDays[month];
        //        const firstWeekDay = new Date(year, month, 1).getDay();
        //        const firstWeekDayIsSunday = Vidyano.CultureInfo.currentCulture.dateFormat.firstDayOfWeek === 0;

        //        const prevMonth = month > 0 ? month - 1 : 11;
        //        const prevMonthYear = prevMonth === 11 ? this._currentDate.getFullYear() - 1 : this._currentDate.getFullYear();
        //        const daysInPrevMonth = totalDays[prevMonth];
        //        let weekDay = (!firstWeekDayIsSunday ? firstWeekDay + 6 : firstWeekDay) % 7;

        //        for (let i = 0; i < (weekDay > 0 ? weekDay : 7); i++) {
        //            const prevDay = daysInPrevMonth - (weekDay - i - 1 + (weekDay > 0 ? 0 : 7));
        //            this._dayCells[0][i].textContent = prevDay.toString();
        //            this._dayCells[0][i].setAttribute("data-day", prevDay.toString());
        //            this._dayCells[0][i].setAttribute("data-month", prevMonth.toString());
        //            this._dayCells[0][i].setAttribute("data-year", prevMonthYear.toString());
        //            this._dayCells[0][i].className = `${this._scopedClassName} ${this._getDayClass(prevDay, prevMonth, prevMonthYear, "previous")}`;
        //        }

        //        let week = 0;
        //        day = 1;

        //        do {
        //            weekDay %= 7;

        //            if (weekDay === 0)
        //                week++;

        //            this._dayCells[week][weekDay].textContent = day.toString();
        //            this._dayCells[week][weekDay].setAttribute("data-day", day.toString());
        //            this._dayCells[week][weekDay].setAttribute("data-month", month.toString());
        //            this._dayCells[week][weekDay].setAttribute("data-year", year.toString());
        //            this._dayCells[week][weekDay].className = `${this._scopedClassName} ${this._getDayClass(day, this._currentDate.getMonth(), this._currentDate.getFullYear())}`;

        //            weekDay++;
        //        }
        //        while (++day <= daysInMonth);

        //        const nextMonth = month < 11 ? month + 1 : 0;
        //        const nextMonthYear = nextMonth === 0 ? this._currentDate.getFullYear() + 1 : this._currentDate.getFullYear();
        //        for (let i = weekDay + 1; i <= 7; i++) {
        //            const nextDay = day = i - weekDay;
        //            this._dayCells[week][i - 1].textContent = nextDay.toString();
        //            this._dayCells[week][i - 1].setAttribute("data-day", nextDay.toString());
        //            this._dayCells[week][i - 1].setAttribute("data-month", nextMonth.toString());
        //            this._dayCells[week][i - 1].setAttribute("data-year", nextMonthYear.toString());
        //            this._dayCells[week][i - 1].className = `${this._scopedClassName} ${this._getDayClass(nextDay, nextMonth, nextMonthYear, "next")}`;
        //        }

        //        if (++week < 6) {
        //            if (day + 1 > daysInMonth)
        //                day = 0;

        //            for (let i = 1; i <= 7; i++) {
        //                const nextDay = day + i;
        //                this._dayCells[week][i - 1].textContent = nextDay.toString();
        //                this._dayCells[week][i - 1].setAttribute("data-day", nextDay.toString());
        //                this._dayCells[week][i - 1].setAttribute("data-month", nextMonth.toString());
        //                this._dayCells[week][i - 1].setAttribute("data-year", nextMonthYear.toString());
        //                this._dayCells[week][i - 1].className = `${this._scopedClassName} ${this._getDayClass(nextDay, nextMonth, nextMonth === 0 ? this._currentDate.getFullYear() + 1 : this._currentDate.getFullYear(), "next")}`;
        //            }
        //        }

        //        this._minYears = this._currentDate.getFullYear() - 4;
        //    }
        //    else if (zoom === "months") {
        //        this.header = year.toString();
        //        for (let i = 0; i < 12; i++) {
        //            this._monthsAndYearsCells[i].textContent = Vidyano.CultureInfo.currentCulture.dateFormat.shortMonthNames[i];
        //            this._monthsAndYearsCells[i].setAttribute("data-value", i.toString());
        //            if (this._currentDate.getFullYear() === year && this._currentDate.getMonth() === i)
        //                this._monthsAndYearsCells[i].className = `${this._scopedClassName} current`;
        //            else
        //                this._monthsAndYearsCells[i].className = this._scopedClassName;
        //        }

        //        this._minYears = this._currentDate.getFullYear() - 4;
        //    }
        //    else if (zoom === "years") {
        //        this.header = this._minYears.toString() + " - " + (this._minYears + 12).toString();
        //        for (let i = 0; i < 12; i++) {
        //            this._monthsAndYearsCells[i].textContent = (this._minYears + i).toString();
        //            this._monthsAndYearsCells[i].setAttribute("data-value", (this._minYears + i).toString());
        //            if (this._minYears + i === this._currentDate.getFullYear())
        //                this._monthsAndYearsCells[i].className = `${this._scopedClassName} current`;
        //            else
        //                this._monthsAndYearsCells[i].className = this._scopedClassName;
        //        }
        //    }
        //}

        //private _getDayClass(day: number, month: number, year: number, baseClass?: string): string {
        //    const classNames = [];
        //    if (baseClass)
        //        classNames.push(baseClass);

        //    if (this._today.getDate() === day && this._today.getMonth() === month && this._today.getFullYear() === year)
        //        classNames.push("today");

        //    if (this.selectedDate && this.selectedDate.getDate() === day && this.selectedDate.getMonth() === month && this.selectedDate.getFullYear() === year) {
        //        classNames.push("selected");
        //    }

        //    return classNames.join(" ");
        //}

        //private _forward(e: Event) {
        //    if (this.zoom === "days")
        //        this._currentDate.setMonth(this._currentDate.getMonth() + 1);
        //    else if (this.zoom === "months")
        //        this._currentDate.setFullYear(this._currentDate.getFullYear() + 1);
        //    else if (this.zoom === "years")
        //        this._minYears += 12;

        //    this.__render();

        //    e.stopPropagation();
        //}

        //private _fastForward(e: Event) {
        //    this._currentDate.setFullYear(this._currentDate.getFullYear() + 1);
        //    this.__render();

        //    e.stopPropagation();
        //}

        //private _backward(e: Event) {
        //    if (this.zoom === "days")
        //        this._currentDate.setMonth(this._currentDate.getMonth() - 1);
        //    else if (this.zoom === "months")
        //        this._currentDate.setFullYear(this._currentDate.getFullYear() - 1);
        //    else if (this.zoom === "years")
        //        this._minYears -= 12;

        //    this.__render();

        //    e.stopPropagation();
        //}

        //private _fastBackward(e: Event) {
        //    this._currentDate.setFullYear(this._currentDate.getFullYear() - 1);
        //    this.__render();

        //    e.stopPropagation();
        //}

        //private _zoomOut(e: Event) {
        //    if (this.zoom === "days")
        //        this.zoom = "months";
        //    else if (this.zoom === "months")
        //        this.zoom = "years";

        //    e.stopPropagation();
        //}

        //private _select(e: Event) {
        //    const srcElement = <HTMLElement>(e.srcElement || e.target);

        //    if (this.zoom === "days") {
        //        if (srcElement.hasAttribute("data-day")) {
        //            this._currentDate.setDate(parseInt(srcElement.getAttribute("data-day"), 10));
        //            this._currentDate.setMonth(parseInt(srcElement.getAttribute("data-month"), 10));
        //            this._currentDate.setFullYear(parseInt(srcElement.getAttribute("data-year"), 10));

        //            const newDate = new Date(this._currentDate.getFullYear(), this._currentDate.getMonth(), this._currentDate.getDate());
        //            if (this.selectedDate) {
        //                newDate.setHours(this.selectedDate.getHours(), this.selectedDate.getMinutes(), this.selectedDate.getSeconds(), this.selectedDate.getMilliseconds());
        //                newDate.netOffset(this.selectedDate.netOffset());
        //                newDate.netType(this.selectedDate.netType());
        //            }

        //            this.selectedDate = newDate;
        //            this.__render();
        //        }
        //    } else if (srcElement.hasAttribute("data-value")) {
        //        const value = parseInt(srcElement.getAttribute("data-value"), 10);
        //        if (this.zoom === "months") {
        //            this._currentDate.setMonth(value);

        //            if (!this.monthMode)
        //                this.zoom = "days";
        //            else {
        //                this._currentDate.setDate(1);
        //                this.selectedDate = new Date(this._currentDate.getFullYear(), this._currentDate.getMonth(), this._currentDate.getDate());
        //                this.__render();
        //            }
        //        }
        //        else if (this.zoom === "years") {
        //            this._currentDate.setFullYear(value);
        //            this.zoom = "months";
        //        }
        //    }

        //    e.stopPropagation();
        //}

        private _catchClick(e: MouseEvent) {
            e.stopPropagation();
        }
    }
}
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
                readOnly: true
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
        zoom: string;
        selectedDate: Date;
        monthMode: boolean;
        currentDate: moment.Moment;
        cells: IDatePickerCell[];

        private _setCells: (cells: IDatePickerCell[]) => void;
        private _setCurrentDate: (date: moment.Moment) => void;
        private _setToday: (date: moment.Moment) => void;
        private _setHeader: (header: string) => void;

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
            else {
                this._setCells(Enumerable.range(1, 12).select(d => {
                    return { type: zoom.substr(0, zoom.length - 1) };
                }).toArray());
            }
        }

        private _render(cells: IDatePickerCell[], currentDate: Date) {
            const currentDateMoment = moment(currentDate);

            if (this.zoom === "days") {
                if (cells.length !== 42 + 7)
                    return;

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

                this._setHeader(`${CultureInfo.currentCulture.dateFormat.monthNames[currentDateMoment.month()]} ${currentDateMoment.year()}`);
            }
            else if (this.zoom === "months") {
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

                this._setHeader(`${currentDateMoment.year()}`);
            }
            else if (this.zoom === "years") {
                const loop = currentDateMoment.clone().startOf("year").subtract(6, "years");
                const end = loop.clone().add(12, "years");

                let index = 0;
                do {
                    this.set(`cells.${index}.date`, loop.clone());
                    this.set(`cells.${index}.content`, loop.year());

                    index++;
                    loop.add(1, "years");
                }
                while (loop.isBefore(end));

                this._setHeader(`${cells[0].date.year()} - ${cells[cells.length - 1].date.year()}`);
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

                if (cell.monthOffset !== 0)
                    this._setCurrentDate(this.currentDate.add(cell.monthOffset, "months").clone());
            }
            else if (this.zoom === "months") {
                this._setCurrentDate(this.currentDate.month(cell.date.month()).clone());

                if (!this.monthMode)
                    this.zoom = "days";
                else {
                    const newSelectedDate = moment(this.selectedDate);
                    newSelectedDate.month(cell.date.month());
                    newSelectedDate.year(cell.date.year());

                    this.selectedDate = newSelectedDate.clone().toDate();
                }
            }
            else if (this.zoom === "years") {
                this._setCurrentDate(this.currentDate.year(cell.date.year()).clone());
                this.zoom = "months";
            }

            e.stopPropagation();
        }

        private _catchClick(e: MouseEvent) {
            e.stopPropagation();
        }
    }
}
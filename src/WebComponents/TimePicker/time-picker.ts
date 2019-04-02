namespace Vidyano.WebComponents {
    @WebComponent.register({
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
        }
    })
    export class TimePicker extends WebComponent {
        readonly hours: number; private _setHours: (hours: number) => void;
        readonly minutes: number; private _setMinutes: (minutes: number) => void;
        state: string;
        time: Date;

        connectedCallback() {
            super.connectedCallback();
            this._updateTime();
        }

        get isOpen(): boolean {
            return (<Popup>this.$.popup).open;
        }

        private _timeChanged() {
            this._updateTime();
        }

        private _tap(e: Event, detail: any, sender: HTMLElement) {
            let source: HTMLElement;
            let tapSource = this.todo_checkEventTarget(e.srcElement || <HTMLElement>e.target);

            if (tapSource.tagName === "SPAN") {
                const parent = <HTMLElement>tapSource.parentNode;
                if (parent.classList && parent.classList.contains("item"))
                    source = parent;
            }
            else {
                const parent = <HTMLElement>tapSource;
                if (parent.classList && parent.classList.contains("item"))
                    source = parent;
            }

            if (!source)
                return;

            const newTime = new Date();
            if (this.time) {
                newTime.netOffset(this.time.netOffset());
                newTime.netType(this.time.netType());

                newTime.setFullYear(this.time.getFullYear(), this.time.getMonth(), this.time.getDate());
                newTime.setHours(this.time.getHours(), this.time.getMinutes(), 0, 0);
            }
            else
                newTime.setHours(0, 0, 0, 0);

            if (this.state === "hours") {
                this._setHours(parseInt(source.getAttribute("data-hours"), 10));
                newTime.setHours(this.hours);
                this.state = "minutes";
            }
            else if (this.state === "minutes") {
                this._setMinutes(parseInt(source.getAttribute("data-minutes"), 10));
                newTime.setMinutes(this.minutes);
            }

            this.time = newTime;

            e.stopPropagation();
        }

        private _switch(e: Event, detail: any) {
            const target = <HTMLElement>this.todo_checkEventTarget(e.target);
            if (target.classList.contains("hours"))
                this.state = "hours";
            else if (target.classList.contains("minutes"))
                this.state = "minutes";

            e.stopPropagation();
        }

        private _updateTime() {
            this._setHours(this.time ? this.time.getHours() : 0);
            this._setMinutes(this.time ? this.time.getMinutes() : 0);

            const items = this.shadowRoot.querySelectorAll(".item");
            [].forEach.apply(items, [(item: HTMLElement) => {
                const hours = parseInt(item.getAttribute("data-hours"), 10);
                const minutes = parseInt(item.getAttribute("data-minutes"), 10);

                if (hours === this.hours || minutes === this.minutes)
                    item.classList.add("active");
                else
                    item.classList.remove("active");
            }]);
        }

        private _catchTap(e: Event) {
            e.stopPropagation();
        }

        private _zeroPrefix(n: number): string {
            return n < 10 ? "0" + n : n.toString();
        }
    }
}
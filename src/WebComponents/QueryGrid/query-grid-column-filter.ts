namespace Vidyano.WebComponents {
    "use strict";

    export class QueryGridColumnFilterProxyBase extends Vidyano.WebComponents.WebComponent {
        private _label: string;
        private _labelTextNode: Text;
        protected queryColumn: Vidyano.QueryColumn;
        column: QueryGridColumn;
        inversed: boolean;
        filtered: boolean;

        protected _update() {
            const filtered = this.filtered;
            if (this.filtered = !!this.queryColumn && !this.queryColumn.selectedDistincts.isEmpty()) {
                const objects = [];
                const textSearch = [];

                this.queryColumn.selectedDistincts.forEach(value => {
                    if (value && value.startsWith("1|@"))
                        textSearch.push(value);
                    else
                        objects.push(value);
                });

                let label = "";
                if (objects.length > 0)
                    label += objects.map(o => this._getDistinctDisplayValue(o)).join(", ");

                if (textSearch.length > 0) {
                    if (label.length > 0)
                        label += ", ";

                    label += textSearch.map(t => this._getDistinctDisplayValue(t)).join(", ");
                }

                this.label = (!this.inversed ? "= " : "≠ ") + label;
            }
            else
                this.label = "=";
        }

        protected _getDistinctDisplayValue(value: string) {
            if (!StringEx.isNullOrWhiteSpace(value) && value !== "|") {
                const indexOfPipe = value.indexOf("|");

                if (indexOfPipe === 0)
                    return value.substr(1);

                if (indexOfPipe > 0)
                    return value.substr(indexOfPipe + parseInt(value.substr(0, indexOfPipe), 10) + 1);
            }

            return value == null ? this.app.service.getTranslatedMessage("DistinctNullValue") : this.app.service.getTranslatedMessage("DistinctEmptyValue");
        }

        protected get label(): string {
            return this._label;
        }

        protected set label(label: string) {
            if (this._label === label)
                return;

            this._label = label;
            if (!this._labelTextNode)
                this.$["label"].appendChild(this._labelTextNode = document.createTextNode(label));
            else
                this._labelTextNode.nodeValue = label;
        }
    }

    @WebComponent.register({
        properties: {
            column: Object,
            queryColumn: {
                type: Object,
                computed: "column.column"
            },
            filtered: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            queryFiltering: {
                type: Boolean,
                computed: "queryColumn.query.isFiltering",
                reflectToAttribute: true
            },
            inversed: {
                type: Boolean,
                computed: "queryColumn.selectedDistinctsInversed"
            },
            loading: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            searchText: String,
            disabled: {
                type: Boolean,
                computed: "!column.canFilter",
                reflectToAttribute: true
            }
        },
        observers: [
            "_update(queryColumn.selectedDistincts, queryColumn.selectedDistinctsInversed)"
        ],
        forwardObservers: [
            "queryColumn.selectedDistincts",
            "queryColumn.selectedDistinctsInversed",
            "queryColumn.query.isFiltering"
        ],
        listeners: {
            "tap": "_upgrade"
        }
    })
    export class QueryGridColumnFilterProxy extends Vidyano.WebComponents.QueryGridColumnFilterProxyBase {
        private _upgrade() {
            this.fire("upgrade-filter-proxy", null, {
                bubbles: true
            });
        }
    }

    export interface IQueryGridColumnFilterDistinct {
        type: string;
        value: string;
        displayValue: string;
    }

    @WebComponent.register({
        properties: {
            column: Object,
            queryColumn: {
                type: Object,
                computed: "column.column"
            },
            distincts: Array,
            filtered: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            queryFiltering: {
                type: Boolean,
                computed: "queryColumn.query.isFiltering",
                reflectToAttribute: true
            },
            inversed: {
                type: Boolean,
                computed: "queryColumn.selectedDistinctsInversed"
            },
            loading: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            searchText: String,
            disabled: {
                type: Boolean,
                computed: "!column.canFilter",
                reflectToAttribute: true
            }
        },
        observers: [
            "_update(queryColumn.selectedDistincts, queryColumn.selectedDistinctsInversed, isAttached)",
            "_renderDistincts(queryColumn.selectedDistincts, queryColumn.distincts)"
        ],
        forwardObservers: [
            "queryColumn.selectedDistincts",
            "queryColumn.selectedDistinctsInversed",
            "queryColumn.distincts",
            "queryColumn.query.isFiltering"
        ]
    })
    export class QueryGridColumnFilter extends Vidyano.WebComponents.QueryGridColumnFilterProxyBase {
        private static _selector: DocumentFragment;
        private _openOnAttach: boolean = true;
        private _distinctHeight: number;
        private _resizeStart: ISize;
        column: QueryGridColumn;
        searchText: string;
        label: string;
        distincts: IQueryGridColumnFilterDistinct[];

        private _setLoading: (loading: boolean) => void;

        attached() {
            super.attached();

            if (this._openOnAttach) {
                this._openOnAttach = false;

                this.async(() => {
                    this.$["distincts"] = <HTMLElement>this.querySelector("#distincts");
                    this.$["search"] = <HTMLElement>this.querySelector("#search");

                    // Specifies that the inner wrapper of the vi-scoller element will handle the scroll event on the behalf of the iron-list
                    (<any>this.$["distincts"]).scrollTarget = (<any>this.$["distinctsContainer"]).$["wrapper"];

                    const popup = <Popup><any>this.querySelector("vi-popup#filter");
                    popup.popup();
                });
            }
        }

        private _popupOpening(e: CustomEvent) {
            if (!this.column.canFilter)
                return;

            const popup = <Vidyano.WebComponents.Popup>this.$["filter"];
            popup.boundingTarget = this.findParent<QueryGrid>(p => p instanceof Vidyano.WebComponents.QueryGrid).parentElement;
            popup.closeDelay = parseInt(this.app.configuration.getSetting("vi-query-grid-column-filter.close-delay", "750"));

            if (this.column.canListDistincts && (!this.column.column.distincts || this.column.distincts.isDirty)) {
                this._setLoading(true);

                this.column.column.refreshDistincts().then(() => {
                    const distinctsList = <HTMLElement>this.$["distincts"];
                    distinctsList.style.minWidth = this.offsetWidth + "px";

                    this._setLoading(false);

                    const input = <InputSearch><any>this.$["search"];
                    input.focus();
                }).catch(() => {
                    this._setLoading(false);
                });
            }
            else {
                const distinctsList = <HTMLElement>this.$["distincts"];
                distinctsList.style.minWidth = this.offsetWidth + "px";
                distinctsList.scrollTop = 0;
            }
        }

        private _distinctClick(e: TapEvent) {
            const distinctValue = e.model.item.value;

            if (this.queryColumn.selectedDistincts.indexOf(distinctValue) === -1)
                this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.concat([distinctValue]);
            else
                this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.except([distinctValue]);

            this._updateFilters();
            this._updateDistincts();

            e.stopPropagation();
        }

        private _updateFilters() {
            if (!this.queryColumn.query.filters)
                return;

            if (!this.queryColumn.selectedDistincts.isEmpty() && !this.queryColumn.query.filters.currentFilter) {
                this.queryColumn.query.filters.createNew().then(filter => {
                    this.queryColumn.query.filters.currentFilter = filter;
                });
            }
        }

        private _updateDistincts() {
            this._setLoading(true);
            this.column.query.search().then(() => {
                return this.column.column.refreshDistincts().then(distincts => {
                    this._setLoading(false);
                });
            }).catch(() => {
                this._setLoading(false);
            });
        }

        private _renderDistincts() {
            if (!this.queryColumn)
                return;

            const distinctType = !this.inversed ? "include" : "exclude";
            const distinctsEnum = this.queryColumn.selectedDistincts.select(v => {
                return {
                    type: distinctType,
                    value: v,
                    displayValue: this._getDistinctDisplayValue(v),
                    checked: true
                };
            });

            if (this.queryColumn.distincts) {
                const distincts = distinctsEnum.concat(this.queryColumn.distincts.matching.filter(v => this.queryColumn.selectedDistincts.indexOf(v) === -1).map(v => {
                    return {
                        type: "matching",
                        value: v,
                        displayValue: this._getDistinctDisplayValue(v),
                        checked: false
                    };
                })).concat(this.queryColumn.distincts.remaining.filter(v => this.queryColumn.selectedDistincts.indexOf(v) === -1).map(v => {
                    return {
                        type: "remaining",
                        value: v,
                        displayValue: this._getDistinctDisplayValue(v),
                        checked: false
                    };
                }));

                this.distincts = (this.queryColumn.distincts.hasMore ? distincts.concat([<any>{}]) : distincts).toArray();
            }
            else
                this.distincts = distinctsEnum.toArray();

            this.updateStyles();
        }

        private _search() {
            if (StringEx.isNullOrEmpty(this.searchText))
                return;

            this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.concat(["1|@" + this.searchText]);
            this.searchText = "";

            this._renderDistincts();
            this.column.query.search().then(() => {
                this._renderDistincts();
                this._updateFilters();
                this._updateDistincts();
            });
        }

        private _inverse(e: Event) {
            e.stopPropagation();

            this.queryColumn.selectedDistinctsInversed = !this.queryColumn.selectedDistinctsInversed;

            if (!this.queryColumn.selectedDistincts.isEmpty())
                this._updateDistincts();
        }

        private _clear(e: CustomEvent) {
            if (!this.filtered) {
                e.stopPropagation();
                return;
            }

            this.queryColumn.selectedDistincts = Enumerable.empty<string>();
            this._updateDistincts();

            WebComponents.Popup.closeAll();
        }

        private _onResize(e: PolymerTrackEvent, detail: PolymerTrackDetail) {
            if (detail.state === "start") {
                this.app.isTracking = true;
                const filter = <Popup>this.$["filter"];
                filter.sticky = true;

                this._resizeStart = { width: this.$["filterContent"].offsetWidth, height: this.$["filterContent"].offsetHeight };
            }
            else if (detail.state === "track") {
                this.$["filterContent"].style.width = `${this._resizeStart.width + detail.dx}px`;
                this.$["filterContent"].style.height = `${this._resizeStart.height + detail.dy}px`;
            }
            else if (detail.state === "end") {
                const filter = <Popup>this.$["filter"];
                filter.sticky = false;

                this._resizeStart = null;
                this.app.isTracking = false;
            }
        }

        private _catchClick(e: Event) {
            e.stopPropagation();
        }
    }
}

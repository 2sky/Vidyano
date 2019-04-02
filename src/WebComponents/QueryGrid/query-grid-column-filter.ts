namespace Vidyano.WebComponents {
    export class QueryGridColumnFilterProxyBase extends Vidyano.WebComponents.WebComponent {
        private _label: string;
        private _labelTextNode: Text;
        protected queryColumn: Vidyano.QueryColumn;
        column: QueryGridColumn;
        inversed: boolean;
        filtered: boolean;

        protected _update() {
            const filtered = this.filtered;
            if (this.filtered = !!this.queryColumn && this.queryColumn.selectedDistincts.length > 0) {
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

            return value == null ? this.queryColumn.service.getTranslatedMessage("DistinctNullValue") : this.queryColumn.service.getTranslatedMessage("DistinctEmptyValue");
        }

        protected get label(): string {
            return this._label;
        }

        protected set label(label: string) {
            if (this._label === label)
                return;

            this._label = label;
            if (!this._labelTextNode)
                this.$.label.appendChild(this._labelTextNode = document.createTextNode(label));
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
            disabled: {
                type: Boolean,
                computed: "!column.canFilter",
                reflectToAttribute: true
            },
            sensitive: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "column.column.isSensitive"
            }
        },
        observers: [
            "_update(queryColumn.selectedDistincts, queryColumn.selectedDistinctsInversed, isConnected)",
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
            filteredDistincts: {
                type: Array,
                computed: "_computeFilteredDistincts(distincts, searchText)"
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
            searchText: {
                type: String,
                observer: "_searchTextChanged"
            },
            disabled: {
                type: Boolean,
                computed: "!column.canFilter",
                reflectToAttribute: true
            },
            sensitive: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "column.column.isSensitive"
            }
        },
        observers: [
            "_update(queryColumn.selectedDistincts, queryColumn.selectedDistinctsInversed, isConnected)",
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
        readonly loading: boolean; private _setLoading: (loading: boolean) => void;
        column: QueryGridColumn;
        searchText: string;
        label: string;
        distincts: IQueryGridColumnFilterDistinct[];

        connectedCallback() {
            super.connectedCallback();

            if (this._openOnAttach) {
                this._openOnAttach = false;

                this.async(() => {
                    const popup = <Popup><any>this.querySelector("vi-popup#filter");
                    popup.popup();
                });
            }
        }

        detached() {
            super.detached();

            this.searchText = "";
        }

        private async _popupOpening(e: CustomEvent) {
            if (!this.column.canFilter)
                return;

            const input = <InputSearch><any>this.$.search;
            this._focusElement(input);

            const popup = <Vidyano.WebComponents.Popup>this.$.filter;
            popup.boundingTarget = this.findParent<QueryGrid>(p => p instanceof Vidyano.WebComponents.QueryGrid).parentElement;
            popup.closeDelay = parseInt(this.app.configuration.getSetting("vi-query-grid-column-filter.close-delay", "750"));

            if (this.column.canListDistincts && (!this.column.column.distincts || this.column.distincts.isDirty)) {
                this._setLoading(true);

                try {
                    await this.column.column.refreshDistincts();
                    const distinctsList = <HTMLElement>this.$.distincts;
                    distinctsList.style.minWidth = this.offsetWidth + "px";

                    this._setLoading(false);
                }
                catch (e) {
                    this._setLoading(false);
                    this.app.showAlert(e, Vidyano.NotificationType.Error);
                }
            }
            else {
                const distinctsList = <HTMLElement>this.$.distincts;
                distinctsList.style.minWidth = this.offsetWidth + "px";
                distinctsList.scrollTop = 0;
            }
        }

        private _searchTextChanged(searchText: string, oldSearchText: string) {
            if (!searchText && !oldSearchText)
                return;

            if (this.queryColumn && this.queryColumn.distincts && this.queryColumn.distincts.hasMore) {
                this._setLoading(true);

                this.debounce(`QueryGridColumnFilter.Query.${this.queryColumn.query.id}._searchTextChanged`, async () => {
                    if (this.searchText !== searchText)
                        return;

                    try {
                        await this.column.column.refreshDistincts(searchText);
                        if (this.searchText === searchText)
                            this._renderDistincts();
                    }
                    finally {
                        if (this.searchText === searchText)
                            this._setLoading(false);
                    }
                }, 250);
            }
        }

        private _computeFilteredDistincts(distincts: IQueryGridColumnFilterDistinct[], searchText: string): IQueryGridColumnFilterDistinct[] {
            if (!searchText)
                return distincts;

            searchText = searchText.toLowerCase();
            return distincts.filter(d => {
                if (!d.displayValue)
                    return false;

                return d.displayValue.toLowerCase().contains(searchText);
            });
        }

        private _distinctClick(e: Polymer.TapEvent) {
            const distinctValue = e.model.item.value;

            if (this.queryColumn.selectedDistincts.indexOf(distinctValue) === -1)
                this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.concat([distinctValue]);
            else
                this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.filter(d => d !== distinctValue);

            this._updateFilters();
            this._updateDistincts();

            e.stopPropagation();
        }

        private async _updateFilters() {
            if (!this.queryColumn.query.filters)
                return;

            if (this.queryColumn.selectedDistincts.length > 0 && !this.queryColumn.query.filters.currentFilter) {
                const filter = await this.queryColumn.query.filters.createNew();
                this.queryColumn.query.filters.currentFilter = filter;
            }
        }

        private async _updateDistincts() {
            this._setLoading(true);

            try {
                await this.column.query.search();
                await this.column.column.refreshDistincts(this.searchText);
            }
            finally {
                this._setLoading(false);
            }
        }

        private _renderDistincts() {
            if (!this.queryColumn)
                return;

            const distinctType = !this.inversed ? "include" : "exclude";
            let distincts = this.queryColumn.selectedDistincts.map(v => ({
                type: distinctType,
                value: v,
                displayValue: this._getDistinctDisplayValue(v),
                checked: true
            }));

            if (this.queryColumn.distincts) {
                distincts = distincts.concat(this.queryColumn.distincts.matching.filter(v => this.queryColumn.selectedDistincts.indexOf(v) === -1).map(v => {
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

                this.distincts = (this.queryColumn.distincts.hasMore ? distincts.concat([<any>{}]) : distincts);
            }
            else
                this.distincts = distincts;

            this.updateStyles();
        }

        private _getHighlightedDistinctDisplayValue(displayValue: string, searchText: string): string {
            if (!searchText)
                return displayValue;

            searchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            const exp = new RegExp(`(${searchText})`, "gi");
            return displayValue.replace(exp, "<span class='style-scope vi-query-grid-column-filter match'>$1</span>");
        }

        private async _search() {
            if (this.searchText) {
                this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.concat(["1|@" + this.searchText]);
                this.searchText = "";
            }

            this._renderDistincts();
            if (!await this.column.query.search())
                return;

            this._renderDistincts();
            this._updateFilters();
            this._updateDistincts();
        }

        private _inverse(e: Event) {
            e.stopPropagation();

            this.queryColumn.selectedDistinctsInversed = !this.queryColumn.selectedDistinctsInversed;

            if (this.queryColumn.selectedDistincts.length > 0)
                this._updateDistincts();
        }

        private _clear(e: CustomEvent) {
            if (!this.filtered) {
                e.stopPropagation();
                return;
            }

            this.queryColumn.selectedDistincts = [];
            this._updateDistincts();

            WebComponents.Popup.closeAll();
        }

        private _onResize(e: Polymer.TrackEvent) {
            if (e.state === "start") {
                this.app.isTracking = true;
                const filter = <Popup>this.$.filter;
                filter.sticky = true;

                this._resizeStart = { width: this.$.filterContent.offsetWidth, height: this.$.filterContent.offsetHeight };
            }
            else if (e.state === "track") {
                this.$.filterContent.style.width = `${this._resizeStart.width + e.dx}px`;
                this.$.filterContent.style.height = `${this._resizeStart.height + e.dy}px`;
            }
            else if (e.state === "end") {
                const filter = <Popup>this.$.filter;
                filter.sticky = false;

                this._resizeStart = null;
                this.app.isTracking = false;

                (<PolymerBase>this.$.distincts).fire("iron-resize", null);
            }
        }

        private _catchClick(e: Event) {
            e.stopPropagation();
        }
    }
}

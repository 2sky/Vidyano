module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            query: Object,
            queryFilters: {
                type: Object,
                computed: "query.filters"
            },
            filters: {
                type: Array,
                computed: "_computeFilters(query.filters.filters)"
            },
            hasFilters: {
                type: Boolean,
                computed: "_computeHasFilters(filters)"
            },
            currentFilter: {
                type: Object,
                computed: "query.filters.currentFilter"
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeDisabled(filters, currentFilter)"
            },
            canReset: {
                type: Boolean,
                computed: "_computeCanReset(currentFilter)"
            },
            canSave: {
                type: Boolean,
                computed: "_computeCanSave(currentFilter, canSaveAs)"
            },
            canSaveAs: {
                type: Boolean,
                computed: "_computeCanSaveAs(currentFilter)"
            },
            editLabel: {
                type: String,
                computed: "query.filters.actions.Edit.displayName"
            }
        },
        forwardObservers: [
            "query.filters",
            "query.filters.filters",
            "query.filters.currentFilter"
        ]
    })
    export class QueryGridFilters extends Vidyano.WebComponents.WebComponent {
        private _dialog: WebComponents.DialogInstance;
        private _preventColumnFilterChangedListener: boolean;
        query: Vidyano.Query;
        queryFilters: Vidyano.QueryFilters;
        currentFilter: Vidyano.QueryFilter;

        private _computeFilters(filters: QueryFilter[]): QueryFilter[] {
            return filters;
        }

        private _computeDisabled(filters: QueryFilter[], currentFilter: QueryFilter): boolean {
            return (!filters || filters.length === 0) && !currentFilter;
        }

        private _computeHasFilters(filters: QueryFilters[]): boolean {
            return !!filters && filters.length > 0;
        }

        private _computeCanReset(currentFilter: QueryFilter): boolean {
            return !!currentFilter;
        }

        private _computeCanSave(currentFilter: QueryFilter, canSaveAs: boolean): boolean {
            return !canSaveAs && !!currentFilter && !currentFilter.persistentObject.isNew;
        }

        private _computeCurrentFilterSaveLabel(currentFilter: QueryFilter): string {
            return !!currentFilter ? `${this.translateMessage('Save')} '${currentFilter.name}': ` : "";
        }

        private _computeCanSaveAs(currentFilter: QueryFilter): boolean {
            return !!currentFilter && currentFilter.persistentObject.isNew;
        }

        private _computeFilterEditLabel(filter: QueryFilter): string {
            return this.query.service.actionDefinitions.get("Edit").displayName;
        }

        private _reset() {
            Vidyano.WebComponents.Popup.closeAll();
            this.query.filters.currentFilter = null;
        }

        private _load(e: Event) {
            var name = (<HTMLElement>e.currentTarget).getAttribute("data-filter");
            if (!name)
                return;

            this.queryFilters.currentFilter = this.queryFilters.getFilter(name);
        }

        private _saveAs() {
            this.app.showDialog(new Vidyano.WebComponents.PersistentObjectDialog(this.currentFilter.persistentObject, true)).then(po => {
                if (!!po)
                    this.query.filters.save();
            });
        }

        private _save() {
            this.query.filters.save();
        }

        private _delete(e: TapEvent) {
            e.stopPropagation();

            var name = (<HTMLElement>e.currentTarget).getAttribute("data-filter");
            if (!name)
                return;

            this.app.showMessageDialog({
                title: name,
                titleIcon: "Action_Delete",
                message: this.translateMessage("AskForDeleteFilter", name),
                actions: [this.translateMessage("Delete"), this.translateMessage("Cancel")],
                actionTypes: ["Danger"]
            }).then(result => {
                if (result === 0) {
                    this.query.filters.delete(name);
                }
            });
        }
    }

    export class QueryGridColumnFilterProxyBase extends Vidyano.WebComponents.WebComponent {
        private _label: string;
        private _labelTextNode: Text;
        protected queryColumn: Vidyano.QueryColumn;
        column: QueryGridColumn;
        inversed: boolean;
        filtered: boolean;

        protected _update() {
            var filtered = this.filtered;
            if (this.filtered = !!this.queryColumn && !this.queryColumn.selectedDistincts.isEmpty()) {
                var objects = [];
                var textSearch = [];

                this.queryColumn.selectedDistincts.forEach(value => {
                    if (value && value.startsWith("1|@"))
                        textSearch.push(value);
                    else
                        objects.push(value);
                });

                var label = "";
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
            if (!StringEx.isNullOrWhiteSpace(value) && value != "|") {
                var indexOfPipe = value.indexOf("|");

                if (indexOfPipe == 0)
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
            "_update(queryColumn.selectedDistincts, queryColumn.selectedDistinctsInversed, isAttached)"
        ],
        forwardObservers: [
            "queryColumn.selectedDistincts",
            "queryColumn.selectedDistinctsInversed",
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
            "_renderDistincts(queryColumn.distincts)"
        ],
        forwardObservers: [
            "queryColumn.selectedDistincts",
            "queryColumn.selectedDistinctsInversed",
            "queryColumn.distincts"
        ]
    })
    export class QueryGridColumnFilter extends Vidyano.WebComponents.QueryGridColumnFilterProxyBase {
        private static _selector: DocumentFragment;
        private _openOnAttach: boolean = true;
        searchText: string;
        label: string;

        private _setLoading: (loading: boolean) => void;

        constructor(public column: QueryGridColumn) {
            super();
        }

        attached() {
            super.attached();

            if (this._openOnAttach) {
                this._openOnAttach = false;

                this.async(() => {
                    this.$["distincts"] = <HTMLElement>this.querySelector("#distincts");
                    this.$["search"] = <HTMLElement>this.querySelector("#search");

                    var popup = <Popup><any>this.querySelector("vi-popup#filter");
                    popup.popup();
                });
            }
        }

        private _popupOpening(e: CustomEvent) {
            if (!this.column.canFilter)
                return;

            if (!this.column.column.distincts || this.column.distincts.isDirty) {
                this._setLoading(true);

                this.column.column.refreshDistincts().then(() => {
                    var distinctsDiv = <HTMLElement>this.$["distincts"];
                    distinctsDiv.style.minWidth = this.offsetWidth + "px";

                    this._setLoading(false);

                    var input = <InputSearch><any>this.$["search"];
                    input.focus();
                }).catch(() => {
                    this._setLoading(false);
                });
            }
            else {
                var distinctsDiv = <HTMLElement>this.$["distincts"];
                distinctsDiv.style.minWidth = this.offsetWidth + "px";
                distinctsDiv.scrollTop = 0;
            }
        }

        private _closePopup() {
            WebComponents.Popup.closeAll();
        }

        private _distinctClick(e: Event) {
            var element = <HTMLElement>e.srcElement || (<any>e).originalTarget;
            var distinctValue: string;
            do {
                distinctValue = element.getAttribute("distinct-value");
                if (distinctValue) {
                    distinctValue = <string>JSON.parse(distinctValue).value;

                    if (this.queryColumn.selectedDistincts.indexOf(distinctValue) == -1)
                        this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.concat([distinctValue]);
                    else
                        this.queryColumn.selectedDistincts = this.queryColumn.selectedDistincts.except([distinctValue]);

                    this._updateFilters();
                    this._updateDistincts();

                    break;
                }
            }
            while (((element = element.parentElement) != this) && element);

            e.stopPropagation();
        }

        private _updateFilters() {
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

        private _clearDistincts() {
            this.$["distincts"].innerHTML = "";
        }

        private _renderDistincts() {
            const target = <HTMLElement>this.$["distincts"];
            target.innerHTML = "";

            if (this.queryColumn && this.queryColumn.distincts) {
                const distinctType = !this.inversed ? "include" : "exclude";

                this.queryColumn.selectedDistincts.forEach(v => {
                    this._renderDistinct(target, v, distinctType);
                });

                this.queryColumn.distincts.matching.filter(v => this.queryColumn.selectedDistincts.indexOf(v) == -1).forEach(v => this._renderDistinct(target, v, "matching"));
                this.queryColumn.distincts.remaining.filter(v => this.queryColumn.selectedDistincts.indexOf(v) == -1).forEach(v => this._renderDistinct(target, v, "remaining"));
            }
        }

        private _renderDistinct(target: HTMLElement, value: string, className?: string) {
            var div = document.createElement("div");
            div.setAttribute("distinct-value", JSON.stringify({ value: value }));
            if (className)
                div.className = className;

            var selectorDiv = document.createElement("div");
            selectorDiv.appendChild(WebComponents.Icon.Load("Selected"));
            selectorDiv.className = "selector";
            div.appendChild(selectorDiv);

            var span = document.createElement("span");
            span.textContent = this._getDistinctDisplayValue(value);

            div.appendChild(span);
            target.appendChild(div);
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

            this._closePopup();
        }

        private _catchClick(e: Event) {
            e.stopPropagation();
        }
    }
}

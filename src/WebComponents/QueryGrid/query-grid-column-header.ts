namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            canSort: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            sorting: {
                type: String,
                reflectToAttribute: true,
                readOnly: true,
                value: null
            },
            canGroupBy: {
                type: Boolean,
                readOnly: true
            },
            isPinned: {
                type: Boolean,
                readOnly: true
            },
            groupByLabel: {
                type: String,
                computed: "_computeGroupByLabel(column.label)"
            },
            pinLabel: {
                type: String,
                computed: "_computePinLabel(isPinned)"
            }
        },
        listeners: {
            "upgrade-filter-proxy": "_onUpgradeFilterProxy",
            "contextmenu": "_onContextmenu"
        }
    })
    export class QueryGridColumnHeader extends WebComponent implements IConfigurable {
        private _resizingRAF: number;
        private _column: QueryGridColumn;
        private _columnObserver: Vidyano.Common.ISubjectDisposer;
        private _minimumColumnWidth: number;
        private _labelTextNode: Text;
        private _filter: QueryGridColumnFilterProxyBase;
        private _sorting: string;
        readonly canSort: boolean; private _setCanSort: (canSort: boolean) => void;
        readonly canGroupBy: boolean; private _setCanGroupBy: (canGroupBy: boolean) => void;
        readonly sorting: string; private _setSorting: (sorting: string) => void;
        readonly isPinned: boolean; private _setIsPinned: (isPinned: boolean) => void;

        connectedCallback() {
            this._minimumColumnWidth = parseInt(ShadyCSS.getComputedStyleValue(this, "--vi-query-grid--minimum-column-width"));

            super.connectedCallback();

            if (!this._filter)
                this.appendChild(this._filter = new Vidyano.WebComponents.QueryGridColumnFilterProxy());
        }

        private _onUpgradeFilterProxy(e: Event) {
            const proxy = this._filter;

            this.replaceChild(this._filter = new Vidyano.WebComponents.QueryGridColumnFilter(), proxy);
            Polymer.flush();

            this._filter.column = this._column;

            e.stopPropagation();
        }

        get column(): QueryGridColumn {
            return this._column;
        }

        set column(column: QueryGridColumn) {
            this._filter.column = column;

            if (this._column === column)
                return;

            if (this._columnObserver) {
                this._columnObserver();
                this._columnObserver = null;
            }

            if (this._column = column) {
                this._columnObserver = this.column.column.propertyChanged.attach(this._columnPropertyChanged.bind(this));

                this._updateLabel(column.label);
                this._setCanGroupBy(column.canGroupBy);
                this._updateSortingIcon(column.sortDirection);
                this._setCanSort(column.canSort);
                this._setIsPinned(column.isPinned);
            }
            else {
                this._updateLabel("");
                this._updateSortingIcon(null);
            }
        }

        private _onContextmenu(e: MouseEvent): boolean {
            if (e.ctrlKey)
                return true;

            e.preventDefault();
            e.stopPropagation();

            (<PopupMenu>this.$.menu).popup();

            return false;
        }

        private _sort(e: Event) {
            if (!this._column.canSort || this._column.query.canReorder)
                return;

            let newSortingDirection: SortDirection;
            let multiSort = false;
            if (e.currentTarget instanceof Vidyano.WebComponents.PopupMenuItem) {
                newSortingDirection = e.currentTarget.icon === "SortAsc" ? SortDirection.Ascending : SortDirection.Descending;
            }
            else {
                multiSort = (<any>e).detail.sourceEvent.ctrlKey;
                switch (this._column.sortDirection) {
                    case SortDirection.Ascending: {
                        newSortingDirection = SortDirection.Descending;
                        break;
                    }
                    case SortDirection.Descending: {
                        newSortingDirection = multiSort && this._column.query.sortOptions.length > 1 ? SortDirection.None : SortDirection.Ascending;
                        break;
                    }
                    case SortDirection.None: {
                        newSortingDirection = SortDirection.Ascending;
                        break;
                    }
                }
            }

            this._column.column.sort(newSortingDirection, multiSort);
        }

        private _group() {
            this.column.query.group(this.column.column);
        }

        private _computeGroupByLabel(label: string, translations: any): string {
            return this.translateMessage("GroupByColumn", label);
        }

        private _togglePin() {
            this.fire("toggle-pin", this.column);
            this._setIsPinned(this.column.isPinned);
        }

        private _computePinLabel(isPinned: boolean): string {
            return isPinned ? this.translations.Unpin : this.translations.Pin;
        }

        private _hide() {
            this.fire("hide-column", this.column);
        }

        private _configure() {
            this.fire("configure-columns", null);
        }

        private _columnPropertyChanged(sender: Vidyano.QueryColumn, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "sortDirection")
                this._updateSortingIcon(sender.sortDirection);
        }

        private _updateLabel(label: string) {
            if (!this._labelTextNode)
                this._labelTextNode = this.$.label.appendChild(document.createTextNode(label));
            else
                this._labelTextNode.nodeValue = label;
        }

        private _updateSortingIcon(direction: Vidyano.SortDirection) {
            this._setSorting(direction === SortDirection.Ascending ? "SortAsc" : (direction === SortDirection.Descending ? "SortDesc" : null));
        }

        private _resizeTrack(detail: Polymer.TrackEvent) {
            if (detail.state === "start") {
                this.app.isTracking = true;
                this.classList.add("resizing");
            }
            else if (detail.state === "track") {
                if (this._resizingRAF)
                    cancelAnimationFrame(this._resizingRAF);

                this._resizingRAF = requestAnimationFrame(() => {
                    const width = Math.max(this.column.calculatedWidth + detail.dx, this._minimumColumnWidth);

                    this.style.width = `${width}px`;
                    this.fire("column-widths-updated", { column: this.column, columnWidth: width });
                });
            }
            else if (detail.state === "end") {
                this.classList.remove("resizing");

                this.style.width = "";

                this.column.calculatedWidth = Math.max(this.column.calculatedWidth + detail.dx, this._minimumColumnWidth);
                this.column.width = `${this.column.calculatedWidth}px`;

                this.fire("column-widths-updated", { column: this.column, columnWidth: this.column.calculatedWidth, save: true });
                this.app.isTracking = false;
            }
        }

        _viConfigure(actions: IConfigurableAction[]) {
            if (this.column.query.isSystem)
                return;

            actions.push({
                label: `Column: ${this.column.column.query.persistentObject.type}.${this.column.name}`,
                icon: "viConfigure",
                action: () => {
                    this.app.changePath(`Management/PersistentObject.f96c50b2-9871-47bb-81bd-de76bf1ce124/${this.column.query.id};${this.column.name}`);
                },
                subActions: [{
                    label: `Attribute: ${this.column.column.query.persistentObject.type}.${this.column.name}`,
                    icon: "viConfigure",
                    action: () => {
                        this.app.changePath(`Management/PersistentObject.1456569d-e02b-44b3-9d1a-a1e417061c77/${this.column.column.id}`);
                    }
                }]
            });
        }
    }
}
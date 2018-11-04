namespace Vidyano.WebComponents {
    export interface IGridColumn {
        name: string;
        force?: boolean;
        width?: number;
    }

    let _hideNativeScrollbars: boolean;

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
            },
            columns: {
                type: Array,
                computed: "_computeColumns(query.columns)"
            },
            hovering: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            scrolling: {
                type: String,
                readOnly: true,
                reflectToAttribute: true
            },
            atTop: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: true
            },
            outerWidth: {
                type: Number,
                notify: true,
                readOnly: true
            },
            outerHeight: {
                type: Number,
                notify: true,
                readOnly: true
            },
            innerWidth: {
                type: Number,
                readOnly: true
            },
            innerHeight: {
                type: Number,
                readOnly: true
            },
            horizontal: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            alignVerticalScrollbar: {
                type: String,
                reflectToAttribute: true
            },
            noHorizontal: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            vertical: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            noVertical: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            scrollbars: {
                type: String,
                reflectToAttribute: true
            },
            verticalScrollOffset: {
                type: Number,
                value: 0,
                notify: true,
                observer: "_verticalScrollOffsetChanged"
            },
            horizontalScrollOffset: {
                type: Number,
                value: 0,
                notify: true,
                observer: "_horizontalScrollOffsetChanged"
            },
            noScrollShadow: {
                type: Boolean,
                reflectToAttribute: true
            },
            scrollTopShadow: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
            },
            scrollBottomShadow: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            forceScrollbars: {
                type: Boolean,
                reflectToAttribute: true
            },
            hideNativeScrollbar: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            }
        },
        forwardObservers: [
            "query.items",
            "query.columns"
        ],
        observers: [
            "_updateVerticalScrollbar(outerHeight, innerHeight, verticalScrollOffset, noVertical)",
            "_updateHorizontalScrollbar(outerWidth, innerWidth, horizontalScrollOffset, noHorizontal)",
            "_updateTransforms(outerWidth, horizontalScrollOffset)"
        ],
        listeners: {
            "row-attached": "_rowAttached",
            "mouseenter": "_mouseenter",
            "mouseleave": "_mouseleave",
            "scroll": "_trapEvent"
        }
    })
    export class NewQueryGrid extends Vidyano.WebComponents.Scroller {
        private _innerSizeTrackerTask: number;
        private _measureAF: number;
        private _measure: boolean = true;
        private _physicalRows: NewQueryGridRow[];
        query: Vidyano.Query;

        attached() {
            super.attached();

            this.app.importComponent("ActionButton");
            this.app.importLib("iron-list");

            let syncingHeader = false, syncingData = false;
            this.$.dataWrapper.addEventListener("scroll", e => {
                if (!syncingData) {
                    syncingHeader = true;
                    this.$.headerHost.scrollLeft = this.$.dataWrapper.scrollLeft;
                }
                syncingData = false;
            }, { capture: true, passive: true });

            this.$.headerHost.addEventListener("scroll", e => {
                if (!syncingHeader) {
                    syncingData = true;
                    this.$.dataWrapper.scrollLeft = this.$.headerHost.scrollLeft;
                }
                syncingHeader = false;
            }, { capture: true, passive: true });

            (<any>this.$.dataList).scrollTarget = this.$.dataWrapper;

            this._innerSizeTrackerTask = setInterval(() => {
                const innerSize = { width: this.$.dataWrapper.scrollWidth, height: this.$.dataWrapper.scrollHeight };
                const update = innerSize.width !== this.innerWidth || innerSize.height !== this.innerHeight;

                (<any>this)._setInnerWidth(innerSize.width);
                (<any>this)._setInnerHeight(innerSize.height);

                if (update)
                    (<any>this)._updateScrollOffsets();
            }, 250);
        }

        detached() {
            super.detached();
            clearInterval(this._innerSizeTrackerTask);
        }

        get scroller(): HTMLElement {
            return this.$.dataWrapper;
        }

        private _updateTransforms(outerWidth: number, horizontalScrollOffset: number) {
            if (!this._physicalRows)
                return;

            this._physicalRows.forEach((row: NewQueryGridRow) => {
                row.updateTransforms(outerWidth, horizontalScrollOffset);
            });
        }

        private _computeColumns(columns: Vidyano.QueryColumn[]): NewQueryGridColumn[] {
            if (!columns)
                return [];

            const gridColumns = <NewQueryGridColumn[]>Enumerable.from(Polymer.dom(this).querySelectorAll("vi-new-query-grid-column")).toArray();
            if (gridColumns.length) {
                return gridColumns.map(g => {
                    g.column = columns.find(c => c.name === g.name);
                    return g.column ? g : null;
                }).filter(c => !!c);
            }

            return columns.map(c => {
                const gc = new Vidyano.WebComponents.NewQueryGridColumn();
                gc.name = c.name;
                gc.column = c;
                return gc;
            });
        }

        private _queryChanged() {
            for (let prop in this.customStyle) {
                if (prop.startsWith("--vi-new-query-grid-attribute-"))
                    this.customStyle[prop] = null;
            }

            this.updateStyles();
            this._measure = true;
        }

        private _rowAttached(e: CustomEvent, detail: { item: Vidyano.QueryResultItem; index: number; row: NewQueryGridRow; }) {
            e.stopPropagation();

            (this._physicalRows || (this._physicalRows = [])).push(detail.row);

            if (!this._measure) {
                detail.row.updateTransforms(this.outerWidth, this.horizontalScrollOffset);
                return;
            }

            const measure = () => {
                if (!this._measure)
                    return;

                const headersTemplate = <any>this.$.headers;
                headersTemplate.render();

                const headers: { [key: string]: number; } = {};
                Enumerable.from(Polymer.dom(this.root).querySelectorAll("vi-new-query-grid-header")).forEach((header: NewQueryGridHeader) => headers[header.column.name] = header.offsetWidth);

                this._measureAF = 0;

                const parentBoundingRect = this.$.dataWrapper.getBoundingClientRect();
                const rowRect = detail.row.getBoundingClientRect();

                if (rowRect.bottom > parentBoundingRect.height || detail.index === this.query.items.length - 1) {
                    const cellWidths = [].concat.apply([], this._physicalRows.map(row => row.getCellWidths()));
                    Enumerable.from(cellWidths).groupBy(cw => cw.column.name, cw => cw).forEach((cwg, index) => {
                        const width = Math.max(cwg.max(cw => cw.width), headers[cwg.key()]);
                        this.customStyle[`--vi-new-query-grid-attribute-${cwg.key().replace(".", "-")}-width`] = `${width}px`;
                    });

                    this.updateStyles();

                    this._updateTransforms(this.outerWidth, this.horizontalScrollOffset);

                    this._measure = false;
                }
            };

            cancelAnimationFrame(this._measureAF);
            this._measureAF = requestAnimationFrame(measure);
        }
    }

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            name: String,
            force: {
                type: Boolean,
                value: false
            },
            column: Object,
            width: {
                type: Number,
                value: 0
            }
        }
    })
    export class NewQueryGridColumn extends Vidyano.WebComponents.WebComponent {
        name: string;
        force: boolean;
        column: Vidyano.QueryColumn;
        width: number;
        grid: NewQueryGrid;
    }

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            column: {
                type: Object,
                observer: "_columnChanged"
            }
        }
    })
    export class NewQueryGridHeader extends Vidyano.WebComponents.WebComponent {
        column: NewQueryGridColumn;

        private _columnChanged(column: NewQueryGridColumn) {
            if (!column)
                return;

            this.style.width = `var(--vi-new-query-grid-attribute-${this.column.name.replace(".", "-")}-width)`;
            this.updateStyles();
        }
    }

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            item: Object,
            columns: Array,
            index: {
                type: Number,
                observer: "_indexChanged"
            },
            canRead: {
                type: Boolean,
                computed: "item.query.canRead",
                reflectToAttribute: true
            },
            actions: {
                type: Array,
                computed: "_computeActions(item.query)"
            }
        },
        observers: [
            "_fireAttached(item, index, isAttached)"
        ],
        listeners: {
            "tap": "_getPersistentObject"
        }
    })
    export class NewQueryGridRow extends Vidyano.WebComponents.WebComponent {
        item: Vidyano.QueryResultItem;

        private async _getPersistentObject(e: TapEvent) {
            if (!this.item.query.canRead)
                return;

            this.fire("open", this.item);
        }

        private _fireAttached(item: Vidyano.QueryResultItem, index: number, isAttached: boolean) {
            Polymer.dom(this).flush();
            this.fire("row-attached", { item: item, index: index, row: this });
        }

        private _actionsSizechanged(e: CustomEvent, detail: Vidyano.WebComponents.ISize) {
            const grid = <NewQueryGrid>this.findParent(e => e instanceof NewQueryGrid);
            grid.customStyle["--vi-new-query-grid-actions-width"] = `${detail.width}px`;
            grid.updateStyles();
        }

        private _indexChanged(index: number) {
            this.toggleClass("odd", !!((index + 1) % 2));
        }

        private _computeActions(query: Vidyano.Query): Vidyano.Action[] {
            return (query.actions || []).filter(a => a.isVisible && a.definition.selectionRule !== ExpressionParser.alwaysTrue && a.selectionRule(Math.max(1, query.selectedItems.length)));
        }

        updateTransforms(gridWidth: number, horizontalOffset: number) {
            this.translate3d(`calc(${gridWidth + horizontalOffset}px - var(--vi-new-query-grid-actions-width, 0))`, "0", "0", this.$.actions);
        }

        getCellWidths(): {
            column: NewQueryGridColumn;
            width: number;
        }[] {
            const cells = <NewQueryGridCell[]>Enumerable.from(Polymer.dom(this.root).querySelectorAll("vi-new-query-grid-cell")).toArray();
            return cells.map(cell => {
                return {
                    column: cell.column,
                    width: cell.firstElementChild.getBoundingClientRect().width
                };
            });
        }
    }

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            item: Object,
            column: {
                type: Object,
                observer: "_columnChanged"
            },
            persistentObject: Object,
            attribute: {
                type: Object,
                computed: "_computeAttribute(column, persistentObject)",
                value: null
            }
        },
        observers: [
            "_updateTemplate(item, column)"
        ]
    })
    export class NewQueryGridCell extends Vidyano.WebComponents.WebComponent {
        private _template: PolymerTemplate;
        private _instance: TemplateInstance;
        column: NewQueryGridColumn;

        private _computeAttribute(column: NewQueryGridColumn, persistentObject: Vidyano.PersistentObject): Vidyano.PersistentObjectAttribute {
            return persistentObject.getAttribute(column.name);
        }

        private _updateTemplate(item: Vidyano.QueryResultItem, gridColumn: NewQueryGridColumn) {
            let restamp: boolean;
            if (!this._template) {
                this._template = Vidyano.WebComponents.QueryGridCellTemplate.Load(gridColumn.column.type);
                restamp = true;
            }
            else {
                const newTemplate = Vidyano.WebComponents.QueryGridCellTemplate.Load(gridColumn.column.type);
                if (newTemplate !== this._template) {
                    this._template = newTemplate;
                    restamp = true;
                }
            }

            const itemValue = item.getFullValue(gridColumn.name);
            if (restamp) {
                const instance = this._instance = this._template.stamp({ value: itemValue });

                requestAnimationFrame(() => {
                    if (this._instance !== instance)
                        return;

                    Polymer.dom(this).appendChild(this._instance.root);
                });
            }
            else
                (<any>this._instance).value = itemValue;
        }

        private _columnChanged(column: NewQueryGridColumn) {
            if (!column)
                return;

            this.style.width = `var(--vi-new-query-grid-attribute-${this.column.name.replace(".", "-")}-width)`;
            this.updateStyles();
        }
    }
}
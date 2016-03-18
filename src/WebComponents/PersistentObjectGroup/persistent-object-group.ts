module Vidyano.WebComponents {
    interface PersistentObjectGroupItem {
        attribute: Vidyano.PersistentObjectAttribute;
        config: Vidyano.WebComponents.PersistentObjectAttributeConfig;
        presenter?: Vidyano.WebComponents.PersistentObjectAttributePresenter;
        x: number;
        y?: number;
        width: number;
        height: number;
    }

    interface PersistentObjectGroupRow {
        host: HTMLTableRowElement;
        cells: HTMLTableCellElement[];
    }

    @WebComponent.register({
        properties: {
            group: Object,
            groupIndex: Number,
            columns: Number,
            label: {
                type: String,
                computed: "_computeLabel(group, groupIndex, isAttached)"
            },
            loading: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true,
                value: true
            }
        },
        observers: [
            "_arrange(group.attributes, columns, isAttached)"
        ],
        listeners: {
            "attribute-loading": "_onAttributeLoading",
            "attribute-loaded": "_onAttributeLoaded"
        },
        forwardObservers: [
            "group.attributes"
        ]
    })
    export class PersistentObjectGroup extends WebComponent {
        private _items: PersistentObjectGroupItem[];
        private _itemsChecksum: string;
        private _presentersLoading: number = 0;
        private _layout: HTMLTableElement;
        group: Vidyano.PersistentObjectAttributeGroup;
        columns: number;
        loading: boolean;

        private _setLoading: (loading: boolean) => void;

        private _computeLabel(group: Vidyano.PersistentObjectAttributeGroup, groupIndex: number, isAttached: boolean): string {
            if (!isAttached)
                return;

            if (!group.label && groupIndex > 0)
                return this.app.translateMessage("DefaultAttributesGroup");

            return group.label;
        }

        private _arrange(attributes: Vidyano.PersistentObjectAttribute[], columns: number, attached: boolean) {
            if (!attached || !columns || !attributes || attributes.length === 0)
                return;

            if (!attributes || attributes.length === 0)
                this._items = [];
            else  if (!this._items)
                this._items = attributes.map(attr => this._itemFromAttribute(attr));
            else {
                const itemsEnum = Enumerable.from(this._items).memoize();
                this._items = attributes.map(attr => {
                    let item = itemsEnum.firstOrDefault(i => i.attribute === attr);
                    if (item) {
                        item.x = item.attribute.column;
                        item.width = Math.min(columns, item.config.calculateWidth(item.attribute));
                    }
                    else
                        item = this._itemFromAttribute(attr);

                    return item;
                });
            }

            let itemsChecksum: string = `${columns}`;
            const items = Enumerable.from(this._items).orderBy(item => item.attribute.offset).doAction(item => {
                itemsChecksum = `${itemsChecksum}${item.attribute.offset};${item.attribute.name};${item.height};${item.width};`;
            }).toArray();

            if (this._itemsChecksum !== itemsChecksum)
                this._itemsChecksum = itemsChecksum;
            else
                return;

            const layoutFragment = document.createDocumentFragment();
            const layout = layoutFragment.appendChild(document.createElement("table"));
            const rows: PersistentObjectGroupRow[] = [];
            const addRow = () => {
                rows.push({
                    host: document.createElement("tr"),
                    cells: new Array<HTMLTableCellElement>(columns)
                });

                layout.appendChild(rows[rows.length - 1].host);
            };

            let groupX = 0;
            let groupY = 0;

            while (items.length > 0) {
                let found = false;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const itemHeight = Math.max(item.height, 1);

                    if (item.x != null && groupX !== item.x) {
                        if (groupX > item.x) {
                            while (groupY < rows.length && rows[groupY].cells.reduce((v, c) => !!v || !!c, false))
                                groupY++;
                        }

                        groupX = Math.min(item.x, this.columns - 1);
                    }

                    while (rows.length < groupY + itemHeight)
                        addRow();

                    let canAdd = groupX + item.width <= this.columns;
                    for (let xx = 0; item.x == null && canAdd && xx < item.width; xx++) {
                        for (let yy = 0; yy < itemHeight; yy++) {
                            if (rows[groupY + yy].cells[groupX + xx] || (xx == 0 && groupX + xx > 0 && !rows[groupY + yy].cells[groupX + xx - 1])) {
                                canAdd = false;
                                break;
                            }
                        }
                    }

                    if (canAdd) {
                        item.x = groupX;
                        item.y = groupY;

                        var cell = document.createElement("td");
                        cell.colSpan = item.width;
                        cell.rowSpan = item.height > 0 ? itemHeight : 0;

                        rows[item.y].host.appendChild(cell);

                        if (!item.presenter) {
                            item.presenter = new Vidyano.WebComponents.PersistentObjectAttributePresenter();
                            item.presenter.attribute = item.attribute;
                        }

                        cell.appendChild(item.presenter);

                        for (let xx = 0; xx < item.width; xx++) {
                            for (let yy = 0; yy < itemHeight; yy++) {
                                rows[groupY + yy].cells[groupX + xx] = cell;
                            }
                        }

                        items.splice(i, 1);

                        groupX += item.width;
                        if (groupX >= this.columns) {
                            if (rows[groupY].cells.some(cell => cell.rowSpan === 0)) {
                                var totalRowHeight = Enumerable.from(rows[groupY].cells).max(cell => cell.rowSpan);
                                rows[groupY].cells.forEach(cell => {
                                    if (!cell.rowSpan)
                                        cell.rowSpan = totalRowHeight;
                                });
                            }

                            groupX = 0;
                            groupY += itemHeight;
                        }

                        found = true;
                        break;
                    }
                }

                if (items.length > 0 && !found) {
                    while (true) {
                        groupX++;

                        if (groupX >= this.columns) {
                            groupX = 0;
                            groupY++;
                            break;
                        }

                        while (rows.length <= groupY)
                            addRow();

                        if (!rows[groupY].cells[groupX])
                            break;
                    }
                }
            }

            rows.forEach(r => {
                for (var i=columns-1; i>=0 && !r.cells[i]; i--)
                    r.host.appendChild(document.createElement("td"));
            });

            if (this._layout)
                Polymer.dom(this.root).replaceChild(layoutFragment, this._layout);
            else
                Polymer.dom(this.root).appendChild(layoutFragment);

            this._layout = layout;
        }

        private _itemFromAttribute(attribute: Vidyano.PersistentObjectAttribute): PersistentObjectGroupItem {
            var config = this.app.configuration.getAttributeConfig(attribute);

            return {
                attribute: attribute,
                config: config,
                x: attribute.column,
                width: Math.min(this.columns, config.calculateWidth(attribute)),
                height: config.calculateHeight(attribute)
            };
        }

        private _onAttributeLoading(e: CustomEvent) {
            if (!this.loading) {
                this._presentersLoading = 0;
                this._setLoading(true);
            }
            else
                this._presentersLoading++;
        }

        private _onAttributeLoaded(e: CustomEvent) {
           if (--this._presentersLoading <= 0)
               this._setLoading(false);
        }
    }
}
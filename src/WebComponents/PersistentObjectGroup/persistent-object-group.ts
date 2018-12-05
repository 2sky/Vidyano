namespace Vidyano.WebComponents {
    "use strict";

    interface IPersistentObjectGroupItem {
        attribute: Vidyano.PersistentObjectAttribute;
        config: Vidyano.WebComponents.PersistentObjectAttributeConfig;
        presenter?: Vidyano.WebComponents.PersistentObjectAttributePresenter;
        area?: string;
        x: number;
        width: number;
        height: number;
    }

    interface IPersistentObjectGroupRow {
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
                computed: "_computeLabel(group, groupIndex, translations)"
            },
            noLabel: {
                type: Boolean,
                reflectToAttribute: true
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
            "attribute-loaded": "_onAttributeLoaded",
            "focus": "_focus"
        },
        forwardObservers: [
            "group.attributes"
        ]
    })
    export class PersistentObjectGroup extends WebComponent {
        private _asyncHandles: number[] = [];
        private _items: IPersistentObjectGroupItem[];
        private _itemsChecksum: string;
        private _presentersLoading: number = 0;
        private _layout: HTMLTableElement;
        readonly loading: boolean; private _setLoading: (loading: boolean) => void;
        group: Vidyano.PersistentObjectAttributeGroup;
        columns: number;

        detached() {
            super.detached();

            this._clearAsyncTasks();
        }

        private _computeLabel(group: Vidyano.PersistentObjectAttributeGroup, groupIndex: number, translations: any): string {
            if (group.label && groupIndex === 0) {
                const firstAttribute = group.attributes[0];
                if (firstAttribute && firstAttribute.tab.label === group.label)
                    return "";
            }
            else if (!group.label && groupIndex > 0)
                return this.translations["DefaultAttributesGroup"];

            return group.label;
        }

        private _arrange(attributes: Vidyano.PersistentObjectAttribute[], columns: number, attached: boolean) {
            if (!attached || !columns || !attributes || attributes.length === 0)
                return;

            let oldItems: IPersistentObjectGroupItem[] = [];
            if (!attributes || attributes.length === 0)
                this._items = [];
            else if (!this._items)
                this._items = attributes.map(attr => this._itemFromAttribute(attr));
            else {
                oldItems = this._items.slice();
                this._items = attributes.map(attr => {
                    let item = oldItems.find(i => i.attribute === attr);
                    if (item) {
                        item.x = item.attribute.column;
                        item.width = Math.min(columns, item.config.calculateWidth(item.attribute));

                        oldItems.splice(oldItems.indexOf(item));
                    }
                    else
                        item = this._itemFromAttribute(attr);

                    return item;
                });

                this._clearAsyncTasks();
            }

            let itemsChecksum: string = `${this.group.parent.type};${this.group.parent.objectId};${columns}`;
            const items = this._items.orderBy(item => item.attribute.offset);
            items.forEach(item => itemsChecksum = `${itemsChecksum}${item.attribute.offset};${item.attribute.name};${item.height};${item.width};`);

            if (this._itemsChecksum === itemsChecksum)
                return;

            this._clearAsyncTasks();
            oldItems.filter(item => item.presenter.isAttached).forEach(item => Polymer.dom(this.$.grid).removeChild(item.presenter));

            const areas: string[][] = [];

            let item = items.shift();
            let column = 0, row = 0;
            let infiniteColumns: {
                [index: number]: string;
            } = {};

            while (!!item) {
                const itemHeight = Math.max(item.height, 1);
                const itemX = item.x < columns ? item.x : null;
                const itemWidth = itemX == null ? Math.min(item.width, columns) : Math.min(item.width, columns - itemX);

                do {
                    if (areas.length < row + itemHeight) {
                        const newRow = Array.range(1, columns).map(_ => "");
                        areas.push(newRow);

                        let added = 0;
                        for (let x in infiniteColumns) {
                            newRow[x] = infiniteColumns[x];
                            added++;
                        }

                        if (added + itemWidth > columns)
                            infiniteColumns = {};

                        continue;
                    }

                    if (itemX != null) {
                        if (itemX < column) {
                            column = itemX;
                            row++;
                            continue;
                        }
                        else
                            column = itemX;
                    }

                    if (!areas[row][column])
                        break;

                    column++;
                    if (column >= columns || column + itemWidth - 1 >= columns) {
                        row++;
                        column = itemX || 0;
                    }
                }
                while (true);

                if (item.height === 0 && itemWidth !== columns) {
                    for (let x = 0; x < itemWidth; x++)
                        infiniteColumns[column + x] = item.area;
                }

                for (let y = 0; y < itemHeight; y++) {
                    for (let x = 0; x < itemWidth; x++)
                        areas[row + y][column + x] = item.area;
                }

                if (!item.presenter) {
                    item.presenter = new Vidyano.WebComponents.PersistentObjectAttributePresenter();
                    item.presenter.attribute = item.attribute;
                    item.presenter.customStyle[`--vi-persistent-object-group--attribute-area`] = item.area;

                    if (this.app.isIe) {
                        item.presenter.style.msGridRow = `${row + 1}`;
                        item.presenter.style.msGridColumn = `${column + 1}`;
                        item.presenter.style.msGridRowSpan = `${itemHeight}`;
                        item.presenter.style.msGridColumnSpan = `${itemWidth}`;
                    }
                }

                const renderItem = item;
                const renderHandle = Polymer.Async.run(() => {
                    Polymer.dom(this.$.grid).appendChild(renderItem.presenter);
                    renderItem.presenter.updateStyles();
                });
                this._asyncHandles.push(renderHandle);

                item = items.shift();
            }

            let newRow: string[];
            for (let x in infiniteColumns) {
                if (!newRow) {
                    newRow = Array.range(1, columns).map(_ => "");
                    areas.push(newRow);
                }

                newRow[x] = infiniteColumns[x];
            }

            if (this.app.isIe) {
                this.$.grid.style.msGridColumns = Array.range(1, columns).map(_ => "1fr").join(" ");
                this.$.grid.style.msGridRows = "auto";
            }

            this.customStyle[`--vi-persistent-object-group--grid-areas`] = areas.map(r => `"${r.map(a => a || ".").join(" ")}"`).join(" ");
            this.updateStyles();

            this._itemsChecksum = itemsChecksum;
        }

        private _clearAsyncTasks() {
            while (true) {
                const handle = this._asyncHandles.shift();
                if (!handle)
                    break;

                Polymer.Async.cancel(handle);
            }
        }

        private _itemFromAttribute(attribute: Vidyano.PersistentObjectAttribute): IPersistentObjectGroupItem {
            const config = this.app.configuration.getAttributeConfig(attribute);
            const item = {
                attribute: attribute,
                config: config,
                area: attribute.name,
                x: attribute.column,
                width: Math.min(this.columns, config.calculateWidth(attribute)),
                height: config.calculateHeight(attribute)
            };

            item.area = item.area.split("").map(c => c.charCodeAt(0) > 255 || (c >= "0" && c <= "9") || (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") ? c : "_").join("");
            if (/[0-9]/.test(item.area[0]))
                item.area = `_${item.area}`;

            if (item.height > 10)
                item.height = 1;

            return item;
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

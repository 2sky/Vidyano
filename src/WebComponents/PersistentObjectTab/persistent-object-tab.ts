module Vidyano.WebComponents {
    export interface Position {
        x: number;
        y: number;
    }

    export interface Size {
        width: number;
        height: number;
    }

    export class PersistentObjectTabItem extends Vidyano.Common.Observable<PersistentObjectTabItem> implements Position {
        private _x: number;
        private _y: number;
        private _width: number;
        private _height: number;

        constructor(public target: any) {
            super();
        }

        get x(): number {
            return this._x;
        }

        set x(val: number) {
            var oldVal = this._x;
            this.notifyPropertyChanged("x", this._x = val, oldVal);
        }

        get y(): number {
            return this._y;
        }

        set y(val: number) {
            var oldVal = this._y;
            this.notifyPropertyChanged("y", this._y = val, oldVal);
        }

        get width(): number {
            return this._width;
        }

        set width(val: number) {
            var oldVal = this._width;
            this.notifyPropertyChanged("width", this._width = val, oldVal);
        }

        get height(): number {
            return this._height;
        }

        set height(val: number) {
            var oldVal = this._height;
            this.notifyPropertyChanged("height", this._height = val, oldVal);
        }
    }

    export class PersistentObjectTab extends WebComponent {
        private _itemDragTargetPosition: Position;
        private _itemDragTargetSize: Size;
        private _lastArrangedColumnCount: number;
        tab: Vidyano.PersistentObjectAttributeTab;
        designMode: boolean;
        cells: PersistentObjectTabCell[][];
        items: PersistentObjectTabItem[];
        columns: number;
        rows: number;
        width: number;
        height: number;
        cellWidth: number;
        cellHeight: number;

        private _setItems: (items: PersistentObjectTabItem[]) => void;
        private _setWidth: (width: number) => void;
        private _setHeight: (height: number) => void;
        private _setCellWidth: (width: number) => void;
        private _setCellHeight: (height: number) => void;
        private _setRows: (rows: number) => void;
        private _setItemDragging: (dragging: boolean) => void;

        private _computeIsDesignModeAvailable(tab: Vidyano.PersistentObjectAttributeTab): boolean {
            return tab && tab.parent.actions["viConfigurePO"] !== undefined;
        }

        private _computeDesignModeCells(items: PersistentObjectTabItem[], columns: number, rows: number): PersistentObjectTabCell[][]{
            if (!items)
                return [];

            var cellsElement = <HTMLElement>this.$$("#cells");
            var itemsElement = <HTMLElement>this.$$("#items");

            var cells: PersistentObjectTabCell[][] = [];
            var oldCells = Enumerable.from(this.cells || []).selectMany(cell => cell).toArray();
            var newCells: PersistentObjectTabCell[] = [];
            if (cells.length != rows || cells[0].length != columns) {
                for (var y = 0; y < rows; y++) {
                    var row: PersistentObjectTabCell[] = [];
                    for (var x = 0; x < columns; x++) {
                        var cell: PersistentObjectTabCell;
                        row.push(cell = (this.cells && this.cells.length > y && this.cells[y].length > x ? this.cells[y][x] : new WebComponents.PersistentObjectTabCell(x, y)));
                        if (!cell.isAttached)
                            cellsElement.appendChild(cell);

                        newCells.push(cell);
                        if (!this.designMode)
                            break;
                    }

                    cells.push(row);
                    if (!this.designMode)
                        break;
                }
            }

            Enumerable.from(oldCells).except(newCells).forEach(oldCell => {
                cellsElement.removeChild(oldCell.asElement);
            });

            var width = Math.floor(this.width / this.columns);
            this._cellsForEach((cell, x, y) => {
                cell.style.width = width + "px";
                if (x == 0 && y == 0) {
                    this._setCellWidth(width);
                    this._setCellHeight(parseInt(window.getComputedStyle(cell.asElement).height));
                }
            }, cells);

            cellsElement.style.width = (width * this.columns) + "px";
            cellsElement.style.height = ((rows - 1) * this.cellHeight) + "px";
            itemsElement.style.width = (width * this.columns) + "px";
            itemsElement.style.height = ((rows - 1) * this.cellHeight) + "px";

            return cells;
        }

        private _computeColumns(width: number, defaultColumnCount: number): number {
            if (defaultColumnCount)
                return defaultColumnCount;

            if (this.width >= 1500)
                return 4;
            else if (this.width > 1000)
                return 3;
            else if (this.width > 500)
                return 2;

            return 1;
        }

        private _arrangeAutoLayout(tab: Vidyano.PersistentObjectAttributeTab, groups: Vidyano.PersistentObjectAttributeGroup[], columns: number) {
            if (tab.layout)
                return;

            var oldItems = Enumerable.from(this.items || []).memoize();
            var items: PersistentObjectTabItem[] = [];

            var tabY = 0;
            this.tab.groups.forEach(group => {
                if (tabY > 0 || !!(group.label && group.label.length > 0)) {
                    if (StringEx.isNullOrEmpty(group.label))
                        group.label = this.translations.DefaultAttributesGroup;

                    var groupItem = oldItems.firstOrDefault(i => i.target == group) || new PersistentObjectTabItem(group);
                    groupItem.x = 0;
                    groupItem.y = tabY;
                    groupItem.width = this.columns;
                    tabY += (groupItem.height = 1);

                    items.push(groupItem);
                }

                var itemsToArrange: PersistentObjectTabItem[] = [];
                group.attributes.forEach(attr => {
                    var attrItem = oldItems.firstOrDefault(i => i.target == attr);
                    if (!attrItem)
                        attrItem = new PersistentObjectTabItem(attr);

                    var config = this.app.configuration.getAttributeConfig(attr);
                    
                    attrItem.height = config.calculateHeight(attr);
                    attrItem.width = Math.min(this.columns, config.calculateWidth(attr));

                    itemsToArrange.push(attrItem);
                    items.push(attrItem);
                });

                var groupGrid: boolean[][] = [];
                var addRow = () => groupGrid.push(new Array<boolean>(this.columns));
                var groupX = 0;
                var groupY = 0;
                while (itemsToArrange.length > 0) {
                    var found = false;
                    for (var i = 0; i < itemsToArrange.length; i++) {
                        var item = itemsToArrange[i];
                        while (groupGrid.length < groupY + item.height)
                            addRow();

                        var canAdd = groupX + item.width <= this.columns;
                        for (var xx = 0; canAdd && xx < item.width; xx++) {
                            for (var yy = 0; yy < item.height; yy++) {
                                if (groupGrid[groupY + yy][groupX + xx] || (xx == 0 && groupX + xx > 0 && !groupGrid[groupY + yy][groupX + xx - 1])) {
                                    canAdd = false;
                                    break;
                                }
                            }
                        }

                        if (canAdd) {
                            item.x = groupX;
                            item.y = tabY + groupY;

                            for (var xx = 0; xx < item.width; xx++) {
                                for (var yy = 0; yy < item.height; yy++) {
                                    groupGrid[groupY + yy][groupX + xx] = true;
                                }
                            }

                            itemsToArrange.splice(i, 1);

                            groupX += item.width;
                            if (groupX >= this.columns) {
                                groupX = 0;
                                groupY += item.height;
                            }

                            found = true;
                            break;
                        }
                    }

                    if (itemsToArrange.length > 0 && !found) {
                        while (true) {
                            groupX++;

                            if (groupX >= this.columns) {
                                groupX = 0;
                                groupY++;
                                break;
                            }

                            while (groupGrid.length <= groupY)
                                addRow();

                            if (!groupGrid[groupY][groupX])
                                break;
                        }
                    }
                }

                tabY += groupGrid.length;
            });

            this._setRows(tabY + 1);
            this._lastArrangedColumnCount = this.columns;

            this._setItems(items);
        }

        private _sizeChanged(e: Event, detail: { width: number; height: number }) {
            e.stopPropagation();

            if (detail.width > 0)
                this._setWidth(detail.width);

            if (detail.height > 0)
                this._setHeight(detail.height);
        }

        private _cellsForEach(fnc: (cell: PersistentObjectTabCell, x: number, y: number) => void, cells: PersistentObjectTabCell[][] = this.cells) {
            for (var y = 0; y < cells.length; y++) {
                for (var x = 0; x < cells[y].length; x++) {
                    fnc(cells[y][x], x, y);
                }
            }
        }

        private _itemDragStart(e: Event, detail: { resizing: boolean; item: Vidyano.WebComponents.PersistentObjectTabItem }) {
            this._setItemDragging(true);
            this._setRows(Enumerable.from(this.items).max(item => item.y + (item.height - 1)) + 2);
        }

        private _itemDragEnd(e: Event, detail: { resizing: boolean; item: Vidyano.WebComponents.PersistentObjectTabItem }) {
            if (!detail.resizing && this._itemDragTargetPosition) {
                detail.item.x = this._itemDragTargetPosition.x;
                detail.item.y = this._itemDragTargetPosition.y;
            }
            else if (this._itemDragTargetSize) {
                detail.item.width = this._itemDragTargetSize.width;
                detail.item.height = this._itemDragTargetSize.height;
            }

            this._setItemDragging(false);
            this._setRows(Enumerable.from(this.items).max(item => item.y + (item.height - 1)) + 2);
        }

        private _itemDrag(e: Event, detail: { x: number; y: number; width: number; height: number; resizing: boolean; item: Vidyano.WebComponents.PersistentObjectTabItem }) {
            if (!detail.resizing) {
                var newX = Math.max(Math.round(detail.x / this.cellWidth), 0);
                var newY = Math.max(Math.round(detail.y / this.cellHeight), 0);

                newX = Math.min(newX, this.columns - detail.item.width);

                this._setRows(Math.max(Enumerable.from(this.items).except([detail.item]).max(item => item.y + (item.height - 1)) + 1, newY + detail.item.height) + 1);
                this._itemDragTargetPosition = {
                    x: newX,
                    y: newY,
                };
            }
            else {
                var newWidth = Math.max(Math.round(detail.width / this.cellWidth), 1);
                var newHeight = Math.max(Math.round(detail.height / this.cellHeight), 1);

                newWidth = Math.min(newWidth, this.columns - detail.item.x);

                this._setRows(Math.max(Enumerable.from(this.items).except([detail.item]).max(item => item.y + (item.height - 1)) + 1, detail.item.y + newHeight) + 1);
                this._itemDragTargetSize = {
                    width: newWidth,
                    height: newHeight,
                };
            }
        }

        private _toggleDesignMode(e: UIEvent) {
            this.designMode = !this.designMode;
        }
    }

    export class PersistentObjectTabCell extends WebComponent {
        constructor(public x: number, public y: number) {
            super();
        }
    }

    export class PersistentObjectTabItemPresenter extends WebComponent {
        private _renderedItem: PersistentObjectTabItem;
        private _itemObserver: Vidyano.Common.SubjectDisposer;
        private _position: Position;
        private _size: Size;
        cellWidth: number;
        cellHeight: number;
        item: PersistentObjectTabItem;
        designMode: boolean;

        private _setDragging: (dragging: boolean) => void;

        private _computeLayout() {
            if (this._itemObserver && (!this.isAttached || this._renderedItem != this.item)) {
                this._itemObserver();
                this.empty();
            }

            if (this.item && this.attached) {
                this._setPosition(this.item.x * this.cellWidth, this.item.y * this.cellHeight);
                this._setSize(this.item.width * this.cellWidth, this.item.height * this.cellHeight);

                if (this._renderedItem != this.item) {
                    this._itemObserver = this.item.propertyChanged.attach(this._itemPropertyChanged.bind(this));
                    var content: HTMLElement;
                    if (this.item.target instanceof Vidyano.PersistentObjectAttribute) {
                        var attributePresenter = new WebComponents.PersistentObjectAttributePresenter();
                        attributePresenter.attribute = <Vidyano.PersistentObjectAttribute>this.item.target;
                        content = attributePresenter.asElement;
                    }
                    else if (this.item.target instanceof Vidyano.PersistentObjectAttributeGroup) {
                        var groupPresenter = new WebComponents.PersistentObjectGroup();
                        groupPresenter.group = <Vidyano.PersistentObjectAttributeGroup>this.item.target;
                        content = groupPresenter.asElement;
                    }
                    else if (this.item.target instanceof Vidyano.Query) {
                        var queryItemsPresenter = new WebComponents.QueryItemsPresenter();
                        queryItemsPresenter.query = <Vidyano.Query>this.item.target;
                        content = queryItemsPresenter.asElement;

                        if (!queryItemsPresenter.query.hasSearched)
                            queryItemsPresenter.query.search();
                    }

                    if (content) {
                        if (!content.classList)
                            content.className = "flex";
                        else
                            content.classList.add("flex");

                        this._renderedItem = this.item;
                        Polymer.dom(this).appendChild(content);
                    }
                }
            }
        }

        private _itemPropertyChanged(sender: PersistentObjectTabItem, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName == "x" || args.propertyName == "y") {
                this._setPosition(sender.x * this.cellWidth, sender.y * this.cellHeight);
            }
            else if (args.propertyName == "width")
                this._setSize(sender.width * this.cellWidth);
            else if (args.propertyName == "height")
                this._setSize(undefined, sender.height * this.cellHeight);
        }

        private _setPosition(x: number, y: number): Position {
            this._position = {
                x: x,
                y: y
            };

            this.asElement.style.left = this._position.x + "px";
            this.asElement.style.top = this._position.y + "px";

            return this._position;
        }

        private _setSize(width?: number, height?: number) {
            if (width)
                this.asElement.style.width = Math.max(width, this.cellWidth) + "px";

            if (height)
                this.asElement.style.height = Math.max(height, this.cellHeight) + "px";

            this._size = {
                width: width || (this._size ? this._size.width : undefined),
                height: height || (this._size ? this._size.height : undefined),
            };
        }

        private _track(e: CustomEvent, detail: PolymerTrackDetail) {
            if (!this.designMode)
                return;

            var inResizeDragMode = (<HTMLElement>e.target).id == "anchor";
            if (detail.state == "track") {
                if (!inResizeDragMode)
                    this._setPosition(this._position.x + detail.ddx, this._position.y + detail.ddy);
                else
                    this._setSize(this._size.width + detail.ddx, this._size.height + detail.ddy);

                this.fire("item-drag", {
                    x: this._position.x,
                    y: this._position.y,
                    width: this._size.width,
                    height: this._size.height,
                    resizing: inResizeDragMode,
                    item: this.item,
                });
            }
            else if (detail.state == "start") {
                this._setDragging(true);

                this.fire("item-drag-start", {
                    item: this.item,
                    resizing: inResizeDragMode
                });
            }
            else if (detail.state == "end") {
                this._setDragging(false);

                this.fire("item-drag-end", {
                    item: this.item,
                    resizing: inResizeDragMode
                });
            }

            e.preventDefault();
            e.stopPropagation();
        }
    }

    WebComponent.register(PersistentObjectTab, WebComponents, "vi", {
        properties: {
            tab: Object,
            columns: {
                type: Number,
                computed: "_computeColumns(width, tab.columnCount)"
            },
            rows: {
                type: Number,
                readOnly: true
            },
            cells: {
                type: Array,
                computed: "_computeDesignModeCells(items, columns, rows, width, isDesignModeAvailable, designMode)"
            },
            items: {
                type: Array,
                readOnly: true
            },
            width: {
                type: Number,
                readOnly: true
            },
            height: {
                type: Number,
                readOnly: true
            },
            cellWidth: {
                type: Number,
                readOnly: true
            },
            cellHeight: {
                type: Number,
                readOnly: true
            },
            designMode: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            isDesignModeAvailable: {
                type: Boolean,
                computed: "_computeIsDesignModeAvailable(tab)"
            },
            itemDragging: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            }
        },
        observers: [
            "_arrangeAutoLayout(tab, tab.groups, columns)"
        ],
        hostAttributes: {
            "class": "relative"
        },
        listeners: {
            "sizechanged": "_sizeChanged",
            "item-drag": "_itemDrag",
            "item-drag-start": "_itemDragStart",
            "item-drag-end": "_itemDragEnd"
        },
        forwardObservers: [
            "tab.groups"
        ]
    });

    WebComponent.register(PersistentObjectTabCell, WebComponents, "vi", {
        properties: {
            x: Number,
            y: Number
        },
        hostAttributes: {
            "class": "relative"
        }
    });

    WebComponent.register(PersistentObjectTabItemPresenter, WebComponents, "vi", {
        properties: {
            cellWidth: Number,
            cellHeight: Number,
            item: Object,
            designMode: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            dragging: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            }
        },
        observers: [
            "_computeLayout(isAttached, item, cellWidth, cellHeight, designMode)"
        ]
    });
}
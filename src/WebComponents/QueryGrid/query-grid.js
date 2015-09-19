var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var QueryGrid = (function (_super) {
            __extends(QueryGrid, _super);
            function QueryGrid() {
                _super.apply(this, arguments);
            }
            QueryGrid.prototype.attached = function () {
                var _this = this;
                if (QueryGrid.tableCache.length > 0 && !this._tableData) {
                    var tableCache = QueryGrid.tableCache.pop();
                    requestAnimationFrame(function () {
                        _this._tableHeader = tableCache.header;
                        _this._tableData = tableCache.data;
                        _this._tableHeader.grid = _this._tableData.grid = _this;
                        _this.$["dataHeaderHost"].appendChild(_this._tableHeader.host);
                        _this.$["dataHost"].appendChild(_this._tableData.host);
                    });
                }
                _super.prototype.attached.call(this);
            };
            QueryGrid.prototype.detached = function () {
                var _this = this;
                _super.prototype.detached.call(this);
                if (this._tableData) {
                    var headerFragment = document.createDocumentFragment();
                    var dataFragment = document.createDocumentFragment();
                    var cachEntry = {
                        header: this._tableHeader,
                        data: this._tableData
                    };
                    QueryGrid.tableCache.push(cachEntry);
                    requestAnimationFrame(function () {
                        headerFragment.appendChild(_this._tableHeader.host);
                        dataFragment.appendChild(_this._tableData.host);
                        _this._tableHeader.grid = _this._tableData.grid = null;
                        _this._tableHeader = _this._tableData = null;
                    });
                    this.transform("", this._tableHeader.host);
                    this._tableHeader.rows[0].columns.forEach(function (cell) {
                        if (cell.column && cell.column.isPinned)
                            _this.transform("", cell.cell.parentElement);
                        cell.setColumn(null);
                    });
                    Enumerable.from(this._tableData.rows).forEach(function (row) {
                        row.columns.forEach(function (cell) {
                            if (cell.column && cell.column.isPinned)
                                _this.transform("", cell.cell.parentElement);
                        });
                        _this.transform("", row.selector.host);
                        _this.transform("", row.actions.host);
                        row.setItem(null, null);
                    });
                }
            };
            QueryGrid.prototype.isColumnInView = function (column) {
                if (column.isPinned || !this._columnOffsets)
                    return true;
                return (this._columnOffsets[column.name] || 0) < this.viewportSize.width + this._horizontalScrollOffset;
            };
            Object.defineProperty(QueryGrid.prototype, "_style", {
                get: function () {
                    return this.$["style"];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGrid.prototype, "_actions", {
                get: function () {
                    return this.$["actions"];
                },
                enumerable: true,
                configurable: true
            });
            QueryGrid.prototype._sizeChanged = function (e, detail) {
                var _this = this;
                this._setViewportSize(detail);
                this._setRowHeight(parseInt(getComputedStyle(this).lineHeight));
                this._requestAnimationFrame(function () {
                    _this._updateTableDataPendingUpdates();
                    if (!_this._remainderWidth || _this._remainderWidth < detail.width) {
                        _this._style.setStyle("Remainder", "td[is=\"vi-query-grid-table-column-remainder\"] { width: " + detail.width + "px; }");
                        _this._remainderWidth = detail.width * 2;
                    }
                });
            };
            QueryGrid.prototype._horizontalScrollOffsetChanged = function (horizontalScrollOffset) {
                var _this = this;
                if (!this._tableData || (!horizontalScrollOffset && !this._horizontalScrollOffsetCurrent))
                    return;
                if (this._actions.open)
                    this._actions.close();
                this.transform("translate(" + -(this._horizontalScrollOffsetCurrent = horizontalScrollOffset) + "px, 0)", this._tableHeader.host);
                [this._tableHeader, this._tableData].forEach(function (table) {
                    table.rows.forEach(function (row) {
                        row.columns.forEach(function (column) {
                            if (column.host.classList.contains("pinned"))
                                _this.transform("translate(" + horizontalScrollOffset + "px, 0)", column.host);
                        });
                        if (row instanceof QueryGridTableDataRow) {
                            _this.transform("translate(" + horizontalScrollOffset + "px, 0)", row.selector.host);
                            _this.transform("translate(" + horizontalScrollOffset + "px, 0)", row.actions.host);
                        }
                    });
                });
                this._updateTableDataPendingUpdates();
            };
            QueryGrid.prototype._computeColumns = function (columns) {
                if (columns === void 0) { columns = []; }
                return Enumerable.from(columns).where(function (c) { return !c.isHidden && c.isPinned; }).orderBy(function (c) { return c.offset; }).concat(Enumerable.from(columns).where(function (c) { return !c.isHidden && !c.isPinned; }).orderBy(function (c) { return c.offset; }).toArray()).toArray();
            };
            QueryGrid.prototype._computeItems = function (items, viewportSize, verticalScrollOffset, rowHeight) {
                var _this = this;
                if (!rowHeight || !viewportSize.height)
                    return [];
                if (this._actions.open)
                    this._actions.close();
                var maxTableRowCount = Math.floor(viewportSize.height * 1.5 / rowHeight);
                var viewportStartRowIndex = Math.floor(verticalScrollOffset / rowHeight);
                var viewportEndRowIndex = Math.ceil((verticalScrollOffset + viewportSize.height) / rowHeight);
                var newVirtualTableStartIndex;
                if (this._virtualTableStartIndex === undefined)
                    this._virtualTableStartIndex = newVirtualTableStartIndex = 0;
                else if (viewportEndRowIndex - this._virtualTableStartIndex > maxTableRowCount)
                    newVirtualTableStartIndex = viewportStartRowIndex;
                else if (viewportStartRowIndex < this._virtualTableStartIndex)
                    newVirtualTableStartIndex = viewportEndRowIndex - maxTableRowCount;
                if (newVirtualTableStartIndex !== undefined) {
                    if (newVirtualTableStartIndex % 2 != 0)
                        newVirtualTableStartIndex--;
                    if (newVirtualTableStartIndex < 0)
                        newVirtualTableStartIndex = 0;
                    this._virtualTableStartIndex = newVirtualTableStartIndex;
                    this._virtualTableOffset = this._virtualTableStartIndex * rowHeight;
                }
                var newItems = items.slice(this._virtualTableStartIndex, this._virtualTableStartIndex + maxTableRowCount).filter(function (item) { return !!item; });
                if (newItems.length !== maxTableRowCount && this.query.totalItems && items.length !== this.query.totalItems) {
                    this.query.getItems(this._virtualTableStartIndex).then(function () {
                        _this.set("_forceUpdate", new Date());
                    });
                }
                else if (newVirtualTableStartIndex === undefined && this._items && this._items.length === newItems.length)
                    return this._items;
                return newItems;
            };
            QueryGrid.prototype._updateTables = function (columns, items) {
                var _this = this;
                var _tablesUpdatingTimestamp = this._tablesUpdatingTimestamp = new Date();
                var tablesUpdating = this._tablesUpdating = (this._tablesUpdating || Promise.resolve()).then(function () { return new Promise(function (resolve) {
                    if (_tablesUpdatingTimestamp !== _this._tablesUpdatingTimestamp)
                        return resolve(null);
                    _this._requestAnimationFrame(function () {
                        var start = Vidyano.WebComponents.QueryGrid.perf.now();
                        if (!_this._tableHeader)
                            _this.$["dataHeaderHost"].appendChild((_this._tableHeader = new Vidyano.WebComponents.QueryGridTableHeader(_this)).host);
                        if (!_this._tableData)
                            _this.$["dataHost"].appendChild((_this._tableData = new Vidyano.WebComponents.QueryGridTableData(_this)).host);
                        Promise.all([_this._tableHeader.update(1, columns.length), _this._tableData.update(items.length, columns.length)]).then(function () {
                            var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                            console.info("Tables Updated: " + Math.round(timeTaken) + "ms");
                            _this._updateTableHeaders(columns).then(function (cont) {
                                if (!cont)
                                    return Promise.resolve();
                                return _this._updateTableData(items);
                            }).then(function () {
                                resolve(null);
                                if (tablesUpdating === _this._tablesUpdating)
                                    _this._tablesUpdating = null;
                            });
                        });
                    });
                }); });
            };
            QueryGrid.prototype._updateVerticalSpacer = function (totalItems, rowHeight) {
                var _this = this;
                this._requestAnimationFrame(function () {
                    var newHeight = totalItems * rowHeight;
                    _this.$["verticalSpacer"].style.height = newHeight + "px";
                    if (newHeight > _this._virtualTableOffset)
                        _this.set("_forceUpdate", new Date());
                });
            };
            QueryGrid.prototype._updateTableHeaders = function (columns) {
                var _this = this;
                return new Promise(function (resolve) {
                    _this._requestAnimationFrame(function () {
                        if (columns !== _this._columns) {
                            resolve(false);
                            return;
                        }
                        _this._tableHeader.rows[0].setColumns(columns);
                        resolve(true);
                    });
                });
            };
            QueryGrid.prototype._updateTableData = function (items) {
                var _this = this;
                var horizontalScrollOffset = this._horizontalScrollOffset;
                var virtualTableStartIndex = this._virtualTableStartIndex;
                return new Promise(function (resolve) {
                    var start = Vidyano.WebComponents.QueryGrid.perf.now();
                    var rowCount = _this._tableData && _this._tableData.rows && _this._tableData.rows.length > 0 ? _this._tableData.rows.length : 0;
                    var virtualTableOffset = _this._virtualTableOffset;
                    _this._requestAnimationFrame(function () {
                        for (var index = 0; index < rowCount; index++) {
                            if (items != _this._items || virtualTableStartIndex !== _this._virtualTableStartIndex) {
                                resolve(false);
                                return;
                            }
                            _this._tableData.rows[index].setItem(items[index], _this._columns);
                        }
                        if (_this._virtualTableOffsetCurrent !== _this._virtualTableOffset && _this._virtualTableOffset === virtualTableOffset)
                            _this.translate3d("0", (_this._virtualTableOffsetCurrent = _this._virtualTableOffset) + "px", "0", _this.$["dataHost"]);
                        var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                        console.info("Data Updated: " + timeTaken + "ms");
                        _this._updateColumnWidths().then(function () {
                            resolve(true);
                        });
                    });
                });
            };
            QueryGrid.prototype._updateTableDataPendingUpdates = function () {
                var _this = this;
                if (!this._tableData)
                    return;
                if (this._updateTableDataPendingUpdatesRAF)
                    cancelAnimationFrame(this._updateTableDataPendingUpdatesRAF);
                this._updateTableDataPendingUpdatesRAF = this._requestAnimationFrame(function () {
                    var start = Vidyano.WebComponents.QueryGrid.perf.now();
                    Enumerable.from(_this._tableData.rows).forEach(function (row) { return row.updatePendingCellUpdates(); });
                    var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                    console.info("Pending Data Updated: " + timeTaken + "ms");
                });
            };
            QueryGrid.prototype._updateColumnWidths = function () {
                var _this = this;
                return new Promise(function (resolve) {
                    _this._requestAnimationFrame(function () {
                        if (!_this._tableData || !_this._tableData.rows || _this._tableData.rows.length == 0 || _this._tableData.rows[0].host.hasAttribute("no-data")) {
                            if (_this.query && !_this.query.isBusy)
                                _this._setInitializing(false);
                            resolve(null);
                            return;
                        }
                        var start = Vidyano.WebComponents.QueryGrid.perf.now();
                        var invalidateColumnWidths;
                        var columnWidths = _this._columnWidths || {};
                        var columnOffsets = _this._columnOffsets || {};
                        [_this._tableHeader, _this._tableData].some(function (table) {
                            if (table.rows && table.rows.length > 0) {
                                var offset = 0;
                                return table.rows[0].columns.filter(function (cell) { return !!cell.column && (!_this._columnWidths || !_this._columnWidths[cell.column.name]); }).some(function (cell) {
                                    var width = cell.cell.offsetWidth;
                                    if (width !== columnWidths[cell.column.name]) {
                                        columnWidths[cell.column.name] = Math.max(width, columnWidths[cell.column.name] || 0);
                                        invalidateColumnWidths = true;
                                    }
                                    columnOffsets[cell.column.name] = offset;
                                    offset += columnWidths[cell.column.name];
                                    if (!columnWidths[cell.column.name]) {
                                        invalidateColumnWidths = false;
                                        return true;
                                    }
                                });
                            }
                        });
                        if (invalidateColumnWidths) {
                            if (columnWidths !== _this._columnWidths)
                                _this._columnWidths = columnWidths;
                            if (columnOffsets !== _this._columnOffsets)
                                _this._columnOffsets = columnOffsets;
                            var columnWidthsStyle = [];
                            _this._columns.forEach(function (col, index) {
                                var columnName = Vidyano.WebComponents.QueryGridTableColumn.columnSafeName(col.name);
                                columnWidthsStyle.push("table td[name=\"" + columnName + "\"] > * { width: " + _this._columnWidths[col.name] + "px; } ");
                            });
                            (_a = _this._style).setStyle.apply(_a, ["ColumnWidths"].concat(columnWidthsStyle));
                        }
                        var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                        console.info("Column Widths Updated: " + timeTaken + "ms");
                        _this._setInitializing(false);
                        resolve(null);
                        var _a;
                    });
                });
            };
            QueryGrid.prototype._requestAnimationFrame = function (action) {
                var _this = this;
                return requestAnimationFrame(function () {
                    if (!_this.isAttached)
                        return;
                    action();
                });
            };
            QueryGrid.prototype._preventScroll = function (e) {
                if (this.scrollLeft > 0 || this.scrollTop > 0) {
                    console.error("Attempt to scroll query grid");
                    this.scrollLeft = this.scrollTop = 0;
                    e.preventDefault();
                    e.stopPropagation();
                }
            };
            QueryGrid.prototype._computeCanSelect = function (query) {
                return !!query && query.actions.some(function (a) { return a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue; });
            };
            QueryGrid.prototype._computeCanSelectAll = function (query, canSelect) {
                return canSelect && query.selectAll.isAvailable;
            };
            QueryGrid.prototype._computeInlineActions = function (query) {
                return !!query && !query.asLookup && !this.asLookup && (query.actions.some(function (a) { return a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1); }));
            };
            QueryGrid.prototype._computeCanFilter = function (query) {
                return !!query && query.canFilter;
            };
            QueryGrid.tableCache = [];
            QueryGrid.perf = performance;
            QueryGrid = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        initializing: {
                            type: Boolean,
                            readOnly: true,
                            reflectToAttribute: true,
                            value: true
                        },
                        isBusy: {
                            type: Boolean,
                            reflectToAttribute: true,
                            computed: "query.isBusy"
                        },
                        query: {
                            type: Object
                        },
                        asLookup: {
                            type: Boolean,
                            reflectToAttribute: true
                        },
                        _columns: {
                            type: Object,
                            computed: "_computeColumns(query.columns)"
                        },
                        _items: {
                            type: Object,
                            computed: "_computeItems(query.items, viewportSize, _verticalScrollOffset, rowHeight, _forceUpdate)"
                        },
                        _forceUpdate: {
                            type: Object,
                            value: null
                        },
                        viewportSize: {
                            type: Object,
                            readOnly: true
                        },
                        rowHeight: {
                            type: Number,
                            readOnly: true
                        },
                        canSelect: {
                            type: Boolean,
                            reflectToAttribute: true,
                            computed: "_computeCanSelect(query)"
                        },
                        canSelectAll: {
                            type: Boolean,
                            reflectToAttribute: true,
                            computed: "_computeCanSelectAll(query, canSelect)"
                        },
                        inlineActions: {
                            type: Boolean,
                            reflectToAttribute: true,
                            computed: "_computeInlineActions(query)"
                        },
                        canFilter: {
                            type: Boolean,
                            reflectToAttribute: true,
                            computed: "_computeCanFilter(query)"
                        },
                        _verticalScrollOffset: Number,
                        _horizontalScrollOffset: {
                            type: Number,
                            observer: "_horizontalScrollOffsetChanged"
                        }
                    },
                    observers: [
                        "_updateTables(_columns, _items, isAttached)",
                        "_updateVerticalSpacer(query.totalItems, rowHeight)",
                    ],
                    forwardObservers: [
                        "query.columns",
                        "query.items",
                        "query.isBusy",
                        "query.totalItems"
                    ],
                    listeners: {
                        "scroll": "_preventScroll"
                    }
                })
            ], QueryGrid);
            return QueryGrid;
        })(WebComponents.WebComponent);
        WebComponents.QueryGrid = QueryGrid;
        var QueryGridHeader = (function (_super) {
            __extends(QueryGridHeader, _super);
            function QueryGridHeader() {
                _super.apply(this, arguments);
            }
            QueryGridHeader.prototype._toggleSelectAll = function () {
                if (!this.query || !this.canSelectAll)
                    return;
                this.query.selectAll.inverse = !this.query.selectAll.inverse;
            };
            QueryGridHeader = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        query: Object,
                        canSelectAll: {
                            type: Boolean,
                            reflectToAttribute: true
                        },
                        canFilter: {
                            type: Boolean,
                            reflectToAttribute: true
                        }
                    }
                })
            ], QueryGridHeader);
            return QueryGridHeader;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridHeader = QueryGridHeader;
        var QueryGridTable = (function () {
            function QueryGridTable(is, grid) {
                this.grid = grid;
                this.rows = [];
                this._host = document.createElement("table", is);
            }
            QueryGridTable.prototype.update = function (rowCount, columnCount) {
                if (!this.section)
                    this._section = this._createSection();
                if (this.rows.length < rowCount) {
                    var fragment = document.createDocumentFragment();
                    while (this.rows.length < rowCount) {
                        var row = this._addRow();
                        this.rows.push(row);
                        fragment.appendChild(row.host);
                    }
                    this._section.appendChild(fragment);
                }
                return Promise.all(this.rows.map(function (row) { return row.updateColumnCount(columnCount); }));
            };
            Object.defineProperty(QueryGridTable.prototype, "section", {
                get: function () {
                    return this._section;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTable.prototype, "host", {
                get: function () {
                    return this._host;
                },
                enumerable: true,
                configurable: true
            });
            return QueryGridTable;
        })();
        WebComponents.QueryGridTable = QueryGridTable;
        var QueryGridTableHeader = (function (_super) {
            __extends(QueryGridTableHeader, _super);
            function QueryGridTableHeader(grid) {
                _super.call(this, "vi-query-grid-table-header", grid);
            }
            QueryGridTableHeader.prototype.update = function (rowCount, columnCount) {
                return _super.prototype.update.call(this, 1, columnCount);
            };
            QueryGridTableHeader.prototype._addRow = function () {
                return new Vidyano.WebComponents.QueryGridTableHeaderRow(this);
            };
            QueryGridTableHeader.prototype._createSection = function () {
                return this.host.appendChild(document.createElement("thead"));
            };
            return QueryGridTableHeader;
        })(QueryGridTable);
        WebComponents.QueryGridTableHeader = QueryGridTableHeader;
        var QueryGridTableData = (function (_super) {
            __extends(QueryGridTableData, _super);
            function QueryGridTableData(grid) {
                _super.call(this, "vi-query-grid-table-data", grid);
            }
            QueryGridTableData.prototype._addRow = function () {
                return new Vidyano.WebComponents.QueryGridTableDataRow(this);
            };
            QueryGridTableData.prototype._createSection = function () {
                return this.host.appendChild(new Vidyano.WebComponents.QueryGridTableDataBody());
            };
            return QueryGridTableData;
        })(QueryGridTable);
        WebComponents.QueryGridTableData = QueryGridTableData;
        var QueryGridTableDataBody = (function (_super) {
            __extends(QueryGridTableDataBody, _super);
            function QueryGridTableDataBody() {
                _super.apply(this, arguments);
            }
            QueryGridTableDataBody = __decorate([
                WebComponents.Sortable.register({
                    extends: "tbody"
                })
            ], QueryGridTableDataBody);
            return QueryGridTableDataBody;
        })(WebComponents.Sortable);
        WebComponents.QueryGridTableDataBody = QueryGridTableDataBody;
        var QueryGridTableRow = (function () {
            function QueryGridTableRow(is, _table) {
                this._table = _table;
                this.columns = [];
                this._host = document.createElement("tr", is);
                this.host.appendChild((this._remainder = new Vidyano.WebComponents.QueryGridTableColumnRemainder()).host);
            }
            QueryGridTableRow.prototype.updateColumnCount = function (columnCount) {
                var _this = this;
                if (this.columns.length >= columnCount)
                    return Promise.resolve();
                return new Promise(function (resolve) {
                    var columnsFragment = document.createDocumentFragment();
                    while (_this.columns.length < columnCount) {
                        var column = _this._createColumn();
                        _this.columns.push(column);
                        columnsFragment.appendChild(column.host);
                    }
                    _this.host.insertBefore(columnsFragment, _this._remainder.host);
                    resolve(null);
                });
            };
            Object.defineProperty(QueryGridTableRow.prototype, "table", {
                get: function () {
                    return this._table;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTableRow.prototype, "host", {
                get: function () {
                    return this._host;
                },
                enumerable: true,
                configurable: true
            });
            return QueryGridTableRow;
        })();
        WebComponents.QueryGridTableRow = QueryGridTableRow;
        var QueryGridTableHeaderRow = (function (_super) {
            __extends(QueryGridTableHeaderRow, _super);
            function QueryGridTableHeaderRow(table) {
                _super.call(this, "vi-query-grid-table-header-row", table);
            }
            QueryGridTableHeaderRow.prototype.setColumns = function (columns) {
                this.columns.forEach(function (col, index) { return col.setColumn(columns[index]); });
            };
            QueryGridTableHeaderRow.prototype._createColumn = function () {
                return new Vidyano.WebComponents.QueryGridTableHeaderColumn();
            };
            return QueryGridTableHeaderRow;
        })(QueryGridTableRow);
        WebComponents.QueryGridTableHeaderRow = QueryGridTableHeaderRow;
        var QueryGridTableDataRow = (function (_super) {
            __extends(QueryGridTableDataRow, _super);
            function QueryGridTableDataRow(table) {
                _super.call(this, "vi-query-grid-table-data-row", table);
                this._noData = true;
                this.host.setAttribute("no-data", "");
                var specialColumns = document.createDocumentFragment();
                specialColumns.appendChild((this._selector = new Vidyano.WebComponents.QueryGridTableDataColumnSelector(this)).host);
                specialColumns.appendChild((this._actions = new Vidyano.WebComponents.QueryGridTableDataColumnActions(this)).host);
                this.host.insertBefore(specialColumns, this.host.firstChild);
                Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
            }
            Object.defineProperty(QueryGridTableDataRow.prototype, "selector", {
                get: function () {
                    return this._selector;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTableDataRow.prototype, "actions", {
                get: function () {
                    return this._actions;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTableDataRow.prototype, "item", {
                get: function () {
                    return this._item;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridTableDataRow.prototype.setItem = function (item, columns) {
                var _this = this;
                if (this._item !== item) {
                    if (this._itemPropertyChangedListener) {
                        this._itemPropertyChangedListener();
                        this._itemPropertyChangedListener = null;
                    }
                    this._item = this.selector.item = this.actions.item = item;
                    if (this._noData != !item) {
                        if (this._noData = !item)
                            this.host.setAttribute("no-data", "");
                        else
                            this.host.removeAttribute("no-data");
                    }
                    if (!!this._item)
                        this._itemPropertyChangedListener = this._item.propertyChanged.attach(this._itemPropertyChanged.bind(this));
                    this._updateIsSelected();
                }
                this._firstCellWithPendingUpdates = -1;
                this.columns.slice(0, columns ? this._columnCount = columns.length : this._columnCount).forEach(function (column, index) {
                    if (!column.setItem(item, columns ? columns[index] : null) && _this._firstCellWithPendingUpdates < 0)
                        _this._firstCellWithPendingUpdates = index;
                });
            };
            QueryGridTableDataRow.prototype.updatePendingCellUpdates = function () {
                if (this._firstCellWithPendingUpdates < 0)
                    return;
                for (var i = this._firstCellWithPendingUpdates; i < this.columns.length; i++) {
                    if (this.columns[i].update())
                        this._firstCellWithPendingUpdates++;
                    else
                        return;
                }
                this._firstCellWithPendingUpdates = -1;
            };
            QueryGridTableDataRow.prototype._tap = function (e) {
                var _this = this;
                if (!this.item)
                    return;
                if (!this.table.grid.query.asLookup && !this.table.grid.asLookup) {
                    1;
                    if (!this.table.grid.app.noHistory && e.detail.sourceEvent && (e.detail.sourceEvent.ctrlKey || e.detail.sourceEvent.shiftKey)) {
                        window.open(document.location.origin + document.location.pathname + "#!/" + this.table.grid.app.getUrlForPersistentObject(this.item.query.persistentObject.id, this.item.id));
                        e.stopPropagation();
                        return;
                    }
                    this.table.grid["_itemOpening"] = this.item;
                    this.item.getPersistentObject().then(function (po) {
                        if (!po)
                            return;
                        if (_this.table.grid["_itemOpening"] === _this.item) {
                            _this.table.grid["_itemOpening"] = undefined;
                            _this.item.query.service.hooks.onOpen(po);
                        }
                    });
                }
            };
            QueryGridTableDataRow.prototype._itemPropertyChanged = function (sender, args) {
                if (args.propertyName === "isSelected")
                    this._updateIsSelected();
            };
            QueryGridTableDataRow.prototype._updateIsSelected = function () {
                if (this._isSelected != (!!this.item && this.item.isSelected)) {
                    if (this._isSelected = !!this.item && this.item.isSelected)
                        this.host.setAttribute("is-selected", "");
                    else
                        this.host.removeAttribute("is-selected");
                }
            };
            QueryGridTableDataRow.prototype._createColumn = function () {
                return new Vidyano.WebComponents.QueryGridTableDataColumn(this);
            };
            return QueryGridTableDataRow;
        })(QueryGridTableRow);
        WebComponents.QueryGridTableDataRow = QueryGridTableDataRow;
        var QueryGridTableColumn = (function () {
            function QueryGridTableColumn(is, _cell, _isPinned) {
                this._cell = _cell;
                this._isPinned = _isPinned;
                this._host = document.createElement("td", is);
                if (_cell)
                    this._cell = this.host.appendChild(_cell);
                if (this._isPinned)
                    this.host.classList.add("pinned");
            }
            Object.defineProperty(QueryGridTableColumn.prototype, "host", {
                get: function () {
                    return this._host;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTableColumn.prototype, "cell", {
                get: function () {
                    return this._cell;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTableColumn.prototype, "column", {
                get: function () {
                    return this._column;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTableColumn.prototype, "isPinned", {
                get: function () {
                    return this._isPinned;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridTableColumn.prototype.setColumn = function (column) {
                if (column == this._column)
                    return;
                if (!(this._column = column) || this._column.isPinned != this._isPinned) {
                    if (this._isPinned = this._column ? this._column.isPinned : false)
                        this.host.classList.add("pinned");
                    else
                        this.host.classList.remove("pinned");
                }
                this.host.setAttribute("name", this._column ? Vidyano.WebComponents.QueryGridTableColumn.columnSafeName(this._column.name) : "");
            };
            Object.defineProperty(QueryGridTableColumn.prototype, "hasContent", {
                get: function () {
                    return this._hasContent;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridTableColumn.prototype._setHasContent = function (hasContent) {
                this._hasContent = hasContent;
            };
            QueryGridTableColumn.columnSafeName = function (name) {
                var safeName = name.replace(/[\. ]/g, "_");
                if (/^\d/.test(safeName))
                    safeName = "_" + safeName;
                return safeName;
            };
            return QueryGridTableColumn;
        })();
        WebComponents.QueryGridTableColumn = QueryGridTableColumn;
        var QueryGridTableHeaderColumn = (function (_super) {
            __extends(QueryGridTableHeaderColumn, _super);
            function QueryGridTableHeaderColumn() {
                _super.call(this, "vi-query-grid-table-header-column", new Vidyano.WebComponents.QueryGridColumnHeader());
            }
            QueryGridTableHeaderColumn.prototype.setColumn = function (column) {
                if (this.column === column)
                    return;
                _super.prototype.setColumn.call(this, this.cell.column = column);
            };
            return QueryGridTableHeaderColumn;
        })(QueryGridTableColumn);
        WebComponents.QueryGridTableHeaderColumn = QueryGridTableHeaderColumn;
        var QueryGridTableDataColumn = (function (_super) {
            __extends(QueryGridTableDataColumn, _super);
            function QueryGridTableDataColumn(_row) {
                _super.call(this, "vi-query-grid-table-data-column", document.createElement("div"));
                this._row = _row;
                this._foreground = {};
                this._fontWeight = {};
                this._textAlign = {};
            }
            Object.defineProperty(QueryGridTableDataColumn.prototype, "item", {
                get: function () {
                    return this._item;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridTableDataColumn.prototype, "hasPendingUpdate", {
                get: function () {
                    return this._hasPendingUpdate;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridTableDataColumn.prototype.setItem = function (item, column) {
                this.setColumn(column);
                this._item = item;
                return !(this._hasPendingUpdate = !this._render());
            };
            QueryGridTableDataColumn.prototype.update = function () {
                if (!this._hasPendingUpdate)
                    return false;
                return !(this._hasPendingUpdate = !this._render());
            };
            QueryGridTableDataColumn.prototype._render = function () {
                var _this = this;
                if (this.column) {
                    if (this._lastColumnType !== this.column.type) {
                        if (this._customCellTemplate)
                            this.cell.removeChild(this._customCellTemplate);
                        if (this._customCellTemplate = WebComponents.QueryGridCellTemplate.Load(this.column.type)) {
                            this._lastColumnType = this.column.type;
                            this.cell.appendChild(this._customCellTemplate);
                            if (this._textNode) {
                                this.cell.removeChild(this._textNode);
                                this._textNode = null;
                            }
                        }
                        else
                            this._lastColumnType = null;
                    }
                }
                else
                    this._lastColumnType = null;
                if (!this._item || !this.column) {
                    if (this.hasContent) {
                        if (this._textNode) {
                            if (this._textNodeValue !== "")
                                this._textNode.nodeValue = this._textNodeValue = "";
                        }
                        else if (this._customCellTemplate)
                            this._customCellTemplate.dataContext = null;
                        this._setHasContent(false);
                    }
                    return true;
                }
                if (!this._row.table.grid.isColumnInView(this.column))
                    return false;
                var itemValue = this._item.getFullValue(this.column.name);
                if (!this._customCellTemplate) {
                    this._typeHints = Vidyano.extend({}, this._item.typeHints, value ? value.typeHints : undefined);
                    var value = this._item.getValue(this.column.name);
                    if (value != null && (this.column.type == "Boolean" || this.column.type == "NullableBoolean"))
                        value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("truekey", "True") : this._getTypeHint("falsekey", "False"));
                    else if (this.column.type == "YesNo")
                        value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("truekey", "Yes") : this._getTypeHint("falsekey", "No"));
                    else if (this.column.type == "Time" || this.column.type == "NullableTime") {
                        if (value != null) {
                            value = value.trimEnd('0').trimEnd('.');
                            if (value.startsWith('0:'))
                                value = value.substr(2);
                            if (value.endsWith(':00'))
                                value = value.substr(0, value.length - 3);
                        }
                    }
                    if (value != null) {
                        var format = this._getTypeHint("displayformat", null);
                        if (format == null || format == "{0}") {
                            switch (this.column.type) {
                                case "Date":
                                case "NullableDate":
                                    format = null;
                                    value = value.localeFormat(Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern, true);
                                    break;
                                case "DateTime":
                                case "NullableDateTime":
                                case "DateTimeOffset":
                                case "NullableDateTimeOffset":
                                    format = null;
                                    value = value.localeFormat(Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern + " " + Vidyano.CultureInfo.currentCulture.dateFormat.shortTimePattern, true);
                                    break;
                            }
                        }
                        if (StringEx.isNullOrEmpty(format))
                            value = value.localeFormat ? value.localeFormat() : value.toLocaleString();
                        else
                            value = StringEx.format(format, value);
                    }
                    else
                        value = "";
                    var foreground = this._getTypeHint("foreground", null);
                    if (foreground != this._foreground.currentValue) {
                        if (this._foreground.originalValue === undefined)
                            this._foreground.originalValue = this.cell.style.color;
                        this.cell.style.color = this._foreground.currentValue = foreground || this._foreground.originalValue;
                    }
                    var textAlign = this._getTypeHint("horizontalcontentalignment", null);
                    if (textAlign != this._textAlign.currentValue)
                        this.cell.style.textAlign = this._textAlign.currentValue = textAlign || this._textAlign.originalValue;
                    var extraClass = this.column.getTypeHint("extraclass", undefined, value && value.typeHints, true);
                    if (extraClass != this._extraClass) {
                        if (!StringEx.isNullOrEmpty(this._extraClass))
                            this._extraClass.split(' ').forEach(function (cls) { return _this.cell.classList.remove(cls); });
                        if (!StringEx.isNullOrEmpty(extraClass)) {
                            this._extraClass = extraClass;
                            this._extraClass.split(' ').forEach(function (cls) { return _this.cell.classList.add(cls); });
                        }
                    }
                    if (this._textNode) {
                        if (this._textNodeValue !== value)
                            this._textNode.nodeValue = this._textNodeValue = value;
                    }
                    else
                        this.cell.appendChild(this._textNode = document.createTextNode(this._textNodeValue = value));
                }
                else if (this._customCellTemplate)
                    this._customCellTemplate.dataContext = itemValue;
                this._setHasContent(!!value);
                return true;
            };
            QueryGridTableDataColumn.prototype._getTypeHint = function (name, defaultValue) {
                return this.column.getTypeHint(name, defaultValue, this._typeHints, true);
            };
            return QueryGridTableDataColumn;
        })(QueryGridTableColumn);
        WebComponents.QueryGridTableDataColumn = QueryGridTableDataColumn;
        var QueryGridTableColumnRemainder = (function (_super) {
            __extends(QueryGridTableColumnRemainder, _super);
            function QueryGridTableColumnRemainder() {
                _super.call(this, "vi-query-grid-table-column-remainder");
            }
            return QueryGridTableColumnRemainder;
        })(QueryGridTableColumn);
        WebComponents.QueryGridTableColumnRemainder = QueryGridTableColumnRemainder;
        var QueryGridTableDataColumnSelector = (function (_super) {
            __extends(QueryGridTableDataColumnSelector, _super);
            function QueryGridTableDataColumnSelector(_row) {
                var _this = this;
                _super.call(this, "vi-query-grid-table-data-column-selector", WebComponents.Icon.Load("Selected"), true);
                this._row = _row;
                Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
                this._row.table.grid.async(function () { return _this.host.appendChild(document.createElement("paper-ripple")); });
            }
            Object.defineProperty(QueryGridTableDataColumnSelector.prototype, "item", {
                get: function () {
                    return this._item;
                },
                set: function (item) {
                    if (this._item !== item)
                        this._item = item;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridTableDataColumnSelector.prototype._tap = function (e) {
                if (this._item)
                    this._item.isSelected = !this._item.isSelected;
                e.stopPropagation();
            };
            return QueryGridTableDataColumnSelector;
        })(QueryGridTableColumn);
        WebComponents.QueryGridTableDataColumnSelector = QueryGridTableDataColumnSelector;
        var QueryGridTableDataColumnActions = (function (_super) {
            __extends(QueryGridTableDataColumnActions, _super);
            function QueryGridTableDataColumnActions(_row) {
                var _this = this;
                _super.call(this, "vi-query-grid-table-data-column-actions", WebComponents.Icon.Load("EllipsisVertical"), true);
                this._row = _row;
                Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
                this._row.table.grid.async(function () { return _this.host.appendChild(document.createElement("paper-ripple")); });
            }
            Object.defineProperty(QueryGridTableDataColumnActions.prototype, "item", {
                get: function () {
                    return this._item;
                },
                set: function (item) {
                    if (this._item !== item)
                        this._item = item;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridTableDataColumnActions.prototype._tap = function (e) {
                var _this = this;
                var gridActions = this._row.table.grid.$["actions"];
                gridActions.empty();
                var actions = (this.item.query.actions || []).filter(function (a) { return a.isVisible && !a.isPinned && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1); });
                actions.forEach(function (action) {
                    var button = new Vidyano.WebComponents.ActionButton();
                    button.action = action;
                    button.item = _this.item;
                    Polymer.dom(gridActions).appendChild(button);
                });
                this.host.parentElement.setAttribute("hover", "");
                gridActions.popup(this.host).then(function () {
                    _this.host.parentElement.removeAttribute("hover");
                });
                e.stopPropagation();
            };
            return QueryGridTableDataColumnActions;
        })(QueryGridTableColumn);
        WebComponents.QueryGridTableDataColumnActions = QueryGridTableDataColumnActions;
        var QueryGridColumnHeader = (function (_super) {
            __extends(QueryGridColumnHeader, _super);
            function QueryGridColumnHeader() {
                _super.call(this);
                Polymer.dom(this).appendChild(this._filter = new Vidyano.WebComponents.QueryGridColumnFilterProxy());
            }
            Object.defineProperty(QueryGridColumnHeader.prototype, "column", {
                get: function () {
                    return this._column;
                },
                set: function (column) {
                    this._filter.column = column;
                    if (this._column === column)
                        return;
                    if (this._columnObserver) {
                        this._columnObserver();
                        this._columnObserver = null;
                    }
                    if (this._column = column) {
                        this._columnObserver = this.column.propertyChanged.attach(this._columnPropertyChanged.bind(this));
                        this._updateLabel(column.label);
                        this._updateSortingIcon(this.column.sortDirection);
                    }
                    else {
                        this._updateLabel("");
                        this._updateSortingIcon(null);
                    }
                },
                enumerable: true,
                configurable: true
            });
            QueryGridColumnHeader.prototype._onUpgradeFilter = function () {
                var newFilter = new Vidyano.WebComponents.QueryGridColumnFilter();
                newFilter.column = this.column;
                Polymer.dom(this).appendChild(newFilter);
                Polymer.dom(this).removeChild(this._filter);
                this._filter = newFilter;
            };
            QueryGridColumnHeader.prototype._sort = function (e) {
                if (this._column.disableSort)
                    return;
                var multiSort = e.detail.sourceEvent.ctrlKey;
                var newSortingDirection;
                switch (this._column.sortDirection) {
                    case Vidyano.SortDirection.Ascending: {
                        newSortingDirection = Vidyano.SortDirection.Descending;
                        break;
                    }
                    case Vidyano.SortDirection.Descending: {
                        newSortingDirection = multiSort && this._column.query.sortOptions.length > 1 ? Vidyano.SortDirection.None : Vidyano.SortDirection.Ascending;
                        break;
                    }
                    case Vidyano.SortDirection.None: {
                        newSortingDirection = Vidyano.SortDirection.Ascending;
                        break;
                    }
                }
                this._column.sort(newSortingDirection, multiSort);
                this._column.query.search().catch(function () { });
            };
            QueryGridColumnHeader.prototype._columnPropertyChanged = function (sender, args) {
                if (args.propertyName === "sortDirection")
                    this._updateSortingIcon(sender.sortDirection);
            };
            QueryGridColumnHeader.prototype._updateLabel = function (label) {
                if (!this._labelTextNode)
                    this._labelTextNode = this.$["label"].appendChild(document.createTextNode(label));
                else
                    this._labelTextNode.nodeValue = label;
            };
            QueryGridColumnHeader.prototype._updateSortingIcon = function (direction) {
                var sortingIcon = direction === Vidyano.SortDirection.Ascending ? "SortAsc" : (direction === Vidyano.SortDirection.Descending ? "SortDesc" : "");
                if (sortingIcon) {
                    if (!this._sortingIcon) {
                        this._sortingIcon = new Vidyano.WebComponents.Icon();
                        Polymer.dom(this).appendChild(this._sortingIcon);
                    }
                    this._sortingIcon.source = sortingIcon;
                    if (this._sortingIcon.hasAttribute("hidden"))
                        this._sortingIcon.removeAttribute("hidden");
                }
                else if (this._sortingIcon && !this._sortingIcon.hasAttribute("hidden"))
                    this._sortingIcon.setAttribute("hidden", "");
            };
            QueryGridColumnHeader = __decorate([
                WebComponents.WebComponent.register({
                    listeners: {
                        "upgrade-filter": "_onUpgradeFilter"
                    }
                })
            ], QueryGridColumnHeader);
            return QueryGridColumnHeader;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridColumnHeader = QueryGridColumnHeader;
        var QueryGridColumnFilterProxyBase = (function (_super) {
            __extends(QueryGridColumnFilterProxyBase, _super);
            function QueryGridColumnFilterProxyBase() {
                _super.apply(this, arguments);
            }
            QueryGridColumnFilterProxyBase.prototype._updateFiltered = function (column) {
                var _this = this;
                var filtered = this.filtered;
                if (this.filtered = !!this.column && ((!!this.column.includes && this.column.includes.length > 0) || (!!this.column.excludes && this.column.excludes.length > 0))) {
                    var objects = [];
                    var textSearch = [];
                    ((!this.inversed ? this.column.includes : this.column.excludes) || []).forEach(function (value) {
                        if (value && value.startsWith("1|@"))
                            textSearch.push(value);
                        else
                            objects.push(value);
                    });
                    var label = "";
                    if (objects.length > 0)
                        label += objects.map(function (o) { return _this._getDistinctDisplayValue(o); }).join(", ");
                    if (textSearch.length > 0) {
                        if (label.length > 0)
                            label += ", ";
                        label += textSearch.map(function (t) { return _this._getDistinctDisplayValue(t); }).join(", ");
                    }
                    this.label = (!this.inversed ? "= " : "≠ ") + label;
                }
                else
                    this.label = "=";
            };
            QueryGridColumnFilterProxyBase.prototype._getDistinctDisplayValue = function (value) {
                if (!StringEx.isNullOrWhiteSpace(value) && value != "|") {
                    var indexOfPipe = value.indexOf("|");
                    if (indexOfPipe == 0)
                        return value.substr(1);
                    if (indexOfPipe > 0)
                        return value.substr(indexOfPipe + parseInt(value.substr(0, indexOfPipe), 10) + 1);
                }
                return value == null ? this.app.service.getTranslatedMessage("DistinctNullValue") : this.app.service.getTranslatedMessage("DistinctEmptyValue");
            };
            Object.defineProperty(QueryGridColumnFilterProxyBase.prototype, "label", {
                get: function () {
                    return this._label;
                },
                set: function (label) {
                    if (this._label === label)
                        return;
                    this._label = label;
                    if (!this._labelTextNode)
                        this.$["label"].appendChild(this._labelTextNode = document.createTextNode(label));
                    else
                        this._labelTextNode.nodeValue = label;
                },
                enumerable: true,
                configurable: true
            });
            return QueryGridColumnFilterProxyBase;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridColumnFilterProxyBase = QueryGridColumnFilterProxyBase;
        var QueryGridColumnFilterProxy = (function (_super) {
            __extends(QueryGridColumnFilterProxy, _super);
            function QueryGridColumnFilterProxy() {
                _super.apply(this, arguments);
            }
            QueryGridColumnFilterProxy.prototype._upgrade = function () {
                this.fire("upgrade-filter", {});
            };
            QueryGridColumnFilterProxy = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        column: Object,
                        filtered: {
                            type: Boolean,
                            reflectToAttribute: true,
                            value: false
                        },
                        inversed: {
                            type: Boolean,
                            readOnly: true
                        },
                        disabled: {
                            type: Boolean,
                            computed: "!column.canFilter",
                            reflectToAttribute: true
                        }
                    },
                    observers: [
                        "_updateFiltered(column)"
                    ],
                    listeners: {
                        "tap": "_upgrade"
                    }
                })
            ], QueryGridColumnFilterProxy);
            return QueryGridColumnFilterProxy;
        })(QueryGridColumnFilterProxyBase);
        WebComponents.QueryGridColumnFilterProxy = QueryGridColumnFilterProxy;
        var QueryGridColumnFilter = (function (_super) {
            __extends(QueryGridColumnFilter, _super);
            function QueryGridColumnFilter() {
                _super.apply(this, arguments);
                this._openOnAttach = true;
            }
            QueryGridColumnFilter.prototype.attached = function () {
                var _this = this;
                _super.prototype.attached.call(this);
                if (this._openOnAttach) {
                    this._openOnAttach = false;
                    this.async(function () {
                        _this.$["distincts"] = _this.querySelector("#distincts");
                        _this.$["search"] = _this.querySelector("#search");
                        var popup = _this.querySelector("vi-popup#filter");
                        popup.popup();
                    });
                }
            };
            QueryGridColumnFilter.prototype.refresh = function () {
                this._updateFiltered();
            };
            QueryGridColumnFilter.prototype._getTargetCollection = function () {
                return !this.inversed ? this.column.includes : this.column.excludes;
            };
            QueryGridColumnFilter.prototype._distinctClick = function (e) {
                var element = e.srcElement || e.originalTarget;
                var distinctValue;
                do {
                    distinctValue = element.getAttribute("distinct-value");
                    if (distinctValue) {
                        distinctValue = JSON.parse(distinctValue).value;
                        var targetCollection = this._getTargetCollection();
                        if (targetCollection.indexOf(distinctValue) == -1)
                            targetCollection.push(distinctValue);
                        else
                            targetCollection.remove(distinctValue);
                        this._updateDistincts();
                        break;
                    }
                } while (((element = element.parentElement) != this) && element);
                e.stopPropagation();
            };
            QueryGridColumnFilter.prototype._popupOpening = function (e) {
                var _this = this;
                if (!this.column.canFilter)
                    return;
                if (!this.column.distincts || this.column.distincts.isDirty) {
                    this._setLoading(true);
                    this.column.refreshDistincts().then(function (distincts) {
                        if (!_this.column.includes)
                            _this.column.includes = [];
                        if (!_this.column.excludes)
                            _this.column.excludes = [];
                        var distinctsDiv = _this.$["distincts"];
                        distinctsDiv.style.minWidth = _this.offsetWidth + "px";
                        _this._setLoading(false);
                        _this._renderDistincts(distinctsDiv);
                        var input = _this.$["search"];
                        input.focus();
                    }).catch(function () {
                        _this._setLoading(false);
                    });
                }
                else {
                    var distinctsDiv = this.$["distincts"];
                    distinctsDiv.style.minWidth = this.offsetWidth + "px";
                    distinctsDiv.scrollTop = 0;
                    this._renderDistincts(distinctsDiv);
                }
            };
            QueryGridColumnFilter.prototype._addDistinctValue = function (target, value, className) {
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
            };
            QueryGridColumnFilter.prototype._updateDistincts = function () {
                var _this = this;
                var distinctsDiv = this.$["distincts"];
                this._renderDistincts(distinctsDiv);
                this.fire("column-filter-changed", null);
                this._setLoading(true);
                this.column.query.search().then(function () {
                    return _this.column.refreshDistincts().then(function (distincts) {
                        _this._setLoading(false);
                        _this._renderDistincts(distinctsDiv);
                    });
                }).catch(function () {
                    _this._setLoading(false);
                });
            };
            QueryGridColumnFilter.prototype._renderDistincts = function (target) {
                var _this = this;
                if (!target)
                    target = this.$["distincts"];
                this._updateFiltered();
                target.innerHTML = "";
                if (this.column.includes.length > 0) {
                    this.column.includes.forEach(function (v) { return _this._addDistinctValue(target, v, "include"); });
                    this._setInversed(false);
                }
                else if (this.column.excludes.length > 0) {
                    this.column.excludes.forEach(function (v) { return _this._addDistinctValue(target, v, "exclude"); });
                    this._setInversed(true);
                }
                var includesExcludes = this.column.includes.concat(this.column.excludes);
                this.column.distincts.matching.filter(function (v) { return includesExcludes.indexOf(v) == -1; }).forEach(function (v) { return _this._addDistinctValue(target, v, "matching"); });
                this.column.distincts.remaining.filter(function (v) { return includesExcludes.indexOf(v) == -1; }).forEach(function (v) { return _this._addDistinctValue(target, v, "remaining"); });
            };
            QueryGridColumnFilter.prototype._search = function () {
                var _this = this;
                if (StringEx.isNullOrEmpty(this.searchText))
                    return;
                this._getTargetCollection().push("1|@" + this.searchText);
                this.searchText = "";
                this._renderDistincts();
                this.column.query.search().then(function () {
                    _this._renderDistincts();
                    _this.fire("column-filter-changed", null);
                });
            };
            QueryGridColumnFilter.prototype._closePopup = function () {
                WebComponents.Popup.closeAll();
            };
            QueryGridColumnFilter.prototype._inverse = function (e) {
                e.stopPropagation();
                this._setInversed(!this.inversed);
                var filters;
                if (this.inversed) {
                    filters = this.column.includes.length;
                    var temp = this.column.excludes;
                    this.column.excludes = this.column.includes.slice();
                    this.column.includes = temp.slice();
                }
                else {
                    filters = this.column.excludes.length;
                    var temp = this.column.includes;
                    this.column.includes = this.column.excludes.slice();
                    this.column.excludes = temp.slice();
                }
                if (filters > 0)
                    this._updateDistincts();
            };
            QueryGridColumnFilter.prototype._clear = function (e) {
                if (!this.filtered) {
                    e.stopPropagation();
                    return;
                }
                this.column.includes = [];
                this.column.excludes = [];
                this._setInversed(false);
                this._updateDistincts();
                this._closePopup();
            };
            QueryGridColumnFilter.prototype._catchClick = function (e) {
                e.stopPropagation();
            };
            QueryGridColumnFilter = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        column: Object,
                        filtered: {
                            type: Boolean,
                            reflectToAttribute: true,
                            value: false
                        },
                        inversed: {
                            type: Boolean,
                            readOnly: true
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
                        "_updateFiltered(column, isAttached)"
                    ]
                })
            ], QueryGridColumnFilter);
            return QueryGridColumnFilter;
        })(QueryGridColumnFilterProxyBase);
        WebComponents.QueryGridColumnFilter = QueryGridColumnFilter;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

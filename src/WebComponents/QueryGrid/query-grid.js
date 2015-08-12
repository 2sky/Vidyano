var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var QueryGrid = (function (_super) {
            __extends(QueryGrid, _super);
            function QueryGrid() {
                _super.apply(this, arguments);
                this._queuedUnattachedWork = [];
                this._uniqueId = Unique.get();
                this._rows = {};
                this._horizontalSpacerWidth = 0;
                this._pinnedColumns = [];
                this._unpinnedColumns = [];
                this._styles = {};
                this._queryPropertyObservers = [];
            }
            QueryGrid.prototype.attached = function () {
                this.asElement.setAttribute("style-scope-id", this._uniqueId);
                if (QueryGrid._isSafari)
                    this.asElement.classList.add("safari");
                this._rows["headers"] = new QueryGridColumnHeaders(this, {
                    header: this.$["headers"].querySelector(".header"),
                    pinned: this.$["headers"].querySelector(".pinned"),
                    unpinned: this.$["headers"].querySelector(".unpinned")
                });
                this._rows["filters"] = new QueryGridColumnFilters(this, {
                    header: this.$["filters"].querySelector(".header"),
                    pinned: this.$["filters"].querySelector(".pinned"),
                    unpinned: this.$["filters"].querySelector(".unpinned")
                });
                this._rows["items"] = new QueryGridItems(this, {
                    header: this.$["data"].querySelector(".header"),
                    pinned: this.$["data"].querySelector(".pinned"),
                    unpinned: this.$["data"].querySelector(".unpinned")
                });
                this._horizontalScrollPanels = [
                    this.headers.hosts.unpinned,
                    this.filters.hosts.unpinned,
                    this.items.hosts.unpinned,
                    this.$["horizontalScroll"]
                ];
                _super.prototype.attached.call(this);
            };
            QueryGrid.prototype.detached = function () {
                this.items.detached();
                _super.prototype.detached.call(this);
            };
            Object.defineProperty(QueryGrid.prototype, "pinnedColumns", {
                get: function () {
                    return this._pinnedColumns;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGrid.prototype, "unpinnedColumns", {
                get: function () {
                    return this._unpinnedColumns;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGrid.prototype, "headers", {
                get: function () {
                    return this._rows["headers"];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGrid.prototype, "filters", {
                get: function () {
                    return this._rows["filters"];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGrid.prototype, "items", {
                get: function () {
                    return this._rows["items"];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGrid.prototype, "_style", {
                get: function () {
                    return this.$["style"];
                },
                enumerable: true,
                configurable: true
            });
            QueryGrid.prototype._columnsChanged = function (columns) {
                columns = columns ? columns.filter(function (c) { return !c.isHidden && (!c.width || c.width != "0"); }) : [];
                var currentPinnedColumns = Enumerable.from(this.pinnedColumns || []);
                var currentUnpinnedColumns = Enumerable.from(this.unpinnedColumns || []);
                var pinnedColumns = [];
                var unpinnedColumns = [];
                Enumerable.from(columns).forEach(function (c) {
                    if (c.isPinned)
                        pinnedColumns.push(currentPinnedColumns.firstOrDefault(function (pc) { return pc.name == c.name; }) || new WebComponents.QueryGridColumn(c));
                    else
                        unpinnedColumns.push(currentUnpinnedColumns.firstOrDefault(function (upc) { return upc.name == c.name; }) || new WebComponents.QueryGridColumn(c));
                });
                this._pinnedColumns = pinnedColumns;
                this._unpinnedColumns = unpinnedColumns;
                for (var row in this._rows)
                    this._rows[row].updateColumns(this._pinnedColumns, this._unpinnedColumns);
            };
            QueryGrid.prototype._itemsChanged = function () {
                this.items.data.scrollTop = 0;
                this.items.updateRows();
                this.items.updateTablePosition(true, true);
            };
            QueryGrid.prototype._updateScrollBarsVisibility = function () {
                var horizontalSpacer = this.$["horizontalSpacer"];
                this.items.data.classList.remove("scroll");
                horizontalSpacer.parentElement.style.marginRight = "0";
                var widthRequired = this.items.hosts.pinned.offsetWidth + this.items.hosts.unpinned.offsetWidth - this.remainderWidth + this.items.hosts.header.offsetWidth;
                var widthAvailable = this.items.verticalSpacer.offsetWidth;
                var heightAvailable = this.items.data.offsetHeight;
                var isVerticalScroll = this.items.virtualHeight > heightAvailable;
                var isHorizontalScroll = widthRequired > widthAvailable;
                if (isVerticalScroll)
                    widthAvailable -= WebComponents.scrollbarWidth();
                isVerticalScroll = this.items.virtualHeight > heightAvailable;
                isHorizontalScroll = widthRequired > widthAvailable;
                if (isVerticalScroll)
                    this.items.data.classList.add("scroll");
                else
                    this.items.data.classList.remove("scroll");
                this._setScrollBottomShadow(isVerticalScroll);
                if (isHorizontalScroll) {
                    horizontalSpacer.parentElement.removeAttribute("hidden");
                    horizontalSpacer.parentElement.style.marginRight = isVerticalScroll ? WebComponents.scrollbarWidth() + "px" : "0";
                }
                else {
                    horizontalSpacer.parentElement.setAttribute("hidden", "");
                    horizontalSpacer.parentElement.style.marginRight = "0";
                }
                horizontalSpacer.style.width = (this._horizontalSpacerWidth = this.items.hosts.pinned.offsetWidth + this.items.hosts.unpinned.offsetWidth - this.remainderWidth + this.items.hosts.header.offsetWidth) + "px";
            };
            QueryGrid.prototype._updateScrollBarsListener = function (e) {
                e.stopPropagation();
                this._updateScrollBarsVisibility();
            };
            QueryGrid.prototype._measureColumnsListener = function (e) {
                var _this = this;
                e.stopPropagation();
                var columns = Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns);
                this._style.setStyle("ColumnWidths");
                columns.forEach(function (c) {
                    for (var row in _this._rows)
                        c.currentWidth = Math.max(_this._rows[row].getColumnWidth(c), c.currentWidth || 0);
                });
                this._style.setStyle.apply(this._style, ["ColumnWidths"].concat(Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns).select(function (c) { return "[data-vi-column-name='" + c.safeName + "'] { width: " + c.currentWidth + "px; }"; }).toArray()));
                this._updateScrollBarsVisibility();
                this._setInitializing(false);
            };
            QueryGrid.prototype._columnWidthUpdatedListener = function (e, detail) {
                var columns = Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns);
                this._style.setStyle.apply(this._style, ["ColumnWidths"].concat(Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns).select(function (c) { return "[data-vi-column-name='" + c.safeName + "'] { width: " + c.currentWidth + "px; }"; }).toArray()));
            };
            QueryGrid.prototype._itemSelectListener = function (e, detail) {
                if (!detail.item)
                    return;
                var indexOfItem = this.query.items.indexOf(detail.item);
                if (!detail.item.isSelected && this._lastSelectedItemIndex >= 0 && detail.rangeSelect) {
                    if (this.query.selectRange(Math.min(this._lastSelectedItemIndex, indexOfItem), Math.max(this._lastSelectedItemIndex, indexOfItem))) {
                        this._lastSelectedItemIndex = indexOfItem;
                        return;
                    }
                }
                if (detail.item.isSelected = !detail.item.isSelected)
                    this._lastSelectedItemIndex = indexOfItem;
            };
            QueryGrid.prototype._filterChangedListener = function (e) {
                e.stopPropagation();
                this.filters.refreshColumns();
            };
            QueryGrid.prototype._columnFilterChangedListener = function (e) {
                e.stopPropagation();
                this.filters.refreshHeader();
            };
            QueryGrid.prototype._sizeChanged = function (e, detail) {
                if (!detail.width || !detail.height)
                    return;
                this._setViewport(detail);
                this.items.updateRows();
                this._updateScrollBarsVisibility();
                e.stopPropagation();
            };
            QueryGrid.prototype._onScrollVertical = function () {
                WebComponents.Popup.closeAll(this);
                this.items.onScroll();
            };
            QueryGrid.prototype._onScrollHorizontal = function (e) {
                WebComponents.Popup.closeAll(this);
                var src = (e && e.target ? e.target : e.srcElement);
                var srcLeft = Math.max(Math.min(src.scrollLeft, this._horizontalSpacerWidth - this.remainderWidth + WebComponents.scrollbarWidth()), 0);
                if (src.scrollLeftSync === undefined || src.scrollLeftSync != srcLeft)
                    src.scrollLeftSync = srcLeft;
                if (src.scrollLeft != srcLeft)
                    src.scrollLeft = srcLeft;
                this._horizontalScrollPanels.filter(function (panel) { return panel != src; }).forEach(function (targetElement) {
                    var target = targetElement;
                    if (target.scrollLeftSync != srcLeft)
                        target.scrollLeftSync = targetElement.parentElement.scrollLeft = srcLeft;
                });
            };
            QueryGrid.prototype._updateHoverRow = function (e) {
                var y = e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                var sender = e.srcElement || e.target;
                if (sender && sender !== this)
                    y -= this.items.data.getClientRects()[0].top;
                this.items.updateHoverRow(y);
            };
            QueryGrid.prototype._itemsTap = function (e, detail) {
                var _this = this;
                if (!this.query || !this.query.canRead || e.defaultPrevented)
                    return;
                var path = e.path;
                if (!path) {
                    path = [];
                    var node = e.target;
                    while (node != e.currentTarget) {
                        path.push(node);
                        node = node.parentElement;
                    }
                }
                var pathEnum = Enumerable.from(path);
                var col = pathEnum.firstOrDefault(function (p) { return p.tagName == "TD"; });
                var row = pathEnum.firstOrDefault(function (p) { return p.tagName == "TR"; });
                if (col.parentElement == row) {
                    var item = this.items.getItem(row);
                    if (!item)
                        return;
                    var colIndex = Enumerable.from(row.children).indexOf(col);
                    var columns = row.parentElement.classList.contains("unpinned") ? this.unpinnedColumns : this.pinnedColumns;
                    var column = columns.length > colIndex ? columns[colIndex].column : null;
                    var newE = this.fire("item-click", { item: item, column: column });
                    if (newE.defaultPrevented)
                        return;
                    if (!this.query.asLookup && !this.asLookup) {
                        if (!this.app.noHistory && e.detail.sourceEvent && (e.detail.sourceEvent.ctrlKey || e.detail.sourceEvent.shiftKey)) {
                            window.open(document.location.origin + document.location.pathname + "#!/" + this.app.getUrlForPersistentObject(item.query.persistentObject.id, item.id));
                            e.stopPropagation();
                            return;
                        }
                        this._itemOpening = item;
                        item.getPersistentObject().then(function (po) {
                            if (!po)
                                return;
                            if (_this._itemOpening == item)
                                item.query.service.hooks.onOpen(po);
                        });
                    }
                }
            };
            QueryGrid.prototype._sortingStart = function (e) {
                if (e.srcElement == this.headers.hosts.pinned || e.srcElement == this.headers.hosts.unpinned)
                    this.asElement.classList.add("header-sorting");
            };
            QueryGrid.prototype._sortingEnd = function (e) {
                if (e.srcElement == this.headers.hosts.pinned || e.srcElement == this.headers.hosts.unpinned)
                    this.asElement.classList.remove("header-sorting");
            };
            QueryGrid.prototype._updateColumnPinning = function (e, detail, sender) {
                var header = e.item;
                header._gridColumn.column.isPinned = sender == this.headers.hosts.pinned;
                this._columnsChanged(this.query.columns);
                this.items.updateTablePosition(true);
            };
            QueryGrid.prototype._updateColumnOffset = function () {
                var existingPinnedColumns = [].map.apply(this.headers.hosts.pinned.querySelectorAll("vi-query-grid-column-header"), [function (c) { return c.gridColumn.column; }]);
                var existingUnpinnedColumns = [].map.apply(this.headers.hosts.unpinned.querySelectorAll("vi-query-grid-column-header"), [function (c) { return c.gridColumn.column; }]);
                this._columnsChanged(existingPinnedColumns.concat(existingUnpinnedColumns));
                this.items.updateTablePosition(true);
            };
            QueryGrid.prototype._computeDisableInlineActions = function (actions) {
                return !actions || !actions.some(function (a) { return a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1); }) || actions[0].query.asLookup || this.asLookup;
            };
            QueryGrid.prototype._computeDisableSelect = function (actions) {
                return !actions || !actions.some(function (a) { return a.definition.selectionRule != ExpressionParser.alwaysTrue; });
            };
            QueryGrid.prototype._computeRemainderWidth = function () {
                this._style.setStyle("RemainderColumn", "._RemainderColumn { width: " + this.viewport.width + "px; }");
                return this.viewport.width;
            };
            QueryGrid._isChrome = /chrome/i.test(navigator.userAgent);
            QueryGrid._isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
            return QueryGrid;
        })(WebComponents.WebComponent);
        WebComponents.QueryGrid = QueryGrid;
        var QueryGridColumn = (function () {
            function QueryGridColumn(_column) {
                this._column = _column;
            }
            Object.defineProperty(QueryGridColumn.prototype, "column", {
                get: function () {
                    return this._column;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridColumn.prototype, "safeName", {
                get: function () {
                    if (this._safeName == null) {
                        this._safeName = this._column.name.replace(/[\. ]/g, "_");
                        if (/^\d/.test(this._safeName))
                            this._safeName = "_" + this._safeName;
                    }
                    return this._safeName;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridColumn.prototype, "name", {
                get: function () {
                    return this._column.name;
                },
                enumerable: true,
                configurable: true
            });
            return QueryGridColumn;
        })();
        WebComponents.QueryGridColumn = QueryGridColumn;
        var QueryGridRow = (function () {
            function QueryGridRow(_grid, _hosts) {
                this._grid = _grid;
                this._hosts = _hosts;
                if (this._remainder = this._createRemainder())
                    this.hosts.unpinned.appendChild(this._remainder);
            }
            Object.defineProperty(QueryGridRow.prototype, "hosts", {
                get: function () {
                    return this._hosts;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridRow.prototype, "grid", {
                get: function () {
                    return this._grid;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridRow.prototype.updateColumns = function (pinned, unpinned) {
                this._updateColumns(pinned, this.hosts.pinned);
                this._updateColumns(unpinned, this.hosts.unpinned);
            };
            QueryGridRow.prototype.getColumnWidth = function (gridColumn) {
                var _this = this;
                var host = gridColumn.column.isPinned ? this.hosts.pinned : this.hosts.unpinned;
                var children = Enumerable.from(host.children).where(function (c) { return !c.classList || !c.classList.contains("_RemainderColumn"); });
                if (gridColumn.column.isPinned)
                    children = children.where(function (c) { return c != _this._remainder; });
                var element = children.firstOrDefault(function (c) { return _this._getColumnNameForElement(c) == gridColumn.name; });
                return element ? element.offsetWidth + element.offsetHeight / 2 : 0;
            };
            QueryGridRow.prototype._createRemainder = function () {
                throw new Error("Not implemented");
            };
            QueryGridRow.prototype._createColumnElement = function (column) {
                throw new Error("Not implemented");
            };
            QueryGridRow.prototype._removedColumnElement = function (element) {
            };
            QueryGridRow.prototype._getColumnNameForElement = function (element) {
                throw new Error("Not implemented");
            };
            QueryGridRow.prototype._updateColumns = function (gridColumns, host) {
                var _this = this;
                var pinned = gridColumns.length > 0 && gridColumns[0].column.isPinned;
                var columnsOrder = gridColumns.map(function (c) { return c.name; }).join(";");
                if (this._columnsOrder != columnsOrder) {
                    var currentChildren = Enumerable.from(host.children);
                    if (!pinned)
                        currentChildren = currentChildren.where(function (c) { return c != _this._remainder; });
                    var children = gridColumns.map(function (col) {
                        var columnElement = currentChildren.count() > 0 ? currentChildren.firstOrDefault(function (c) { return _this._getColumnNameForElement(c) == col.name; }) : undefined;
                        if (!columnElement)
                            columnElement = _this._createColumnElement(col);
                        return columnElement;
                    });
                    currentChildren.except(children).forEach(function (c) {
                        host.removeChild(c);
                        _this._removedColumnElement(c);
                    });
                    if (!pinned && this._remainder)
                        children.forEach(function (c) { return host.insertBefore(c, _this._remainder); });
                    else
                        children.forEach(function (c) { return host.appendChild(c); });
                    this._columnsOrder = columnsOrder;
                }
            };
            return QueryGridRow;
        })();
        WebComponents.QueryGridRow = QueryGridRow;
        var QueryGridColumnHeaders = (function (_super) {
            __extends(QueryGridColumnHeaders, _super);
            function QueryGridColumnHeaders() {
                _super.apply(this, arguments);
            }
            QueryGridColumnHeaders.prototype._createRemainder = function () {
                var remainder = document.createElement("div");
                remainder.className = "_RemainderColumn";
                return remainder;
            };
            QueryGridColumnHeaders.prototype._createColumnElement = function (column) {
                return new WebComponents.QueryGridColumnHeader(column).asElement;
            };
            QueryGridColumnHeaders.prototype._getColumnNameForElement = function (element) {
                return element.gridColumn.name;
            };
            return QueryGridColumnHeaders;
        })(QueryGridRow);
        WebComponents.QueryGridColumnHeaders = QueryGridColumnHeaders;
        var QueryGridColumnFilters = (function (_super) {
            __extends(QueryGridColumnFilters, _super);
            function QueryGridColumnFilters() {
                _super.apply(this, arguments);
            }
            QueryGridColumnFilters.prototype.updateColumns = function (pinned, unpinned) {
                _super.prototype.updateColumns.call(this, pinned, unpinned);
                if (!this._filterMenu) {
                    this._filterMenu = document.createElement("div");
                    this.hosts.header.appendChild(this._filterMenu);
                }
            };
            QueryGridColumnFilters.prototype.refreshColumns = function () {
                var columns = Enumerable.from(this.hosts.pinned.children).concat(Enumerable.from(this.hosts.unpinned.children).toArray()).where(function (c) { return c instanceof WebComponents.QueryGridColumnFilter; }).toArray();
                columns.forEach(function (col) { return col.refresh(); });
            };
            QueryGridColumnFilters.prototype.refreshHeader = function () {
                var header = this.hosts.header.querySelector("vi-query-grid-filters");
                if (header)
                    header.fire("column-filter-changed", null);
            };
            QueryGridColumnFilters.prototype._createRemainder = function () {
                var remainder = document.createElement("div");
                remainder.className = "_RemainderColumn";
                return remainder;
            };
            QueryGridColumnFilters.prototype._createColumnElement = function (column) {
                return new WebComponents.QueryGridColumnFilter(column).asElement;
            };
            QueryGridColumnFilters.prototype._getColumnNameForElement = function (element) {
                return element.gridColumn.name;
            };
            return QueryGridColumnFilters;
        })(QueryGridRow);
        WebComponents.QueryGridColumnFilters = QueryGridColumnFilters;
        var QueryGridItems = (function (_super) {
            __extends(QueryGridItems, _super);
            function QueryGridItems(grid, hosts) {
                _super.call(this, grid, hosts);
                this._items = [];
                this._viewportStartRowIndex = 0;
                this._dataTop = 0;
                this._currentHoverRowIndex = -1;
                this._lastKnownMouseYPosition = -1;
                this._data = this.grid.$["data"];
                this._verticalSpacer = this.grid.$["verticalSpacer"];
            }
            QueryGridItems.prototype.detached = function () {
                this._items.forEach(function (item) {
                    item.detached();
                });
                this._items = [];
            };
            Object.defineProperty(QueryGridItems.prototype, "data", {
                get: function () {
                    return this._data;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridItems.prototype, "verticalSpacer", {
                get: function () {
                    return this._verticalSpacer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridItems.prototype, "virtualHeight", {
                get: function () {
                    return this._virtualHeight;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridItems.prototype._createRemainder = function () {
                return null;
            };
            QueryGridItems.prototype.getColumnWidth = function (column) {
                return this._items[0] ? this._items[0].getColumnWidth(column) : 0;
            };
            QueryGridItems.prototype.getItem = function (row) {
                var rowIndex;
                for (var host in this.hosts) {
                    rowIndex = Enumerable.from(this.hosts[host].children).indexOf(function (c) { return c == row; });
                    if (rowIndex >= 0)
                        break;
                }
                return rowIndex >= 0 && rowIndex < this._items.length ? this._items[rowIndex].item : null;
            };
            QueryGridItems.prototype.updateRows = function () {
                var rowCount = this._rowHeight !== undefined ? Math.min((Math.ceil(this.grid.viewport.height / this._rowHeight * 1.25) + 1), this.grid.query.totalItems) : 1;
                if (rowCount == this._items.length)
                    return;
                while (this._items.length < rowCount)
                    this._items.push(new QueryGridItem(this));
                var oldViewportEndRowIndex = this._viewportEndRowIndex || 0;
                this._viewportEndRowIndex = this._rowHeight !== undefined ? Math.floor(this._data.scrollTop + this.grid.viewport.height / this._rowHeight) : 1;
                if (this._viewportEndRowIndex > oldViewportEndRowIndex)
                    this.updateTablePosition(true);
            };
            QueryGridItems.prototype.updateColumns = function (pinned, unpinned) {
                this._items.forEach(function (item) { return item.updateColumns(pinned, unpinned); });
            };
            QueryGridItems.prototype.updateTablePosition = function (forceRender, skipSearch) {
                var _this = this;
                if (!this.grid.query)
                    return;
                else {
                    if (!this.grid.query.hasSearched && !this.grid.query.autoQuery) {
                        this.grid.fire("measure-columns", {}, {
                            bubbles: false
                        });
                    }
                }
                var newStartIndex = forceRender ? this._viewportStartRowIndex : undefined;
                if (this._rowsStartIndex === undefined)
                    this._rowsStartIndex = newStartIndex = 0;
                else if (this._viewportEndRowIndex - this._rowsStartIndex > this._items.length)
                    newStartIndex = this._viewportStartRowIndex;
                else if (this._viewportStartRowIndex < this._rowsStartIndex)
                    newStartIndex = this._viewportEndRowIndex - this._items.length;
                if (newStartIndex != undefined) {
                    if (newStartIndex % 2 != 0)
                        newStartIndex--;
                    if (newStartIndex < 0)
                        newStartIndex = 0;
                    this._pendingNewRowsStartIndex = newStartIndex;
                    var items = this.grid.query.getItemsInMemory(newStartIndex, this._items.length);
                    if (items) {
                        if (this._pendingNewRowsStartIndex != newStartIndex)
                            return;
                        this._rowsStartIndex = newStartIndex;
                        if (this._rowHeight === undefined && items.length > 0) {
                            this._fireColumnMeasurement = true;
                            this._items[0].item = items[0];
                            this._rowHeight = this._items[0].height;
                            this._verticalSpacer.style.height = (this._virtualHeight = (this._rowHeight * this.grid.query.totalItems)) + "px";
                            this.updateRows();
                            return;
                        }
                        if (this._virtualHeight != this._rowHeight * this.grid.query.totalItems) {
                            this._verticalSpacer.style.height = (this._virtualHeight = (this._rowHeight * this.grid.query.totalItems)) + "px";
                            this.grid.fire("update-scrollbars", null);
                        }
                        var numberOfItemRows = Math.min(this._rowsStartIndex + this._items.length, this.grid.query.totalItems);
                        this._items.slice(0, numberOfItemRows).forEach(function (row, i) { return row.item = items[i]; });
                        this._items.slice(numberOfItemRows, this._items.length).forEach(function (row) { return row.item = null; });
                        this.grid.$["topSpacer"].style.height = (this._dataTop = newStartIndex * this._rowHeight) + "px";
                        this.updateHoverRow();
                    }
                    else if (!skipSearch) {
                        if (!this._debouncedGetItems) {
                            this._debouncedGetItems = Vidyano._debounce(function (start, length, newStartIndex) {
                                if (_this.grid.query.notification && !_this.grid.query.hasSearched)
                                    return;
                                _this.grid.query.getItems(start, length).then(function () { return _this.updateTablePosition(); });
                            }, 100);
                        }
                        this._debouncedGetItems(newStartIndex, this._items.length, newStartIndex);
                    }
                    else if (!this.grid.query.isBusy)
                        this._items.forEach(function (row) { return row.item = null; });
                }
                if (this._fireColumnMeasurement || this._rowHeight === undefined) {
                    this._fireColumnMeasurement = false;
                    this.grid.fire("measure-columns", {}, {
                        bubbles: false
                    });
                }
            };
            QueryGridItems.prototype.updateHoverRow = function (yPosition) {
                if (yPosition === void 0) { yPosition = this._lastKnownMouseYPosition; }
                this._lastKnownMouseYPosition = yPosition;
                var newCurrentHoverRowIndex = Math.floor(yPosition / this._rowHeight + (this._data.scrollTop - this._dataTop) / this._rowHeight);
                if (newCurrentHoverRowIndex != this._currentHoverRowIndex) {
                    if (this._currentHoverRowIndex >= 0)
                        this._items[this._currentHoverRowIndex].hover = false;
                    this._currentHoverRowIndex = newCurrentHoverRowIndex >= 0 && newCurrentHoverRowIndex < this._items.length ? newCurrentHoverRowIndex : -1;
                    if (this._currentHoverRowIndex >= 0)
                        this._items[this._currentHoverRowIndex].hover = true;
                }
            };
            QueryGridItems.prototype.onScroll = function () {
                this.updateHoverRow();
                var top = this._data.scrollTop;
                this.grid._setScrollTopShadow(top > 0);
                this.grid._setScrollBottomShadow(top < (this._data.scrollHeight - this._data.offsetHeight - this._rowHeight * 0.25));
                this._viewportStartRowIndex = Math.floor(top / this._rowHeight);
                this._viewportEndRowIndex = Math.ceil((top + this.grid.viewport.height) / this._rowHeight);
                this.updateTablePosition();
            };
            return QueryGridItems;
        })(QueryGridRow);
        WebComponents.QueryGridItems = QueryGridItems;
        var QueryGridItem = (function (_super) {
            __extends(QueryGridItem, _super);
            function QueryGridItem(parent) {
                var _this = this;
                _super.call(this, parent.grid, {
                    header: parent.hosts.header.appendChild(document.createElement("tr")),
                    pinned: parent.hosts.pinned.appendChild(document.createElement("tr")),
                    unpinned: parent.hosts.unpinned.appendChild(document.createElement("tr"))
                });
                this._cells = [];
                var actions = (this.grid.query.actions || []).filter(function (a) { return a.isVisible; });
                actions = actions.filter(function (a) { return a.definition.selectionRule != ExpressionParser.alwaysTrue; });
                if (!this.grid.disableSelect) {
                    var selectorCol = document.createElement("td");
                    if (!QueryGridItem._selectorProxy) {
                        selectorCol.appendChild(this._selector = new Vidyano.WebComponents.QueryGridItemSelector());
                        Polymer.dom(this.hosts.header).flush();
                        QueryGridItem._selectorProxy = document.createElement("div");
                        Enumerable.from(Polymer.dom(this._selector.root).children).forEach(function (child) {
                            QueryGridItem._selectorProxy.appendChild(child.cloneNode(true));
                        });
                        QueryGridItem._selectorProxy.className = "vi-query-grid-item-selector-proxy";
                    }
                    else {
                        this._selectorProxy = selectorCol.appendChild(QueryGridItem._selectorProxy.cloneNode(true));
                        this._selectorProxy.addEventListener("click", this._selectorProxyClick = (function (e, detail) {
                            selectorCol.removeChild(_this._selectorProxy);
                            _this._selectorProxyClick = _this._selectorProxy = null;
                            selectorCol.appendChild(_this._selector = new Vidyano.WebComponents.QueryGridItemSelector());
                            _this._selector.item = _this._item;
                            e.stopPropagation();
                            _this._selector.fire("tap", { sourceEvent: e });
                        }));
                    }
                    this.hosts.header.appendChild(selectorCol);
                }
                if (!this.grid.disableInlineActions) {
                    actions = actions.filter(function (a) { return a.definition.selectionRule(1); });
                    if (!this.grid.query.asLookup && actions.length > 0) {
                        var actionsCol = document.createElement("td");
                        if (!QueryGridItem._actionsProxy) {
                            QueryGridItem._actionsProxy = document.createElement("div");
                            var resource = document.createElement("vi-resource");
                            resource.source = "Icon_EllipsisVertical";
                            QueryGridItem._actionsProxy.className = "vi-query-grid-item-actions-proxy";
                            QueryGridItem._actionsProxy.appendChild(resource);
                        }
                        this._actionsProxy = actionsCol.appendChild(QueryGridItem._actionsProxy.cloneNode(true));
                        this._actionsProxy.addEventListener("click", this._actionsProxyClick = (function (e, detail) {
                            actionsCol.removeChild(_this._actionsProxy);
                            _this._actionsProxyClick = _this._actionsProxy = null;
                            actionsCol.appendChild(_this._actions = new Vidyano.WebComponents.QueryGridItemActions());
                            _this._actions.item = _this._item;
                            Polymer.dom(_this._actions).flush();
                            e.stopPropagation();
                            _this._actions.async(function () {
                                _this._actions.popup();
                            });
                        }));
                        this.hosts.header.appendChild(actionsCol);
                    }
                }
                if (this.grid.disableInlineActions && this.grid.disableSelect)
                    this.hosts.header.appendChild(document.createElement("td"));
                this.updateColumns(parent.grid.pinnedColumns, parent.grid.unpinnedColumns);
            }
            QueryGridItem.prototype.detached = function () {
                if (this._selectorProxyClick) {
                    this._selectorProxy.removeEventListener("click", this._selectorProxyClick);
                    this._selectorProxyClick = null;
                }
                if (this._actionsProxyClick) {
                    this._actionsProxy.removeEventListener("click", this._actionsProxyClick);
                    this._selectorProxyClick = null;
                }
                if (this._isItemSelectedDisposer) {
                    this._isItemSelectedDisposer();
                    this._isItemSelectedDisposer = null;
                }
            };
            Object.defineProperty(QueryGridItem.prototype, "item", {
                get: function () {
                    return this._item;
                },
                set: function (item) {
                    var _this = this;
                    this._item = item;
                    var extraClass = item ? item.getTypeHint("ExtraClass", null) : null;
                    for (var host in this.hosts) {
                        this._cells.forEach(function (cell) { return cell.item = _this._item; });
                        if (item) {
                            if (extraClass != this._extraClass) {
                                if (!StringEx.isNullOrEmpty(this._extraClass))
                                    this._extraClass.split(' ').forEach(function (cls) { return _this.hosts[host].classList.remove(cls); });
                                if (!StringEx.isNullOrEmpty(extraClass))
                                    extraClass.split(' ').forEach(function (cls) { return _this.hosts[host].classList.add(cls); });
                            }
                            this.hosts[host].classList.remove("noData");
                        }
                        else
                            this.hosts[host].classList.add("noData");
                    }
                    this._extraClass = extraClass;
                    if (this._isItemSelectedDisposer) {
                        this._isItemSelectedDisposer();
                        this._isItemSelectedDisposer = null;
                    }
                    if (this._selectorProxy) {
                        if (this._item) {
                            this._isItemSelectedDisposer = this._item.propertyChanged.attach(function (item, detail) {
                                if (detail.propertyName == "isSelected") {
                                    if (!_this._selectorProxy) {
                                        if (_this._isItemSelectedDisposer) {
                                            _this._isItemSelectedDisposer();
                                            _this._isItemSelectedDisposer = null;
                                        }
                                        return;
                                    }
                                    if (detail.newValue)
                                        _this._selectorProxy.setAttribute("is-selected", "");
                                    else
                                        _this._selectorProxy.removeAttribute("is-selected");
                                }
                            });
                            if (this._item.isSelected)
                                this._selectorProxy.setAttribute("is-selected", "");
                            else
                                this._selectorProxy.removeAttribute("is-selected");
                        }
                    }
                    else if (this._selector)
                        this._selector.item = this.item;
                    if (this._actions)
                        this._actions.item = this.item;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridItem.prototype, "hover", {
                get: function () {
                    return this._hover;
                },
                set: function (val) {
                    if (this._hover == val)
                        return;
                    for (var host in this.hosts) {
                        if (val)
                            this.hosts[host].setAttribute("hover", "");
                        else
                            this.hosts[host].removeAttribute("hover");
                    }
                    this._hover = val;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridItem.prototype, "height", {
                get: function () {
                    var height = 0;
                    for (var host in this.hosts) {
                        height = Math.max(this.hosts[host].offsetHeight, height);
                    }
                    return height;
                },
                enumerable: true,
                configurable: true
            });
            QueryGridItem.prototype._createRemainder = function () {
                var remainder = document.createElement("td");
                remainder.appendChild(document.createElement("div")).className = "_RemainderColumn";
                return remainder;
            };
            QueryGridItem.prototype._getColumnNameForElement = function (element) {
                var cell = this._cells.filter(function (cell) { return cell.host == element; })[0];
                if (cell)
                    return cell.gridColumn.name;
                return null;
            };
            QueryGridItem.prototype._createColumnElement = function (gridColumn) {
                var cell;
                if (Vidyano.WebComponents["QueryGridCell" + gridColumn.column.type])
                    cell = new Vidyano.WebComponents["QueryGridCell" + gridColumn.column.type]();
                else
                    cell = new QueryGridCell();
                this._cells.push(cell.initialize(gridColumn));
                return cell.host;
            };
            QueryGridItem.prototype._removedColumnElement = function (element) {
                this._cells = this._cells.filter(function (cell) { return cell.host != element; });
            };
            return QueryGridItem;
        })(QueryGridRow);
        var QueryGridItemActions = (function (_super) {
            __extends(QueryGridItemActions, _super);
            function QueryGridItemActions() {
                _super.apply(this, arguments);
            }
            QueryGridItemActions.prototype._popupOpening = function () {
                var _this = this;
                if (this._updateActionItems) {
                    this.empty();
                    var actions = (this.item.query.actions || []).filter(function (a) { return a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1); });
                    actions.forEach(function (action) {
                        var button = new Vidyano.WebComponents.ActionButton();
                        button.action = action;
                        button.item = _this.item;
                        Polymer.dom(_this).appendChild(button);
                    });
                }
                this._updateActionItems = false;
            };
            QueryGridItemActions.prototype._itemChanged = function () {
                this._updateActionItems = true;
            };
            QueryGridItemActions.prototype._mousemove = function (e) {
                e.stopPropagation();
            };
            QueryGridItemActions.prototype.popup = function () {
                return this.$["popup"].popup();
            };
            return QueryGridItemActions;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridItemActions = QueryGridItemActions;
        var QueryGridItemSelector = (function (_super) {
            __extends(QueryGridItemSelector, _super);
            function QueryGridItemSelector() {
                _super.apply(this, arguments);
            }
            QueryGridItemSelector.prototype._updateIsSelected = function (isAttached, item) {
                if (!isAttached && this._selectedItemsObserver) {
                    this._selectedItemsObserver();
                    this._selectedItemsObserver = undefined;
                    this._query = undefined;
                    return;
                }
                if (this.item) {
                    if (this.item.query != this._query || !this._selectedItemsObserver) {
                        this._query = this.item.query;
                        if (this._selectedItemsObserver)
                            this._selectedItemsObserver();
                        this._selectedItemsObserver = this.item.query.propertyChanged.attach(this._selectedItemsChanged.bind(this));
                    }
                }
                if (!this.item || !this.item.isSelected)
                    this._setIsSelected(false);
                else
                    this._setIsSelected(true);
            };
            QueryGridItemSelector.prototype._selectedItemsChanged = function (source, detail) {
                var _this = this;
                if (detail.propertyName != "selectedItems")
                    return;
                if (!detail.newValue || detail.newValue.length == 0) {
                    if (this.isSelected)
                        this._setIsSelected(false);
                    return;
                }
                var shouldSelect = Enumerable.from(detail.newValue).firstOrDefault(function (i) { return i == _this.item; });
                if (shouldSelect && !this.isSelected)
                    this._setIsSelected(true);
                else if (!shouldSelect && this.isSelected)
                    this._setIsSelected(false);
            };
            QueryGridItemSelector.prototype._select = function (e) {
                if (this.item) {
                    this.fire("item-select", {
                        item: this.item,
                        rangeSelect: e.detail.sourceEvent && e.detail.sourceEvent.shiftKey
                    });
                    e.stopPropagation();
                }
            };
            return QueryGridItemSelector;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridItemSelector = QueryGridItemSelector;
        var QueryGridColumnHeader = (function (_super) {
            __extends(QueryGridColumnHeader, _super);
            function QueryGridColumnHeader(column) {
                _super.call(this);
                this._setGridColumn(column);
                this.asElement.setAttribute("data-vi-column-name", column.safeName);
            }
            QueryGridColumnHeader.prototype.attached = function () {
                _super.prototype.attached.call(this);
                if (!this._grid)
                    this._grid = this.findParent(Vidyano.WebComponents.QueryGrid);
                this.gridColumn.isAttached = true;
            };
            QueryGridColumnHeader.prototype._sort = function (e) {
                var multiSort = e.detail.sourceEvent.ctrlKey;
                var newSortingDirection;
                switch (this.gridColumn.column.sortDirection) {
                    case Vidyano.SortDirection.Ascending: {
                        newSortingDirection = Vidyano.SortDirection.Descending;
                        break;
                    }
                    case Vidyano.SortDirection.Descending: {
                        newSortingDirection = multiSort && this.gridColumn.column.query.sortOptions.length > 1 ? Vidyano.SortDirection.None : Vidyano.SortDirection.Ascending;
                        break;
                    }
                    case Vidyano.SortDirection.None: {
                        newSortingDirection = Vidyano.SortDirection.Ascending;
                        break;
                    }
                }
                this.gridColumn.column.sort(newSortingDirection, multiSort);
                this.gridColumn.column.query.search().catch(function () { });
            };
            QueryGridColumnHeader.prototype._resizeStart = function (e) {
                this._resizeX = e.clientX;
                this._resizeStartWidth = this.gridColumn.currentWidth;
                this._resizeMinWidth = this.asElement.offsetHeight;
                var overlay = document.createElement("div");
                overlay.style.position = "fixed";
                overlay.style.zIndex = "100000";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.bottom = "0";
                overlay.style.right = "0";
                overlay.style.backgroundColor = "rgba(0,0,0,0.001)";
                overlay.style.cursor = "col-resize";
                overlay.addEventListener("mousemove", this._resizeMove.bind(this));
                overlay.addEventListener("touchmove", this._resizeMove.bind(this));
                overlay.addEventListener("mouseup", this._resizeEnd.bind(this));
                overlay.addEventListener("touchend", this._resizeEnd.bind(this));
                overlay.addEventListener("touchcancel", this._resizeEnd.bind(this));
                document.body.appendChild(overlay);
                e.stopPropagation();
            };
            QueryGridColumnHeader.prototype._resizeMove = function (e) {
                var newWidth = this._resizeStartWidth + e.clientX - this._resizeX;
                this.gridColumn.currentWidth = newWidth >= this._resizeMinWidth ? newWidth : this._resizeMinWidth;
                this.fire("column-width-updated", { column: this.gridColumn });
                if (Vidyano.WebComponents.QueryGrid._isChrome)
                    this._grid._updateScrollBarsVisibility();
                e.stopPropagation();
            };
            QueryGridColumnHeader.prototype._resizeEnd = function (e) {
                e.target.parentElement.removeChild(e.target);
                this.gridColumn.currentWidth = this.asElement.offsetWidth;
                this._grid._updateScrollBarsVisibility();
                e.stopPropagation();
            };
            QueryGridColumnHeader.prototype._getIsSorting = function (direction) {
                return direction !== Vidyano.SortDirection.None;
            };
            QueryGridColumnHeader.prototype._getSortingIcon = function (direction) {
                return direction === Vidyano.SortDirection.Ascending ? "Icon_SortAsc" : (direction === Vidyano.SortDirection.Descending ? "Icon_SortDesc" : "");
            };
            return QueryGridColumnHeader;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridColumnHeader = QueryGridColumnHeader;
        var QueryGridColumnFilter = (function (_super) {
            __extends(QueryGridColumnFilter, _super);
            function QueryGridColumnFilter(column) {
                _super.call(this);
                this._popupOpening = this.__popupOpening.bind(this);
                this._setGridColumn(column);
                this.asElement.setAttribute("data-vi-column-name", column.safeName);
            }
            QueryGridColumnFilter.prototype.attached = function () {
                _super.prototype.attached.call(this);
                if (!this._grid) {
                    this._grid = this.findParent(Vidyano.WebComponents.QueryGrid);
                    if (this._grid) {
                        var colName = this.getAttribute("data-vi-column-name");
                        this._setGridColumn(Enumerable.from(this._grid.unpinnedColumns).firstOrDefault(function (c) { return c.safeName == colName; }) || Enumerable.from(this._grid.pinnedColumns).firstOrDefault(function (c) { return c.safeName == colName; }));
                    }
                }
                this._updateFiltered();
            };
            QueryGridColumnFilter.prototype.refresh = function () {
                this._updateFiltered();
            };
            QueryGridColumnFilter.prototype._getTargetCollection = function () {
                return !this.inversed ? this.gridColumn.column.includes : this.gridColumn.column.excludes;
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
                } while (((element = element.parentElement) != this.asElement) && element);
                e.stopPropagation();
            };
            QueryGridColumnFilter.prototype.__popupOpening = function (e) {
                var _this = this;
                if (!this.gridColumn.column.canFilter)
                    return;
                if (!this.gridColumn.column.distincts || this.gridColumn.column.distincts.isDirty) {
                    this._setLoading(true);
                    this.gridColumn.column.refreshDistincts().then(function (distincts) {
                        if (!_this.gridColumn.column.includes)
                            _this.gridColumn.column.includes = [];
                        if (!_this.gridColumn.column.excludes)
                            _this.gridColumn.column.excludes = [];
                        var distinctsDiv = _this.$["distincts"];
                        distinctsDiv.style.minWidth = _this.asElement.offsetWidth + "px";
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
                    distinctsDiv.style.minWidth = this.asElement.offsetWidth + "px";
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
                selectorDiv.appendChild(WebComponents.Resource.Load("Icon_Selected"));
                selectorDiv.className = "selector";
                div.appendChild(selectorDiv);
                var span = document.createElement("span");
                span.textContent = this._getDistinctDisplayValue(value);
                div.appendChild(span);
                target.appendChild(div);
            };
            QueryGridColumnFilter.prototype._getDistinctDisplayValue = function (value) {
                if (!StringEx.isNullOrWhiteSpace(value) && value != "|") {
                    var indexOfPipe = value.indexOf("|");
                    if (indexOfPipe == 0)
                        return value.substr(1);
                    if (indexOfPipe > 0)
                        return value.substr(indexOfPipe + parseInt(value.substr(0, indexOfPipe), 10) + 1);
                }
                return value == null ? this.app.service.getTranslatedMessage("DistinctNullValue") : this.app.service.getTranslatedMessage("DistinctEmptyValue");
            };
            QueryGridColumnFilter.prototype._updateDistincts = function () {
                var _this = this;
                var distinctsDiv = this.$["distincts"];
                this._renderDistincts(distinctsDiv);
                this.fire("column-filter-changed", null);
                this._setLoading(true);
                this.gridColumn.column.query.search().then(function () {
                    return _this.gridColumn.column.refreshDistincts().then(function (distincts) {
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
                if (this.gridColumn.column.includes.length > 0) {
                    this.gridColumn.column.includes.forEach(function (v) { return _this._addDistinctValue(target, v, "include"); });
                    this._setInversed(false);
                }
                else if (this.gridColumn.column.excludes.length > 0) {
                    this.gridColumn.column.excludes.forEach(function (v) { return _this._addDistinctValue(target, v, "exclude"); });
                    this._setInversed(true);
                }
                var includesExcludes = this.gridColumn.column.includes.concat(this.gridColumn.column.excludes);
                this.gridColumn.column.distincts.matching.filter(function (v) { return includesExcludes.indexOf(v) == -1; }).forEach(function (v) { return _this._addDistinctValue(target, v, "matching"); });
                this.gridColumn.column.distincts.remaining.filter(function (v) { return includesExcludes.indexOf(v) == -1; }).forEach(function (v) { return _this._addDistinctValue(target, v, "remaining"); });
            };
            QueryGridColumnFilter.prototype._search = function () {
                var _this = this;
                if (StringEx.isNullOrEmpty(this.searchText))
                    return;
                this._getTargetCollection().push("1|@" + this.searchText);
                this.searchText = "";
                this._renderDistincts();
                this.gridColumn.column.query.search().then(function () {
                    _this._renderDistincts();
                    _this.fire("column-filter-changed", null);
                });
            };
            QueryGridColumnFilter.prototype._closePopup = function () {
                WebComponents.Popup.closeAll();
            };
            QueryGridColumnFilter.prototype._updateFiltered = function () {
                var _this = this;
                if (this.filtered = (this.gridColumn.column.includes && this.gridColumn.column.includes.length > 0) ||
                    (this.gridColumn.column.excludes && this.gridColumn.column.excludes.length > 0)) {
                    var objects = [];
                    var textSearch = [];
                    ((!this.inversed ? this.gridColumn.column.includes : this.gridColumn.column.excludes) || []).forEach(function (value) {
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
            QueryGridColumnFilter.prototype._inverse = function (e) {
                e.stopPropagation();
                this._setInversed(!this.inversed);
                var filters;
                if (this.inversed) {
                    filters = this.gridColumn.column.includes.length;
                    var temp = this.gridColumn.column.excludes;
                    this.gridColumn.column.excludes = this.gridColumn.column.includes.slice();
                    this.gridColumn.column.includes = temp.slice();
                }
                else {
                    filters = this.gridColumn.column.excludes.length;
                    var temp = this.gridColumn.column.includes;
                    this.gridColumn.column.includes = this.gridColumn.column.excludes.slice();
                    this.gridColumn.column.excludes = temp.slice();
                }
                if (filters > 0)
                    this._updateDistincts();
            };
            QueryGridColumnFilter.prototype._clear = function (e) {
                if (!this.filtered) {
                    e.stopPropagation();
                    return;
                }
                this.gridColumn.column.includes = [];
                this.gridColumn.column.excludes = [];
                this._setInversed(false);
                this._updateDistincts();
                this._closePopup();
            };
            QueryGridColumnFilter.prototype._catchClick = function (e) {
                e.stopPropagation();
            };
            return QueryGridColumnFilter;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridColumnFilter = QueryGridColumnFilter;
        var QueryGridCell = (function () {
            function QueryGridCell() {
                this._foreground = {};
                this._fontWeight = {};
                this._textAlign = {};
            }
            QueryGridCell.prototype.initialize = function (column) {
                this._host = document.createElement("td");
                if (!this._dom) {
                    this._host.appendChild(this._dom = document.createElement("div"));
                    this._dom.className = "cell";
                }
                this._gridColumn = column;
                this._dom.setAttribute("data-vi-column-name", this._gridColumn.safeName);
                this._dom.setAttribute("data-vi-column-type", this._gridColumn.column.type);
                if (Vidyano.Service.isNumericType(this._gridColumn.column.type))
                    this._dom.style.textAlign = this._textAlign.currentValue = this._textAlign.originalValue = "right";
                return this;
            };
            Object.defineProperty(QueryGridCell.prototype, "host", {
                get: function () {
                    return this._host;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridCell.prototype, "gridColumn", {
                get: function () {
                    return this._gridColumn;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridCell.prototype, "width", {
                get: function () {
                    return this._dom.offsetWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridCell.prototype, "_type", {
                get: function () {
                    return this.gridColumn.column.type;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryGridCell.prototype, "item", {
                get: function () {
                    return this._item;
                },
                set: function (item) {
                    this._item = item;
                    this._render(this._dom);
                },
                enumerable: true,
                configurable: true
            });
            QueryGridCell.prototype._render = function (dom) {
                if (!this._item) {
                    this._dom.textContent = "";
                    return;
                }
                var itemValue = this._item.getFullValue(this._gridColumn.name);
                this._typeHints = Vidyano.extend({}, this._item.typeHints, itemValue ? itemValue.typeHints : undefined);
                var value = this._item.getValue(this.gridColumn.name);
                if (value != null && (this._type == "Boolean" || this._type == "NullableBoolean"))
                    value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("TrueKey", "True") : this._getTypeHint("FalseKey", "False"));
                else if (this._type == "YesNo")
                    value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("TrueKey", "Yes") : this._getTypeHint("FalseKey", "No"));
                else if (this._type == "Time" || this._type == "NullableTime") {
                    if (value != null) {
                        value = value.trimEnd('0').trimEnd('.');
                        if (value.startsWith('0:'))
                            value = value.substr(2);
                        if (value.endsWith(':00'))
                            value = value.substr(0, value.length - 3);
                    }
                }
                if (value != null) {
                    var format = this._getTypeHint("DisplayFormat", null);
                    if (format == null || format == "{0}") {
                        switch (this._type) {
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
                var foreground = this._getTypeHint("Foreground", null);
                if (foreground != this._foreground.currentValue) {
                    if (this._foreground.originalValue === undefined)
                        this._foreground.originalValue = dom.style.color;
                    dom.style.color = this._foreground.currentValue = foreground || this._foreground.originalValue;
                }
                var fontWeight = this._getTypeHint("FontWeight", null);
                if (fontWeight != this._fontWeight.currentValue) {
                    if (this._fontWeight.originalValue === undefined)
                        this._fontWeight.originalValue = dom.style.fontWeight;
                    dom.style.fontWeight = this._fontWeight.currentValue = fontWeight || this._fontWeight.originalValue;
                }
                var textAlign = this._getTypeHint("HorizontalContentAlignment", null);
                if (textAlign != this._textAlign.currentValue)
                    dom.style.textAlign = this._textAlign.currentValue = textAlign || this._textAlign.originalValue;
                var extraClass = this.gridColumn.column.getTypeHint("ExtraClass", undefined, itemValue && itemValue.typeHints);
                if (extraClass != this._extraClass) {
                    if (!StringEx.isNullOrEmpty(this._extraClass))
                        this._extraClass.split(' ').forEach(function (cls) { return dom.classList.remove(cls); });
                    if (!StringEx.isNullOrEmpty(extraClass)) {
                        this._extraClass = extraClass;
                        this._extraClass.split(' ').forEach(function (cls) { return dom.classList.add(cls); });
                    }
                }
                if (dom.firstChild != null) {
                    if (dom.firstChild.nodeValue !== value)
                        dom.firstChild.nodeValue = value;
                }
                else
                    dom.appendChild(document.createTextNode(value));
            };
            QueryGridCell.prototype._getTypeHint = function (name, defaultValue) {
                return this.gridColumn.column.getTypeHint(name, defaultValue, this._typeHints);
            };
            return QueryGridCell;
        })();
        WebComponents.QueryGridCell = QueryGridCell;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGrid, Vidyano.WebComponents, "vi", {
            properties: {
                query: Object,
                asLookup: {
                    type: Boolean,
                    reflectToAttribute: true
                },
                loading: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "query.isBusy"
                },
                initializing: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true,
                    value: true
                },
                viewport: {
                    type: Object,
                    readOnly: true
                },
                remainderWidth: {
                    type: Number,
                    computed: "_computeRemainderWidth(viewport)"
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
                disableFilter: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "!query.canFilter"
                },
                disableInlineActions: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_computeDisableInlineActions(query.actions)"
                },
                disableSelect: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_computeDisableSelect(query.actions)"
                }
            },
            observers: [
                "_columnsChanged(query.columns, isAttached)",
                "_itemsChanged(query.items, isAttached, viewport)",
            ],
            forwardObservers: [
                "query.columns",
                "query.items",
                "query.isBusy"
            ],
            listeners: {
                "measure-columns": "_measureColumnsListener",
                "column-width-updated": "_columnWidthUpdatedListener",
                "update-scrollbars": "_updateScrollBarsListener",
                "item-select": "_itemSelectListener",
                "filter-changed": "_filterChangedListener",
                "column-filter-changed": "_columnFilterChangedListener"
            }
        });
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridColumnHeader, Vidyano.WebComponents, "vi", {
            properties: {
                gridColumn: {
                    type: Object,
                    readOnly: true,
                    notify: true
                },
                column: {
                    type: Object,
                    computed: "gridColumn.column"
                },
                sortDirection: {
                    type: Number,
                    computed: "column.sortDirection"
                }
            },
            forwardObservers: [
                "column.sortDirection"
            ]
        });
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridColumnFilter, Vidyano.WebComponents, "vi", {
            properties: {
                gridColumn: {
                    type: Object,
                    readOnly: true,
                    notify: true
                },
                loading: {
                    type: Boolean,
                    readOnly: true,
                    reflectToAttribute: true
                },
                searchText: String,
                filtered: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false
                },
                label: String,
                inversed: {
                    type: Boolean,
                    readOnly: true
                }
            }
        });
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridItemSelector, Vidyano.WebComponents, "vi", {
            properties: {
                item: Object,
                isSelected: {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                }
            },
            observers: [
                "_updateIsSelected(isAttached, item)"
            ],
            listeners: {
                "tap": "_select"
            }
        });
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridItemActions, Vidyano.WebComponents, "vi", {
            properties: {
                item: {
                    type: Object,
                    observer: "_itemChanged"
                }
            },
            listeners: {
                "mousemove": "_mousemove"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

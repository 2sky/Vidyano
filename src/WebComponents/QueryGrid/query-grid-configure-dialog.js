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
        var QueryGridConfigureDialog = (function (_super) {
            __extends(QueryGridConfigureDialog, _super);
            function QueryGridConfigureDialog(grid) {
                _super.call(this);
                this.grid = grid;
                this._set_columns(grid.query.columns.filter(function (c) { return c.width != "0"; }).map(function (c) { return new Vidyano.WebComponents.QueryGridConfigureDialogColumn(c); }));
                this._distributeColumns();
            }
            QueryGridConfigureDialog.prototype._distributeColumns = function (e) {
                var _this = this;
                var columns = Enumerable.from(this._columns).orderBy(function (c) { return c.offset; }).memoize();
                requestAnimationFrame(function () {
                    _this._updateColumns(_this.$["pinned"], columns.where(function (c) { return c.isPinned; }).toArray());
                    _this._updateColumns(_this.$["unpinned"], columns.where(function (c) { return !c.isPinned; }).toArray());
                });
                if (e)
                    e.stopPropagation();
            };
            QueryGridConfigureDialog.prototype._updateColumns = function (target, columns) {
                columns.forEach(function (col) { return target.appendChild(col); });
            };
            QueryGridConfigureDialog.prototype._reorderColumns = function (e) {
                var children = Polymer.dom(e.srcElement).children;
                var offsets = Enumerable.from(children).orderBy(function (c) { return c.offset; }).select(function (c) { return c.offset; }).toArray();
                children.forEach(function (child, index) {
                    child.offset = offsets[index];
                });
            };
            QueryGridConfigureDialog.prototype._save = function () {
                var settings = this.app.service.application.userSettings["QueryGridSettings"] || (this.app.service.application.userSettings["QueryGridSettings"] = {});
                var querySettings = settings[this.grid.query.id] || (settings[this.grid.query.id] = {});
                Polymer.dom(this.$["pinned"]).children.concat(Polymer.dom(this.$["unpinned"]).children).forEach(function (c) {
                    var cr = querySettings[c.column.name];
                    querySettings[c.column.name] = { offset: c.offset, isPinned: c.isPinned, isHidden: c.isHidden, dragWidth: cr != null ? cr.dragWidth : null };
                });
                this.app.service.application.saveUserSettings();
                this.instance.resolve();
            };
            QueryGridConfigureDialog.prototype._reset = function () {
                var settings = this.app.service.application.userSettings["QueryGridSettings"];
                if (settings != null) {
                    if (settings[this.grid.query.id] != null) {
                        delete settings[this.grid.query.id];
                        this.app.service.application.saveUserSettings();
                    }
                }
            };
            QueryGridConfigureDialog = __decorate([
                WebComponents.Dialog.register({
                    properties: {
                        grid: Object,
                        _columns: {
                            type: Object,
                            readOnly: true
                        }
                    },
                    listeners: {
                        "redistribute-columns": "_distributeColumns",
                        "reorder-columns": "_reorderColumns"
                    }
                })
            ], QueryGridConfigureDialog);
            return QueryGridConfigureDialog;
        })(WebComponents.Dialog);
        WebComponents.QueryGridConfigureDialog = QueryGridConfigureDialog;
        var QueryGridConfigureDialogColumnList = (function (_super) {
            __extends(QueryGridConfigureDialogColumnList, _super);
            function QueryGridConfigureDialogColumnList() {
                _super.apply(this, arguments);
            }
            QueryGridConfigureDialogColumnList.prototype._dragEnd = function () {
                this.fire("reorder-columns", {}, { bubbles: true });
            };
            QueryGridConfigureDialogColumnList = __decorate([
                WebComponents.Sortable.register({
                    extends: "ul"
                })
            ], QueryGridConfigureDialogColumnList);
            return QueryGridConfigureDialogColumnList;
        })(WebComponents.Sortable);
        WebComponents.QueryGridConfigureDialogColumnList = QueryGridConfigureDialogColumnList;
        var QueryGridConfigureDialogColumn = (function (_super) {
            __extends(QueryGridConfigureDialogColumn, _super);
            function QueryGridConfigureDialogColumn(column) {
                _super.call(this);
                this.column = column;
                this.offset = column.offset;
                this._setLabel(column.label);
                this._setIsPinned(column.isPinned);
                this._setIsHidden(column.isHidden);
            }
            QueryGridConfigureDialogColumn.prototype._togglePin = function () {
                this._setIsPinned(!this.isPinned);
                this.fire("redistribute-columns", {}, { bubbles: true });
            };
            QueryGridConfigureDialogColumn.prototype._toggleVisible = function () {
                this._setIsHidden(!this.isHidden);
            };
            QueryGridConfigureDialogColumn = __decorate([
                WebComponents.WebComponent.register({
                    extends: "li",
                    properties: {
                        label: {
                            type: String,
                            readOnly: true
                        },
                        isPinned: {
                            type: Boolean,
                            reflectToAttribute: true,
                            readOnly: true
                        },
                        isHidden: {
                            type: Boolean,
                            reflectToAttribute: true,
                            readOnly: true
                        }
                    }
                })
            ], QueryGridConfigureDialogColumn);
            return QueryGridConfigureDialogColumn;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridConfigureDialogColumn = QueryGridConfigureDialogColumn;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

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
        var Attributes;
        (function (Attributes) {
            var PersistentObjectAttributeAsDetail = (function (_super) {
                __extends(PersistentObjectAttributeAsDetail, _super);
                function PersistentObjectAttributeAsDetail() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeAsDetail.prototype._isColumnVisible = function (column) {
                    return !column.isHidden && column.width !== "0";
                };
                PersistentObjectAttributeAsDetail.prototype._rowSizechanged = function (e, detail) {
                    this._setWidth(detail.width);
                    this._setHeight(detail.height);
                    e.stopPropagation();
                };
                PersistentObjectAttributeAsDetail.prototype._computeColumns = function (columns) {
                    return Enumerable.from(columns).where(function (c) { return !c.isHidden; }).toArray();
                };
                PersistentObjectAttributeAsDetail.prototype._computeCanDelete = function (editing, deleteAction, objects) {
                    return editing && !!deleteAction && !!objects && objects.some(function (o) { return !o.isDeleted; });
                };
                PersistentObjectAttributeAsDetail.prototype._computeNewActionPinned = function (height, newAction) {
                    if (!height || !newAction)
                        return false;
                    var scroller = this.$["body"];
                    if (!this._inlineAddHeight) {
                        var inlineAdd = scroller.asElement.querySelector(".row.add.inline");
                        if (!inlineAdd)
                            return false;
                        this._inlineAddHeight = inlineAdd.offsetHeight;
                    }
                    var contentHeight = this.newActionPinned ? height : height - this._inlineAddHeight;
                    return contentHeight + this._inlineAddHeight > this.$["table"].offsetHeight - this.$["head"].offsetHeight;
                };
                PersistentObjectAttributeAsDetail.prototype._updateActions = function (actions, editing, readOnly) {
                    this._setNewAction(editing && !readOnly ? actions["New"] || null : null);
                    this._setDeleteAction(editing && !readOnly ? actions["Delete"] || null : null);
                };
                PersistentObjectAttributeAsDetail.prototype._updateWidths = function (columns, width, deleteAction, editing, isAttached) {
                    if (!isAttached || !columns || !columns.length || !width || this._lastComputedWidths === width)
                        return;
                    var widths = [];
                    var remainingWidth = this._lastComputedWidths = width;
                    var usedWidth = 0;
                    columns.filter(function (c) { return c.width != null && !c.width.endsWith('%'); }).forEach(function (c) {
                        var intWidth = parseInt(c.width, 10);
                        if (!isNaN(intWidth)) {
                            widths.push({
                                name: c.name,
                                width: intWidth
                            });
                            remainingWidth -= intWidth;
                            usedWidth += intWidth;
                        }
                    });
                    var percentagesRemainingWidth = width;
                    columns.filter(function (c) { return c.width != null && c.width.endsWith('%'); }).forEach(function (c) {
                        var intWidthPercentage = parseInt(c.width, 10);
                        if (!isNaN(intWidthPercentage)) {
                            var intWidth = Math.floor(percentagesRemainingWidth * intWidthPercentage / 100);
                            widths.push({
                                name: c.name,
                                width: intWidth
                            });
                            remainingWidth -= intWidth;
                            usedWidth += intWidth;
                        }
                    });
                    var udColumns = columns.filter(function (c) { return c.width == null; });
                    var remainingColumnWidth = Math.floor(remainingWidth / udColumns.length);
                    udColumns.forEach(function (c) {
                        widths.push({
                            name: c.name,
                            width: remainingColumnWidth
                        });
                        usedWidth += remainingColumnWidth;
                    });
                    if (usedWidth < width)
                        widths[0].width += width - usedWidth;
                    var style = this.$["style"];
                    style.setStyle.apply(style, ["ColumnStyles"].concat(widths.map(function (w) { return (".column[data-column='" + w.name + "'] { width: " + w.width + "px; }"); })));
                    this._setInitializing(false);
                };
                PersistentObjectAttributeAsDetail.prototype._rowAdded = function (e) {
                    var row = e.target.parentElement;
                    this.async(function () {
                        row.scrollIntoView(false);
                    });
                };
                PersistentObjectAttributeAsDetail.prototype._add = function (e) {
                    var _this = this;
                    this.newAction.skipOpen = true;
                    this.newAction.execute().then(function (po) {
                        _this.push("attribute.objects", po);
                        _this.attribute.isValueChanged = true;
                        _this.attribute.parent.triggerDirty();
                    });
                };
                PersistentObjectAttributeAsDetail.prototype._delete = function (e) {
                    var obj = e.model.obj;
                    if (!obj.isNew)
                        obj.isDeleted = true;
                    else
                        this.splice("attribute.objects", this.attribute.objects.indexOf(obj), 1);
                    this.attribute.isValueChanged = true;
                    this.attribute.parent.triggerDirty();
                };
                return PersistentObjectAttributeAsDetail;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeAsDetail = PersistentObjectAttributeAsDetail;
            var PersistentObjectAttributeAsDetailRow = (function (_super) {
                __extends(PersistentObjectAttributeAsDetailRow, _super);
                function PersistentObjectAttributeAsDetailRow() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeAsDetailRow.prototype._isColumnVisible = function (column) {
                    return !column.isHidden && column.width !== "0";
                };
                PersistentObjectAttributeAsDetailRow.prototype._getDisplayValue = function (obj, column) {
                    var attr = this._getAttributeForColumn(obj, column);
                    return attr && attr.displayValue || "";
                };
                PersistentObjectAttributeAsDetailRow.prototype._getAttributeForColumn = function (obj, column) {
                    return obj.attributesByName[column.name];
                };
                PersistentObjectAttributeAsDetailRow.prototype._scrollNewDetailRowIntoView = function (serviceObject, columns, editing, isAttached) {
                    if (editing && isAttached && !!serviceObject && serviceObject.isNew && !!columns)
                        this.asElement.scrollIntoView(false);
                };
                return PersistentObjectAttributeAsDetailRow;
            })(WebComponents.WebComponent);
            Attributes.PersistentObjectAttributeAsDetailRow = PersistentObjectAttributeAsDetailRow;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeAsDetail, {
                properties: {
                    columns: {
                        type: Array,
                        computed: "_computeColumns(attribute.details.columns)"
                    },
                    newAction: {
                        type: Object,
                        readOnly: true
                    },
                    newActionPinned: {
                        type: Boolean,
                        reflectToAttribute: true,
                        computed: "_computeNewActionPinned(height, newAction)"
                    },
                    deleteAction: {
                        type: Object,
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
                    canDelete: {
                        type: Boolean,
                        reflectToAttribute: true,
                        computed: "_computeCanDelete(editing, deleteAction, attribute.objects)"
                    },
                    initializing: {
                        type: Boolean,
                        reflectToAttribute: true,
                        value: true,
                        readOnly: true
                    }
                },
                observers: [
                    "_updateWidths(columns, width, deleteAction, editing, isAttached)",
                    "_updateActions(attribute.details.actions, editing, readOnly)"
                ],
                forwardObservers: [
                    "attribute.objects.isDeleted"
                ]
            });
            WebComponents.WebComponent.register(PersistentObjectAttributeAsDetailRow, WebComponents.Attributes, "vi", {
                properties: {
                    serviceObject: Object,
                    columns: Array,
                    editing: Boolean
                },
                observers: [
                    "_scrollNewDetailRowIntoView(serviceObject, columns, editing, isAttached)"
                ]
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

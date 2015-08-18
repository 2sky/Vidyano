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
        var QueryGridFilters = (function (_super) {
            __extends(QueryGridFilters, _super);
            function QueryGridFilters() {
                _super.apply(this, arguments);
            }
            QueryGridFilters.prototype._queryChanged = function (query) {
                this._setFilters(query && query.filters ? this._computeFilters(query.filters) : []);
                if (query && query.filters) {
                    var filterAttr = this.query.filters.attributesByName["Filters"];
                    var defaultFilter = Enumerable.from(filterAttr.objects).firstOrDefault(function (filter) { return filter.getAttributeValue("IsDefault"); });
                    if (defaultFilter)
                        this._setCurrentFilter(defaultFilter.getAttributeValue("Name"));
                    else if (this.currentFilter)
                        this._setCurrentFilter(null);
                }
                else
                    this._setCurrentFilter(null);
                this._updateFiltering();
            };
            QueryGridFilters.prototype._currentFilterChanged = function () {
                try {
                    this._preventColumnFilterChangedListener = true;
                    this.fire("filter-changed", null);
                    this._updateFiltering();
                }
                finally {
                    this._preventColumnFilterChangedListener = false;
                }
            };
            QueryGridFilters.prototype._computeFilters = function (filters) {
                var filterAttr = filters.attributesByName["Filters"];
                return filterAttr.objects.map(function (filter) { return filter.getAttributeValue("Name"); }).sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
            };
            QueryGridFilters.prototype._computeCanOpen = function (filters, filtering) {
                return filters && filters.length > 0 || filtering;
            };
            QueryGridFilters.prototype._columnFilterChangedListener = function (e) {
                e.stopPropagation();
                if (!this._preventColumnFilterChangedListener)
                    this._updateFiltering();
            };
            QueryGridFilters.prototype._updateFiltering = function () {
                this._setFiltering(this.query && this.query.columns.some(function (c) { return (c.includes && c.includes.length > 0) || (c.excludes && c.excludes.length > 0); }));
                WebComponents.Popup.closeAll(this);
            };
            QueryGridFilters.prototype._getFilterObject = function (name) {
                var filterAttr = this.query.filters.attributesByName["Filters"];
                return Enumerable.from(filterAttr.objects).firstOrDefault(function (filter) { return filter.getAttributeValue("Name") === name; });
            };
            QueryGridFilters.prototype._getColumnsFilterData = function (query) {
                return JSON.stringify(query.columns.filter(function (c) { return (c.includes && c.includes.length > 0) || (c.excludes && c.excludes.length > 0); }).map(function (c) {
                    return {
                        name: c.name,
                        includes: c.includes,
                        excludes: c.excludes
                    };
                }));
            };
            QueryGridFilters.prototype._save = function () {
                var _this = this;
                this.query.filters.beginEdit();
                var filterAttr = this.query.filters.attributesByName["Filters"];
                var action = filterAttr.details.actions["New"];
                action.skipOpen = true;
                action.execute().then(function (po) {
                    var dialog = _this.$["dialog"];
                    dialog.show(po, function () {
                        po.attributesByName["Columns"].setValue(_this._getColumnsFilterData(_this.query));
                        filterAttr.objects.push(po);
                        return _this.query.filters.save().then(function (result) {
                            _this._setFilters(_this._computeFilters(_this.query.filters));
                            _this._setCurrentFilter(po.getAttributeValue("Name"));
                            return result;
                        });
                    });
                });
            };
            QueryGridFilters.prototype._saveCurrent = function () {
                this.query.filters.beginEdit();
                var po = this._getFilterObject(this.currentFilter);
                if (!po)
                    return;
                po.attributesByName["Columns"].setValue(this._getColumnsFilterData(this.query));
                this.query.filters.save();
            };
            QueryGridFilters.prototype._reset = function () {
                this.query.columns.forEach(function (col) {
                    col.includes = [];
                    col.excludes = [];
                });
                if (this.currentFilter === null)
                    this.fire("filter-changed", null);
                else
                    this._setCurrentFilter(null);
                this._updateFiltering();
                this.query.search();
            };
            QueryGridFilters.prototype._edit = function (e) {
                var _this = this;
                e.stopPropagation();
                WebComponents.Popup.closeAll();
                var name = e.currentTarget.getAttribute("data-filter");
                if (!name)
                    return;
                var po = this._getFilterObject(name);
                if (!po)
                    return;
                this.query.filters.beginEdit();
                var isCurrentFilter = po.getAttributeValue("Name") === this.currentFilter && this.currentFilter != null;
                var dialog = this.$["dialog"];
                po.breadcrumb = po.actions["Edit"].displayName + " '" + name + "'";
                dialog.show(po, function () {
                    if (isCurrentFilter)
                        po.attributesByName["Columns"].setValue(_this._getColumnsFilterData(_this.query));
                    return _this.query.filters.save().then(function (result) {
                        _this._setFilters(_this._computeFilters(_this.query.filters));
                        if (isCurrentFilter)
                            _this._setCurrentFilter(po.getAttributeValue("Name"));
                        return result;
                    });
                });
            };
            QueryGridFilters.prototype._load = function (e) {
                var name = e.currentTarget.getAttribute("data-filter");
                if (!name)
                    return;
                var po = this._getFilterObject(name);
                if (!po)
                    return;
                var columnsFilterData = Enumerable.from(JSON.parse(po.getAttributeValue("Columns")));
                this.query.columns.forEach(function (col) {
                    var columnFilterData = columnsFilterData.firstOrDefault(function (c) { return c.name === col.name; });
                    if (columnFilterData) {
                        col.includes = columnFilterData.includes;
                        col.excludes = columnFilterData.excludes;
                    }
                    else {
                        col.includes = [];
                        col.excludes = [];
                    }
                });
                this.query.search();
                this._setCurrentFilter(Enumerable.from(this.filters).firstOrDefault(function (filter) { return filter === name; }));
            };
            QueryGridFilters.prototype._delete = function (e) {
                var _this = this;
                e.stopPropagation();
                WebComponents.Popup.closeAll();
                var name = e.currentTarget.getAttribute("data-filter");
                if (!name)
                    return;
                var filterAttr = this.query.filters.attributesByName["Filters"];
                var po = Enumerable.from(filterAttr.objects).firstOrDefault(function (filter) { return filter.getAttributeValue("Name") === name; });
                if (!po)
                    return;
                this.app.showMessageDialog({
                    title: name,
                    titleIcon: "Icon_Action_Delete",
                    message: this.translateMessage("AskForDeleteFilter", name),
                    actions: [this.translateMessage("Delete"), this.translateMessage("Cancel")],
                    actionTypes: ["Danger"]
                }).then(function (result) {
                    if (result === 0) {
                        _this.query.filters.beginEdit();
                        po.isDeleted = true;
                        _this.query.filters.save().then(function () {
                            _this._setFilters(_this._computeFilters(_this.query.filters));
                            if (_this.currentFilter && _this.currentFilter === name)
                                _this._setCurrentFilter(null);
                        });
                    }
                });
            };
            QueryGridFilters.prototype._ok = function () {
                this._dialog.resolve(true);
            };
            QueryGridFilters.prototype._cancel = function () {
                this._dialog.reject(false);
            };
            QueryGridFilters.prototype._getCurrentFilterSave = function (currentFilter) {
                if (!currentFilter)
                    return "";
                return this.translateMessage("Save") + " '" + currentFilter + "'";
            };
            return QueryGridFilters;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridFilters = QueryGridFilters;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridFilters, Vidyano.WebComponents, "vi", {
            properties: {
                query: {
                    type: Object,
                    observer: "_queryChanged"
                },
                filters: {
                    type: Array,
                    readOnly: true
                },
                filtering: {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true,
                    value: false
                },
                canOpen: {
                    type: Boolean,
                    computed: "_computeCanOpen(filters, filtering)"
                },
                currentFilter: {
                    type: Object,
                    readOnly: true,
                    observer: "_currentFilterChanged",
                    value: null
                },
                editLabel: {
                    type: String,
                    computed: "query.filters.actions.Edit.displayName"
                }
            },
            listeners: {
                "column-filter-changed": "_columnFilterChangedListener"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

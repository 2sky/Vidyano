var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var _groups = [];
        var Sortable = (function (_super) {
            __extends(Sortable, _super);
            function Sortable() {
                _super.apply(this, arguments);
            }
            Sortable.prototype.attached = function () {
                _super.prototype.attached.call(this);
                if (this.group)
                    _groups.push(this);
                this._create();
            };
            Sortable.prototype.detached = function () {
                if (this.group)
                    _groups.remove(this);
                this._destroy();
                _super.prototype.detached.call(this);
            };
            Sortable.prototype.groupChanged = function () {
                this._sortable.option("group", this.group);
                if (this.group)
                    _groups.push(this);
                else
                    _groups.remove(this);
            };
            Sortable.prototype.filterChanged = function () {
                this._sortable.option("filter", this.filter);
            };
            Sortable.prototype._create = function () {
                var _this = this;
                this._destroy();
                this._sortable = window["Sortable"].create(this, {
                    group: this.group,
                    filter: this.filter,
                    disabled: !this.enabled,
                    onStart: function () {
                        _this._setIsDragging(true);
                        if (_this.group)
                            _groups.filter(function (s) { return s.group == _this.group; }).forEach(function (s) { return s._setIsGroupDragging(true); });
                    },
                    onEnd: function () {
                        _this._setIsDragging(false);
                        if (_this.group)
                            _groups.filter(function (s) { return s.group == _this.group; }).forEach(function (s) { return s._setIsGroupDragging(false); });
                    }
                });
            };
            Sortable.prototype._destroy = function () {
                if (this._sortable) {
                    this._sortable.destroy();
                    this._sortable = null;
                }
            };
            Sortable.prototype._enabledChanged = function (enabled) {
                this._sortable.option("disabled", !enabled);
            };
            Sortable.register = function (info) {
                if (info === void 0) { info = {}; }
                return function (obj) {
                    info.properties = info.properties || {};
                    info.properties["group"] = {
                        type: String,
                        reflectToAttribute: true,
                    };
                    info.properties["filter"] =
                        {
                            type: String,
                            reflectToAttribute: true
                        };
                    info.properties["isDragging"] =
                        {
                            type: Boolean,
                            reflectToAttribute: true,
                            readOnly: true
                        };
                    info.properties["isGroupDragging"] =
                        {
                            type: Boolean,
                            reflectToAttribute: true,
                            readOnly: true
                        };
                    info.properties["enabled"] =
                        {
                            type: Boolean,
                            observer: "_enabledChanged"
                        };
                    return WebComponents.WebComponent.register(obj, info);
                };
            };
            return Sortable;
        })(WebComponents.WebComponent);
        WebComponents.Sortable = Sortable;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

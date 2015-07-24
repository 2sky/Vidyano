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
        var AppConfig = (function (_super) {
            __extends(AppConfig, _super);
            function AppConfig() {
                _super.apply(this, arguments);
            }
            AppConfig.prototype.attached = function () {
                _super.prototype.attached.call(this);
                if (!this._defaultAttributeConfig) {
                    this._defaultAttributeConfig = this.appendChild(new WebComponents.PersistentObjectAttributeConfig());
                }
                this.app._setConfiguration(this);
            };
            AppConfig.prototype.getAttributeConfig = function (attr) {
                if (!this._attributeConfigs)
                    this._attributeConfigs = this._getConfigs(Vidyano.WebComponents.PersistentObjectAttributeConfig);
                return this._attributeConfigs.firstOrDefault(function (c) { return c.parentObjectId == attr.parent.objectId && c.parentId == attr.parent.id && (c.name == attr.name || c.type == attr.type); }) ||
                    this._attributeConfigs.firstOrDefault(function (c) { return c.parentId == attr.parent.id && (c.name == attr.name || c.type == attr.type); }) ||
                    this._attributeConfigs.firstOrDefault(function (c) { return c.name == attr.name && c.type == attr.type; }) ||
                    this._attributeConfigs.firstOrDefault(function (c) { return c.name == attr.name; }) ||
                    this._attributeConfigs.firstOrDefault(function (c) { return c.type == attr.type; }) ||
                    this._defaultAttributeConfig;
            };
            AppConfig.prototype.getTabConfig = function (tab) {
                if (!this._tabConfigs)
                    this._tabConfigs = this._getConfigs(Vidyano.WebComponents.PersistentObjectTabConfig);
                return this._tabConfigs.firstOrDefault(function (c) { return c.name == tab.name && c.type == tab.parent.type && c.objectId == tab.parent.objectId; }) ||
                    this._tabConfigs.firstOrDefault(function (c) { return c.name == tab.name && c.type == tab.parent.type; });
            };
            AppConfig.prototype._getConfigs = function (type) {
                return Enumerable.from(Polymer.dom(this).children).where(function (c) { return c.tagName != "TEMPLATE"; }).selectMany(function (element) {
                    if (element.tagName == "CONTENT")
                        return Enumerable.from(Polymer.dom(element).getDistributedNodes()).where(function (c) { return c.tagName != "TEMPLATE"; }).toArray();
                    return [element];
                }).where(function (child) { return child instanceof type; }).select(function (child) { return child; }).memoize();
            };
            return AppConfig;
        })(WebComponents.WebComponent);
        WebComponents.AppConfig = AppConfig;
        WebComponents.WebComponent.register(AppConfig, WebComponents, "vi");
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

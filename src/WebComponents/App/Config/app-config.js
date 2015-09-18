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
            AppConfig.prototype.getProgramUnitConfig = function (name) {
                if (!this._programUnitConfigs)
                    this._programUnitConfigs = this._getConfigs(Vidyano.WebComponents.ProgramUnitConfig);
                return this._programUnitConfigs.firstOrDefault(function (c) { return c.name == name; });
            };
            AppConfig.prototype._getConfigs = function (type) {
                return Enumerable.from(Polymer.dom(this).children).where(function (c) { return c.tagName != "TEMPLATE"; }).selectMany(function (element) {
                    if (element.tagName == "CONTENT")
                        return Enumerable.from(Polymer.dom(element).getDistributedNodes()).where(function (c) { return c.tagName != "TEMPLATE"; }).toArray();
                    return [element];
                }).where(function (child) { return child instanceof type; }).select(function (child) { return child; }).memoize();
            };
            AppConfig = __decorate([
                WebComponents.WebComponent.register
            ], AppConfig);
            return AppConfig;
        })(WebComponents.WebComponent);
        WebComponents.AppConfig = AppConfig;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

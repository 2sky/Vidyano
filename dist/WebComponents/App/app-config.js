var __extends = this.__extends || function (d, b) {
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
                this._attributeConfigs = [];
            }
            AppConfig.prototype.attached = function () {
                _super.prototype.attached.call(this);
                if (!this._defaultAttributeConfig) {
                    this._defaultAttributeConfig = this.appendChild(new WebComponents.PersistentObjectAttributeConfig());
                }
                this.app._setConfiguration(this);
            };
            AppConfig.prototype.getAttributeConfig = function (attr) {
                var configs = Enumerable.from(this._attributeConfigs);
                return configs.firstOrDefault(function (c) { return c.parentObjectId == attr.parent.objectId && c.parentId == attr.parent.id && (c.name == attr.name || c.type == attr.type); }) ||
                    configs.firstOrDefault(function (c) { return c.parentId == attr.parent.id && (c.name == attr.name || c.type == attr.type); }) ||
                    configs.firstOrDefault(function (c) { return c.name == attr.name && c.type == attr.type; }) ||
                    configs.firstOrDefault(function (c) { return c.name == attr.name; }) ||
                    configs.firstOrDefault(function (c) { return c.type == attr.type; }) ||
                    this._defaultAttributeConfig;
            };
            AppConfig.prototype._configAdded = function (e, detail) {
                if (detail.config instanceof WebComponents.PersistentObjectAttributeConfig)
                    this._attributeConfigs.push(detail.config);
            };
            return AppConfig;
        })(WebComponents.WebComponent);
        WebComponents.AppConfig = AppConfig;
        WebComponents.WebComponent.register(AppConfig, WebComponents, "vi", {
            listeners: {
                "config-added": "_configAdded"
            }
        });
        var AppConfigEntry = (function (_super) {
            __extends(AppConfigEntry, _super);
            function AppConfigEntry() {
                _super.apply(this, arguments);
            }
            AppConfigEntry.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this.fire("config-added", { config: this });
            };
            return AppConfigEntry;
        })(WebComponents.WebComponent);
        WebComponents.AppConfigEntry = AppConfigEntry;
        var PersistentObjectAttributeConfig = (function (_super) {
            __extends(PersistentObjectAttributeConfig, _super);
            function PersistentObjectAttributeConfig() {
                _super.apply(this, arguments);
            }
            PersistentObjectAttributeConfig.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._setTemplate(Polymer.dom(this).querySelector("template"));
            };
            PersistentObjectAttributeConfig.prototype.calculateHeight = function (attr) {
                if (!this._calculateHeight) {
                    if (/d+/.test(this.height)) {
                        var height = parseInt(this.height);
                        this._calculateHeight = function () { return height; };
                    }
                    else
                        this._calculateHeight = new Function("attr", "return " + this.height);
                }
                return this._calculateHeight(attr);
            };
            PersistentObjectAttributeConfig.prototype.calculateWidth = function (attr) {
                if (!this._calculateWidth) {
                    if (/d+/.test(this.width)) {
                        var width = parseInt(this.width);
                        this._calculateWidth = function () { return width; };
                    }
                    else
                        this._calculateWidth = new Function("attr", "return " + this.width);
                }
                return this._calculateWidth(attr);
            };
            return PersistentObjectAttributeConfig;
        })(AppConfigEntry);
        WebComponents.PersistentObjectAttributeConfig = PersistentObjectAttributeConfig;
        WebComponents.WebComponent.register(PersistentObjectAttributeConfig, WebComponents, "vi", {
            properties: {
                type: String,
                name: String,
                parentId: String,
                parentObjectId: String,
                height: {
                    type: String,
                    value: "2"
                },
                width: {
                    type: String,
                    value: "1"
                },
                template: {
                    type: Object,
                    readOnly: true
                }
            },
            hostAttributes: {
                "config": ""
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

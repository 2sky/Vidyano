module Vidyano.WebComponents {
    export class AppConfig extends WebComponent {
        private _defaultAttributeConfig: PersistentObjectAttributeConfig;
        private _attributeConfigs: linqjs.Enumerable<PersistentObjectAttributeConfig>;
        private _tabConfigs: linqjs.Enumerable<PersistentObjectTabConfig>;

        attached() {
            super.attached();

            if (!this._defaultAttributeConfig) {
                this._defaultAttributeConfig = <PersistentObjectAttributeConfig><any>this.appendChild(new WebComponents.PersistentObjectAttributeConfig());
            }

            (<any>this.app)._setConfiguration(this);
        }

        getAttributeConfig(attr: Vidyano.PersistentObjectAttribute): PersistentObjectAttributeConfig {
            if (!this._attributeConfigs)
                this._attributeConfigs = this._getConfigs<PersistentObjectAttributeConfig>(Vidyano.WebComponents.PersistentObjectAttributeConfig);

            return this._attributeConfigs.firstOrDefault(c => c.parentObjectId == attr.parent.objectId && c.parentId == attr.parent.id && (c.name == attr.name || c.type == attr.type)) ||
                this._attributeConfigs.firstOrDefault(c => c.parentId == attr.parent.id && (c.name == attr.name || c.type == attr.type)) ||
                this._attributeConfigs.firstOrDefault(c => c.name == attr.name && c.type == attr.type) ||
                this._attributeConfigs.firstOrDefault(c => c.name == attr.name) ||
                this._attributeConfigs.firstOrDefault(c => c.type == attr.type) ||
                this._defaultAttributeConfig;
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab): PersistentObjectTabConfig {
            if (!this._tabConfigs)
                this._tabConfigs = this._getConfigs<PersistentObjectTabConfig>(Vidyano.WebComponents.PersistentObjectTabConfig);
            
            return this._tabConfigs.firstOrDefault(c => c.name == tab.name && c.type == tab.parent.type && c.objectId == tab.parent.objectId) ||
                this._tabConfigs.firstOrDefault(c => c.name == tab.name && c.type == tab.parent.type);
        }

        private _getConfigs<T>(type: any): linqjs.Enumerable<T> {
            return <linqjs.Enumerable<T>>Enumerable.from(Polymer.dom(this).children).where(c => c.tagName != "TEMPLATE").selectMany(element => {
                if (element.tagName == "CONTENT")
                    return Enumerable.from(Polymer.dom(element).getDistributedNodes()).where(c => c.tagName != "TEMPLATE").toArray();

                return [element];
            }).where(child => child instanceof type).select(child => <T><any>child).memoize();
        }
    }

    WebComponent.register(AppConfig, WebComponents, "vi");
}
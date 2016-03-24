namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register
    export class AppConfig extends WebComponent {
        private _defaultAttributeConfig: PersistentObjectAttributeConfig;
        private _persistentObjectConfigs: linqjs.Enumerable<PersistentObjectConfig>;
        private _attributeConfigs: linqjs.Enumerable<PersistentObjectAttributeConfig>;
        private _tabConfigs: linqjs.Enumerable<PersistentObjectTabConfig>;
        private _programUnitConfigs: linqjs.Enumerable<ProgramUnitConfig>;
        private _queryConfigs: linqjs.Enumerable<QueryConfig>;
        private _queryChartConfigs: linqjs.Enumerable<QueryChartConfig>;

        attached() {
            super.attached();

            if (!this._defaultAttributeConfig) {
                this._defaultAttributeConfig = <PersistentObjectAttributeConfig><any>this.appendChild(new WebComponents.PersistentObjectAttributeConfig());
            }
        }

        getSetting(key: string, defaultValue?: string): string {
            const setting = <AppSetting>this.queryEffectiveChildren(`vi-app-setting[key="${key}"]`);
            return setting ? setting.getAttribute("value") : defaultValue;
        }

        getPersistentObjectConfig(persistentObject: Vidyano.PersistentObject): PersistentObjectConfig {
            if (!this._persistentObjectConfigs)
                this._persistentObjectConfigs = this._getConfigs<PersistentObjectConfig>(Vidyano.WebComponents.PersistentObjectConfig);

            return this._persistentObjectConfigs.firstOrDefault(c => c.id === persistentObject.id && c.objectId === persistentObject.objectId) ||
                this._persistentObjectConfigs.firstOrDefault(c => c.id === persistentObject.id);
        }

        getAttributeConfig(attr: Vidyano.PersistentObjectAttribute): PersistentObjectAttributeConfig {
            if (!this._attributeConfigs)
                this._attributeConfigs = this._getConfigs<PersistentObjectAttributeConfig>(Vidyano.WebComponents.PersistentObjectAttributeConfig);

            return this._attributeConfigs.firstOrDefault(c => c.parentObjectId === attr.parent.objectId && c.parentId === attr.parent.id && (c.name === attr.name || c.type === attr.type)) ||
                this._attributeConfigs.firstOrDefault(c => c.parentId === attr.parent.id && (c.name === attr.name || c.type === attr.type)) ||
                this._attributeConfigs.firstOrDefault(c => c.name === attr.name && c.type === attr.type) ||
                this._attributeConfigs.firstOrDefault(c => c.name === attr.name) ||
                this._attributeConfigs.firstOrDefault(c => c.type === attr.type) ||
                this._defaultAttributeConfig;
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab): PersistentObjectTabConfig {
            if (!this._tabConfigs)
                this._tabConfigs = this._getConfigs<PersistentObjectTabConfig>(Vidyano.WebComponents.PersistentObjectTabConfig);

            return this._tabConfigs.firstOrDefault(c => c.name === tab.name && c.type === tab.parent.type && c.objectId === tab.parent.objectId) ||
                this._tabConfigs.firstOrDefault(c => c.name === tab.name && c.type === tab.parent.type);
        }

        getProgramUnitConfig(name: string): ProgramUnitConfig {
            if (!this._programUnitConfigs)
                this._programUnitConfigs = this._getConfigs<ProgramUnitConfig>(Vidyano.WebComponents.ProgramUnitConfig);

            return this._programUnitConfigs.firstOrDefault(c => c.name === name);
        }

        getQueryConfig(query: Vidyano.Query): QueryConfig {
            if (!this._queryConfigs)
                this._queryConfigs = this._getConfigs<QueryConfig>(Vidyano.WebComponents.QueryConfig);

            return this._queryConfigs.firstOrDefault(c => (query.id && c.id === query.id) || (query.name && c.name === query.name)) ||
                this._queryConfigs.firstOrDefault(c => !c.id && !c.name);
        }

        getQueryChartConfig(type: string): QueryChartConfig {
            if (!this._queryChartConfigs)
                this._queryChartConfigs = this._getConfigs<QueryChartConfig>(Vidyano.WebComponents.QueryChartConfig);

            return this._queryChartConfigs.firstOrDefault(c => c.type === type);
        }

        private _getConfigs<T>(type: any): linqjs.Enumerable<T> {
            return <linqjs.Enumerable<T>>Enumerable.from(Polymer.dom(this).children).where(c => c.tagName !== "TEMPLATE").selectMany(element => {
                if (element.tagName === "CONTENT")
                    return Enumerable.from(Polymer.dom(element).getDistributedNodes()).where(c => c.tagName !== "TEMPLATE").toArray();

                return [element];
            }).where(child => child instanceof type).select(child => <T><any>child).memoize();
        }
    }
}
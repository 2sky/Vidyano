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

            this.fire("app-config-attached", this);
        }

        getSetting(key: string, defaultValue?: string): string {
            const setting = <AppSetting>this.queryEffectiveChildren(`vi-app-setting[key="${key}"]`);
            return setting ? setting.getAttribute("value") : defaultValue;
        }

        getPersistentObjectConfig(persistentObject: Vidyano.PersistentObject): PersistentObjectConfig {
            if (!this._persistentObjectConfigs)
                this._persistentObjectConfigs = this._getConfigs<PersistentObjectConfig>(Vidyano.WebComponents.PersistentObjectConfig);

            return (<AppServiceHooks>this.app.service.hooks).getPersistentObjectConfig(persistentObject, this._persistentObjectConfigs);
        }

        getAttributeConfig(attribute: Vidyano.PersistentObjectAttribute): PersistentObjectAttributeConfig {
            if (!this._attributeConfigs)
                this._attributeConfigs = this._getConfigs<PersistentObjectAttributeConfig>(Vidyano.WebComponents.PersistentObjectAttributeConfig);

            let config = (<AppServiceHooks>this.app.service.hooks).getAttributeConfig(attribute, this._attributeConfigs);
            if (!config) {
                if (!this._defaultAttributeConfig)
                    this._defaultAttributeConfig = <PersistentObjectAttributeConfig><any>this.appendChild(new WebComponents.PersistentObjectAttributeConfig());

                config = this._defaultAttributeConfig;
            }

            return config;
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab): PersistentObjectTabConfig {
            if (!this._tabConfigs)
                this._tabConfigs = this._getConfigs<PersistentObjectTabConfig>(Vidyano.WebComponents.PersistentObjectTabConfig);

            return (<AppServiceHooks>this.app.service.hooks).getTabConfig(tab, this._tabConfigs);
        }

        getProgramUnitConfig(name: string): ProgramUnitConfig {
            if (!this._programUnitConfigs)
                this._programUnitConfigs = this._getConfigs<ProgramUnitConfig>(Vidyano.WebComponents.ProgramUnitConfig);

            return (<AppServiceHooks>this.app.service.hooks).getProgramUnitConfig(name, this._programUnitConfigs);
        }

        getQueryConfig(query: Vidyano.Query): QueryConfig {
            if (!this._queryConfigs)
                this._queryConfigs = this._getConfigs<QueryConfig>(Vidyano.WebComponents.QueryConfig);

            return (<AppServiceHooks>this.app.service.hooks).getQueryConfig(query, this._queryConfigs);
        }

        getQueryChartConfig(type: string): QueryChartConfig {
            if (!this._queryChartConfigs)
                this._queryChartConfigs = this._getConfigs<QueryChartConfig>(Vidyano.WebComponents.QueryChartConfig);

            return (<AppServiceHooks>this.app.service.hooks).getQueryChartConfig(type, this._queryChartConfigs);
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
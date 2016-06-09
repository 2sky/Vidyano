namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        listeners: {
            "config-attached": "_configAttached"
        }
    })
    export class AppConfig extends WebComponent {
        private _defaultAttributeConfig: PersistentObjectAttributeConfig;
        private _persistentObjectConfigs: PersistentObjectConfig[] = [];
        private _attributeConfigs: PersistentObjectAttributeConfig[] = [];
        private _tabConfigs: PersistentObjectTabConfig[] = [];
        private _programUnitConfigs: ProgramUnitConfig[] = [];
        private _queryConfigs: QueryConfig[] = [];
        private _queryChartConfigs: QueryChartConfig[] = [];

        attached() {
            super.attached();

            this.fire("app-config-attached", this);
        }

        private _configAttached(e: CustomEvent) {
            e.stopPropagation();

            const element = e.srcElement || e.target;
            switch (element["is"]) {
                case "vi-persistent-object-attribute-config":
                    this._attributeConfigs.push(<PersistentObjectAttributeConfig>element);
                    break;

                case "vi-persistent-object-config":
                    this._persistentObjectConfigs.push(<PersistentObjectConfig>element);
                    break;

                case "vi-persistent-object-tab-config":
                    this._tabConfigs.push(<PersistentObjectTabConfig>element);
                    break;

                case "vi-program-unit-config":
                    this._programUnitConfigs.push(<ProgramUnitConfig>element);
                    break;

                case "vi-query-config":
                    this._queryConfigs.push(<QueryConfig>element);
                    break;

                case "vi-query-chart-config":
                    this._queryChartConfigs.push(<QueryChartConfig>element);
                    break;
            }
        }

        getSetting(key: string, defaultValue?: string): string {
            const setting = <AppSetting>this.queryEffectiveChildren(`vi-app-setting[key="${key}"]`);
            return setting ? setting.getAttribute("value") : defaultValue;
        }

        getPersistentObjectConfig(persistentObject: Vidyano.PersistentObject): PersistentObjectConfig {
            return (<AppServiceHooks>this.app.service.hooks).getPersistentObjectConfig(persistentObject, this._persistentObjectConfigs);
        }

        getAttributeConfig(attribute: Vidyano.PersistentObjectAttribute): PersistentObjectAttributeConfig {
            let config = (<AppServiceHooks>this.app.service.hooks).getAttributeConfig(attribute, this._attributeConfigs);
            if (!config) {
                if (!this._defaultAttributeConfig)
                    this._defaultAttributeConfig = <PersistentObjectAttributeConfig><any>this.appendChild(new WebComponents.PersistentObjectAttributeConfig());

                config = this._defaultAttributeConfig;
            }

            return config;
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab): PersistentObjectTabConfig {
            return (<AppServiceHooks>this.app.service.hooks).getTabConfig(tab, this._tabConfigs);
        }

        getProgramUnitConfig(name: string): ProgramUnitConfig {
            return (<AppServiceHooks>this.app.service.hooks).getProgramUnitConfig(name, this._programUnitConfigs);
        }

        getQueryConfig(query: Vidyano.Query): QueryConfig {
            return (<AppServiceHooks>this.app.service.hooks).getQueryConfig(query, this._queryConfigs);
        }

        getQueryChartConfig(type: string): QueryChartConfig {
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
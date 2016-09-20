namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register
    export class AppConfig extends WebComponent {
        private _nodeObserver: PolymerDomChangeObserver;
        private _defaultAttributeConfig: PersistentObjectAttributeConfig;
        private _persistentObjectConfigs: PersistentObjectConfig[] = [];
        private _attributeConfigs: PersistentObjectAttributeConfig[] = [];
        private _tabConfigs: PersistentObjectTabConfig[] = [];
        private _programUnitConfigs: ProgramUnitConfig[] = [];
        private _queryConfigs: QueryConfig[] = [];
        private _queryChartConfigs: QueryChartConfig[] = [];

        attached() {
            super.attached();

            this._nodeObserver = Polymer.dom(this.root).observeNodes(this._nodesChanged.bind(this));
        }

        detached() {
            super.detached();

            Polymer.dom(this.root).unobserveNodes(this._nodeObserver);
        }

        private _nodesChanged(info: PolymerDomChangedInfo) {
            info.addedNodes.forEach(node => this._handleNode(node as WebComponent, true));
            info.removedNodes.forEach(node => this._handleNode(node as WebComponent, false));
        }

        private _handleNode(node: WebComponent, added: boolean) {
            if (node.nodeType !== Node.ELEMENT_NODE)
                return;

            const operation = added ? "push" : "remove";
            switch (node.tagName.toUpperCase()) {
                case "VI-PERSISTENT-OBJECT-ATTRIBUTE-CONFIG":
                    this._attributeConfigs[operation](node);
                    break;

                case "VI-PERSISTENT-OBJECT-CONFIG":
                    this._persistentObjectConfigs[operation](node);
                    break;

                case "VI-PERSISTENT-OBJECT-TAB-CONFIG":
                    this._tabConfigs[operation](node);
                    break;

                case "VI-PROGRAM-UNIT-CONFIG":
                    this._programUnitConfigs[operation](node);
                    break;

                case "VI-QUERY-CONFIG":
                    this._queryConfigs[operation](node);
                    break;

                case "VI-QUERY-CHART-CONFIG":
                    this._queryChartConfigs[operation](node);
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
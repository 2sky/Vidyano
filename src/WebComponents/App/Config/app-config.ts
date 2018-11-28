namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register()
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

            let arr: Array<WebComponent>;
            switch (node.tagName.toUpperCase()) {
                case "VI-PERSISTENT-OBJECT-ATTRIBUTE-CONFIG":
                    arr = this._attributeConfigs;
                    break;

                case "VI-PERSISTENT-OBJECT-CONFIG":
                    arr = this._persistentObjectConfigs;
                    break;

                case "VI-PERSISTENT-OBJECT-TAB-CONFIG":
                    arr = this._tabConfigs;
                    break;

                case "VI-PROGRAM-UNIT-CONFIG":
                    arr = this._programUnitConfigs;
                    break;

                case "VI-QUERY-CONFIG":
                    arr = this._queryConfigs;
                    break;

                case "VI-QUERY-CHART-CONFIG":
                    arr = this._queryChartConfigs;
                    break;

                default:
                    return;
            }

            if (added)
                arr.push(node);
            else
                arr.remove(node);
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

        getSpinnerConfig(): SpinnerConfig {
            return <SpinnerConfig>this.queryEffectiveChildren(`vi-spinner-config`) || null;
        }

        private _getConfigs<T>(type: any): T[] {
            return [].concat(...Array.from(Polymer.dom(this).children).filter(c => c.tagName !== "TEMPLATE").map(element => {
                if (element.tagName === "CONTENT")
                    return Array.from(Polymer.dom(element).getDistributedNodes()).filter(c => c.tagName !== "TEMPLATE");

                return [element];
            })).filter(child => child instanceof type).map(child => <T><any>child);
        }
    }
}
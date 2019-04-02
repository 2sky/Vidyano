namespace Vidyano.WebComponents {
    @WebComponent.register()
    export class AppConfig extends WebComponent {
        private _nodeObserver: Polymer.FlattenedNodesObserver;
        private _defaultAttributeConfig: PersistentObjectAttributeConfig;
        private _persistentObjectConfigs: PersistentObjectConfig[] = [];
        private _attributeConfigs: PersistentObjectAttributeConfig[] = [];
        private _tabConfigs: PersistentObjectTabConfig[] = [];
        private _programUnitConfigs: ProgramUnitConfig[] = [];
        private _queryConfigs: QueryConfig[] = [];
        private _queryChartConfigs: QueryChartConfig[] = [];
        private _spinnerConfig: SpinnerConfig;

        connectedCallback() {
            super.connectedCallback();

            const configsSlot = <HTMLSlotElement>this.$.configs;
            configsSlot.assignedNodes({ flatten: true }).forEach(node => this._handleNode(<WebComponent>node, true));

            this._nodeObserver = new Polymer.FlattenedNodesObserver(configsSlot, this._nodesChanged.bind(this));
        }

        disconnectedCallback() {
            super.disconnectedCallback();

            this._nodeObserver.disconnect();
        }

        private _nodesChanged(info: Polymer.FlattenedNodesObserverInfo) {
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

                case "VI-SPINNER-CONFIG":
                    this._spinnerConfig = <SpinnerConfig>node;

                default:
                    return;
            }

            if (added) {
                if (arr.indexOf(node) < 0)
                    arr.push(node);
            }
            else
                arr.remove(node);
        }

        getSetting(key: string, defaultValue?: string): string {
            const setting = <AppSetting>this.querySelector(`vi-app-setting[key="${key}"]`);
            return setting ? setting.getAttribute("value") : defaultValue;
        }

        getPersistentObjectConfig(persistentObject: Vidyano.PersistentObject): PersistentObjectConfig {
            return (<AppServiceHooks>this.service.hooks).getPersistentObjectConfig(persistentObject, this._persistentObjectConfigs);
        }

        getAttributeConfig(attribute: Vidyano.PersistentObjectAttribute): PersistentObjectAttributeConfig {
            let config = (<AppServiceHooks>this.service.hooks).getAttributeConfig(attribute, this._attributeConfigs);
            if (!config) {
                if (!this._defaultAttributeConfig)
                    this._defaultAttributeConfig = <PersistentObjectAttributeConfig><any>this.appendChild(new WebComponents.PersistentObjectAttributeConfig());

                config = this._defaultAttributeConfig;
            }

            return config;
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab): PersistentObjectTabConfig {
            return (<AppServiceHooks>this.service.hooks).getTabConfig(tab, this._tabConfigs);
        }

        getProgramUnitConfig(name: string): ProgramUnitConfig {
            return (<AppServiceHooks>this.service.hooks).getProgramUnitConfig(name, this._programUnitConfigs);
        }

        getQueryConfig(query: Vidyano.Query): QueryConfig {
            return (<AppServiceHooks>this.service.hooks).getQueryConfig(query, this._queryConfigs);
        }

        getQueryChartConfig(type: string): QueryChartConfig {
            return (<AppServiceHooks>this.service.hooks).getQueryChartConfig(type, this._queryChartConfigs);
        }

        getSpinnerConfig(): SpinnerConfig {
            return this._spinnerConfig;
        }

        private _getConfigs<T>(type: any): T[] {
            return [].concat(...Array.from(this.children).filter(c => c.tagName !== "TEMPLATE").map(element => {
                if (element.tagName === "SLOT") {
                    const slot = <HTMLSlotElement>element;
                    return Array.from(slot.assignedNodes({ flatten: true })).filter(c => (<any>c).tagName !== "TEMPLATE");
                }

                return [element];
            })).filter(child => child instanceof type).map(child => <T><any>child);
        }
    }
}
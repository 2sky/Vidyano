namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            tabs: Array,
            selectedTab: {
                type: Object,
                notify: true
            },
            mode: {
                type: String,
                value: "inline",
                reflectToAttribute: true
            }
        },
        observers: [
            "_hookObservers(isConnected, tabs)"
        ]
    })
    export class PersistentObjectTabBar extends WebComponent {
        private _observeDisposer: IObserveChainDisposer;
        tabs: Vidyano.PersistentObjectTab[];
        selectedTab: Vidyano.PersistentObjectTab;

        private _hookObservers() {
            if (this._observeDisposer) {
                this._observeDisposer();
                this._observeDisposer = undefined;
            }

            if (this.isConnected && this.tabs) {
                this._observeDisposer = this._forwardObservable(this.tabs, "isVisible", "tabs", () => {
                    if (!this.selectedTab || !this.selectedTab.isVisible)
                        this.selectedTab = this.tabs.filter(t => t.isVisible)[0];
                });
            }

            if (!this.selectedTab || !this.selectedTab.isVisible)
                this.selectedTab = this.tabs.filter(t => t.isVisible)[0];
        }

        private _tabSelected(e: Event, detail: any) {
            this.selectedTab = detail.tab;

            Popup.closeAll(this);
        }

        private isInline(mode: string): boolean {
            return mode === "inline";
        }

        private isDropDown(mode: string): boolean {
            return mode === "dropdown";
        }

        private _isVisible(tab: Vidyano.PersistentObjectTab): boolean {
            return tab.isVisible;
        }
    }

    @WebComponent.register({
        properties: {
            tab: Object,
            selectedTab: Object,
            isSelected: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeIsSelected(tab, selectedTab)"
            },
            label: {
                type: String,
                computed: "_computeLabel(tab.label, query, queryLabel)"
            },
            query: {
                type: Object,
                computed: "_computeQuery(tab)"
            },
            queryLabel: {
                type: String,
                value: null,
                computed: "_computeQueryLabel(query.label, query.filters.currentFilter)"
            },
            badge: {
                type: String,
                computed: "_computeBadge(query.totalItems, query.hasMore)"
            },
            hasBadge: {
                type: Boolean,
                computed: "_computeHasBadge(badge)"
            }
        },
        listeners: {
            "tap": "_select"
        },
        forwardObservers: [
            "query.totalItems",
            "query.label",
            "query.filters.currentFilter.name"
        ]
    })
    export class PersistentObjectTabBarItem extends WebComponent {
        tab: Vidyano.PersistentObjectTab;

        private _select() {
            this.fire("tab-selected", { tab: this.tab }, { bubbles: false });
        }

        private _computeIsSelected(tab: Vidyano.PersistentObjectTab, selectedTab: Vidyano.PersistentObjectTab): boolean {
            return tab === selectedTab;
        }

        private _computeBadge(totalItems: number, hasMore: boolean): string {
            if (totalItems != null && totalItems >= 0)
                return totalItems + (hasMore ? "+" : "");
            return "";
        }

        private _computeHasBadge(badge: string): boolean {
            return !!badge;
        }

        private _computeLabel(tabLabel: string, query: Vidyano.Query, queryLabel: string): string {
            return query && queryLabel || tabLabel;
        }

        private _computeQuery(tab: Vidyano.PersistentObjectQueryTab): Vidyano.Query {
            return tab.query || null;
        }

        private _computeQueryLabel(label: string, currentFilter: Vidyano.QueryFilter): string {
            return label + (currentFilter && currentFilter.name ? " — " + currentFilter.name : "");
        }

        _viConfigure(actions: IConfigurableAction[]) {
            if (this.tab.target instanceof Vidyano.PersistentObject) {
                if ((<Vidyano.PersistentObject>this.tab.target).isSystem)
                    return;
            }
            else if (this.tab.target instanceof Vidyano.Query) {
                if ((<Vidyano.Query>this.tab.target).isSystem)
                    return;
            }
            else
                return;

            if (this.tab.target instanceof Vidyano.PersistentObject) {
                const tab = <Vidyano.PersistentObjectAttributeTab>this.tab;
                actions.push({
                    label: `Attribute tab: ${tab.label}`,
                    icon: "viConfigure",
                    action: () => this.app.changePath(`Management/PersistentObject.9b7a3b94-cf71-4284-bac3-de4d2790c868/${tab.id}`)
                });
            }
            else if (this.tab.target instanceof Vidyano.Query) {
                const query = <Vidyano.Query>this.tab.target;
                actions.push({
                    label: `Query tab: ${query.label}`,
                    icon: "viConfigure",
                    action: () => this.app.changePath(`Management/PersistentObject.b9d2604d-2233-4df2-887a-709d93502843/${query.id}`),
                    subActions: [{
                        label: `Persistent Object: ${query.persistentObject.type}`,
                        icon: "viConfigure",
                        action: () => {
                            this.app.changePath(`Management/PersistentObject.316b2486-df38-43e3-bee2-2f7059334992/${query.persistentObject.id}`);
                        }
                    }]
                });
            }
        }
    }
}
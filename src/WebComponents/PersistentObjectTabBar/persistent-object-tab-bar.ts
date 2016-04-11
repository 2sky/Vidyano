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
            "_hookObservers(isAttached, tabs)"
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

            if (this.isAttached && this.tabs) {
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
                computed: "_computeLabel(tab.label, queryLabel)"
            },
            query: {
                type: Object,
                computed: "tab.query"
            },
            queryLabel: {
                type: String,
                value: null,
                computed: "_computeQueryLabel(query.label, query.filters.currentFilter)"
            },
            badge: {
                type: Number,
                computed: "query.totalItems"
            },
            hasBadge: {
                type: Boolean,
                computed: "_computeHasBadge(badge)"
            }
        },
        hostAttributes: {
            class: "horizontal layout"
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

        private _computeHasBadge(badge: number): boolean {
            return badge !== undefined && badge >= 0;
        }

        private _computeLabel(tabLabel: string, queryLabel: string): string {
            return queryLabel || tabLabel;
        }

        private _computeQueryLabel(label: string, currentFilter: Vidyano.QueryFilter): string {
            return label + (currentFilter && currentFilter.name ? " — " + currentFilter.name : "");
        }
    }
}
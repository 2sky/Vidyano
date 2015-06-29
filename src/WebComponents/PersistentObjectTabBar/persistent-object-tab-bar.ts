module Vidyano.WebComponents {
    export class PersistentObjectTabBar extends WebComponent {
        private _observeDisposer: ObserveChainDisposer;
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
            e.stopPropagation();

            this.selectedTab = detail.tab;
        }

        private isInline(mode: string): boolean {
            return mode == "inline";
        }

        private isDropDown(mode: string): boolean {
            return mode == "dropdown";
        }

        private _isVisible(tab: Vidyano.PersistentObjectTab): boolean {
            return tab.isVisible;
        }
    }

    export class PersistentObjectTabBarItem extends WebComponent {
        tab: Vidyano.PersistentObjectTab;

        private _select() {
            this.fire("tab-selected", { tab: this.tab });
        }

        private _computeIsSelected(tab: Vidyano.PersistentObjectTab, selectedTab: Vidyano.PersistentObjectTab): boolean {
            return tab == selectedTab;
        }

        private _computeHasBadge(badge: number): boolean {
            return badge !== undefined && badge >= 0;
        }
    }

    WebComponent.register(PersistentObjectTabBar, WebComponents, "vi", {
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
        listeners: {
            "tab-selected": "_tabSelected"
        },
        observers: [
            "_hookObservers(isAttached, tabs)"
        ]
    });

    WebComponent.register(PersistentObjectTabBarItem, WebComponents, "vi", {
        properties: {
            tab: Object,
            selectedTab: Object,
            isSelected: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeIsSelected(tab, selectedTab)"
            },
            badge: {
                type: Number,
                computed: "tab.query.totalItems"
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
            "tab.query.totalItems"
        ]
    });
}
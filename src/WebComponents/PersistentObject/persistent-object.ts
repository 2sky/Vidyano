module Vidyano.WebComponents {
    export class PersistentObject extends WebComponent {
        private _uniqueId: string = Unique.get();
        private _parameters: { id: string; objectId: string };
        private _styleElement: HTMLElement;
        private _styles: { [key: string]: Text } = {};
        private _cacheEntry: PersistentObjectAppCacheEntry;
        persistentObject: Vidyano.PersistentObject;
        layout: string;
        masterWidth: string;
        masterTabs: Vidyano.PersistentObjectTab[];
        selectedMasterTab: Vidyano.PersistentObjectTab;
        detailTabs: Vidyano.PersistentObjectTab[];
        selectedDetailTab: Vidyano.PersistentObjectTab;

        attached() {
            super.attached();

            this.asElement.setAttribute("style-scope-id", this._uniqueId);
            if (!this.masterWidth)
                this.masterWidth = "40%";
        }

        detached() {
            if (this._styleElement) {
                document.head.removeChild(this._styleElement);
                this._styleElement = undefined;
            }

            super.detached();
        }

        private _persistentObjectChanged(persistentObject: Vidyano.PersistentObject, isAttached: boolean) {
            if (persistentObject && isAttached) {
                this._cacheEntry = <PersistentObjectAppCacheEntry>this.app.cache(new PersistentObjectAppCacheEntry(this.persistentObject));

                this.selectedMasterTab = this._cacheEntry.selectedMasterTab || this._computeMasterTabs(this.persistentObject, this.persistentObject.tabs)[0];
                this.selectedDetailTab = this._cacheEntry.selectedDetailTab || this._computeDetailTabs(this.persistentObject, this.persistentObject.tabs)[0];
            }
        }

        private _masterWidthChanged() {
            this._setStyle("masterWidth", ".master { width: " + this.masterWidth + "; }");
        }

        private _setStyle(name: string, ...css: string[]) {
            var cssBody = "";
            css.forEach(c => {
                cssBody += "vi-persistent-object[style-scope-id=\"" + this._uniqueId + "\"] " + c + (css.length > 0 ? "\n" : "");
            });

            if (!this._styleElement)
                this._styleElement = <HTMLStyleElement>document.head.appendChild(document.createElement("style"));

            var node = this._styles[name] || (this._styles[name] = <Text>this._styleElement.appendChild(document.createTextNode("")));
            node.textContent = cssBody;
        }

        private _computeMasterTabs(persistentObject: Vidyano.PersistentObject, tabs: Vidyano.PersistentObjectTab[]): Vidyano.PersistentObjectTab[]{
            if (persistentObject.queryLayoutMode == PersistentObjectLayoutMode.FullPage)
                return tabs.filter(t => t.isVisible);

            return tabs ? tabs.filter(t => t.isVisible && t.tabGroupIndex == 0) : [];
        }

        private _computeDetailTabs(persistentObject: Vidyano.PersistentObject, tabs: Vidyano.PersistentObjectTab[]): Vidyano.PersistentObjectTab[] {
            if (persistentObject.queryLayoutMode == PersistentObjectLayoutMode.FullPage)
                return [];

            return tabs ? tabs.filter(t => t.isVisible && t.tabGroupIndex == 1) : [];
        }

        private _detailTabsChanged() {
            if (!this.detailTabs || this.detailTabs.length == 0) {
                this.selectedDetailTab = null;
                return;
            }
        }

        private _masterTabsChanged() {
            if (!this.masterTabs || this.masterTabs.length == 0) {
                this.selectedMasterTab = null;
                return;
            }
        }

        private _selectedMasterTabChanged() {
            if (!this._cacheEntry)
                return;

            this._cacheEntry.selectedMasterTab = this.selectedMasterTab;
        }

        private _selectedDetailTabChanged() {
            if (!this._cacheEntry)
                return;

            this._cacheEntry.selectedDetailTab = this.selectedDetailTab;
        }

        private _computeLayout(persistentObject: Vidyano.PersistentObject, masterTabs: Vidyano.PersistentObjectTab[] = [], detailTabs: Vidyano.PersistentObjectTab[] = []): string {
            if (!persistentObject)
                return undefined;

            var hasDetailTabs = detailTabs.length > 0;
            var hasMasterTabs = masterTabs.length > 0;

            var layoutFlags = [hasDetailTabs ? (hasMasterTabs ? 'master-detail' : 'details-only') : 'full-page'];
            if (hasDetailTabs)
                layoutFlags.push("dt");

            if (hasMasterTabs && (hasDetailTabs || masterTabs.length > 1))
                layoutFlags.push("mt");

            if (hasMasterTabs && masterTabs.some(t => t.parent.actions.some(a => a.isVisible || a.name == "Filter")))
                layoutFlags.push("ma");

            if (hasDetailTabs && detailTabs.some(t => t.parent.actions.some(a => a.isVisible || a.name == "Filter")))
                layoutFlags.push("da");

            return layoutFlags.join(" ");
        }

        private _hasMasterTabs(tabs: Vidyano.PersistentObjectAttributeTab[]): boolean {
            return tabs && tabs.length > 1;
        }

        private _hasDetailTabs(tabs: Vidyano.PersistentObjectAttributeTab[]): boolean {
            return tabs && tabs.length > 0;
        }

        private _trackSplitter(e: CustomEvent, detail: PolymerTrackDetail) {
            if (detail.state == "track") {
                var px = parseInt(this.masterWidth);
                this.masterWidth = (px + detail.ddx) + "px";
            }
            else if (detail.state == "start") {
                this.app.classList.add("dragging");
                if (this.masterWidth.endsWith("%"))
                    this.masterWidth = (this.asElement.offsetWidth * (parseInt(this.masterWidth) / 100)).toString() + "px";
            }
            else if (detail.state == "end") {
                this.app.classList.remove("dragging");
                window.getSelection().removeAllRanges();

                if (this.masterWidth.endsWith("px")) {
                    var px = parseInt(this.masterWidth);
                    this.masterWidth = (100 / this.asElement.offsetWidth * px).toString() + "%";
                }
            }

            e.stopPropagation();
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.PersistentObject, Vidyano.WebComponents, "vi", {
        properties: {
            persistentObject: {
                type: Object,
            },
            tabs: {
                type: Array,
                computed: "persistentObject.tabs"
            },
            masterWidth: {
                type: Number,
                observer: "_masterWidthChanged"
            },
            masterTabs: {
                type: Array,
                computed: "_computeMasterTabs(persistentObject, tabs)",
                observer: "_masterTabsChanged"
            },
            hasMasterTabs: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_hasMasterTabs(masterTabs)"
            },
            selectedMasterTab: {
                type: Object,
                observer: "_selectedMasterTabChanged"
            },
            detailTabs: {
                type: Array,
                computed: "_computeDetailTabs(persistentObject, tabs)",
                observer: "_detailTabsChanged"
            },
            hasDetailTabs: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_hasDetailTabs(detailTabs)"
            },
            selectedDetailTab: {
                type: Object,
                observer: "_selectedDetailTabChanged"
            },
            layout: {
                type: String,
                reflectToAttribute: true,
                computed: "_computeLayout(persistentObject, masterTabs, detailTabs)"
            },
        },
        observers: [
            "_persistentObjectChanged(persistentObject, isAttached)"
        ],
        forwardObservers: [
            "persistentObject.tabs.isVisible"
        ]
    });
}
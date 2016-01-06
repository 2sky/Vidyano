module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            menuTitle: String,
            programUnit: Object,
            items: Array,
            collapsed: {
                type: Boolean,
                reflectToAttribute: true
            },
            filter: {
                type: String,
                observer: "_filterChanged"
            },
            filtering: {
                type: Boolean,
                reflectToAttribute: true
            },
            currentProgramUnit: Object,
        }
    })
    export class Menu extends WebComponent {
        filter: string;
        filtering: boolean;
        programUnit: ProgramUnit;
        collapsed: boolean;

        attached() {
            super.attached();

            Enumerable.from(Polymer.dom(this.app).querySelectorAll("[vi-menu-element~='footer']")).forEach(element => Polymer.dom(this.$["footerElements"]).appendChild(element));
            Enumerable.from(Polymer.dom(this.app).querySelectorAll("[vi-menu-element~='header']")).forEach(element => Polymer.dom(this.$["headerElements"]).appendChild(element));

            this.collapsed = BooleanEx.parse(Vidyano.cookie("menu-collapsed"));

            // Fix for FireFox line-height calc bug (https://bugzilla.mozilla.org/show_bug.cgi?id=594933)
            this.customStyle["--vi-menu-expanded-header-line-height"] = (parseInt(this.getComputedStyleValue("--theme-h1")) * 2) + "px";
            this.updateStyles();
        }

        private _filterChanged() {
            this.filtering = !StringEx.isNullOrEmpty(this.filter);
        }

        private _search() {
            if(this.collapsed && this.filter)
                Popup.closeAll();

            if (!this.filtering || this.app.service.application.globalSearchId == "00000000-0000-0000-0000-000000000000")
                return;

            this.app.changePath(this.app.getUrlForPersistentObject(this.app.service.application.globalSearchId, this.filter));
            this.filter = "";
        }

        private _toggleCollapse() {
            this.collapsed = !this.collapsed;
            Vidyano.cookie("menu-collapsed", String(this.collapsed));
        }

        private _hasGroupItems(programUnitItems: ProgramUnitItemGroup[]): boolean {
            return !!programUnitItems && programUnitItems.some(item => item instanceof ProgramUnitItemGroup);
        }

        private _countItems(programUnitItems: any[]): number {
            return !!programUnitItems ? programUnitItems.length : 0;
        }

        private _focusSearch() {
            var inputSearch =  <InputSearch>Polymer.dom(this.root).querySelector("#collapsedInputSearch");
            inputSearch.focus();
        }

        private _catchInputSearchTap(e: TapEvent) {
            e.stopPropagation();
        }
    }

    @WebComponent.register({
        properties: {
            item: Object,
            collapsed: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            programUnit: {
                type: Object,
                observer: "_programUnitChanged"
            },
            hasItems: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computedHasItems(item)"
            },
            expand: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            filtering: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            filter: {
                type: String,
                notify: true,
                observer: "_filterChanged",
                value: ""
            },
            filterParent: Object,
            hide: {
                type: Boolean,
                reflectToAttribute: true
            },
            href: {
                type: String,
                computed: "_computedHref(item, isAttached)"
            }
        },
        observers: [
            "_updateItemTitle(item, filter, filtering, collapsed)",
            "_autoOpenFirst(programUnit, expand, href)"
        ],
        listeners: {
            "tap": "_tap"
        }
    })
    export class MenuItem extends WebComponent {
        item: Vidyano.ProgramUnitItem;
        programUnit: Vidyano.ProgramUnit;
        expand: boolean;
        filter: string;
        filtering: boolean;
        hide: boolean;
        filterParent: ProgramUnitItem;

        private _setExpand: (val: boolean) => void;

        private _tap(e: Event) {
            if (!this.item || !this.item.path) {
                this._setExpand(!this.expand);

                e.preventDefault();
                e.stopPropagation();
            }
            else {
                var item = this.item;
                if (item instanceof Vidyano.ProgramUnit && item.openFirst && item.items)
                    item = (<Vidyano.ProgramUnit>item).items[0];

                if (item instanceof Vidyano.ProgramUnitItemQuery)
                    this.app.cacheRemove(new QueryAppCacheEntry((<Vidyano.ProgramUnitItemQuery>item).queryId));
                else if (item instanceof Vidyano.ProgramUnitItemPersistentObject)
                    this.app.cacheRemove(new PersistentObjectAppCacheEntry((<Vidyano.ProgramUnitItemPersistentObject>item).persistentObjectId, (<Vidyano.ProgramUnitItemPersistentObject>item).persistentObjectObjectId));

                this.filter = "";

                if (this.app.noHistory) {
                    this.app.changePath(item.path);

                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }

        private _filterChanged() {
            this.filtering = !StringEx.isNullOrEmpty(this.filter);
            this.hide = this.filtering && !this._hasMatch(<ProgramUnitItem><any>this.item, this.filter.toUpperCase());
        }

        private _hasMatch(item: ProgramUnitItem, search: string): boolean {
            var matchOnItem = item.title.toUpperCase().contains(search);
            var items = (<any>item).items;
            var matchOnSubItems = (items != null && items.filter(i => this._hasMatch(i, search)).length > 0);

            var hasMatch = matchOnItem || matchOnSubItems;
            if (!hasMatch && this.filterParent instanceof Vidyano.ProgramUnitItemGroup && this.filterParent.title.toUpperCase().contains(search))
                hasMatch = true;

            if (hasMatch && item instanceof ProgramUnit && !matchOnSubItems)
                hasMatch = false;

            return hasMatch;
        }

        private _programUnitChanged() {
            if (!this.classList.contains("program-unit"))
                return;

            this._setExpand(this.item && this.item == this.programUnit);
        }

        private _updateItemTitle(item: Vidyano.ProgramUnitItem, filter: string, filtering: boolean, collapsed: boolean) {
            if (collapsed) {
                if (item instanceof ProgramUnit && !this.$["title"].querySelector("vi-resource")) {
                    var resourceName = item.offset < 2147483647 ? "ProgramUnit_" + item.name : "Vidyano";
                    if (Vidyano.WebComponents.Icon.Exists(resourceName)) {
                        this.$["title"].textContent = "";
                        Polymer.dom(this.$["title"]).appendChild(new Vidyano.WebComponents.Icon(resourceName));

                        return;
                    }
                }

                this.$["title"].textContent = item.title[0];
                return;
            }

            if (!filtering)
                this.$["title"].textContent = item.title;
            else if (this._hasMatch(item, this.filter.toUpperCase())) {
                var exp = new RegExp('(' + filter + ')', 'gi');
                this.$["title"].innerHTML = item.title.replace(exp, "<span class='style-scope vi-menu-item match'>$1</span>");
            }
        }

        private _computedHasItems(item: Vidyano.ProgramUnitItem): boolean {
            return item instanceof Vidyano.ProgramUnitItemGroup;
        }

        private _computedHref(item: Vidyano.ProgramUnitItem): string {
            if (!item || !this.isAttached)
                return undefined;

            if (item instanceof Vidyano.ProgramUnitItemUrl)
                return item.path;

            return (this.item && !(item instanceof Vidyano.ProgramUnitItemGroup)) ? this.app.noHistory ? "#" : '#!/' + this.item.path : undefined;
        }

        private _autoOpenFirst(programUnit: Vidyano.ProgramUnit, expand: boolean, href: string) {
            if (expand && programUnit && programUnit.openFirst && href && !this.app.path)
                this.app.changePath(href);
        }
    }
}
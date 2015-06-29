module Vidyano.WebComponents {
    export class Menu extends WebComponent {
        filter: string;
        filtering: boolean;
        programUnit: ProgramUnit;

        attached() {
            super.attached();

            this.$["programUnits"].style.marginRight = "-" + (this.$["programUnits"].style.paddingRight = scrollbarWidth().toString(10) + "px");
        }

        private _filterChanged() {
            this.filtering = !StringEx.isNullOrEmpty(this.filter);
        }

        private _search() {
            if (!this.filtering || this.app.service.application.globalSearchId == "00000000-0000-0000-0000-000000000000")
                return;

            this.app.changePath(this.app.getUrlForPersistentObject(this.app.service.application.globalSearchId, this.filter));
            this.filter = "";
        }
    }

    export class MenuItem extends WebComponent {
        private _appPathObserver: PathObserver;
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

        private _updateItemTitle(item: Vidyano.ProgramUnitItem, filter: string, filtering: boolean) {
            if (!filtering)
                this.$["title"].textContent = item.title;
            else if (this._hasMatch(item, this.filter.toUpperCase())) {
                var exp = new RegExp('(' + filter + ')', 'gi');
                this.$["title"].innerHTML = item.title.replace(exp, "<span class='match'>$1</span>");
            }
        }

        private _computedHasItems(item: Vidyano.ProgramUnitItem): boolean {
            return item instanceof Vidyano.ProgramUnitItemGroup;
        }

        private _computedHref(item: Vidyano.ProgramUnitItem): string {
            if (!item || !this.isAttached)
                return undefined;

            return (this.item && !(item instanceof Vidyano.ProgramUnitItemGroup)) ? this.app.noHistory ? "#" : '#!/' + this.item.path : undefined;
        }
    }

    WebComponent.register(Menu, WebComponents, "vi", {
        properties: {
            menuTitle: String,
            programUnit: Object,
            items: Array,
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
    });

    WebComponent.register(MenuItem, WebComponents, "vi", {
        properties: {
            item: Object,
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
            "_updateItemTitle(item, filter, filtering)"
        ]
    });
}
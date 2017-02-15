namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            label: String,
            activeProgramUnit: Object,
            programUnits: Array,
            collapsed: {
                type: Boolean,
                reflectToAttribute: true
            },
            collapsedWithGlobalSearch: {
                type: Boolean,
                computed: "_computeCollapsedWithGlobalSearch(collapsed, hasGlobalSearch)"
            },
            hasGlobalSearch: {
                type: Boolean,
                computed: "_computeHasGlobalSearch(app.service.application.globalSearchId)"
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
            isResizing: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            hideSearch: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        listeners: {
            "reset-filter": "_resetFilter"
        }
    })
    export class Menu extends WebComponent {
        private static _minResizeWidth: number;
        private _resizeWidth: number;
        readonly isResizing: boolean; private _setIsResizing: (val: boolean) => void;
        filter: string;
        filtering: boolean;
        activeProgramUnit: ProgramUnit;
        collapsed: boolean;
        hasGlobalSearch: boolean;
        hideSearch: boolean;

        attached() {
            super.attached();

            this.hideSearch = this.app.configuration.getSetting("vi-menu.hide-search", "false").toLowerCase() === "true";

            Enumerable.from(Polymer.dom(this.app).querySelectorAll("[vi-menu-element~='footer']")).forEach(element => Polymer.dom(this.$["footerElements"]).appendChild(element));
            Enumerable.from(Polymer.dom(this.app).querySelectorAll("[vi-menu-element~='header']")).forEach(element => Polymer.dom(this.$["headerElements"]).appendChild(element));

            if (!Menu._minResizeWidth)
                Menu._minResizeWidth = this.offsetWidth;

            const menuWidth = parseInt(Vidyano.cookie("menu-width"));
            if (menuWidth)
                this.customStyle["--vi-menu--expand-width"] = `${menuWidth}px`;

            this.updateStyles();

            this.collapsed = BooleanEx.parse(Vidyano.cookie("menu-collapsed"));
        }

        detached() {
            super.detached();

            Enumerable.from(Polymer.dom(this.$["footerElements"]).children).forEach(element => Polymer.dom(this.app).appendChild(element));
            Enumerable.from(Polymer.dom(this.$["headerElements"]).children).forEach(element => Polymer.dom(this.app).appendChild(element));
        }

        private _filterChanged() {
            this.filtering = !StringEx.isNullOrEmpty(this.filter);
        }

        private _search() {
            if (this.collapsed && this.filter)
                Popup.closeAll();

            if (!this.filtering || !this.hasGlobalSearch)
                return;

            this.app.changePath(this.app.getUrlForPersistentObject(this.app.service.application.globalSearchId, this.filter));
            this.filter = "";
        }

        private _computeHasGlobalSearch(globalSearchId: string): boolean {
            return globalSearchId !== "00000000-0000-0000-0000-000000000000";
        }

        private _computeCollapsedWithGlobalSearch(collapsed: boolean, hasGlobalSearch: boolean): boolean {
            return collapsed && hasGlobalSearch;
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
            const inputSearch = <InputSearch>Polymer.dom(this.root).querySelector("#collapsedInputSearch");
            inputSearch.focus();
        }

        private _catchInputSearchTap(e: TapEvent) {
            e.stopPropagation();
        }

        private _resetFilter(e: CustomEvent) {
            this.filter = "";
        }

        private _onResize(e: PolymerTrackEvent, detail: PolymerTrackDetail) {
            if (detail.state === "start") {
                this.app.isTracking = true;
                this._resizeWidth = Math.max(Menu._minResizeWidth, this.offsetWidth);
                this.customStyle["--vi-menu--expand-width"] = `${this._resizeWidth}px`;
                this.updateStyles();
                this._setIsResizing(true);
            }
            else if (detail.state === "track") {
                this._resizeWidth = Math.max(Menu._minResizeWidth, this._resizeWidth + detail.ddx);
                this.customStyle["--vi-menu--expand-width"] = `${this._resizeWidth}px`;
                this.updateStyles();
            }
            else if (detail.state === "end") {
                Vidyano.cookie("menu-width", String(this._resizeWidth));
                this._setIsResizing(false);
                this.app.isTracking = false;
            }
        }

        private _computeIsFirstRunProgramUnit(application: Vidyano.Application, programUnit: Vidyano.ProgramUnit): boolean {
            if (application && application.programUnits.length === 2) {
                if (application.programUnits[0] === programUnit && programUnit.name === "Home" && programUnit.items.length === 0)
                    return application.programUnits[1].path.contains("e683de37-2b39-45e9-9522-ef69c3f0287f");
            }

            return false;
        }

        private async _add(e: TapEvent) {
            const query = (await Promise.all([this.app.service.getQuery("5a4ed5c7-b843-4a1b-88f7-14bd1747458b"), this.app.importComponent("SelectReferenceDialog")]))[0] as Vidyano.Query;
            if (!query)
                return;

            if (query.items.length === 0) {
                this.app.showMessageDialog({
                    title: "Add menu item",
                    message: "Your application contains no persistent objects.\n\nFor more information [Getting Started](https://vidyano.com/gettingstarted)",
                    actions: [this.translateMessage("OK")],
                    actionTypes: ["Danger"],
                    rich: true
                });

                return;
            }

            const dialog = new Vidyano.WebComponents.SelectReferenceDialog(query);
            this.app.showDialog(dialog).then(async () => {
                if (!query.selectedItems || query.selectedItems.length === 0)
                    return;

                try {
                    await this.app.service.executeAction("System.AddQueriesToProgramUnit", null, query, query.selectedItems, { Id: this.app.service.application.programUnits[0].id });
                    document.location.reload();
                }
                catch (e) {
                    this.app.showMessageDialog({
                        title: "Add menu item",
                        message: e,
                        actions: [this.translateMessage("OK")],
                        actionTypes: ["Danger"]
                    });
                }
            });
        }
    }

    @WebComponent.register({
        properties: {
            item: Object,
            items: Array,
            level: {
                type: Number,
                value: 0
            },
            subLevel: {
                type: Number,
                computed: "_computeSubLevel(level)"
            },
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
            icon: {
                type: String,
                computed: "_computeIcon(item)"
            },
            expand: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                observer: "_expandChanged",
                value: false
            },
            filtering: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            filter: {
                type: String,
                observer: "_filterChanged",
                value: ""
            },
            filterParent: Object,
            hidden: {
                type: Boolean,
                reflectToAttribute: true
            },
            href: {
                type: String,
                computed: "_computedHref(item, app)"
            },
            collapseGroupsOnTap: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        observers: [
            "_updateItemTitle(item, filter, filtering, collapsed)",
            "_updateIndentVariable(level)",
            "_updateOpened(filtering, item, expand)"
        ],
        listeners: {
            "tap": "_tap"
        }
    })
    export class MenuItem extends WebComponent {
        readonly expand: boolean; private _setExpand: (val: boolean) => void;
        collapseGroupsOnTap: boolean;
        item: Vidyano.ProgramUnitItem;
        programUnit: Vidyano.ProgramUnit;
        collapsed: boolean;
        filter: string;
        filtering: boolean;
        hidden: boolean;
        filterParent: ProgramUnitItem;

        private _updateIndentVariable(level: number) {
            this.customStyle["--vi-menu-item-indent-level"] = level.toString();
            this.updateStyles();
        }

        private _computeSubLevel(level: number): number {
            return level + 1;
        }

        private _collapseRecursive() {
            if (!this.collapseGroupsOnTap)
                this._setExpand(false);

            Array.prototype.forEach.call(Polymer.dom(this.root).querySelectorAll("vi-menu-item[has-items]"), (item: MenuItem) => item._collapseRecursive());
        }

        private _tap(e: Event) {
            if (!this.filtering && this.collapseGroupsOnTap)
                this._collapseRecursive();

            if (!this.item || !this.item.path) {
                e.preventDefault();
                this._setExpand(!this.expand);
            }
            else {
                let item = this.item;
                if (item instanceof Vidyano.ProgramUnit && item.openFirst && item.items)
                    item = (<Vidyano.ProgramUnit>item).items[0];

                if (item instanceof Vidyano.ProgramUnitItemQuery)
                    this.app.cacheRemove(new QueryAppCacheEntry((<Vidyano.ProgramUnitItemQuery>item).queryId));
                else if (item instanceof Vidyano.ProgramUnitItemPersistentObject)
                    this.app.cacheRemove(new PersistentObjectAppCacheEntry((<Vidyano.ProgramUnitItemPersistentObject>item).persistentObjectId, (<Vidyano.ProgramUnitItemPersistentObject>item).persistentObjectObjectId));

                if (this.app.noHistory) {
                    e.preventDefault();
                    this.app.changePath(item.path);
                }

                if (this.filtering && this.app.configuration.getSetting("vi-menu.sticky-search", "false").toLowerCase() !== "true")
                    this.fire("reset-filter", null);
            }

            e.stopPropagation();
        }

        private _expandChanged(expand: boolean) {
            (<any>this.$["subItems"]).opened = expand;
        }

        private _filterChanged() {
            this.filtering = !StringEx.isNullOrEmpty(this.filter);
            this.hidden = this.filtering && !this._hasMatch(<ProgramUnitItem><any>this.item, this.filter.toUpperCase());
        }

        private _updateOpened(filtering: boolean, item: Vidyano.ProgramUnitItem, expand: boolean) {
            (<any>this.$["subItems"]).opened = filtering || item === this.programUnit || expand;
        }

        private _hasMatch(item: ProgramUnitItem, search: string): boolean {
            if (item.title.toUpperCase().contains(search))
                return true;

            const items = (<any>item).items;
            if (items != null && items.filter(i => this._hasMatch(i, search)).length > 0)
                return true;

            return this.filterParent instanceof Vidyano.ProgramUnitItemGroup && this.filterParent.title.toUpperCase().contains(search);
        }

        private _programUnitChanged() {
            if (!this.classList.contains("program-unit"))
                return;

            this._setExpand(this.item && (this.item === this.programUnit || this.collapsed));
        }

        private _updateItemTitle(item: Vidyano.ProgramUnitItem, filter: string, filtering: boolean, collapsed: boolean) {
            if (item instanceof Vidyano.ProgramUnit && collapsed)
                this.$["title"].textContent = item.title[0];
            else if (filtering && this._hasMatch(item, this.filter.toUpperCase())) {
                const exp = new RegExp(`(${filter})`, "gi");
                this.$["title"].innerHTML = item.title.replace(exp, "<span class='style-scope vi-menu-item match'>$1</span>");
            }
            else
                this.$["title"].textContent = item.title;
        }

        private _computeIcon(item: Vidyano.ProgramUnitItem): string {
            let prefix: string;

            if (item instanceof ProgramUnitItemGroup)
                return "ProgramUnitGroup";

            if (item instanceof ProgramUnit) {
                if (item.offset === 2147483647)
                    return "ProgramUnit_Vidyano";
                else
                    prefix = "ProgramUnit_";
            }
            else if (item instanceof ProgramUnitItemQuery)
                prefix = "ProgramUnitItem_Query_";
            else if (item instanceof ProgramUnitItemPersistentObject)
                prefix = "ProgramUnitItem_PersistentObject_";
            else if (item instanceof ProgramUnitItemUrl)
                prefix = "ProgramUnitItem_Url_";

            if (Vidyano.WebComponents.Icon.Exists(prefix + item.name))
                return prefix + item.name;

            return null;
        }

        private _computedHasItems(item: Vidyano.ProgramUnitItem): boolean {
            return item instanceof Vidyano.ProgramUnit || item instanceof Vidyano.ProgramUnitItemGroup;
        }

        private _computedHref(item: Vidyano.ProgramUnitItem, app: Vidyano.WebComponents.App): string {
            if (!item || !app)
                return undefined;

            if (item instanceof Vidyano.ProgramUnitItemUrl)
                return item.path;

            return (this.item && !(item instanceof Vidyano.ProgramUnitItemGroup)) ? app.noHistory ? "#" : Path.routes.rootPath + this.item.path : undefined;
        }

        private _titleMouseenter() {
            this.$["title"].setAttribute("title", this.$["title"].offsetWidth < this.$["title"].scrollWidth ? this.item.title : "");
        }

        _viConfigure(actions: IConfigurableAction[]) {
            if (!this.item.path || this.item.path.startsWith("Management/"))
                return;

            if (this.item instanceof Vidyano.ProgramUnit) {
                actions.push({
                    label: `Program unit: ${this.item.name}`,
                    icon: "viConfigure",
                    action: () => this.app.changePath(`Management/PersistentObject.b53ec1cd-e0b3-480f-b16d-bf33b133c05c/${this.item.name}`),
                    subActions: [
                        {
                            label: "Add Query",
                            icon: "Add",
                            action: async () => {
                                await this.app.importComponent("SelectReferenceDialog");
                                const query = await this.app.service.getQuery("5a4ed5c7-b843-4a1b-88f7-14bd1747458b");
                                if (!query)
                                    return;

                                await this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(query));
                                if (!query.selectedItems || query.selectedItems.length === 0)
                                    return;

                                await this.app.service.executeAction("System.AddQueriesToProgramUnit", null, query, query.selectedItems, { Id: this.item.id });
                                document.location.reload();
                            }
                        }
                    ]
                });

                actions.push();
            }
            else if (this.item instanceof Vidyano.ProgramUnitItem) {
                actions.push({
                    label: `Program unit item: ${this.item.name}`,
                    icon: "viConfigure",
                    action: () => this.app.changePath(`Management/PersistentObject.68f7b99e-ce10-4d43-80fb-191b6742d53c/${this.item.name}`)
                });
            }
        }
    }
}
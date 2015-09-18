var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var Menu = (function (_super) {
            __extends(Menu, _super);
            function Menu() {
                _super.apply(this, arguments);
            }
            Menu.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this.collapsed = BooleanEx.parse(Vidyano.cookie("menu-collapsed"));
            };
            Menu.prototype._filterChanged = function () {
                this.filtering = !StringEx.isNullOrEmpty(this.filter);
            };
            Menu.prototype._search = function () {
                if (this.collapsed && this.filter)
                    WebComponents.Popup.closeAll();
                if (!this.filtering || this.app.service.application.globalSearchId == "00000000-0000-0000-0000-000000000000")
                    return;
                this.app.changePath(this.app.getUrlForPersistentObject(this.app.service.application.globalSearchId, this.filter));
                this.filter = "";
            };
            Menu.prototype._toggleCollapse = function () {
                this.collapsed = !this.collapsed;
                Vidyano.cookie("menu-collapsed", String(this.collapsed));
            };
            Menu.prototype._hasGroupItems = function (programUnitItems) {
                return !!programUnitItems && programUnitItems.some(function (item) { return item instanceof Vidyano.ProgramUnitItemGroup; });
            };
            Menu.prototype._countItems = function (programUnitItems) {
                return !!programUnitItems ? programUnitItems.length : 0;
            };
            Menu = __decorate([
                WebComponents.WebComponent.register({
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
            ], Menu);
            return Menu;
        })(WebComponents.WebComponent);
        WebComponents.Menu = Menu;
        var MenuItem = (function (_super) {
            __extends(MenuItem, _super);
            function MenuItem() {
                _super.apply(this, arguments);
            }
            MenuItem.prototype._tap = function (e) {
                if (!this.item || !this.item.path) {
                    this._setExpand(!this.expand);
                    e.preventDefault();
                    e.stopPropagation();
                }
                else {
                    var item = this.item;
                    if (item instanceof Vidyano.ProgramUnit && item.openFirst && item.items)
                        item = item.items[0];
                    if (item instanceof Vidyano.ProgramUnitItemQuery)
                        this.app.cacheRemove(new WebComponents.QueryAppCacheEntry(item.queryId));
                    else if (item instanceof Vidyano.ProgramUnitItemPersistentObject)
                        this.app.cacheRemove(new WebComponents.PersistentObjectAppCacheEntry(item.persistentObjectId, item.persistentObjectObjectId));
                    this.filter = "";
                    if (this.app.noHistory) {
                        this.app.changePath(item.path);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            };
            MenuItem.prototype._filterChanged = function () {
                this.filtering = !StringEx.isNullOrEmpty(this.filter);
                this.hide = this.filtering && !this._hasMatch(this.item, this.filter.toUpperCase());
            };
            MenuItem.prototype._hasMatch = function (item, search) {
                var _this = this;
                var matchOnItem = item.title.toUpperCase().contains(search);
                var items = item.items;
                var matchOnSubItems = (items != null && items.filter(function (i) { return _this._hasMatch(i, search); }).length > 0);
                var hasMatch = matchOnItem || matchOnSubItems;
                if (!hasMatch && this.filterParent instanceof Vidyano.ProgramUnitItemGroup && this.filterParent.title.toUpperCase().contains(search))
                    hasMatch = true;
                if (hasMatch && item instanceof Vidyano.ProgramUnit && !matchOnSubItems)
                    hasMatch = false;
                return hasMatch;
            };
            MenuItem.prototype._programUnitChanged = function () {
                if (!this.classList.contains("program-unit"))
                    return;
                this._setExpand(this.item && this.item == this.programUnit);
            };
            MenuItem.prototype._updateItemTitle = function (item, filter, filtering, collapsed) {
                if (collapsed) {
                    if (item instanceof Vidyano.ProgramUnit && !this.$["title"].querySelector("vi-resource")) {
                        var resourceName = item.offset < 2147483647 ? "ProgramUnit_" + item.name : "Vidyano";
                        if (Vidyano.WebComponents.Icon.Exists(resourceName)) {
                            this.$["title"].textContent = "";
                            this.$["title"].appendChild(new Vidyano.WebComponents.Icon(resourceName));
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
                    this.$["title"].innerHTML = item.title.replace(exp, "<span class='match'>$1</span>");
                }
            };
            MenuItem.prototype._computedHasItems = function (item) {
                return item instanceof Vidyano.ProgramUnitItemGroup;
            };
            MenuItem.prototype._computedHref = function (item) {
                if (!item || !this.isAttached)
                    return undefined;
                return (this.item && !(item instanceof Vidyano.ProgramUnitItemGroup)) ? this.app.noHistory ? "#" : '#!/' + this.item.path : undefined;
            };
            MenuItem = __decorate([
                WebComponents.WebComponent.register({
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
                        "_updateItemTitle(item, filter, filtering, collapsed)"
                    ],
                    listeners: {
                        "tap": "_tap"
                    }
                })
            ], MenuItem);
            return MenuItem;
        })(WebComponents.WebComponent);
        WebComponents.MenuItem = MenuItem;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
            Menu.prototype._filterChanged = function () {
                this.filtering = !StringEx.isNullOrEmpty(this.filter);
            };
            Menu.prototype._search = function () {
                if (!this.filtering || this.app.service.application.globalSearchId == "00000000-0000-0000-0000-000000000000")
                    return;
                this.app.changePath(this.app.getUrlForPersistentObject(this.app.service.application.globalSearchId, this.filter));
                this.filter = "";
            };
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
            MenuItem.prototype._updateItemTitle = function (item, filter, filtering) {
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
            return MenuItem;
        })(WebComponents.WebComponent);
        WebComponents.MenuItem = MenuItem;
        WebComponents.WebComponent.register(Menu, WebComponents, "vi", {
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
        WebComponents.WebComponent.register(MenuItem, WebComponents, "vi", {
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
            ],
            listeners: {
                "tap": "_tap"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

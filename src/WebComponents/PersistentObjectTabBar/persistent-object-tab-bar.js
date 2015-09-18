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
        var PersistentObjectTabBar = (function (_super) {
            __extends(PersistentObjectTabBar, _super);
            function PersistentObjectTabBar() {
                _super.apply(this, arguments);
            }
            PersistentObjectTabBar.prototype._hookObservers = function () {
                var _this = this;
                if (this._observeDisposer) {
                    this._observeDisposer();
                    this._observeDisposer = undefined;
                }
                if (this.isAttached && this.tabs) {
                    this._observeDisposer = this._forwardObservable(this.tabs, "isVisible", "tabs", function () {
                        if (!_this.selectedTab || !_this.selectedTab.isVisible)
                            _this.selectedTab = _this.tabs.filter(function (t) { return t.isVisible; })[0];
                    });
                }
                if (!this.selectedTab || !this.selectedTab.isVisible)
                    this.selectedTab = this.tabs.filter(function (t) { return t.isVisible; })[0];
            };
            PersistentObjectTabBar.prototype._tabSelected = function (e, detail) {
                this.selectedTab = detail.tab;
                WebComponents.Popup.closeAll(this);
            };
            PersistentObjectTabBar.prototype.isInline = function (mode) {
                return mode == "inline";
            };
            PersistentObjectTabBar.prototype.isDropDown = function (mode) {
                return mode == "dropdown";
            };
            PersistentObjectTabBar.prototype._isVisible = function (tab) {
                return tab.isVisible;
            };
            PersistentObjectTabBar = __decorate([
                WebComponents.WebComponent.register({
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
            ], PersistentObjectTabBar);
            return PersistentObjectTabBar;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectTabBar = PersistentObjectTabBar;
        var PersistentObjectTabBarItem = (function (_super) {
            __extends(PersistentObjectTabBarItem, _super);
            function PersistentObjectTabBarItem() {
                _super.apply(this, arguments);
            }
            PersistentObjectTabBarItem.prototype._select = function () {
                this.fire("tab-selected", { tab: this.tab }, { bubbles: false });
            };
            PersistentObjectTabBarItem.prototype._computeIsSelected = function (tab, selectedTab) {
                return tab == selectedTab;
            };
            PersistentObjectTabBarItem.prototype._computeHasBadge = function (badge) {
                return badge !== undefined && badge >= 0;
            };
            PersistentObjectTabBarItem = __decorate([
                WebComponents.WebComponent.register({
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
                })
            ], PersistentObjectTabBarItem);
            return PersistentObjectTabBarItem;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectTabBarItem = PersistentObjectTabBarItem;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

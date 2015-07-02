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
        var PersistentObjectTabPresenter = (function (_super) {
            __extends(PersistentObjectTabPresenter, _super);
            function PersistentObjectTabPresenter() {
                _super.apply(this, arguments);
            }
            PersistentObjectTabPresenter.prototype._renderTab = function (tab, isAttached) {
                if (!isAttached || this._renderedTab === tab)
                    return;
                if (this._tabComponent) {
                    Polymer.dom(this).removeChild(this._tabComponent);
                    this._tabComponent = this._renderedTab = null;
                }
                var childClassName = "style-scope vi-persistent-object fit";
                if (tab instanceof Vidyano.PersistentObjectQueryTab) {
                    this._renderedTab = tab;
                    var itemPresenter = new WebComponents.QueryItemsPresenter();
                    itemPresenter.className = childClassName;
                    itemPresenter.query = tab.query;
                    if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                        itemPresenter.query.search();
                    Polymer.dom(this).appendChild(this._tabComponent = itemPresenter);
                }
                else if (tab instanceof Vidyano.PersistentObjectAttributeTab) {
                    this._renderedTab = tab;
                    // TODO: Check Custom
                    var attributeTab = new WebComponents.PersistentObjectTab();
                    attributeTab.className = childClassName;
                    attributeTab.tab = tab;
                    Polymer.dom(this).appendChild(this._tabComponent = attributeTab);
                    this._skipTabUpdate = true;
                }
            };
            PersistentObjectTabPresenter.prototype._updateAuthoredTab = function (groups, isAttached) {
                if (this._skipTabUpdate) {
                    this._skipTabUpdate = false;
                    return;
                }
                if (isAttached && this._tabComponent instanceof Vidyano.WebComponents.PersistentObjectTab)
                    this._tabComponent.update();
            };
            return PersistentObjectTabPresenter;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectTabPresenter = PersistentObjectTabPresenter;
        WebComponents.WebComponent.register(PersistentObjectTabPresenter, WebComponents, "vi", {
            properties: {
                tab: Object
            },
            observers: [
                "_renderTab(tab, isAttached)",
                "_updateAuthoredTab(tab.groups, isAttached)"
            ],
            forwardObservers: [
                "tab.groups"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

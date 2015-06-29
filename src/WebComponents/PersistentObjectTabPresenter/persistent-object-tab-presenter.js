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
            PersistentObjectTabPresenter.prototype._tabChanged = function () {
                this.empty();
                var childClassName = "style-scope vi-persistent-object fit";
                if (this.tab instanceof Vidyano.PersistentObjectQueryTab) {
                    var itemPresenter = new WebComponents.QueryItemsPresenter();
                    itemPresenter.className = childClassName;
                    itemPresenter.query = this.tab.query;
                    if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                        itemPresenter.query.search();
                    Polymer.dom(this).appendChild(itemPresenter);
                }
                else if (this.tab instanceof Vidyano.PersistentObjectAttributeTab) {
                    // TODO: Check Custom
                    var authoredTab = new WebComponents.PersistentObjectTab();
                    authoredTab.className = childClassName;
                    authoredTab.tab = this.tab;
                    Polymer.dom(this).appendChild(authoredTab);
                }
            };
            return PersistentObjectTabPresenter;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectTabPresenter = PersistentObjectTabPresenter;
        WebComponents.WebComponent.register(PersistentObjectTabPresenter, WebComponents, "vi", {
            properties: {
                tab: {
                    type: Object,
                    observer: "_tabChanged"
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

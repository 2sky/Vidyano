var __extends = (this && this.__extends) || function (d, b) {
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
                var _this = this;
                if (!isAttached || this._renderedTab === tab)
                    return;
                this.empty();
                if (!tab)
                    return;
                this._setLoading(true);
                var childClassName = "style-scope vi-persistent-object";
                var config = this.app.configuration.getTabConfig(tab);
                this._setTemplated(!!config && !!config.template);
                if (this.templated) {
                    if (!this._templatePresenter)
                        this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(config.template, "tab");
                    this._templatePresenter.dataContext = tab;
                    if (!this._templatePresenter.isAttached)
                        Polymer.dom(this).appendChild(this._templatePresenter);
                    this._setLoading(false);
                }
                else {
                    if (tab instanceof Vidyano.PersistentObjectQueryTab) {
                        var itemPresenter = new WebComponents.QueryItemsPresenter();
                        itemPresenter.className = childClassName;
                        itemPresenter.query = tab.query;
                        if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                            itemPresenter.query.search();
                        Polymer.dom(this).appendChild(itemPresenter);
                        this._setLoading(false);
                    }
                    else if (tab instanceof Vidyano.PersistentObjectAttributeTab) {
                        if (!Vidyano.WebComponents.PersistentObjectTabPresenter._persistentObjectTabComponentLoader) {
                            Vidyano.WebComponents.PersistentObjectTabPresenter._persistentObjectTabComponentLoader = new Promise(function (resolve) {
                                _this.importHref(_this.resolveUrl("../PersistentObjectTab/persistent-object-tab.html"), function (e) {
                                    resolve(true);
                                }, function (err) {
                                    console.error(err);
                                    resolve(false);
                                });
                            });
                        }
                        Vidyano.WebComponents.PersistentObjectTabPresenter._persistentObjectTabComponentLoader.then(function () {
                            if (tab !== _this.tab)
                                return;
                            var attributeTab = new WebComponents.PersistentObjectTab();
                            attributeTab.className = childClassName;
                            attributeTab.tab = tab;
                            Polymer.dom(_this).appendChild(attributeTab);
                            _this._setLoading(false);
                        });
                    }
                }
            };
            return PersistentObjectTabPresenter;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectTabPresenter = PersistentObjectTabPresenter;
        WebComponents.WebComponent.register(PersistentObjectTabPresenter, WebComponents, "vi", {
            properties: {
                tab: Object,
                loading: {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true,
                    value: true
                },
                templated: {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                }
            },
            observers: [
                "_renderTab(tab, isAttached)"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

module Vidyano.WebComponents {
    @WebComponent.register({
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
    })
    export class PersistentObjectTabPresenter extends WebComponent {
        private static _persistentObjectTabComponentLoader: Promise<any>;
        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;
        private _renderedTab: Vidyano.PersistentObjectTab;
        tab: Vidyano.PersistentObjectTab;
        templated: boolean;
        scroll: boolean;

        private _setLoading: (loading: boolean) => void;
        private _setTemplated: (templated: boolean) => void;

        private _renderTab(tab: Vidyano.PersistentObjectTab, isAttached: boolean) {
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
                    var itemPresenter = new QueryItemsPresenter();
                    itemPresenter.className = childClassName;
                    itemPresenter.query = (<Vidyano.PersistentObjectQueryTab>tab).query;
                    if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                        itemPresenter.query.search();

                    Polymer.dom(this).appendChild(itemPresenter);

                    this._setLoading(false);
                }
                else if (tab instanceof Vidyano.PersistentObjectAttributeTab) {
                    if (!Vidyano.WebComponents.PersistentObjectTabPresenter._persistentObjectTabComponentLoader) {
                        Vidyano.WebComponents.PersistentObjectTabPresenter._persistentObjectTabComponentLoader = new Promise(resolve => {
                            this.importHref(this.resolveUrl("../PersistentObjectTab/persistent-object-tab.html"), e => {
                                resolve(true);
                            }, err => {
                                    console.error(err);
                                    resolve(false);
                                });
                        });
                    }

                    Vidyano.WebComponents.PersistentObjectTabPresenter._persistentObjectTabComponentLoader.then(() => {
                        if (tab !== this.tab)
                            return;

                        var attributeTab = new WebComponents.PersistentObjectTab();
                        attributeTab.className = childClassName;
                        attributeTab.tab = <Vidyano.PersistentObjectAttributeTab>tab;

                        Polymer.dom(this).appendChild(attributeTab);

                        this._setLoading(false);
                    });
                }
            }
        }
    }
}
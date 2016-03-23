namespace Vidyano.WebComponents {
    "use strict";

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
        ],
        listeners: {
            "attribute-loaded": "_attributeLoaded"
        }
    })
    export class PersistentObjectTabPresenter extends WebComponent {
        private static _persistentObjectTabComponentLoader: Promise<any>;
        private _renderedTab: Vidyano.PersistentObjectTab;
        private _tabAttributes: Vidyano.PersistentObjectAttribute[];
        tab: Vidyano.PersistentObjectTab;
        templated: boolean;
        scroll: boolean;

        private _setLoading: (loading: boolean) => void;
        private _setTemplated: (templated: boolean) => void;

        private _renderTab(tab: Vidyano.PersistentObjectTab, isAttached: boolean) {
            if (!isAttached || this._renderedTab === tab)
                return;

            this.empty();

            if (!tab) {
                this._setLoading(false);
                return;
            }

            this._setLoading(true);

            const childClassName = "style-scope vi-persistent-object";

            const config = this.app.configuration.getTabConfig(tab);
            this._setTemplated(!!config && config.hasTemplate);

            if (this.templated) {
                Polymer.dom(this).appendChild(config.stamp(tab, config.as || "tab"));

                this._setLoading(false);
            }
            else {
                if (tab instanceof Vidyano.PersistentObjectQueryTab) {
                    const itemPresenter = new QueryItemsPresenter();
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

                        this._tabAttributes = tab.attributes.slice(0);

                        const attributeTab = new WebComponents.PersistentObjectTab();
                        attributeTab.className = childClassName;
                        attributeTab.tab = <Vidyano.PersistentObjectAttributeTab>tab;

                        Polymer.dom(this).appendChild(attributeTab);
                    });
                }
            }
        }

        private _attributeLoaded(e: Event, detail: { attribute: Vidyano.PersistentObjectAttribute; }) {
            if (!this._tabAttributes)
                return;

            if (this._tabAttributes.length > 0)
                this._tabAttributes.remove(detail.attribute);

            if (this._tabAttributes.length === 0)
                this._setLoading(false);
        }
    }
}
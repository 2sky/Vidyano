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
        private _renderedTab: Vidyano.PersistentObjectTab;
        private _tabAttributes: Vidyano.PersistentObjectAttribute[];
        tab: Vidyano.PersistentObjectTab;
        templated: boolean;

        private _setLoading: (loading: boolean) => void;
        private _setTemplated: (templated: boolean) => void;

        private async _renderTab(tab: Vidyano.PersistentObjectTab, isAttached: boolean) {
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
                    await this.app.importComponent("QueryItemsPresenter");
                    const itemPresenter = new QueryItemsPresenter();
                    itemPresenter.className = childClassName;
                    itemPresenter.query = (<Vidyano.PersistentObjectQueryTab>tab).query;
                    if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                        itemPresenter.query.search();

                    Polymer.dom(this).appendChild(itemPresenter);

                    this._setLoading(false);
                }
                else if (tab instanceof Vidyano.PersistentObjectAttributeTab) {
                    await this.app.importComponent("PersistentObjectTab");

                    if (tab !== this.tab)
                        return;

                    this._tabAttributes = (<Vidyano.PersistentObjectAttributeTab>tab).attributes.slice(0).filter(a => a.isVisible);

                    const attributeTab = new WebComponents.PersistentObjectTab();
                    attributeTab.className = childClassName;
                    attributeTab.tab = <Vidyano.PersistentObjectAttributeTab>tab;

                    Polymer.dom(this).appendChild(attributeTab);

                    if (this._tabAttributes.length === 0)
                        this._setLoading(false);
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
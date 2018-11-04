namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            tab: Object,
            columns: {
                type: Number,
                reflectToAttribute: true
            },
            maxColumns: {
                type: Number,
                reflectToAttribute: true
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
        private _renderedTab: Vidyano.PersistentObjectTab;
        readonly templated: boolean; private _setTemplated: (templated: boolean) => void;
        tab: Vidyano.PersistentObjectTab;
        columns: number;
        maxColumns: number;

        private async _renderTab(tab: Vidyano.PersistentObjectTab, isAttached: boolean) {
            if (!isAttached || this._renderedTab === tab)
                return;

            this.empty();

            if (!tab)
                return;

            const childClassName = "style-scope vi-persistent-object";

            const config = this.app.configuration.getTabConfig(tab);
            this._setTemplated(!!config && config.hasTemplate);

            if (this.templated)
                Polymer.dom(this).appendChild(config.stamp(tab, config.as || "tab"));
            else {
                if (tab instanceof Vidyano.PersistentObjectQueryTab) {
                    await this.app.importComponent("QueryItemsPresenter");
                    const itemPresenter = new QueryItemsPresenter();
                    itemPresenter.className = childClassName;
                    itemPresenter.query = (<Vidyano.PersistentObjectQueryTab>tab).query;
                    if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                        itemPresenter.query.search();

                    Polymer.dom(this).appendChild(itemPresenter);
                }
                else if (tab instanceof Vidyano.PersistentObjectAttributeTab) {
                    await this.app.importComponent("PersistentObjectTab");

                    if (tab !== this.tab)
                        return;

                    const attributeTab = new WebComponents.PersistentObjectTab();
                    attributeTab.className = childClassName;
                    attributeTab.tab = <Vidyano.PersistentObjectAttributeTab>tab;
                    attributeTab.columns = this.columns != null ? this.columns : tab.columnCount;
                    if (this.maxColumns)
                        attributeTab.maxColumns = this.maxColumns;

                    Polymer.dom(this).appendChild(attributeTab);
                }
            }
        }
    }
}
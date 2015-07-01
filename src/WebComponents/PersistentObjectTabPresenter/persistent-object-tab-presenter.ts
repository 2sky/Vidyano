module Vidyano.WebComponents {
    export class PersistentObjectTabPresenter extends WebComponent {
        private _skipTabUpdate: boolean;
        private _tabComponent: WebComponent;
        private _renderedTab: Vidyano.PersistentObjectTab;

        private _renderTab(tab: Vidyano.PersistentObjectTab, isAttached: boolean) {
            if (!isAttached || this._renderedTab === tab)
                return;

            if (this._tabComponent) {
                Polymer.dom(this).removeChild(this._tabComponent);
                this._tabComponent = this._renderedTab = null;
            }

            var childClassName = "style-scope vi-persistent-object fit";
            if (tab instanceof Vidyano.PersistentObjectQueryTab) {
                this._renderedTab = tab;

                var itemPresenter = new QueryItemsPresenter();
                itemPresenter.className = childClassName;
                itemPresenter.query = (<Vidyano.PersistentObjectQueryTab>tab).query;
                if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                    itemPresenter.query.search();

                Polymer.dom(this).appendChild(this._tabComponent = itemPresenter);
            }
            else if (tab instanceof Vidyano.PersistentObjectAttributeTab) {
                this._renderedTab = tab;

                // TODO: Check Custom
                var attributeTab = new WebComponents.PersistentObjectTab();
                attributeTab.className = childClassName;
                attributeTab.tab = <Vidyano.PersistentObjectAttributeTab>tab;

                Polymer.dom(this).appendChild(this._tabComponent = attributeTab);
                this._skipTabUpdate = true;
            }
        }

        private _updateAuthoredTab(groups: Vidyano.PersistentObjectAttributeGroup[], isAttached: boolean) {
            if (this._skipTabUpdate) {
                this._skipTabUpdate = false;
                return;
            }

            if (isAttached && this._tabComponent instanceof Vidyano.WebComponents.PersistentObjectTab)
                (<Vidyano.WebComponents.PersistentObjectTab>this._tabComponent).update();
        }
    }

    WebComponent.register(PersistentObjectTabPresenter, WebComponents, "vi", {
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
}
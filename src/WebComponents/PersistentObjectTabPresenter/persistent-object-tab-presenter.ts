module Vidyano.WebComponents {
    export class PersistentObjectTabPresenter extends WebComponent {
        tab: Vidyano.PersistentObjectTab;

        private _tabChanged() {
            this.empty();

            var childClassName = "style-scope vi-persistent-object fit";
            if (this.tab instanceof Vidyano.PersistentObjectQueryTab) {
                var itemPresenter = new QueryItemsPresenter();
                itemPresenter.className = childClassName;
                itemPresenter.query = (<Vidyano.PersistentObjectQueryTab>this.tab).query;
                if (itemPresenter.query.autoQuery && !itemPresenter.query.hasSearched)
                    itemPresenter.query.search();

                Polymer.dom(this).appendChild(itemPresenter);
            }
            else if (this.tab instanceof Vidyano.PersistentObjectAttributeTab) {
                // TODO: Check Custom
                var authoredTab = new WebComponents.PersistentObjectTab();
                authoredTab.className = childClassName;
                authoredTab.tab = <Vidyano.PersistentObjectAttributeTab>this.tab;
                Polymer.dom(this).appendChild(authoredTab);
            }
        }
    }

    WebComponent.register(PersistentObjectTabPresenter, WebComponents, "vi", {
        properties: {
            tab: {
                type: Object,
                observer: "_tabChanged"
            }
        }
    });
}
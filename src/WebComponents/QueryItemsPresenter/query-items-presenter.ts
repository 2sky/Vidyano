module Vidyano.WebComponents {
    export class QueryItemsPresenter extends WebComponent {
        query: Vidyano.Query;

        private _queryChanged(newQuery: Vidyano.Query, oldQuery: Vidyano.Query) {
            if (oldQuery)
                this.empty();

            if (this.query) {
                var child: HTMLElement;

                //! TODO Custom templates for queries
                //var queryTemplateName = "QUERY." + this.query.name;
                //if (Vidyano.WebComponents.Resource.Exists(queryTemplateName)) {
                //    var resource = new Vidyano.WebComponents.Resource();
                //    resource.source = queryTemplateName;
                //    this.appendChild(resource);
                //}
                //else {
                var grid = new Vidyano.WebComponents.QueryGrid();
                grid.query = this.query;
                this.appendChild(grid);
                //}
            }
        }
    }

    WebComponent.register(QueryItemsPresenter, WebComponents, "vi", {
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
            }
        }
    });
}
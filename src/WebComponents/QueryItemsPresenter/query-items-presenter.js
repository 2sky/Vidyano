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
        var QueryItemsPresenter = (function (_super) {
            __extends(QueryItemsPresenter, _super);
            function QueryItemsPresenter() {
                _super.apply(this, arguments);
            }
            QueryItemsPresenter.prototype._queryChanged = function (newQuery, oldQuery) {
                if (oldQuery)
                    this.empty();
                if (this.query) {
                    var child;
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
                }
            };
            return QueryItemsPresenter;
        })(WebComponents.WebComponent);
        WebComponents.QueryItemsPresenter = QueryItemsPresenter;
        WebComponents.WebComponent.register(QueryItemsPresenter, WebComponents, "vi", {
            properties: {
                query: {
                    type: Object,
                    observer: "_queryChanged"
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

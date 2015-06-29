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
        var QueryGridCellBoolean = (function (_super) {
            __extends(QueryGridCellBoolean, _super);
            function QueryGridCellBoolean() {
                _super.apply(this, arguments);
            }
            QueryGridCellBoolean.prototype._render = function (dom) {
                if (!this._resource) {
                    this._resource = new Vidyano.WebComponents.Resource();
                    this._resource.source = "Icon_Selected";
                    dom.appendChild(this._resource);
                }
                var value = this.item ? this.item.getValue(this.gridColumn.column.name) : null;
                if (value == true)
                    this._resource.className = "checked";
                else if (value == false)
                    this._resource.className = "unchecked";
                else
                    this._resource.className = "";
            };
            return QueryGridCellBoolean;
        })(WebComponents.QueryGridCell);
        WebComponents.QueryGridCellBoolean = QueryGridCellBoolean;
        var QueryGridCellNullableBoolean = (function (_super) {
            __extends(QueryGridCellNullableBoolean, _super);
            function QueryGridCellNullableBoolean() {
                _super.apply(this, arguments);
            }
            return QueryGridCellNullableBoolean;
        })(QueryGridCellBoolean);
        WebComponents.QueryGridCellNullableBoolean = QueryGridCellNullableBoolean;
        var QueryGridCellYesNo = (function (_super) {
            __extends(QueryGridCellYesNo, _super);
            function QueryGridCellYesNo() {
                _super.apply(this, arguments);
            }
            return QueryGridCellYesNo;
        })(QueryGridCellBoolean);
        WebComponents.QueryGridCellYesNo = QueryGridCellYesNo;
        var QueryGridCellImage = (function (_super) {
            __extends(QueryGridCellImage, _super);
            function QueryGridCellImage() {
                _super.apply(this, arguments);
            }
            QueryGridCellImage.prototype._render = function (dom) {
                if (!this._img) {
                    this._img = document.createElement("div");
                    this._img.className = "image";
                    dom.appendChild(this._img);
                }
                var value = (this.item ? this.item.getValue(this.gridColumn.column.name) : null);
                if (StringEx.isNullOrEmpty(value)) {
                    if (!StringEx.isNullOrEmpty(dom.style.backgroundImage))
                        this._img.style.backgroundImage = "";
                    return;
                }
                this._img.style.backgroundImage = "url(" + value.asDataUri() + ")";
            };
            return QueryGridCellImage;
        })(WebComponents.QueryGridCell);
        WebComponents.QueryGridCellImage = QueryGridCellImage;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

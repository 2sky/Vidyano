var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var SelectReferenceDialog = (function (_super) {
            __extends(SelectReferenceDialog, _super);
            function SelectReferenceDialog() {
                _super.apply(this, arguments);
            }
            SelectReferenceDialog.prototype.detached = function () {
                _super.prototype.detached.call(this);
                if (this._itemClickCallback && this._grid) {
                    this._grid.removeEventListener("item-click", this._itemClickCallback);
                    this._itemClickCallback = null;
                }
            };
            SelectReferenceDialog.prototype.show = function () {
                var dialog = this.$["dialog"];
                this.empty();
                this._grid = new WebComponents.QueryGrid();
                this._grid.addEventListener("item-click", this._itemClickCallback = this._selectReference.bind(this));
                this._grid.classList.add("fit");
                this._grid.asLookup = true;
                this._grid.query = this.query;
                Polymer.dom(this).appendChild(this._grid);
                this._dialog = dialog.show({
                    autoSize: true
                });
                return this._dialog.result;
            };
            SelectReferenceDialog.prototype._selectedItemsChanged = function () {
                if (!this.isAttached)
                    return;
                this.canSelect = this.query && this.query.selectedItems && this.query.selectedItems.length > 0;
            };
            SelectReferenceDialog.prototype._invalidateCanSelect = function (selectedItems) {
                if (selectedItems === void 0) { selectedItems = (this.query ? this.query.selectedItems : undefined); }
                this.canSelect = selectedItems && selectedItems.length > 0;
            };
            SelectReferenceDialog.prototype._queryPropertyChanged = function (sender, detail) {
                if (detail.propertyName == "selectedItems")
                    this._invalidateCanSelect(detail.newValue);
            };
            SelectReferenceDialog.prototype._select = function () {
                if (!this.canSelect)
                    return;
                this._dialog.resolve(this.query.selectedItems);
            };
            SelectReferenceDialog.prototype._cancel = function () {
                this._dialog.resolve();
            };
            SelectReferenceDialog.prototype._search = function (e, detail) {
                if (!this.query)
                    return;
                this.query.textSearch = detail;
                this.query.search();
            };
            SelectReferenceDialog.prototype._selectReference = function (e) {
                e.preventDefault();
                var detail = e.detail;
                if (this.query.maxSelectedItems == 1)
                    this._dialog.resolve([detail.item]);
                else
                    detail.item.isSelected = !detail.item.isSelected;
            };
            SelectReferenceDialog = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        query: Object,
                        canSelect: Boolean
                    },
                    hostAttributes: {
                        "dialog": ""
                    },
                    forwardObservers: [
                        "_selectedItemsChanged(query.selectedItems)"
                    ]
                })
            ], SelectReferenceDialog);
            return SelectReferenceDialog;
        })(WebComponents.WebComponent);
        WebComponents.SelectReferenceDialog = SelectReferenceDialog;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

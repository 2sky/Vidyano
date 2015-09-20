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
            function SelectReferenceDialog(query) {
                _super.call(this);
                this.query = query;
            }
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
                this.instance.resolve(this.query.selectedItems);
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
                    this.instance.resolve([detail.item]);
                else
                    detail.item.isSelected = !detail.item.isSelected;
            };
            SelectReferenceDialog = __decorate([
                WebComponents.Dialog.register({
                    properties: {
                        query: Object,
                        canSelect: Boolean
                    },
                    forwardObservers: [
                        "_selectedItemsChanged(query.selectedItems)"
                    ]
                })
            ], SelectReferenceDialog);
            return SelectReferenceDialog;
        })(WebComponents.Dialog);
        WebComponents.SelectReferenceDialog = SelectReferenceDialog;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

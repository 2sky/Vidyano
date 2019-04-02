namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
        }
    })
    export class QueryGridColumnFooter extends WebComponent {
        private _resizingRAF: number;
        private _column: QueryGridColumn;
        private _columnObserver: Vidyano.Common.ISubjectDisposer;
        private _labelTextNode: Text;
        private _typeHints: any;
        private _renderedValue: any;

        get column(): QueryGridColumn {
            return this._column;
        }

        set column(column: QueryGridColumn) {
            if (this._column === column)
                return;

            if (this._columnObserver) {
                this._columnObserver();
                this._columnObserver = null;
            }

            if (this._column = column) {
                this._columnObserver = this.column.column.propertyChanged.attach(this._columnPropertyChanged.bind(this));

                this._updateTotal(this.column.column.total);
            }
            else
                this._updateTotal(null);
        }

        private _columnPropertyChanged(sender: Vidyano.QueryColumn, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "total")
                this._updateTotal(sender.total);
        }

        private _updateTotal(total: Vidyano.QueryResultItemValue) {
            if (total) {
                let value = total.getValue();
                if (value === this._renderedValue)
                    return;
                else
                    this._renderedValue = value;

                const format = this._getTypeHint("displayformat", null);
                if (!StringEx.isNullOrEmpty(format))
                    value = StringEx.format(format, value);

                if (!this._labelTextNode)
                    this._labelTextNode = this.$.label.appendChild(document.createTextNode(value));
                else
                    this._labelTextNode.nodeValue = value;
            }
            else if (this._labelTextNode && this._renderedValue)
                this._labelTextNode.nodeValue = this._renderedValue = "";
        }

        protected _getTypeHint(name: string, defaultValue?: string): string {
            return this.column.column.getTypeHint(name, defaultValue, this._typeHints, true);
        }
    }
}
namespace Vidyano {

    export class QueryResultItemValue extends ServiceObject {
        private _column: Vidyano.QueryColumn;
        private _value: any;
        private _valueParsed: boolean;

        key: string;
        value: string;
        typeHints: any;
        persistentObjectId: string;
        objectId: string;

        constructor(service: Service, private _item: QueryResultItem, value: any) {
            super(service);

            this.key = value.key;
            this._column = this._item.query.getColumn(this.key);
            this.value = value.value;
            this.persistentObjectId = value.persistentObjectId;
            this.objectId = value.objectId;
            this.typeHints = value.typeHints;
        }

        get item(): Vidyano.QueryResultItem {
            return this._item;
        }

        get column(): Vidyano.QueryColumn {
            return this._column;
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }

        getValue(): any {
            if (this._valueParsed)
                return this._value;

            this._value = Service.fromServiceString(this.value, this._item.query.getColumn(this.key).type);
            this._valueParsed = true;

            return this._value;
        }

        _toServiceObject() {
            return this.copyProperties(["key", "value", "persistentObjectId", "objectId"]);
        }
    }
}
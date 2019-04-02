namespace Vidyano {

    export class QueryResultItem extends ServiceObject {
        private _ignoreSelect: boolean;
        id: string;
        rawValues: QueryResultItemValue[];
        typeHints: any;
        private _fullValuesByName: any;
        private _values: any;

        constructor(service: Service, item: any, public query: Query, private _isSelected: boolean) {
            super(service);

            this.id = item.id;

            if (item.values) {
                const columnNames = query.columns.map(c => c.name);
                this.rawValues = item.values.filter(v => columnNames.indexOf(v.key) >= 0).map(v => service.hooks.onConstructQueryResultItemValue(this.service, this, v));
            }
            else
                this.rawValues = [];

            this.typeHints = item.typeHints;
        }

        get values(): { [key: string]: any; } {
            if (!this._values) {
                this._values = {};
                this.rawValues.forEach(v => {
                    const col = this.query.columns[v.key];
                    if (!col)
                        return;

                    this._values[v.key] = Service.fromServiceString(v.value, col.type);
                });
            }

            return this._values;
        }

        get isSelected(): boolean {
            if (this._ignoreSelect)
                return false;

            return this._isSelected;
        }

        set isSelected(val: boolean) {
            if (val && this.ignoreSelect)
                return;

            const oldIsSelected = this._isSelected;
            this.notifyPropertyChanged("isSelected", this._isSelected = val, oldIsSelected);

            this.query._notifyItemSelectionChanged(this);
        }

        get ignoreSelect(): boolean {
            if (typeof this._ignoreSelect === "undefined")
                this._ignoreSelect = this.getTypeHint("extraclass", "").toUpperCase().split(" ").some(c => c === "DISABLED" || c === "READONLY");

            return this._ignoreSelect;
        }

        getValue(key: string): any {
            return this.values[key];
        }

        getFullValue(key: string): QueryResultItemValue {
            if (!this._fullValuesByName) {
                this._fullValuesByName = {};
                this.rawValues.forEach(v => {
                    this._fullValuesByName[v.key] = v;
                });
            }

            return this._fullValuesByName[key] || (this._fullValuesByName[key] = null);
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }

        getPersistentObject(throwExceptions?: boolean): Promise<PersistentObject> {
            return this.query.queueWork(async () => {
                try {
                    const po = await this.service.getPersistentObject(this.query.parent, this.query.persistentObject.id, this.id);
                    po.ownerQuery = this.query;

                    return po;
                }
                catch (e) {
                    this.query.setNotification(e);
                    if (throwExceptions)
                        throw e;

                    return null;
                }
            }, false);
        }

        _toServiceObject() {
            const result = this.copyProperties(["id"]);
            result.values = this.rawValues.map(v => v._toServiceObject());

            return result;
        }
    }
}
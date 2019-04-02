namespace Vidyano {
    export class PersistentObjectAttributeGroup extends Vidyano.Common.Observable<PersistentObjectAttributeGroup> {
        private _attributes: PersistentObjectAttribute[];
        label: string;
        index: number;

        constructor(public service: Service, public key: string, _attributes: PersistentObjectAttribute[], public parent: PersistentObject) {
            super();

            this.label = key || "";
            this.attributes = _attributes;
        }

        get attributes(): PersistentObjectAttribute[] {
            return this._attributes;
        }

        set attributes(attributes: PersistentObjectAttribute[]) {
            const oldAttributes = this._attributes;
            const newAttributes = attributes;
            newAttributes.forEach(attr => newAttributes[attr.name] = attr);

            this.notifyPropertyChanged("attributes", this._attributes = newAttributes, oldAttributes);
        }
    }
}
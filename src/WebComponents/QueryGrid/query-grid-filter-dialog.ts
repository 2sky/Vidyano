namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            persistentObject: {
                type: Object,
                readOnly: true
            }
        },
        forwardObservers: [
            "persistentObject.isBusy"
        ]
    })
    export class QueryGridFilterDialog extends Dialog {
        readonly persistentObject: Vidyano.PersistentObject; private _setPersistentObject: (persistentObject: Vidyano.PersistentObject) => void;

        constructor(private _filters: QueryFilters, private _filter: QueryFilter) {
            super();

            this._setPersistentObject(_filter.persistentObject);
            this.persistentObject.beginEdit();
        }

        private async _save() {
            const isNew = this.persistentObject.isNew;
            if (await this._filters.save(this._filter)) {
                super.close();
                return;
            }

            this._setPersistentObject(this._filter.persistentObject);
        }

        close(result?: any) {
            this._filter.persistentObject.cancelEdit();
            super.close();
        }
    }

    @WebComponent.register({
        properties: {
            attribute: {
                type: Object,
                observer: "_attributeChanged"
            },
            grouping: {
                type: String,
                readOnly: true,
                observer: "_groupingChanged"
            },
            group: {
                type: String,
                notify: true,
                value: null
            },
            name: {
                type: String,
                notify: true,
                value: null
            }
        },
        observers: [
            "_updateAttributeValue(attribute, name, group)"
        ]
    })
    export class QueryGridFilterDialogName extends WebComponent {
        readonly grouping: boolean; private _setGrouping: (grouping: boolean) => void;
        attribute: Vidyano.PersistentObjectAttribute;
        group: string;
        name: string;

        connectedCallback() {
            super.connectedCallback();

            this._groupingChanged(this.grouping);
        }

        private _attributeChanged(attribute: Vidyano.PersistentObjectAttribute) {
            if (!attribute)
                return;

            const name = <string>attribute.value;
            this._setGrouping(name ? name.contains("\n") : false);

            if (!this.grouping)
                this.name = name;
            else {
                const parts = name.split("\n");
                this.group = parts[0];
                this.name = parts[1];
            }
        }

        private _groupingChanged(grouping: boolean, previous?: boolean) {
            const input = <HTMLInputElement>this.shadowRoot.querySelector(`input.${grouping ? "group" : "name"}`);

            input.selectionStart = 0;
            if (grouping && previous !== false && input.value)
                input.selectionEnd = input.value.length;
            else
                input.selectionEnd = 0;

            this._focusElement(input);
        }

        private _toggleGrouping() {
            this._setGrouping(!this.grouping);
            if (!this.grouping)
                this.group = "";
        }

        private _updateAttributeValue(attribute: Vidyano.PersistentObjectAttribute, name: string, group: string) {
            attribute.setValue(name && group ? `${group}\n${name}` : name);
        }
    }
}
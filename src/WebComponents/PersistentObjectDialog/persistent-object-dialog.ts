module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            persistentObject: {
                type: Object,
                readOnly: true
            },
            tab: {
                type: Object,
                computed: "_computeTab(persistentObject)"
            }
        },
        hostAttributes: {
            "dialog": ""
        },
        keybindings: {
            "esc": {
                listener: "_cancel",
                priority: Number.MAX_VALUE
            }
        }
    })
    export class PersistentObjectDialog extends WebComponent {
        private _dialog: WebComponents.DialogInstance;
        private _saveHook: (po: Vidyano.PersistentObject) => Promise<any>;
        persistentObject: Vidyano.PersistentObject;
        tab: Vidyano.PersistentObjectAttributeTab;

        private _setPersistentObject: (persistentObject: Vidyano.PersistentObject) => void;

        show(persistentObject: Vidyano.PersistentObject, save?: (po: Vidyano.PersistentObject) => Promise<any>): Promise<any> {
            this._setPersistentObject(persistentObject);
            this.persistentObject.beginEdit();

            this._saveHook = save;

            this._dialog = (<WebComponents.Dialog><any>this.$["dialog"]).show();
            return this._dialog.result;
        }

        private _save() {
            (this._saveHook ? this._saveHook(this.persistentObject) : this.persistentObject.save()).then(() => {
                this._dialog.resolve(this.persistentObject);
            });
        }

        private _cancel() {
            this.persistentObject.cancelEdit();
            this._dialog.resolve();
        }

        private _computeTab(persistentObject: Vidyano.PersistentObject): Vidyano.PersistentObjectAttributeTab {
            if (!persistentObject)
                return null;

            var tab = <Vidyano.PersistentObjectAttributeTab>Enumerable.from(persistentObject.tabs).firstOrDefault(tab => tab instanceof Vidyano.PersistentObjectAttributeTab);
            tab.columnCount = 1;

            return tab;
        }

        private _onSelectAction(e: Event) {
            this._dialog.resolve(parseInt((<HTMLElement>e.target).getAttribute("data-action-index"), 10));

            e.stopPropagation();
        }
    }
}
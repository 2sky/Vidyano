module Vidyano.WebComponents {
    @Dialog.register({
        properties: {
            persistentObject: Object,
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
    export class PersistentObjectDialog extends Dialog {
        private _saveHook: (po: Vidyano.PersistentObject) => Promise<any>;
        tab: Vidyano.PersistentObjectAttributeTab;

        constructor(public persistentObject: Vidyano.PersistentObject) {
            super();

            persistentObject.beginEdit();
        }

        private _save() {
            (this._saveHook ? this._saveHook(this.persistentObject) : this.persistentObject.save()).then(() => {
                this.instance.resolve(this.persistentObject);
            });
        }

        private _cancel() {
            if (this.persistentObject) {
                this.persistentObject.cancelEdit();
                this.cancel();
            }
        }

        private _computeTab(persistentObject: Vidyano.PersistentObject): Vidyano.PersistentObjectAttributeTab {
            if (!persistentObject)
                return null;

            var tab = <Vidyano.PersistentObjectAttributeTab>Enumerable.from(persistentObject.tabs).firstOrDefault(tab => tab instanceof Vidyano.PersistentObjectAttributeTab);
            tab.columnCount = 1;

            return tab;
        }

        private _onSelectAction(e: Event) {
            this.instance.resolve(parseInt((<HTMLElement>e.target).getAttribute("data-action-index"), 10));

            e.stopPropagation();
        }
    }
}
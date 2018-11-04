namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            persistentObject: Object,
            persistentObjectLoader: {
                type: Object,
                observer: "_persistentObjectLoaderChanged"
            },
            tabs: {
                type: Array,
                computed: "_computePreviewTabs(persistentObject.tabs)"
            },
            tab: {
                type: Object,
                readOnly: true,
                notify: true
            },
            loading: {
                type: Boolean,
                computed: "_computeLoading(persistentObjectLoader)",
                value: true
            }
        }
    })
    export class PersistentObjectSlideInPanel extends Vidyano.WebComponents.SlideIn {
        persistentObjectLoader: Promise<Vidyano.PersistentObject>;
        persistentObject: Vidyano.PersistentObject;
        readonly tab: Vidyano.PersistentObjectTab; private _setTab: (tab: Vidyano.PersistentObjectTab) => void;
        readonly tabs: Vidyano.PersistentObjectTab[]; private _setTabs: (tabs: Vidyano.PersistentObjectTab[]) => void;

        private async _persistentObjectLoaderChanged(loader: Promise<Vidyano.PersistentObject>) {
            if (!loader)
                return;

            try {
                this.persistentObject = null;
                this.open = true;

                this.persistentObject = await loader;
            }
            catch (e) {
                // TODO
            }
            finally {
                this.persistentObjectLoader = null;
            }
        }

        private _computeLoading(loader: Promise<Vidyano.PersistentObject>): boolean {
            return !!loader;
        }
    }
}
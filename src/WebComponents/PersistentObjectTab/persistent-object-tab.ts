namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            tab: Object,
            columns: {
                type: Number,
                computed: "_computeColumns(size, tab.columnCount)"
            },
            size: Object,
            autofocus: {
                type: Boolean,
                reflectToAttribute: true,
                value: true
            }
        },
        observers: [
            "_autofocus(autofocus, tab.parent.isEditing)"
        ],
        listeners: {
            "attribute-loaded": "_attributeLoaded"
        },
        forwardObservers: [
            "tab.parent.isEditing",
            "tab.groups"
        ]
    })
    export class PersistentObjectTab extends WebComponent {
        private _attributePresenters: Vidyano.WebComponents.PersistentObjectAttributePresenter[];
        private _autofocusTarget: Vidyano.WebComponents.PersistentObjectAttributePresenter;
        tab: Vidyano.PersistentObjectAttributeTab;
        autofocus: boolean;

        private _computeColumns(size: ISize, defaultColumnCount: number): number {
            if (defaultColumnCount)
                return defaultColumnCount;

            if (size.width >= 1500)
                return 4;
            else if (size.width > 1000)
                return 3;
            else if (size.width > 500)
                return 2;

            return 1;
        }

        private _autofocus(autofocus: boolean, isEditing: boolean) {
            if (autofocus && isEditing && this._autofocusTarget)
                this.async(() => this._autofocusTarget.focus());
        }

        private _attributeLoaded(e: CustomEvent, detail: { attribute: Vidyano.PersistentObjectAttribute }) {
            if (!this._attributePresenters)
                this._attributePresenters = [];

            const presenter = <Vidyano.WebComponents.PersistentObjectAttributePresenter>e.target;
            this._attributePresenters.push(presenter);

            if (this._attributePresenters.length < this.tab.attributes.length)
                return;

            this._attributePresenters = this._attributePresenters.sort((attr1, attr2) => attr1.attribute.offset - attr2.attribute.offset);
            this._autofocusTarget = Enumerable.from(this._attributePresenters).firstOrDefault(a => !a.hidden && !a.disabled && !a.readOnly);
            if (!this.autofocus || !this._autofocusTarget)
                return;

            if (document.activeElement && document.activeElement.tagName === "INPUT")
                return;

            this._autofocusTarget.focus();
        }
    }
}
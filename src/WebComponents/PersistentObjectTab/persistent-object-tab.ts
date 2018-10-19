namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            tab: Object,
            columns: {
                type: Number,
                reflectToAttribute: true,
                value: null
            },
            maxColumns: {
                type: Number,
                reflectToAttribute: true,
                value: 4
            },
            size: Object,
            innerSize: {
                type: Object,
                observer: "_innerSizeChanged"
            },
            autofocus: {
                type: Boolean,
                reflectToAttribute: true,
                value: true
            },
            noScroll: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
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
    export class PersistentObjectTab extends WebComponent implements IConfigurable {
        private _attributePresenters: Vidyano.WebComponents.PersistentObjectAttributePresenter[];
        private _autofocusTarget: Vidyano.WebComponents.PersistentObjectAttributePresenter;
        tab: Vidyano.PersistentObjectAttributeTab;
        columns: number;
        maxColumns: number;
        autofocus: boolean;

        detached() {
            super.detached();

            this._attributePresenters = this._autofocusTarget = null;
        }

        private _computeColumnCount(columns: number, size: ISize, defaultColumnCount: number): number {
            if (defaultColumnCount || columns)
                return defaultColumnCount || columns;

            if (this.maxColumns > 4 && size.width >= 2000)
                return Math.min(Math.floor(size.width / 500), this.maxColumns);

            if (size.width >= 1500)
                return Math.min(4, this.maxColumns);
            else if (size.width > 1000)
                return Math.min(3, this.maxColumns);
            else if (size.width > 500)
                return Math.min(2, this.maxColumns);

            return 1;
        }

        private _autofocus(autofocus: boolean, isEditing: boolean) {
            if (autofocus && isEditing && this._autofocusTarget)
                this._focusElement(this._autofocusTarget);
        }

        private _attributeLoaded(e: CustomEvent, detail: { attribute: Vidyano.PersistentObjectAttribute }) {
            if (!this.autofocus)
                return;

            if (!this._attributePresenters)
                this._attributePresenters = [];

            const presenter = <Vidyano.WebComponents.PersistentObjectAttributePresenter>e.target;
            this._attributePresenters.push(presenter);

            if (this._attributePresenters.length < this.tab.attributes.length)
                return;

            this._attributePresenters = this._attributePresenters.sort((attr1, attr2) => attr1.attribute.offset - attr2.attribute.offset);
            this._autofocusTarget = Enumerable.from(this._attributePresenters).firstOrDefault(a => !a.hidden && !a.disabled && !a.readOnly);
            if (!this._autofocusTarget)
                return;

            if (document.activeElement && document.activeElement.tagName === "INPUT")
                return;

            if (!!this.findParent(e => e instanceof Vidyano.WebComponents.PersistentObjectAttributePresenter, this._autofocusTarget.parentElement))
                return;

            this._focusElement(this._autofocusTarget);
        }

        private _innerSizeChanged(size: ISize) {
            this.fire("vi-persistent-object-tab-inner-size-changed", { size: size }, { bubbles: true});
        }

        _viConfigure(actions: IConfigurableAction[]) {
            if (this.tab.target instanceof Vidyano.PersistentObject) {
                if ((<Vidyano.PersistentObject>this.tab.target).isSystem)
                    return;
            }

            const tab = <Vidyano.PersistentObjectAttributeTab>this.tab;
            actions.push({
                label: `Attribute tab: ${tab.label}`,
                icon: "viConfigure",
                action: () => this.app.changePath(`Management/PersistentObject.9b7a3b94-cf71-4284-bac3-de4d2790c868/${tab.id}`)
            });
        }
    }
}
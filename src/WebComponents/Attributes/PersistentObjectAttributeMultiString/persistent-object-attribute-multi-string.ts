namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @Sortable.register
    export class PersistentObjectAttributeMultiStringItems extends Sortable {
        protected _dragEnd() {
            this.fire("reorder-strings", {}, { bubbles: true });
        }
    }

    @WebComponent.register({
        properties: {
            value: {
                type: String,
                observer: "_valueChanged"
            },
            isReadOnly: {
                type: Boolean,
                reflectToAttribute: true
            },
            isNew: {
                type: Boolean,
                reflectToAttribute: true
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            },
            placeholder: String
        }
    })
    export class PersistentObjectAttributeMultiStringItem extends WebComponent {
        private _focusQueued: boolean;
        isNew: boolean;
        isReadOnly: boolean;

        constructor(public value: string) {
            super();
        }

        attached() {
            super.attached();

            if (this._focusQueued) {
                this._focusQueued = false;
                this.$.input.focus();
            }
        }

        queueFocus() {
            this._focusQueued = true;
        }

        private _valueChanged(value: string) {
            if (this.isReadOnly)
                return;

            if (this.isNew) {
                if (value) {
                    this.fire("multi-string-item-value-new", { value: value });
                    this.value = "";
                }
            }
            else
                this.fire("multi-string-item-value-changed", null);
        }

        private _onInputBlur() {
            if (!this.isReadOnly && !this.isNew)
                this.fire("multi-string-item-value-changed", null);
        }
    }

    @PersistentObjectAttribute.register({
        properties: {
            maxlength: Number,
            strings: {
                type: Array,
                computed: "_computeStrings(value, attribute.isReadOnly)"
            }
        },
        observers: [
            "_render(strings, editing, isConnected)"
        ],
        listeners: {
            "multi-string-item-value-new": "_itemValueNew",
            "multi-string-item-value-changed": "_itemValueChanged",
            "reorder-strings": "_itemsOrderChanged"
        },
        forwardObservers: [
            "attribute.isReadOnly"
        ]
    })
    export class PersistentObjectAttributeMultiString extends PersistentObjectAttribute {
        strings: PersistentObjectAttributeMultiStringItem[];
        private _setNewString: (newString: PersistentObjectAttributeMultiStringItem) => void;

        private _computeStrings(value: string, readOnly: boolean): PersistentObjectAttributeMultiStringItem[] {
            const strings = value ? value.split("\n").filter(v => !!v.length).map((v: string, n: number) => this.strings && this.strings[n] && this.strings[n].value === v ? this.strings[n] : new PersistentObjectAttributeMultiStringItem(v)) : [];
            strings.forEach(s => s.isReadOnly = readOnly);

            return strings;
        }

        private _itemValueNew(e: Event, detail: { value: string }) {
            this.value = `${this.value || ""}\n${detail.value}`;
            this.strings[this.strings.length - 1].$.input.focus();

            e.stopPropagation();
        }

        private _itemsOrderChanged() {
            const stringsContainer = <HTMLElement>Polymer.dom(this.root).querySelector("#strings");
            this.value = Enumerable.from(stringsContainer.querySelectorAll("input")).where((i: HTMLInputElement) => !!i.value).select((i: HTMLInputElement) => i.value).toArray().join("\n");
        }

        private _itemValueChanged(e: Event) {
            this.value = this.strings.filter(s => !!s.value).map(s => s.value).join("\n");

            e.stopPropagation();
        }

        private _getValues(): string[] {
            return Array.prototype.map.apply(this.querySelectorAll("#inputs > vi-resource"), [resource => resource.model.value]);
        }

        private _render(strings: PersistentObjectAttributeMultiStringItem[], editing: boolean, isConnected: boolean) {
            if (!editing || !isConnected)
                return;

            Polymer.dom(this).flush();

            const stringsContainer = <HTMLElement>Polymer.dom(this.root).querySelector("#strings");
            const diff = stringsContainer.children.length !== strings.length || strings.some((s, n) => stringsContainer.children[n] !== s);

            strings.forEach((s: PersistentObjectAttributeMultiStringItem, index: number) => {
                if (diff)
                    Polymer.dom(stringsContainer).appendChild(s);
            });

            Enumerable.from(stringsContainer.children).toArray().forEach((c: PersistentObjectAttributeMultiStringItem) => {
                if (strings.indexOf(c) < 0)
                    Polymer.dom(stringsContainer).removeChild(c);
            });
        }
    }
}
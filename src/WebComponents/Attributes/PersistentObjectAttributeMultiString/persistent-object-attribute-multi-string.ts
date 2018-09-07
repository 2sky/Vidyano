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
            input: {
                type: Object,
                readOnly: true
            },
            isNew: {
                type: Boolean,
                reflectToAttribute: true
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            },
            placeholder: String,
            sensitive: Boolean
        }
    })
    export class PersistentObjectAttributeMultiStringItem extends WebComponent {
        readonly input: HTMLInputElement; private _setInput: (input: HTMLInputElement) => void;
        private _focusQueued: boolean;
        isNew: boolean;
        isReadOnly: boolean;
        sensitive: boolean;

        constructor(public value: string) {
            super();
        }

        attached() {
            super.attached();

            this._setInput(<HTMLInputElement>Polymer.dom(this.root).querySelector("input"));

            if (this._focusQueued) {
                this._focusQueued = false;
                this._focusElement(this.input);
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

        private _computeTabIndex(isReadOnly: boolean): string {
            return isReadOnly ? "-1" : null;
        }
    }

    @PersistentObjectAttribute.register({
        properties: {
            maxlength: Number,
            strings: {
                type: Array,
                computed: "_computeStrings(value, attribute.isReadOnly, sensitive)"
            },
            isTags: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            suggestions: {
                type: Array,
                readOnly: true
            },
            hasSuggestions: {
                type: Boolean,
                computed: "_computeHasSuggestions(filteredSuggestions, readOnly)"
            },
            filteredSuggestions: {
                type: Array,
                computed: "_computeFilteredSuggestions(suggestions, strings)"
            },
            editMode: Boolean
        },
        observers: [
            "_render(strings, editing, isAttached)",
            "_onStringsChange(strings.splices)",
            "_onEditingChange(editing, sensitive)"
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

        readonly isTags: boolean; private _setIsTags: (value: boolean) => void; 
        readonly suggestions: string[]; private _setSuggestions: (suggestions: string[]) => void;
        strings: PersistentObjectAttributeMultiStringItem[];
        private editMode: boolean;
        private hasSuggestions: boolean;

        private _setNewString: (newString: PersistentObjectAttributeMultiStringItem) => void;

        protected _attributeChanged() {
            super._attributeChanged();
            if (this.attribute.typeHints.istags != undefined) {
                this._setIsTags(this.attribute.typeHints.istags);
            }
            if (this.attribute.options != null && this.attribute.options.length > 0) {
                this._setSuggestions((<string[]>this.attribute.options).filter(o => !StringEx.isNullOrEmpty(o) ));
            }
          
        }

        private _onStringsChange() {
            if (this.isTags) {
                this.value = this.strings.filter(s => !!s.value).map(s => s.value).join("\n");
            }
        }

        private _computeStrings(value: string, readOnly: boolean, sensitive: boolean): PersistentObjectAttributeMultiStringItem[] {
            const strings = value ? value.split("\n").filter(v => !!v.length).map((v: string, n: number) => this.strings && this.strings[n] && this.strings[n].value === v ? this.strings[n] : new PersistentObjectAttributeMultiStringItem(v)) : [];
            strings.forEach(s => {
                s.isReadOnly = readOnly || sensitive;
                s.sensitive = sensitive;
            });
            return strings;
        }

        private _itemValueNew(e: Event, detail: { value: string }) {
            this.value = `${this.value || ""}\n${detail.value}`;

            Polymer.dom(this).flush();
            this._focusElement(this.strings[this.strings.length - 1].input);

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

        private _render(strings: PersistentObjectAttributeMultiStringItem[], editing: boolean, isAttached: boolean) {
            if (!editing || !isAttached || this.isTags)
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

        private _addSuggestionTag(e: TapEvent) {
            const newItem = new Attributes.PersistentObjectAttributeMultiStringItem(e.model.suggestion);
            newItem.sensitive = this.sensitive;
            newItem.isReadOnly = this.readOnly;
            this.push("strings", newItem)
        }

        private _computeFilteredSuggestions(suggestions: string[], strings: Attributes.PersistentObjectAttributeMultiStringItem[]): string[] {
            if (!suggestions || suggestions.length === 0)
                return [];

            let tempArray = [];
            strings.forEach(tag => tempArray.push(tag.value));
            return suggestions.filter(s => tempArray.indexOf(s) < 0);
        }

        private _onEditingChange() {
            if (!this.readOnly && !this.sensitive && this.hasSuggestions)
                this.editMode = this.editing

            else this.editMode = false
        }

        private _computeHasSuggestions(suggestions: string[], readOnly: boolean): boolean {
            return !readOnly && suggestions && suggestions.length > 0;
        }
    }
}
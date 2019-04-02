namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register()
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

        connectedCallback() {
            super.connectedCallback();

            this._setInput(<HTMLInputElement>this.shadowRoot.querySelector("input"));

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
    }

    @WebComponent.register({
        properties: {
            maxlength: Number,
            strings: {
                type: Array,
                computed: "_computeStrings(value, attribute.isReadOnly, sensitive)"
            },
            isTags: {
                type: Boolean,
                computed: "_computeIsTags(attribute)"
            },
            tags: {
                type: Array
            },
            suggestions: {
                type: Array,
                computed: "_computeTagSuggestions(attribute)"
            },
            hasSuggestions: {
                type: Boolean,
                computed: "_computeHasTagSuggestions(filteredSuggestions, editing, readOnly)"
            },
            filteredSuggestions: {
                type: Array,
                computed: "_computeFilteredSuggestions(suggestions, strings)"
            },
            isTagsReadonly: {
                type: Boolean,
                computed: "_computeIsTagsReadonly(readOnly, editing)"
            }
        },
        observers: [
            "_render(strings, editing, isConnected)",
            "_onTagsChanged(isTags, tags.*)"
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
        readonly isTags: boolean;
        readonly suggestions: string[];
        readonly hasSuggestions: boolean;
        strings: PersistentObjectAttributeMultiStringItem[];
        tags: string[];

        private _computeStrings(value: string, readOnly: boolean, sensitive: boolean): PersistentObjectAttributeMultiStringItem[] {
            const strings = value ? value.split("\n").filter(v => !!v.length).map((v: string, n: number) => this.strings && this.strings[n] && this.strings[n].value === v ? this.strings[n] : new PersistentObjectAttributeMultiStringItem(v)) : [];
            strings.forEach(s => {
                s.isReadOnly = readOnly || sensitive;
                s.sensitive = sensitive;
            });

            return strings;
        }

        private _itemValueNew(e: CustomEvent) {
            const { value }: { value: string } = e.detail;
            this.value = `${this.value || ""}\n${value}`;

            Polymer.flush();
            this._focusElement(this.strings[this.strings.length - 1].input);

            e.stopPropagation();
        }

        private _itemsOrderChanged() {
            const stringsContainer = <HTMLElement>this.shadowRoot.querySelector("#strings");
            this.value = Array.from(stringsContainer.querySelectorAll("input")).filter((i: HTMLInputElement) => !!i.value).map((i: HTMLInputElement) => i.value).join("\n");
        }

        private _itemValueChanged(e: Event) {
            this.value = this.strings.filter(s => !!s.value).map(s => s.value).join("\n");

            e.stopPropagation();
        }

        private _getValues(): string[] {
            return Array.prototype.map.apply(this.querySelectorAll("#inputs > vi-resource"), [resource => resource.model.value]);
        }

        private _render(strings: PersistentObjectAttributeMultiStringItem[], editing: boolean, isConnected: boolean) {
            if (!editing || !isConnected || this.isTags)
                return;

            Polymer.flush();

            const stringsContainer = <HTMLElement>this.shadowRoot.querySelector("#strings");
            const diff = stringsContainer.children.length !== strings.length || strings.some((s, n) => stringsContainer.children[n] !== s);

            strings.forEach((s: PersistentObjectAttributeMultiStringItem, index: number) => {
                if (diff)
                    Polymer.dom(stringsContainer).appendChild(s);
            });

            Array.from(stringsContainer.children).forEach((c: PersistentObjectAttributeMultiStringItem) => {
                if (strings.indexOf(c) < 0)
                    Polymer.dom(stringsContainer).removeChild(c);
            });
        }

        /// Tags specific code

        private _computeIsTags(attribute: Vidyano.PersistentObjectAttribute): boolean {
            return attribute && attribute.getTypeHint("inputtype", undefined, undefined, true) === "tags";
        }

        protected _valueChanged(newValue: any, oldValue: any) {
            super._valueChanged(newValue, oldValue);

            if (!newValue)
                this.tags = [];
            else
                this.tags = newValue.split("\n").filter(v => !!v.length);
        }

        private _onTagsChanged(isTags: boolean) {
            if (!this.isTags || !this.tags || !this.editing)
                return;

            const newValue = this.tags.filter(t => !!t).join("\n");
            if (this.value !== newValue)
                this.value = newValue;
        }

        private _computeTagSuggestions(attribute: Vidyano.PersistentObjectAttribute): string[] {
            if (!attribute || !attribute.options || !attribute.options.length)
                return null;

            return (<string[]>this.attribute.options).filter(o => !StringEx.isNullOrEmpty(o));
        }

        private _computeHasTagSuggestions(suggestions: string[], editing: boolean, readOnly: boolean): boolean {
            return editing && !readOnly && suggestions && suggestions.length > 0;
        }

        private _computeFilteredSuggestions(suggestions: string[], strings: Attributes.PersistentObjectAttributeMultiStringItem[]): string[] {
            if (!suggestions || suggestions.length === 0)
                return [];

            const currentStrings = strings.map(s => s.value);
            return suggestions.filter(s => currentStrings.indexOf(s) < 0);
        }

        private _computeIsTagsReadonly(readonly: boolean, editing: boolean) {
            return this.readOnly || !editing;
        }

        private _addSuggestionTag(e: TapEvent) {
            this.value = `${this.value}\n${e.model.suggestion}`;
        }
    }
}
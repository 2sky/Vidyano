namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            options: Array,
            keepUnmatched: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            selectedOption: {
                type: Object,
                observer: "_selectedOptionChanged",
                notify: true
            },
            suggestion: {
                type: Object,
                readOnly: true,
                observer: "_suggestionChanged"
            },
            groupSeparator: {
                type: String,
                value: null
            },
            ungroupedOptions: {
                type: Array,
                computed: "_computeUngroupedOptions(options, groupSeparator)"
            },
            items: {
                type: Array,
                computed: "_computeItems(options, ungroupedOptions)"
            },
            filteredItems: {
                type: Array,
                computed: "_computeFilteredItems(items, inputValue, filtering, selectedOption)"
            },
            selectedItem: {
                type: Object,
                readOnly: true,
                observer: "_selectedItemChanged"
            },
            inputValue: {
                type: String,
                notify: true,
                computed: "_forwardComputed(_inputValue)"
            },
            _inputValue: {
                type: String,
                notify: true,
                value: ""
            },
            filtering: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            readonly: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            disableFiltering: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            placeholder: String
        },
        listeners: {
            "keydown": "_keydown"
        },
        observers: [
            "_computeSuggestionFeedback(inputValue, suggestion, filtering)"
        ]
    })
    export class Select extends WebComponent {
        private items: ISelectItem[];
        private filteredItems: ISelectItem[];
        private _lastMatchedInputValue: string;
        private _inputValue: string;
        private _pendingSelectedOption: string;
        readonly suggestion: ISelectItem; private _setSuggestion: (suggestion: ISelectItem) => void;
        readonly filtering: boolean; private _setFiltering: (filtering: boolean) => void;
        readonly selectedItem: ISelectItem; private _setSelectedItem: (item: ISelectItem) => void;
        ungroupedOptions: string[] | Common.IKeyValuePair[];
        selectedOption: string;
        keepUnmatched: boolean;
        readonly: boolean;
        groupSeparator: string;

        open() {
            if (this.readonly || !this.items || this.items.length === 0)
                return;

            this.popup.popup();
        }

        private get popup(): WebComponents.Popup {
            return <WebComponents.Popup><any>this.$["popup"];
        }

        private _keydown(e: KeyboardEvent) {
            if (!this.ungroupedOptions || this.ungroupedOptions.length === 0)
                return;

            if (this.items && this.items.length > 0) {
                const currentIndex = this.filteredItems.indexOf(this.filtering ? this.suggestion : this.selectedItem);

                if (e.which === WebComponents.Keyboard.KeyCodes.downarrow) {
                    this.popup.popup();

                    if (currentIndex + 1 < this.filteredItems.length) {
                        if (this.filtering)
                            this._setSuggestion(this.filteredItems[currentIndex + 1]);
                        else
                            this._setSelectedItem(this.filteredItems[currentIndex + 1]);
                    }

                    e.stopPropagation();
                    e.preventDefault();
                }
                else if (e.which === WebComponents.Keyboard.KeyCodes.uparrow) {
                    this.popup.popup();

                    if (currentIndex > 0) {
                        if (this.filtering)
                            this._setSuggestion(this.filteredItems[currentIndex - 1]);
                        else
                            this._setSelectedItem(this.filteredItems[currentIndex - 1]);
                    }

                    e.stopPropagation();
                    e.preventDefault();
                }
                else if (e.which === WebComponents.Keyboard.KeyCodes.enter || e.which === WebComponents.Keyboard.KeyCodes.tab) {
                    this.popup.close();

                    if (this.suggestion !== this.selectedItem)
                        this._setSelectedItem(this.suggestion);
                    else
                        this._selectedItemChanged();

                    if (e.which === WebComponents.Keyboard.KeyCodes.enter) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
                else if (e.which === WebComponents.Keyboard.KeyCodes.escape) {
                    this.popup.close();

                    if (this.filtering)
                        this._setFiltering(false);

                    const currentSelectedItem = this.selectedItem;
                    this._setSelectedItem(this._getItem(this.selectedOption));
                    if (currentSelectedItem === this.selectedItem)
                        this._selectedItemChanged();

                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }

        private _keyup(e: KeyboardEvent) {
            if (this._lastMatchedInputValue !== this._inputValue && !this.filtering && e.which !== WebComponents.Keyboard.KeyCodes.enter && e.which !== WebComponents.Keyboard.KeyCodes.tab && e.which !== WebComponents.Keyboard.KeyCodes.escape)
                this._setFiltering(true);
        }

        private _blur() {
            if (this.keepUnmatched)
                return;

            if (!this.popup.open)
                this._selectedItemChanged();
        }

        private _openPopup() {
            if (!this.popup.open)
                this.popup.popup();
        }

        private _popupOpened() {
            this._scrollItemIntoView();
        }

        private _popupClosed() {
            if (this._pendingSelectedOption) {
                const pendingSelectedOption = this._pendingSelectedOption;
                this._pendingSelectedOption = undefined;

                this._setSelectedItem(this._getItem(pendingSelectedOption));
            }
        }

        private _scrollItemIntoView() {
            const focusOption = <HTMLElement>this.$$("[content] > li[selected]") || <HTMLElement>this.$$("[content] > li[suggested]");
            if (focusOption)
                (focusOption["scrollIntoViewIfNeeded"] || focusOption["scrollIntoView"]).apply(focusOption);
        }

        private _computeUngroupedOptions(options: string[] | Common.IKeyValuePair[], groupSeparator: string): string[] | Common.IKeyValuePair[] {
            if (!groupSeparator || !options || options.length === 0)
                return options;

            if ((<any[]>options).some(o => typeof o === "string"))
                return (<string[]>options).map(o => o ? o.split(groupSeparator, 2)[1] : o);
            else
                return (<Common.IKeyValuePair[]>options).map(kvp => {
                    return {
                        key: kvp.key,
                        value: kvp && kvp.value ? kvp.value.split(groupSeparator, 2)[1] : ""
                    };
                });
        }

        private _computeItems(options: string[] | Common.IKeyValuePair[], ungroupedOptions: string[] | Common.IKeyValuePair[]): ISelectItem[] {
            if (!options || options.length === 0)
                return [];

            const isKvp = !(<any[]>options).some(o => typeof o === "string");

            let groupFirstOptions: Map<any, any>;
            if (this.groupSeparator) {
                let optionsByGroup: linqjs.Grouping<string, any>[];

                if (!isKvp)
                    optionsByGroup = Enumerable.from(<string[]>options).groupBy(o => {
                        const parts = o ? o.split(this.groupSeparator, 2) : [];
                        return parts.length === 2 ? parts[0] || null : null;
                    }, o => o).toArray();
                else {
                    optionsByGroup = Enumerable.from(<Common.IKeyValuePair[]>options).groupBy(kvp => {
                        const displayValue = kvp ? kvp.value : null;
                        const displayParts = displayValue ? displayValue.split(this.groupSeparator, 2) : [];
                        return displayParts.length === 2 ? displayParts[0] || null : null;
                    }, o => o).toArray();
                }

                groupFirstOptions = new Map();
                optionsByGroup.forEach(g => {
                    g.forEach((o, n) => groupFirstOptions.set(o, { name: g.key(), first: n === 0 }));
                });
            }

            let result: ISelectItem[];
            if (!isKvp )
                result = (<string[]>options).map((o, n) => {
                    const group = groupFirstOptions ? groupFirstOptions.get(o) : null;
                    return {
                        displayValue: <string>ungroupedOptions[n],
                        group: group ? group.name : null,
                        groupFirst: group ? group.first : null,
                        option: ungroupedOptions[n]
                    };
                });
            else {
                result = (<Common.IKeyValuePair[]>options).map((kvp, index) => {
                    const ungroupedKvp = <Common.IKeyValuePair>ungroupedOptions[index];
                    const group = groupFirstOptions ? groupFirstOptions.get(kvp) : null;

                    return {
                        displayValue: ungroupedKvp ? ungroupedKvp.value : "",
                        group: group ? group.name : null,
                        groupFirst: group ? group.first : null,
                        option: ungroupedKvp
                    };
                });
            }

            return result;
        }

        private _computeFilteredItems(items: ISelectItem[], inputValue: string, filtering: boolean, selectedOption: string): ISelectItem[] {
            let result = items;
            if (result.length === 0)
                return result;

            if (filtering) {
                if (!StringEx.isNullOrEmpty(inputValue)) {
                    const lowerInputValue = inputValue.toLowerCase();
                    result = result.filter(r => r != null && r.displayValue && r.displayValue.toLowerCase().startsWith(lowerInputValue));

                    if (!this.suggestion || result.indexOf(this.suggestion) < 0)
                        this._setSuggestion(result[0] !== undefined ? result[0] : null);
                }
                else {
                    const resultEnum = Enumerable.from(result);
                    let suggestion: ISelectItem;
                    if (result[0].option == null)
                        suggestion = result[0];
                    else if (typeof result[0].option === "string") {
                        suggestion = resultEnum.firstOrDefault(o => o.option == null);
                        if (!suggestion)
                            suggestion = resultEnum.firstOrDefault(o => (<string>o.option).length === 0);
                    }
                    else {
                        suggestion = resultEnum.firstOrDefault(o => (<Common.IKeyValuePair>o.option).key == null);
                        if (!suggestion)
                            suggestion = resultEnum.firstOrDefault(o => (<Common.IKeyValuePair>o.option).key.length === 0);
                    }

                    this._setSuggestion(suggestion);
                }

                if (!this.popup.open && result.length > 1)
                    this.popup.popup();
            }
            else if (!this.selectedItem)
                this._setSelectedItem(this._getItem(this.selectedOption));

            return result;
        }

        private _computeSuggestionFeedback(inputValue: string, suggestion: ISelectItem, filtering: boolean) {
            let suggestionMatch = "";
            let suggestionRemainder = "";

            if (filtering && suggestion && suggestion.displayValue) {
                suggestionMatch = inputValue;
                suggestionRemainder = suggestion.displayValue.substr(inputValue.length);
            }

            this.$["match"].innerHTML = this._escapeHTML(suggestionMatch).replace(" ", "&nbsp;");
            this.$["remainder"].innerHTML = this._escapeHTML(suggestionRemainder).replace(" ", "&nbsp;");
        }

        private _setSelectedOption(option: string | Common.IKeyValuePair, force?: boolean) {
            if (option && typeof option !== "string")
                option = (<Common.IKeyValuePair>option).key;

            if (this.popup.open && !force) {
                this._pendingSelectedOption = <string>option;
                this._scrollItemIntoView();

                return;
            }

            this.selectedOption = <string>option;
        }

        private _selectedItemChanged() {
            this._setFiltering(false);

            if (this.selectedItem) {
                if (!this.selectedItem.option || typeof this.selectedItem.option === "string") {
                    this._setSelectedOption(Enumerable.from(<string[]>this.ungroupedOptions).firstOrDefault(o => o === this.selectedItem.option));
                    this._inputValue = <string>this.selectedItem.option;
                }
                else {
                    this._setSelectedOption(Enumerable.from(<Common.IKeyValuePair[]>this.ungroupedOptions).firstOrDefault(o => o.key === (<Common.IKeyValuePair>this.selectedItem.option).key));
                    this._inputValue = (<Common.IKeyValuePair>this.selectedItem.option).value;
                }

                this._lastMatchedInputValue = this._inputValue;
                this._setSuggestion(this.selectedItem);
            }
            else {
                this._setSuggestion(null);
                this._inputValue = "";
            }
        }

        private _selectedOptionChanged() {
            this._setFiltering(false);

            this._setSelectedItem(this._getItem(this.selectedOption));
            this._scrollItemIntoView();
        }

        private _suggestionChanged() {
            if (!this.filtering && this.suggestion)
                this._setSelectedOption(this.suggestion.option);
        }

        private _getItem(key: string, items: ISelectItem[] = this.items): ISelectItem {
            return Enumerable.from(items || []).firstOrDefault(i => {
                if (!i.option || typeof i.option === "string")
                    return i.option === key;
                else
                    return (<Common.IKeyValuePair>i.option).key === key;
            });
        }

        private _select(e: CustomEvent, detail: any) {
            this._setSelectedOption(detail.option, true);
            this.popup.close();

            e.stopPropagation();
        }

        private _equals(item1: ISelectItem, item2: ISelectItem): boolean {
            return item1 != null && item2 != null && item1.option === item2.option;
        }

        private _isReadonlyInput(readonly: boolean, disableFiltering: boolean): boolean {
            return readonly || disableFiltering;
        }

        private _disablePopup(readonly: boolean, disabled: boolean): boolean {
            return readonly || disabled;
        }

        private _showGroup(item: ISelectItem): boolean {
            return item.group && item.groupFirst;
        }
    }

    export interface ISelectItem {
        displayValue: string;
        group: string;
        groupFirst: boolean;
        option: string | Common.IKeyValuePair;
    }

    @WebComponent.register({
        extends: "li",
        properties: {
            suggested: {
                type: Boolean,
                reflectToAttribute: true
            },
            selected: {
                type: Boolean,
                reflectToAttribute: true
            },
            item: Object,
            group: {
                type: String,
                reflectToAttribute: true,
                computed: "item.group"
            }
        },
        listeners: {
            "tap": "_onTap"
        }
    })
    export class SelectOptionItem extends WebComponent {
        item: ISelectItem;

        private _onTap(e: TapEvent) {
            this.fire("select-option", { option: this.item.option }, { bubbles: true });

            e.stopPropagation();
        }
    }
}

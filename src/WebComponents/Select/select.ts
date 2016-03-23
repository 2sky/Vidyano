namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            options: Array,
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
            items: {
                type: Array,
                computed: "_computeItems(options)"
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
            disableFiltering: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
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
        private selectedItem: ISelectItem;
        private suggestion: ISelectItem;
        private filtering: boolean;
        private _lastMatchedInputValue: string;
        private _inputValue: string;
        private _pendingSelectedOption: string;
        options: string[] | Common.IKeyValuePair[];
        selectedOption: string;

        private _setSuggestion: (suggestion: ISelectItem) => void;
        private _setSelectedItem: (item: ISelectItem) => void;
        private _setFiltering: (filtering: boolean) => void;

        private get popup(): WebComponents.Popup {
            return <WebComponents.Popup><any>this.$["popup"];
        }

        private _keydown(e: KeyboardEvent) {
            if (!this.options || this.options.length === 0)
                return;

            if (this.items && this.items.length > 0) {
                const currentIndex = this.filteredItems.indexOf(this.filtering ? this.suggestion : this.selectedItem);

                if (e.which === WebComponents.Keyboard.KeyCodes.downarrow) {
                    this.popup.popup();

                    if (currentIndex + 1 < this.items.length) {
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

        private _computeItems(options: string[] | Common.IKeyValuePair[]): ISelectItem[] {
            if (!options || options.length === 0)
                return [];

            let result: ISelectItem[];
            if ((<any[]>options).some(o => typeof o === "string"))
                result = (<string[]>options).map(o => {
                    return {
                        displayValue: o,
                        option: o
                    };
                });
            else {
                result = (<Common.IKeyValuePair[]>options).map(kvp => {
                    return {
                        displayValue: kvp ? kvp.value : "",
                        option: kvp
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

            this.$["match"].innerHTML = this.escapeHTML(suggestionMatch).replace(" ", "&nbsp;");
            this.$["remainder"].innerHTML = this.escapeHTML(suggestionRemainder).replace(" ", "&nbsp;");
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
                this._setSelectedOption(Enumerable.from(<any[]>this.options).firstOrDefault(o => o === this.selectedItem.option));

                if (!this.selectedItem.option || typeof this.selectedItem.option === "string")
                    this._inputValue = <string>this.selectedItem.option;
                else
                    this._inputValue = (<Common.IKeyValuePair>this.selectedItem.option).value;

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
            return  Enumerable.from(items || []).firstOrDefault(i => {
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
    }

    export interface ISelectItem {
        displayValue: string;
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
            item: Object
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

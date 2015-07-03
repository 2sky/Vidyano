module Vidyano.WebComponents {
    interface SelectOption {
        displayValue: string;
        option: string | Common.KeyValuePair;
    }

    export class Select extends WebComponent {
        private items: SelectOption[];
        private filteredItems: SelectOption[];
        private selectedItem: SelectOption;
        private suggestion: SelectOption;
        private filtering: boolean;
        private _lastMatchedInputValue: string;
        private _inputValue: string;
        private _pendingSelectedOption: string;
        options: string[] | Common.KeyValuePair[];
        selectedOption: string;

        private _setSuggestion: (suggestion: SelectOption) => void;
        private _setSelectedItem: (item: SelectOption) => void;
        private _setFiltering: (filtering: boolean) => void;

        private get popup(): WebComponents.Popup {
            return <WebComponents.Popup><any>this.$["popup"];
        }

        private _keydown(e: KeyboardEvent) {
            if (!this.options || this.options.length == 0)
                return;

            if (this.items && this.items.length > 0) {
                var currentIndex = this.filteredItems.indexOf(this.filtering ? this.suggestion : this.selectedItem);

                if (e.which == WebComponents.Keyboard.KeyCodes.downarrow) {
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
                else if (e.which == WebComponents.Keyboard.KeyCodes.uparrow) {
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
                else if (e.which == WebComponents.Keyboard.KeyCodes.enter || e.which == WebComponents.Keyboard.KeyCodes.tab) {
                    this.popup.close();

                    if (this.suggestion !== this.selectedItem)
                        this._setSelectedItem(this.suggestion);
                    else
                        this._selectedItemChanged();

                    if (e.which == WebComponents.Keyboard.KeyCodes.enter) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
                else if (e.which == WebComponents.Keyboard.KeyCodes.escape) {
                    this.popup.close();

                    if (this.filtering)
                        this._setFiltering(false);

                    var currentSelectedItem = this.selectedItem;
                    this._setSelectedItem(this._getItem(this.selectedOption));
                    if (currentSelectedItem == this.selectedItem)
                        this._selectedItemChanged();

                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }

        private _keyup(e: KeyboardEvent) {
            if (this._lastMatchedInputValue != this._inputValue && !this.filtering && e.which != WebComponents.Keyboard.KeyCodes.enter && e.which != WebComponents.KeyCodes.tab && e.which != WebComponents.KeyCodes.escape)
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
                var pendingSelectedOption = this._pendingSelectedOption;
                this._pendingSelectedOption = undefined;

                this._setSelectedItem(this._getItem(pendingSelectedOption));
            }
        }

        private _scrollItemIntoView() {
            var focusOption = <HTMLElement>this.$$("[content] .option[selected]") || <HTMLElement>this.$$("[content] .option[suggested]");
            if(focusOption)
                focusOption.scrollIntoView();
        }

        private _computeItems(options: string[]| Common.KeyValuePair[]): SelectOption[]{
            if (!options || options.length == 0)
                return [];

            var result: SelectOption[];
            if ((<any[]>options).some(o => typeof o == "string"))
                result = (<string[]>options).map(o => {
                    return {
                        displayValue: o,
                        option: o
                    };
                });
            else {
                result = (<Common.KeyValuePair[]>options).map(kvp => {
                    return {
                        displayValue: kvp ? kvp.value : "",
                        option: kvp
                    };
                });
            }

            return result;
        }

        private _computeFilteredItems(items: SelectOption[], inputValue: string, filtering: boolean, selectedOption: string): SelectOption[]{
            var result = items;
            if (result.length == 0)
                return result;
            
            if (filtering) {
                if (!StringEx.isNullOrEmpty(inputValue)) {
                    var lowerInputValue = inputValue.toLowerCase();
                    result = result.filter(r => r != null && r.displayValue && r.displayValue.toLowerCase().startsWith(lowerInputValue));

                    if (!this.suggestion || result.indexOf(this.suggestion) < 0)
                        this._setSuggestion(result[0] !== undefined ? result[0] : null);
                }
                else {
                    var resultEnum = Enumerable.from(result);
                    var suggestion: SelectOption;
                    if (result[0].option == null)
                        suggestion = result[0];
                    else if (typeof result[0].option === "string") {
                        suggestion = resultEnum.firstOrDefault(o => o.option == null);
                        if (!suggestion)
                            suggestion = resultEnum.firstOrDefault(o => (<string>o.option).length == 0);
                    }
                    else {
                        suggestion = resultEnum.firstOrDefault(o => (<Common.KeyValuePair>o.option).key == null);
                        if (!suggestion)
                            suggestion = resultEnum.firstOrDefault(o => (<Common.KeyValuePair>o.option).key.length == 0);
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

        private _computeSuggestionFeedback(inputValue: string, suggestion: SelectOption, filtering: boolean) {
            var suggestionMatch = "";
            var suggestionRemainder = "";

            if (filtering && suggestion && suggestion.displayValue) {
                suggestionMatch = inputValue;
                suggestionRemainder = suggestion.displayValue.substr(inputValue.length);
            }

            this.$["match"].innerHTML = this.escapeHTML(suggestionMatch).replace(" ", "&nbsp;");
            this.$["remainder"].innerHTML = this.escapeHTML(suggestionRemainder).replace(" ", "&nbsp;");
        }

        private _setSelectedOption(option: string | Common.KeyValuePair, force?: boolean) {
            if (option && typeof option !== "string")
                option = (<Common.KeyValuePair>option).key;

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
                this._setSelectedOption(Enumerable.from(<any[]>this.options).firstOrDefault(o => o == this.selectedItem.option));

                if (!this.selectedItem.option || typeof this.selectedItem.option == "string")
                    this._inputValue = <string>this.selectedItem.option;
                else
                    this._inputValue = (<Common.KeyValuePair>this.selectedItem.option).value;

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

        private _getItem(key: string, items: SelectOption[] = this.items): SelectOption {
            var result = Enumerable.from(items || []).firstOrDefault(i => {
                if (!i.option || typeof i.option === "string")
                    return i.option == key;
                else
                    return (<Common.KeyValuePair>i.option).key == key;
            });

            return result;
        }

        private _optionTap(e: CustomEvent, detail: any) {
            var option = <HTMLElement>e.target;
            if (option.classList && option.classList.contains("option")) {
                this._setSelectedOption(this.items[parseInt(option.getAttribute("data-option-index"), 10)].option, true);
                this.popup.close();

                if (detail.sourceEvent)
                    detail.sourceEvent.stopPropagation();

                e.stopPropagation();
            }
        }

        private _equals(item1: SelectOption, item2: SelectOption): boolean {
            return item1 == item2;
        }

        private _isReadonlyInput(readonly: boolean, disableFiltering: boolean): boolean {
            return readonly || disableFiltering;
        }
    }

    WebComponent.register(Select, WebComponents, "vi", {
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
    });
}
module Vidyano.WebComponents {
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
        private items: SelectItem[];
        private filteredItems: SelectItem[];
        private selectedItem: SelectItem;
        private suggestion: SelectItem;
        private filtering: boolean;
        private _lastMatchedInputValue: string;
        private _inputValue: string;
        private _pendingSelectedOption: string;
        options: string[] | Common.KeyValuePair[];
        selectedOption: string;

        private _setSuggestion: (suggestion: SelectItem) => void;
        private _setSelectedItem: (item: SelectItem) => void;
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
            if (this._lastMatchedInputValue != this._inputValue && !this.filtering && e.which != WebComponents.Keyboard.KeyCodes.enter && e.which != WebComponents.Keyboard.KeyCodes.tab && e.which != WebComponents.Keyboard.KeyCodes.escape)
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
            var focusOption = <HTMLElement>this.$$("[content] > li[selected]") || <HTMLElement>this.$$("[content] > li[suggested]");
            if (focusOption) {
                (focusOption["scrollIntoViewIfNeeded"] || focusOption["scrollIntoView"]).apply(focusOption);
            }
        }

        private _computeItems(options: string[] | Common.KeyValuePair[]): SelectItem[] {
            if (!options || options.length == 0)
                return [];

            var result: SelectItem[];
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

        private _computeFilteredItems(items: SelectItem[], inputValue: string, filtering: boolean, selectedOption: string): SelectItem[] {
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
                    var suggestion: SelectItem;
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

        private _computeSuggestionFeedback(inputValue: string, suggestion: SelectItem, filtering: boolean) {
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

        private _getItem(key: string, items: SelectItem[] = this.items): SelectItem {
            var result = Enumerable.from(items || []).firstOrDefault(i => {
                if (!i.option || typeof i.option === "string")
                    return i.option == key;
                else
                    return (<Common.KeyValuePair>i.option).key == key;
            });

            return result;
        }

        private _select(e: CustomEvent, detail: any) {
            this._setSelectedOption(detail.option, true);
            this.popup.close();

            e.stopPropagation();
        }

        private _equals(item1: SelectItem, item2: SelectItem): boolean {
            return item1.option == item2.option;
        }

        private _isReadonlyInput(readonly: boolean, disableFiltering: boolean): boolean {
            return readonly || disableFiltering;
        }
    }

    export interface SelectItem {
        displayValue: string;
        option: string | Common.KeyValuePair;
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
        item: SelectItem;

        private _onTap(e: TapEvent) {
            this.fire("select-option", { option: this.item.option }, { bubbles: true });

            e.stopPropagation();
        }
    }
}
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var Select = (function (_super) {
            __extends(Select, _super);
            function Select() {
                _super.apply(this, arguments);
            }
            Object.defineProperty(Select.prototype, "popup", {
                get: function () {
                    return this.$["popup"];
                },
                enumerable: true,
                configurable: true
            });
            Select.prototype._keydown = function (e) {
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
            };
            Select.prototype._keyup = function (e) {
                if (this._lastMatchedInputValue != this._inputValue && !this.filtering && e.which != WebComponents.Keyboard.KeyCodes.enter && e.which != WebComponents.Keyboard.KeyCodes.tab && e.which != WebComponents.Keyboard.KeyCodes.escape)
                    this._setFiltering(true);
            };
            Select.prototype._openPopup = function () {
                if (!this.popup.open)
                    this.popup.popup();
            };
            Select.prototype._popupOpened = function () {
                this._scrollItemIntoView();
            };
            Select.prototype._popupClosed = function () {
                if (this._pendingSelectedOption) {
                    var pendingSelectedOption = this._pendingSelectedOption;
                    this._pendingSelectedOption = undefined;
                    this._setSelectedItem(this._getItem(pendingSelectedOption));
                }
            };
            Select.prototype._scrollItemIntoView = function () {
                var focusOption = this.$$("[content] .option[selected]") || this.$$("[content] .option[suggested]");
                if (focusOption)
                    focusOption.scrollIntoView();
            };
            Select.prototype._computeItems = function (options) {
                if (!options || options.length == 0)
                    return [];
                var result;
                if (options.some(function (o) { return typeof o == "string"; }))
                    result = options.map(function (o) {
                        return {
                            displayValue: o,
                            option: o
                        };
                    });
                else {
                    result = options.map(function (kvp) {
                        return {
                            displayValue: kvp ? kvp.value : "",
                            option: kvp
                        };
                    });
                }
                return result;
            };
            Select.prototype._computeFilteredItems = function (items, inputValue, filtering, selectedOption) {
                var result = items;
                if (result.length == 0)
                    return result;
                if (filtering) {
                    if (!StringEx.isNullOrEmpty(inputValue)) {
                        var lowerInputValue = inputValue.toLowerCase();
                        result = result.filter(function (r) { return r != null && r.displayValue && r.displayValue.toLowerCase().startsWith(lowerInputValue); });
                        if (!this.suggestion || result.indexOf(this.suggestion) < 0)
                            this._setSuggestion(result[0] !== undefined ? result[0] : null);
                    }
                    else {
                        var resultEnum = Enumerable.from(result);
                        var suggestion;
                        if (result[0].option == null)
                            suggestion = result[0];
                        else if (typeof result[0].option === "string") {
                            suggestion = resultEnum.firstOrDefault(function (o) { return o.option == null; });
                            if (!suggestion)
                                suggestion = resultEnum.firstOrDefault(function (o) { return o.option.length == 0; });
                        }
                        else {
                            suggestion = resultEnum.firstOrDefault(function (o) { return o.option.key == null; });
                            if (!suggestion)
                                suggestion = resultEnum.firstOrDefault(function (o) { return o.option.key.length == 0; });
                        }
                        this._setSuggestion(suggestion);
                    }
                    if (!this.popup.open && result.length > 1)
                        this.popup.popup();
                }
                else if (!this.selectedItem)
                    this._setSelectedItem(this._getItem(this.selectedOption));
                return result;
            };
            Select.prototype._computeSuggestionFeedback = function (inputValue, suggestion, filtering) {
                var suggestionMatch = "";
                var suggestionRemainder = "";
                if (filtering && suggestion && suggestion.displayValue) {
                    suggestionMatch = inputValue;
                    suggestionRemainder = suggestion.displayValue.substr(inputValue.length);
                }
                this.$["match"].innerHTML = this.escapeHTML(suggestionMatch).replace(" ", "&nbsp;");
                this.$["remainder"].innerHTML = this.escapeHTML(suggestionRemainder).replace(" ", "&nbsp;");
            };
            Select.prototype._setSelectedOption = function (option, force) {
                if (option && typeof option !== "string")
                    option = option.key;
                if (this.popup.open && !force) {
                    this._pendingSelectedOption = option;
                    this._scrollItemIntoView();
                    return;
                }
                this.selectedOption = option;
            };
            Select.prototype._selectedItemChanged = function () {
                var _this = this;
                this._setFiltering(false);
                if (this.selectedItem) {
                    this._setSelectedOption(Enumerable.from(this.options).firstOrDefault(function (o) { return o == _this.selectedItem.option; }));
                    if (!this.selectedItem.option || typeof this.selectedItem.option == "string")
                        this._inputValue = this.selectedItem.option;
                    else
                        this._inputValue = this.selectedItem.option.value;
                    this._lastMatchedInputValue = this._inputValue;
                    this._setSuggestion(this.selectedItem);
                }
                else {
                    this._setSuggestion(null);
                    this._inputValue = "";
                }
            };
            Select.prototype._selectedOptionChanged = function () {
                this._setFiltering(false);
                this._setSelectedItem(this._getItem(this.selectedOption));
                this._scrollItemIntoView();
            };
            Select.prototype._suggestionChanged = function () {
                if (!this.filtering && this.suggestion)
                    this._setSelectedOption(this.suggestion.option);
            };
            Select.prototype._getItem = function (key, items) {
                if (items === void 0) { items = this.items; }
                var result = Enumerable.from(items || []).firstOrDefault(function (i) {
                    if (!i.option || typeof i.option === "string")
                        return i.option == key;
                    else
                        return i.option.key == key;
                });
                return result;
            };
            Select.prototype._optionTap = function (e, detail) {
                var option = e.target;
                if (option.classList && option.classList.contains("option")) {
                    this._setSelectedOption(this.items[parseInt(option.getAttribute("data-option-index"), 10)].option, true);
                    this.popup.close();
                    if (detail.sourceEvent)
                        detail.sourceEvent.stopPropagation();
                    e.stopPropagation();
                }
            };
            Select.prototype._equals = function (item1, item2) {
                return item1 == item2;
            };
            Select.prototype._isReadonlyInput = function (readonly, disableFiltering) {
                return readonly || disableFiltering;
            };
            Select = __decorate([
                WebComponents.WebComponent.register({
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
            ], Select);
            return Select;
        })(WebComponents.WebComponent);
        WebComponents.Select = Select;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));

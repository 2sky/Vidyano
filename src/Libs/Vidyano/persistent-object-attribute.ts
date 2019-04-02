namespace Vidyano {
    export type PersistentObjectAttributeVisibility = "Always" | "Read" | "New" | "Never" | "Query" | "Read, Query" | "Read, New" | "Query, New";

    export type PersistentObjectAttributeOption = KeyValuePair<string, string>;

    export interface IServicePersistentObjectAttribute {
        name: string;
        type: string;
        label: string;
        value?: string;
        isReadOnly?: boolean;
        isRequired?: boolean;
        isSensitive?: boolean;
        isValueChanged: boolean;
        rules?: string;
        visibility: PersistentObjectAttributeVisibility;
    }

    export class PersistentObjectAttribute extends ServiceObject {
        private _isSystem: boolean;
        private _lastParsedValue: string;
        private _cachedValue: any;
        private _serviceValue: string;
        private _serviceOptions: string[];
        private _displayValueSource: any;
        private _displayValue: string;
        private _rules: string;
        private _validationError: string;
        private _tab: PersistentObjectAttributeTab;
        private _tabKey: string;
        private _group: PersistentObjectAttributeGroup;
        private _groupKey: string;
        private _isRequired: boolean;
        private _isReadOnly: boolean;
        private _isValueChanged: boolean;
        private _isSensitive: boolean;
        private _visibility: PersistentObjectAttributeVisibility;
        private _isVisible: boolean;

        protected _shouldRefresh: boolean = false;
        private _refreshServiceValue: string;

        id: string;
        name: string;
        label: string;
        options: string[] | PersistentObjectAttributeOption[];
        offset: number;
        type: string;
        toolTip: string;
        typeHints: any;
        editTemplateKey: string;
        templateKey: string;
        disableSort: boolean;
        triggersRefresh: boolean;
        column: number;
        columnSpan: number;
        input: HTMLInputElement;

        constructor(service: Service, attr: IServicePersistentObjectAttribute, parent: PersistentObject);
        constructor(service: Service, attr: any, public parent: PersistentObject) {
            super(service);

            this.id = attr.id;
            this._isSystem = !!attr.isSystem;
            this.name = attr.name;
            this.type = attr.type;
            this.label = attr.label;
            this._serviceValue = attr.value !== undefined ? attr.value : null;
            this._groupKey = attr.group;
            this._tabKey = attr.tab;
            this._isReadOnly = !!attr.isReadOnly;
            this._isRequired = !!attr.isRequired;
            this._isValueChanged = !!attr.isValueChanged;
            this._isSensitive = !!attr.isSensitive;
            this.offset = attr.offset || 0;
            this.toolTip = attr.toolTip;
            this._rules = attr.rules;
            this.validationError = attr.validationError || null;
            this.typeHints = attr.typeHints || {};
            this.editTemplateKey = attr.editTemplateKey;
            this.templateKey = attr.templateKey;
            this.disableSort = !!attr.disableSort;
            this.triggersRefresh = !!attr.triggersRefresh;
            this.column = attr.column;
            this.columnSpan = attr.columnSpan || 0;
            this.visibility = attr.visibility;

            if (this.type !== "Reference")
                this._setOptions(attr.options);
        }

        get groupKey(): string {
            return this._groupKey;
        }

        get group(): PersistentObjectAttributeGroup {
            return this._group;
        }
        set group(group: PersistentObjectAttributeGroup) {
            const oldGroup = this._group;
            this._group = group;

            this._groupKey = group ? group.key : null;

            this.notifyPropertyChanged("group", group, oldGroup);
        }

        get tabKey(): string {
            return this._tabKey;
        }

        get tab(): PersistentObjectAttributeTab {
            return this._tab;
        }
        set tab(tab: PersistentObjectAttributeTab) {
            const oldTab = this._tab;
            this._tab = tab;

            this._tabKey = tab ? tab.key : null;

            this.notifyPropertyChanged("tab", tab, oldTab);
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get visibility(): PersistentObjectAttributeVisibility {
            return this._visibility;
        }

        set visibility(visibility: PersistentObjectAttributeVisibility) {
            if (this._visibility === visibility)
                return;

            const oldIsVisible = this._isVisible;
            const newIsVisible = visibility.indexOf("Always") >= 0 || visibility.indexOf(this.parent.isNew ? "New" : "Read") >= 0;
            if (newIsVisible !== oldIsVisible)
                this._isVisible = newIsVisible;

            const oldVisibility = this._visibility;
            this.notifyPropertyChanged("visibility", this._visibility = visibility, oldVisibility);

            if (newIsVisible !== oldIsVisible) {
                this.notifyPropertyChanged("isVisible", this._isVisible, oldIsVisible);

                if (typeof(oldVisibility) !== "undefined" && !this.parent.isBusy)
                    this.parent.refreshTabsAndGroups(this);
            }
        }

        get isVisible(): boolean {
            return this._isVisible;
        }

        get validationError(): string {
            return this._validationError;
        }

        set validationError(error: string) {
            const oldValidationError = this._validationError;
            if (oldValidationError !== error)
                this.notifyPropertyChanged("validationError", this._validationError = error, oldValidationError);
        }

        get rules(): string {
            return this._rules;
        }

        private _setRules(rules: string) {
            const oldRules = this._rules;
            if (oldRules !== rules)
                this.notifyPropertyChanged("rules", this._rules = rules, oldRules);
        }

        get isRequired(): boolean {
            return this._isRequired;
        }

        private _setIsRequired(isRequired: boolean) {
            const oldIsRequired = this._isRequired;
            if (oldIsRequired !== isRequired)
                this.notifyPropertyChanged("isRequired", this._isRequired = isRequired, oldIsRequired);
        }

        get isReadOnly(): boolean {
            return this._isReadOnly;
        }

        private _setIsReadOnly(isReadOnly: boolean) {
            const oldisReadOnly = this._isReadOnly;
            if (oldisReadOnly !== isReadOnly)
                this.notifyPropertyChanged("isReadOnly", this._isReadOnly = isReadOnly, oldisReadOnly);
        }

        get displayValue(): string {
            if (this._displayValueSource === this._serviceValue)
                return !StringEx.isNullOrEmpty(this._displayValue) ? this._displayValue : "—";
            else
                this._displayValueSource = this._serviceValue;

            let format = this.getTypeHint("DisplayFormat", "{0}");

            let value = this.value;
            if (value != null && (this.type === "Boolean" || this.type === "NullableBoolean" || this.type === "YesNo"))
                value = this.service.getTranslatedMessage(value ? this.getTypeHint("TrueKey", "Yes") : this.getTypeHint("FalseKey", "No"));
            else if (this.type === "KeyValueList") {
                if (this.options && this.options.length > 0) {
                    const isEmpty = StringEx.isNullOrEmpty(value);
                    let option = (<PersistentObjectAttributeOption[]>this.options).find(o => o.key === value || (isEmpty && StringEx.isNullOrEmpty(o.key)));
                    if (this.isRequired && option == null)
                        option = (<PersistentObjectAttributeOption[]>this.options).find(o => StringEx.isNullOrEmpty(o.key));

                    if (option != null)
                        value = option.value;
                    else if (this.isRequired)
                        value = this.options.length > 0 ? (<PersistentObjectAttributeOption>this.options[0]).value : null;
                }
            }
            else if (value != null && (this.type === "Time" || this.type === "NullableTime")) {
                value = value.trimEnd("0").trimEnd(".");
                if (value.startsWith("0:"))
                    value = value.substr(2);
                if (value.endsWith(":00"))
                    value = value.substr(0, value.length - 3);
            } else if (value != null && (this.type === "User" || this.type === "NullableUser") && this.options.length > 0)
                value = this.options[0];
            else {
                const calculated = this.service.hooks.onGetAttributeDisplayValue(this, value);
                if (typeof calculated !== "undefined")
                    return (this._displayValue = calculated);
            }

            if (format === "{0}") {
                if (this.type === "Date" || this.type === "NullableDate")
                    format = "{0:" + CultureInfo.currentCulture.dateFormat.shortDatePattern + "}";
                else if (this.type === "DateTime" || this.type === "NullableDateTime")
                    format = "{0:" + CultureInfo.currentCulture.dateFormat.shortDatePattern + " " + CultureInfo.currentCulture.dateFormat.shortTimePattern + "}";
            }

            return !StringEx.isNullOrEmpty(this._displayValue = value != null ? StringEx.format(format, value) : null) ? this._displayValue : "—";
        }

        get shouldRefresh(): boolean {
            return this._shouldRefresh;
        }

        get value(): any {
            if (this._lastParsedValue !== this._serviceValue) {
                this._lastParsedValue = this._serviceValue;

                if (!this.parent.isBulkEdit || !!this._serviceValue)
                    this._cachedValue = Service.fromServiceString(this._serviceValue, this.type);
                else
                    this._cachedValue = null;
            }

            return this._cachedValue;
        }

        set value(val: any) {
            this.setValue(val).catch(Vidyano.noop);
        }

        async setValue(val: any, allowRefresh: boolean = true): Promise<any> {
            if (!this.parent.isEditing || this.parent.isFrozen || this.isReadOnly)
                return this.value;

            if (val && typeof val === "string") {
                const charactercasing = this.getTypeHint("charactercasing", "", undefined, true);
                if (charactercasing) {
                    if (charactercasing.toUpperCase() === "LOWER")
                        val = (<string>val).toLowerCase();
                    else if (charactercasing.toUpperCase() === "UPPER")
                        val = (<string>val).toUpperCase();
                }
            }

            const newServiceValue = Service.toServiceString(val, this.type);

            // If value is equal
            if (this._cachedValue === val || (this._serviceValue == null && StringEx.isNullOrEmpty(newServiceValue)) || this._serviceValue === newServiceValue) {
                if (allowRefresh && this._shouldRefresh)
                    await this._triggerAttributeRefresh();
            }
            else {
                const oldDisplayValue = this.displayValue;
                const oldServiceValue = this._serviceValue;
                this.notifyPropertyChanged("value", this._serviceValue = newServiceValue, oldServiceValue);
                this.isValueChanged = true;

                const newDisplayValue = this.displayValue;
                if (oldDisplayValue !== newDisplayValue)
                    this.notifyPropertyChanged("displayValue", newDisplayValue, oldDisplayValue);

                if (this.triggersRefresh) {
                    if (allowRefresh)
                        await this._triggerAttributeRefresh();
                    else
                        this._shouldRefresh = true;
                }

                this.parent.triggerDirty();
            }

            return this.value;
        }

        get isValueChanged(): boolean {
            return this._isValueChanged;
        }

        set isValueChanged(isValueChanged: boolean) {
            if (isValueChanged === this._isValueChanged)
                return;

            const oldIsValueChanged = this._isValueChanged;
            this.notifyPropertyChanged("isValueChanged", this._isValueChanged = isValueChanged, oldIsValueChanged);
        }

        get isSensitive(): boolean {
            return this._isSensitive;
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any, ignoreCasing?: boolean): string {
            if (typeHints != null) {
                if (this.typeHints != null)
                    typeHints = Vidyano.extend({}, this.typeHints, typeHints);
            }
            else
                typeHints = this.typeHints;

            if (typeHints != null) {
                const typeHint = typeHints[ignoreCasing ? name : name.toLowerCase()];

                if (typeHint != null)
                    return typeHint;
            }

            return defaultValue;
        }

        _toServiceObject() {
            const result = this.copyProperties(["id", "name", "label", "type", "isReadOnly", "triggersRefresh", "isRequired", "differsInBulkEditMode", "isValueChanged", "displayAttribute", "objectId", "visibility"]);
            result.value = this._serviceValue;

            if (this.options && this.options.length > 0 && this.isValueChanged)
                result.options = (<any[]>this.options).map(o => o ? (typeof (o) !== "string" ? o.key + "=" + o.value : o) : null);
            else
                result.options = this._serviceOptions;

            return result;
        }

        _refreshFromResult(resultAttr: PersistentObjectAttribute, resultWins: boolean): boolean {
            let visibilityChanged = false;

            this._setOptions(resultAttr._serviceOptions);
            this._setIsReadOnly(resultAttr.isReadOnly);
            this._setRules(resultAttr.rules);
            this._setIsRequired(resultAttr.isRequired);
            if (this.visibility !== resultAttr.visibility) {
                this.visibility = resultAttr.visibility;
                visibilityChanged = true;
            }

            if (resultWins || (this._serviceValue !== resultAttr._serviceValue && (this.isReadOnly || this._refreshServiceValue !== resultAttr._serviceValue))) {
                const oldDisplayValue = this.displayValue;
                const oldValue = this.value;

                this._serviceValue = resultAttr._serviceValue;
                this._lastParsedValue = undefined;

                this.notifyPropertyChanged("value", this.value, oldValue);
                this.notifyPropertyChanged("displayValue", this.displayValue, oldDisplayValue);

                this.isValueChanged = resultAttr.isValueChanged;
            }

            this._refreshServiceValue = undefined;

            this.triggersRefresh = resultAttr.triggersRefresh;
            this.validationError = resultAttr.validationError || null;

            if (resultAttr.typeHints && Object.keys(resultAttr.typeHints).some(k => resultAttr.typeHints[k] !== this.typeHints[k])) {
                for (let name in this.typeHints) {
                    if (resultAttr.typeHints[name] != null)
                        continue;

                    resultAttr.typeHints[name] = this.typeHints[name];
                }

                const oldTypeHints = this.typeHints;
                this.notifyPropertyChanged("typeHints", this.typeHints = resultAttr.typeHints, oldTypeHints);
            }

            return visibilityChanged;
        }

        _triggerAttributeRefresh(immediate?: boolean): Promise<any> {
            this._shouldRefresh = false;
            return this.parent._triggerAttributeRefresh(this, immediate);
        }

        protected _setOptions(options: string[]) {
            const oldOptions = this.options ? this.options.slice() : undefined;

            if (!options || options.length === 0) {
                this.options = this._serviceOptions = options;
                if (oldOptions && oldOptions.length > 0)
                    this.notifyPropertyChanged("options", this.options, oldOptions);

                return;
            }

            this._serviceOptions = <any[]>options.slice(0);
            const keyValuePairOptionType = ["FlagsEnum", "KeyValueList"].indexOf(this.type) !== -1 || (this.type === "Reference" && (<PersistentObjectAttributeWithReference><any>this).selectInPlace);

            if (!keyValuePairOptionType)
                this.options = options;
            else {
                this.options = options.map(o => {
                    const optionSplit = splitWithTail(o, "=", 2);
                    return {
                        key: optionSplit[0],
                        value: optionSplit[1]
                    };
                });
            }

            this.notifyPropertyChanged("options", this.options, oldOptions);
        }
    }
}
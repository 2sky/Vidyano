//module Vidyano.WebComponents.Attributes {
//	class MultiString {
//		constructor(private _value, private _valueChanged: Function) {
//		}

//		get value(): string {
//			return this._value;
//		}

//		set value(val: string) {
//			this._value = val;
//			this._valueChanged();
//		}

//		updateValueChanged(newValueChanged: Function) {
//			this._valueChanged = newValueChanged;
//			this._valueChanged();
//		}
//	}

//    export class PersistentObjectAttributeMultiString extends WebComponents.Attributes.PersistentObjectAttribute {
//		private strings: MultiString[];
//		private _sortable: ISortable;
//		private _newMultiString: MultiString;

//		protected templateLoaded() {
//			if (this.target && this.target.parent.isEditing)
//				this._render();
//		}

//		private stringsChanged() {
//			if (this.target && this.target.parent.isEditing)
//				this._render();
//		}

//		private _computeStrings(value: string): MultiString[]{
//			if (!value)
//				return [];

//			var valueChangedCallback = this._onSort.bind(this);
//			return value.split("\n").filter(v => v.length > 0).map(v => new MultiString(v, valueChangedCallback));
//		}

//		private _render() {
//			if (!this.isTemplatedLoaded || !this.strings)
//				return;

//			var newContainer = this.asElement.querySelector("#new");
//			if (newContainer.childNodes.length == 0)
//				newContainer.appendChild(this._createMultiStringResource(this._newMultiString = new MultiString("", this._newMultiStringValueChanged.bind(this))));

//			var skipRefreshStrings;
//			if (this._sortable) {
//				var values = this._getValues();
//				if (values.length == this.strings.length) {
//					var stringValues = this.strings.map(s => s.value);

//					if (values.every((v, index) => v == stringValues[index]))
//						skipRefreshStrings = true;
//				}

//				this._sortable.destroy();
//			}

//			var inputs = this.asElement.querySelector("#inputs");
//			if (!skipRefreshStrings) {
//				inputs.textContent = "";

//				this.strings.forEach(s => inputs.appendChild(this._createMultiStringResource(s)));
//			}

//			this._sortable = window["Sortable"].create(inputs, {
//				handle: ".sort-handle",
//				animation: 150,
//				onSort: this._onSort.bind(this)
//			});
//		}

//		private _onSort() {
//			this.value = this._getValues().filter(v => v.length > 0).join("\n");
//		}

//		private _newMultiStringValueChanged() {
//			if (this._newMultiString.value)

//			var newContainer = this.asElement.querySelector("#new");
//			var newResource = this.asElement.querySelector("#new > vi-resource");
//			this.asElement.querySelector("#inputs").appendChild(newResource);

//			var input = <HTMLInputElement>newResource.querySelector("input");
//			if (input)
//				input.focus();

//			this._newMultiString.updateValueChanged(this._onSort.bind(this));
//		}

//		private _createMultiStringResource(model: MultiString): Vidyano.WebComponents.Resource {
//			var resource = new Vidyano.WebComponents.Resource();
//			resource.model = model;
//			resource.source = "vi-persistent-object-attribute-multi-string+part:edit";

//			return resource;
//		}

//		private _getValues(): string[] {
//			return Array.prototype.map.apply(this.asElement.querySelectorAll("#inputs > vi-resource"), [resource => resource.model.value]);
//		}
//    }

//    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeMultiString, {
//		_newMultiString: { value: null }
//	}, {
//			strings: "_computeStrings(target.value)"
//		});
//}
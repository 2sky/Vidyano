module Vidyano.WebComponents {
	var _groups: Sortable[] = [];

    export class Sortable extends WebComponent {
		private _sortable: ISortable;
		private _isDragging: boolean;
		private _isGroupDragging: boolean;
		group: string;
		filter: string;
		disabled: boolean;

		attached() {
			super.attached();

			if (this.group)
				_groups.push(this);

			this._create();
		}

		detached() {
			if (this.group)
				_groups.remove(this);

			this._destroy();
			super.detached();
		}

		groupChanged() {
			this._sortable.option("group", this.group);
			if (this.group)
				_groups.push(this);
			else
				_groups.remove(this);
		}

		filterChanged() {
			this._sortable.option("filter", this.filter);
		}

		disabledChanged() {
			this._sortable.option("filter", this.filter);
		}

		private _create() {
			this._destroy();

			this._sortable = window["Sortable"].create(this, {
				group: this.group,
				filter: this.filter,
				disabled: this.disabled,
				onStart: () => {
					this._isDragging = true;
					if (this.group)
						_groups.filter(s => s.group == this.group).forEach(s => s._isGroupDragging = true);
				},
				onEnd: () => {
					this._isDragging = false;
					if (this.group)
						_groups.filter(s => s.group == this.group).forEach(s => s._isGroupDragging = false);
				}
			});
		}

		private _destroy() {
			if (this._sortable) {
				this._sortable.destroy();
				this._sortable = null;
			}
		}
    }

  //  Vidyano.WebComponents.WebComponent.registerTODO(Vidyano.WebComponents.Sortable, Vidyano.WebComponents, "vi",
  //      {
		//	group: { value: null, reflect: true },
		//	filter: { value: null, reflect: true },
		//	isDragging: { value: false, reflect: true },
		//	isGroupDragging: { value: false, reflect: true },
		//	disabled: { value: false, reflect: true }
  //      }, {
		//	isDragging: "_isDragging",
		//	isGroupDragging: "_isGroupDragging"
		//});
}
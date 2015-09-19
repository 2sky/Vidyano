module Vidyano.WebComponents {
    var _groups: Sortable[] = [];

    export class Sortable extends WebComponent {
        private _sortable: ISortable;
        group: string;
        filter: string;
        enabled: boolean;

        private _setIsDragging: (isDragging: boolean) => void;
        private _setIsGroupDragging: (isGroupDragging: boolean) => void;

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

        private _create() {
            this._destroy();

            this._sortable = window["Sortable"].create(this, {
                group: this.group,
                filter: this.filter,
                disabled: !this.enabled,
                onStart: () => {
                    this._setIsDragging(true);
                    if (this.group)
                        _groups.filter(s => s.group == this.group).forEach(s => s._setIsGroupDragging(true));
                },
                onEnd: () => {
                    this._setIsDragging(false);
                    if (this.group)
                        _groups.filter(s => s.group == this.group).forEach(s => s._setIsGroupDragging(false));
                }
            });
        }

        private _destroy() {
            if (this._sortable) {
                this._sortable.destroy();
                this._sortable = null;
            }
        }

        private _enabledChanged(enabled: boolean) {
            this._sortable.option("disabled", !enabled);
        }

        static register(info: WebComponentRegistrationInfo = {}): any {
            return (obj: Function) => {
                info.properties = info.properties || {};

                info.properties["group"] = {
                    type: String,
                    reflectToAttribute: true,
                };
                info.properties["filter"] =
                {
                    type: String,
                    reflectToAttribute: true
                };
                info.properties["isDragging"] =
                {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };
                info.properties["isGroupDragging"] =
                {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };
                info.properties["enabled"] = // Use enabled before disabled to prevent IE from blocking all events
                {
                    type: Boolean,
                    observer: "_enabledChanged"
                };

                return WebComponent.register(obj, info);
            };
        }
    }
}
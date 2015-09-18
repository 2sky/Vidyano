module Vidyano.WebComponents {
    var _groups: Sortable[] = [];

    //@WebComponent.register({
    //    properties: {
    //        group: {
    //            type: String,
    //            reflectToAttribute: true
    //        },
    //        filter: {
    //            type: String,
    //            reflectToAttribute: true
    //        },
    //        isDragging: {
    //            type: Boolean,
    //            reflectToAttribute: true
    //        },
    //        isGroupDragging: {
    //            type: Boolean,
    //            reflectToAttribute: true,
    //            readOnly: true
    //        },
    //        disabled: {
    //            type: Boolean,
    //            reflectToAttribute: true
    //        }
    //    }
    //})
    export class Sortable extends WebComponent {
        private _sortable: ISortable;
        group: string;
        filter: string;
        disabled: boolean;

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
                info.properties["disabled"] =
                {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: true
                };

                return WebComponent.register(obj, info);
            };
        }
    }
}
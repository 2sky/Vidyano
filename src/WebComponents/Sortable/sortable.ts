namespace Vidyano.WebComponents {
    "use strict";

    const _groups: Sortable[] = [];

    export interface ISortableDragEndDetails {
        element: HTMLElement;
        newIndex: number;
        oldIndex: number;
    }

    export abstract class Sortable extends WebComponent {
        private _sortable: ISortable;
        group: string;
        filter: string;
        handle: string;
        draggableItems: string;
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

        handleChanged() {
            this._sortable.option("handle", this.handle);
        }

        draggableItemsChangted() {
            this._sortable.option("draggable", this.draggableItems);
        }

        protected _dragStart() {
            this.fire("drag-start", undefined);
        }

        protected _dragEnd(element: HTMLElement, newIndex: number, oldIndex: number) {
            this.fire("drag-end", {
                element: element,
                newIndex: newIndex,
                oldIndex: oldIndex
            });
        }

        private _create() {
            this._destroy();

            this._sortable = window["Sortable"].create(this, {
                group: this.group,
                filter: this.filter,
                handle: this.handle,
                disabled: !this.enabled,
                animation: 150,
                onStart: () => {
                    this._setIsDragging(true);
                    if (this.group)
                        _groups.filter(s => s.group === this.group).forEach(s => s._setIsGroupDragging(true));

                    this._dragStart();
                },
                onEnd: (e: any) => {
                    this._setIsDragging(false);
                    if (this.group)
                        _groups.filter(s => s.group === this.group).forEach(s => s._setIsGroupDragging(false));

                    this._dragEnd(e.item, e.newIndex, e.oldIndex);
                }
            });

            // Delay setting draggable
            if (this.draggableItems)
                this._sortable.option("draggable", this.draggableItems);
        }

        private _destroy() {
            if (this._sortable) {
                this._sortable.destroy();
                this._sortable = null;
            }
        }

        private _enabledChanged(enabled: boolean) {
            if(this._sortable)
                this._sortable.option("disabled", !enabled);
        }

        static register(info: IWebComponentRegistrationInfo = {}): any {
            if (typeof info === "function")
                return Sortable.register({})(info);

            return (obj: Function) => {
                info.properties = info.properties || {};

                info.properties["group"] = {
                    type: String,
                    reflectToAttribute: true,
                };
                info.properties["filter"] = {
                    type: String,
                    reflectToAttribute: true
                };
                info.properties["draggableItems"] = {
                    type: String,
                    reflectToAttribute: true
                };
                info.properties["handle"] = {
                    type: String,
                    reflectToAttribute: true
                };
                info.properties["isDragging"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };
                info.properties["isGroupDragging"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };
                info.properties["enabled"] = { // Use enabled before disabled to prevent IE from blocking all events
                    type: Boolean,
                    reflectToAttribute: true,
                    observer: "_enabledChanged"
                };

                return WebComponent.register(obj, info);
            };
        }
    }
}
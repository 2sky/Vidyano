namespace Vidyano.WebComponents {
    const _groups: Sortable[] = [];

    export interface ISortableDragEndDetails {
        element: HTMLElement;
        newIndex: number;
        oldIndex: number;
    }

    @WebComponent.registerAbstract({
        properties: {
            "group": {
                type: String,
                reflectToAttribute: true,
            },
            "filter": {
                type: String,
                reflectToAttribute: true
            },
            "draggableItems": {
                type: String,
                reflectToAttribute: true
            },
            "handle": {
                type: String,
                reflectToAttribute: true
            },
            "isDragging": {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            "isGroupDragging": {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            "enabled": { // Use enabled before disabled to prevent IE from blocking all events
                type: Boolean,
                reflectToAttribute: true,
                observer: "_enabledChanged"
            }
        }
    })
    export abstract class Sortable extends WebComponent {
        private _sortable: ISortable;
        readonly isDragging: boolean; private _setIsDragging: (isDragging: boolean) => void;
        readonly isGroupDragging: boolean; private _setIsGroupDragging: (isGroupDragging: boolean) => void;
        group: string;
        filter: string;
        handle: string;
        draggableItems: string;
        enabled: boolean;

        connectedCallback() {
            super.connectedCallback();

            if (this.group)
                _groups.push(this);

            this._create();
        }

        disconnectedCallback() {
            if (this.group)
                _groups.remove(this);

            this._destroy();
            super.disconnectedCallback();
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
    }
}
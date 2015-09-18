module Vidyano.WebComponents.Attributes {
    @PersistentObjectAttribute.register({
        properties: {
            columns: {
                type: Array,
                computed: "_computeColumns(attribute.details.columns)"
            },
            newAction: {
                type: Object,
                readOnly: true
            },
            newActionPinned: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeNewActionPinned(height, newAction)"
            },
            deleteAction: {
                type: Object,
                readOnly: true
            },
            width: {
                type: Number,
                readOnly: true
            },
            height: {
                type: Number,
                readOnly: true
            },
            canDelete: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeCanDelete(editing, deleteAction, attribute.objects)"
            },
            initializing: {
                type: Boolean,
                reflectToAttribute: true,
                value: true,
                readOnly: true
            }
        },
        observers: [
            "_updateWidths(columns, width, deleteAction, editing, isAttached)",
            "_updateActions(attribute.details.actions, editing, readOnly)"
        ],
        forwardObservers: [
            "attribute.objects.isDeleted"
        ]
    })
    export class PersistentObjectAttributeAsDetail extends WebComponents.Attributes.PersistentObjectAttribute {
        private _inlineAddHeight: number;
        private _lastComputedWidths: number;
        attribute: Vidyano.PersistentObjectAttributeAsDetail;
        newAction: Vidyano.Action;
        newActionPinned: boolean;

        private _setInitializing: (init: boolean) => void;
        private _setWidth: (width: number) => void;
        private _setHeight: (height: number) => void;
        private _setNewAction: (action: Vidyano.Action) => void;
        private _setDeleteAction: (action: Vidyano.Action) => void;

        private _isColumnVisible(column: QueryColumn) {
            return !column.isHidden && column.width !== "0";
        }

        private _rowSizechanged(e: Event, detail: { width: number; height: number; }) {
            this._setWidth(detail.width);
            this._setHeight(detail.height);

            e.stopPropagation();
        }

        private _computeColumns(columns: QueryColumn[]): QueryColumn[] {
            return Enumerable.from(columns).where(c => !c.isHidden).toArray();
        }

        private _computeCanDelete(editing: boolean, deleteAction: Vidyano.Action, objects: Vidyano.PersistentObject[]): boolean {
            return editing && !!deleteAction && !!objects && objects.some(o => !o.isDeleted);
        }

        private _computeNewActionPinned(height: number, newAction: Vidyano.Action): boolean {
            if (!height || !newAction)
                return false;

            var scroller = (<Scroller><any>this.$["body"]);
            if (!this._inlineAddHeight) {
                var inlineAdd = <HTMLElement>scroller.querySelector(".row.add.inline");
                if (!inlineAdd)
                    return false;

                this._inlineAddHeight = inlineAdd.offsetHeight;
            }

            var contentHeight = this.newActionPinned ? height : height - this._inlineAddHeight;
            return contentHeight + this._inlineAddHeight > this.$["table"].offsetHeight - this.$["head"].offsetHeight;
        }

        private _updateActions(actions: Vidyano.Action[], editing: boolean, readOnly: boolean) {
            this._setNewAction(editing && !readOnly ? actions["New"] || null : null);
            this._setDeleteAction(editing && !readOnly ? actions["Delete"] || null : null);
        }

        private _updateWidths(columns: QueryColumn[], width: number, deleteAction: Vidyano.Action, editing: boolean, isAttached: boolean) {
            if (!isAttached || !columns || !columns.length || !width || this._lastComputedWidths === width)
                return;

            var widths: { name: string; width: number; }[] = [];
            var remainingWidth = this._lastComputedWidths = width;
            var usedWidth = 0;

            columns.filter(c => c.width != null && !c.width.endsWith('%')).forEach(c => {
                var intWidth = parseInt(c.width, 10);
                if (!isNaN(intWidth)) {
                    widths.push({
                        name: c.name,
                        width: intWidth
                    });

                    remainingWidth -= intWidth;
                    usedWidth += intWidth;
                }
            });

            var percentagesRemainingWidth = width;
            columns.filter(c => c.width != null && c.width.endsWith('%')).forEach(c => {
                var intWidthPercentage = parseInt(c.width, 10);
                if (!isNaN(intWidthPercentage)) {
                    var intWidth = Math.floor(percentagesRemainingWidth * intWidthPercentage / 100);
                    widths.push({
                        name: c.name,
                        width: intWidth
                    });

                    remainingWidth -= intWidth;
                    usedWidth += intWidth;
                }
            });

            var udColumns = columns.filter(c => c.width == null)
            var remainingColumnWidth = Math.floor(remainingWidth / udColumns.length);
            udColumns.forEach(c => {
                widths.push({
                    name: c.name,
                    width: remainingColumnWidth
                });

                usedWidth += remainingColumnWidth;
            });

            if (usedWidth < width)
                widths[0].width += width - usedWidth;

            var style = <Style><any>this.$["style"];
            style.setStyle("ColumnStyles", ...widths.map(w => `.column[data-column='${w.name}'] { width: ${w.width}px; }`));

            this._setInitializing(false);
        }

        private _rowAdded(e: CustomEvent) {
            var row = (<HTMLElement>e.target).parentElement;
            this.async(() => {
                row.scrollIntoView(false);
            });
        }

        private _add(e: TapEvent) {
            this.newAction.skipOpen = true;
            this.newAction.execute().then(po => {
                this.push("attribute.objects", po);

                this.attribute.isValueChanged = true;
                this.attribute.parent.triggerDirty();
            });
        }

        private _delete(e: TapEvent) {
            var obj = <Vidyano.PersistentObject>e.model.obj;
            if (!obj.isNew)
                obj.isDeleted = true;
            else
                this.splice("attribute.objects", this.attribute.objects.indexOf(obj), 1);

            this.attribute.isValueChanged = true;
            this.attribute.parent.triggerDirty();
        }
    }

    @WebComponent.register({
        properties: {
            serviceObject: Object,
            columns: Array,
            editing: Boolean
        },
        observers: [
            "_scrollNewDetailRowIntoView(serviceObject, columns, editing, isAttached)"
        ]
    })
    export class PersistentObjectAttributeAsDetailRow extends WebComponents.WebComponent {
        private _isColumnVisible(column: QueryColumn) {
            return !column.isHidden && column.width !== "0";
        }

        private _getDisplayValue(obj: Vidyano.PersistentObject, column: QueryColumn): string {
            var attr = this._getAttributeForColumn(obj, column);
            return attr && attr.displayValue || "";
        }

        private _getAttributeForColumn(obj: Vidyano.PersistentObject, column: QueryColumn): Vidyano.PersistentObjectAttribute {
            return obj.attributesByName[column.name];
        }

        private _scrollNewDetailRowIntoView(serviceObject: Vidyano.PersistentObject, columns: Vidyano.QueryColumn[], editing: boolean, isAttached: boolean) {
            if (editing && isAttached && !!serviceObject && serviceObject.isNew && !!columns)
                this.scrollIntoView(false);
        }
    }
}
namespace Vidyano.WebComponents.Attributes {
    "use strict";

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
                computed: "_computeNewActionPinned(size.height, newAction)"
            },
            deleteAction: {
                type: Object,
                readOnly: true
            },
            size: {
                type: Object,
                notify: true
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
            "_updateWidths(columns, size.width, deleteAction, editing, isAttached)",
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
        private _setNewAction: (action: Vidyano.Action) => void;
        private _setDeleteAction: (action: Vidyano.Action) => void;

        private _isColumnVisible(column: QueryColumn) {
            return !column.isHidden && column.width !== "0";
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

            const scroller = (<Scroller><any>this.$["body"]);
            if (!this._inlineAddHeight) {
                const inlineAdd = <HTMLElement>scroller.querySelector(".row.add.inline");
                if (!inlineAdd)
                    return false;

                this._inlineAddHeight = inlineAdd.offsetHeight;
            }

            const contentHeight = this.newActionPinned ? height : height - this._inlineAddHeight;
            return contentHeight + this._inlineAddHeight > this.$["table"].offsetHeight - this.$["head"].offsetHeight;
        }

        private _updateActions(actions: Vidyano.Action[], editing: boolean, readOnly: boolean) {
            this._setNewAction(editing && !readOnly ? actions["New"] || null : null);
            this._setDeleteAction(editing && !readOnly ? actions["Delete"] || null : null);
        }

        private _updateWidths(columns: QueryColumn[], width: number, deleteAction: Vidyano.Action, editing: boolean, isAttached: boolean) {
            if (!isAttached || !columns || !columns.length || !width || this._lastComputedWidths === width)
                return;

            const widths: { name: string; width: number; }[] = [];
            let remainingWidth = this._lastComputedWidths = width;
            let usedWidth = 0;

            columns.filter(c => !StringEx.isNullOrEmpty(c.width) && !c.width.endsWith("%")).forEach(c => {
                const intWidth = parseInt(c.width);
                if (!isNaN(intWidth)) {
                    widths.push({
                        name: c.name,
                        width: intWidth
                    });

                    remainingWidth -= intWidth;
                    usedWidth += intWidth;
                }
            });

            const percentagesRemainingWidth = width;
            columns.filter(c => !StringEx.isNullOrEmpty(c.width) && c.width.endsWith("%")).forEach(c => {
                const intWidthPercentage = parseInt(c.width);
                if (!isNaN(intWidthPercentage)) {
                    const intWidth = Math.floor(percentagesRemainingWidth * intWidthPercentage / 100);
                    widths.push({
                        name: c.name,
                        width: intWidth
                    });

                    remainingWidth -= intWidth;
                    usedWidth += intWidth;
                }
            });

            const udColumns = columns.filter(c => StringEx.isNullOrEmpty(c.width));
            const remainingColumnWidth = Math.floor(remainingWidth / udColumns.length);
            udColumns.forEach(c => {
                widths.push({
                    name: c.name,
                    width: remainingColumnWidth
                });

                usedWidth += remainingColumnWidth;
            });

            if (usedWidth < width)
                widths[0].width += width - usedWidth;

            const style = <Style>this.$["style"];
            style.setStyle("ColumnStyles", ...widths.map(w => `.column[data-column='${w.name}'] { width: ${w.width}px; }`));

            this._setInitializing(false);
        }

        private _rowAdded(e: CustomEvent) {
            const row = (<HTMLElement>e.target).parentElement;
            this.async(() => {
                row.scrollIntoView(false);
            });
        }

        private _add(e: TapEvent) {
            const postAdd = (po: Vidyano.PersistentObject) => {
                this.push("attribute.objects", po);
                po.parent = this.attribute.parent;

                if (this.attribute.lookupAttribute && po.attributes[this.attribute.lookupAttribute]) {
                    const lookupAttribute = <Vidyano.PersistentObjectAttributeWithReference>po.attributes[this.attribute.lookupAttribute];
                    lookupAttribute.lookup.search();

                    this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(lookupAttribute.lookup)).then(result => {
                        if (!result) {
                            this.pop("attribute.objects");
                            return;
                        }

                        return lookupAttribute.changeReference(result).then();
                    });
                }

                this.attribute.isValueChanged = true;
                this.attribute.parent.triggerDirty();
            };

            this.newAction.execute({ throwExceptions: true, skipOpen: true }).then(po => {
                return po.stateBehavior.indexOf("OpenAsDialog") < 0 ?
                    Promise.resolve(po).then(po => postAdd(po)) :
                    this.app.showDialog(new Vidyano.WebComponents.PersistentObjectDialog(po, {
                        saveLabel: this.app.service.actionDefinitions.get("AddReference").displayName,
                        save: (po, close) => {
                            postAdd(po);
                            close();
                        }
                    }));
            }).catch(e => this.attribute.parent.setNotification(e));
        }

        private _delete(e: TapEvent) {
            const obj = <Vidyano.PersistentObject>e.model.obj;
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
            const attr = this._getAttributeForColumn(obj, column);
            return attr && attr.displayValue || "";
        }

        private _getAttributeForColumn(obj: Vidyano.PersistentObject, column: QueryColumn): Vidyano.PersistentObjectAttribute {
            return obj.attributes[column.name];
        }

        private _scrollNewDetailRowIntoView(serviceObject: Vidyano.PersistentObject, columns: Vidyano.QueryColumn[], editing: boolean, isAttached: boolean) {
            if (editing && isAttached && !!serviceObject && serviceObject.isNew && !!columns)
                this.scrollIntoView(false);
        }
    }
}
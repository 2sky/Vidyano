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
            },
            activeObject: {
                type: Object,
                value: null
            }
        },
        observers: [
            "_updateWidths(columns, size.width, deleteAction, editing, isAttached)",
            "_updateActions(attribute.details.actions, editing, readOnly)"
        ],
        forwardObservers: [
            "attribute.objects.*.isDeleted"
        ]
    })
    export class PersistentObjectAttributeAsDetail extends WebComponents.Attributes.PersistentObjectAttribute {
        private _inlineAddHeight: number;
        private _lastComputedWidths: number;
        private _initialActiveObjectSet: boolean;
        readonly initializing: boolean; private _setInitializing: (init: boolean) => void;
        readonly newAction: Vidyano.Action; private _setNewAction: (action: Vidyano.Action) => void;
        readonly deleteAction: Vidyano.Action; private _setDeleteAction: (action: Vidyano.Action) => void;
        attribute: Vidyano.PersistentObjectAttributeAsDetail;
        newActionPinned: boolean;

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

            const scroller = <Scroller>this.$.body;
            if (!this._inlineAddHeight) {
                const inlineAdd = <HTMLElement>scroller.querySelector(".row.add.inline");
                if (!inlineAdd)
                    return false;

                this._inlineAddHeight = inlineAdd.offsetHeight;
            }

            const contentHeight = this.newActionPinned ? height : height - this._inlineAddHeight;
            return contentHeight + this._inlineAddHeight > this.$.table.offsetHeight - this.$.head.offsetHeight;
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

            const style = <Style>this.$.style;
            style.setStyle("ColumnStyles", ...widths.map(w => `.column[data-column='${w.name}'] { width: ${w.width}px; }`));

            this._setInitializing(false);
        }

        private _rowAdded(e: CustomEvent) {
            const row = (<HTMLElement>e.target).parentElement;
            this.async(() => {
                row.scrollIntoView(false);
            });
        }

        private async _add(e: TapEvent) {
            try {
                const po = await this.attribute.newObject();
                if (po.stateBehavior.indexOf("OpenAsDialog") < 0)
                    await this.__add(po);
                else {
                    await this.app.importComponent("PersistentObjectDialog");
                    this.app.showDialog(new Vidyano.WebComponents.PersistentObjectDialog(po, {
                        saveLabel: this.app.service.actionDefinitions.get("AddReference").displayName,
                        save: (po, close) => {
                            this.__add(po);
                            close();
                        }
                    }));
                }
            }
            catch (e) {
                this.attribute.parent.setNotification(e);
            }
        }

        private async __add(po: Vidyano.PersistentObject) {
            this.push("attribute.objects", po);
            this.set("activeObject", po);
            po.parent = this.attribute.parent;

            if (this.attribute.lookupAttribute && po.attributes[this.attribute.lookupAttribute]) {
                const lookupAttribute = <Vidyano.PersistentObjectAttributeWithReference>po.attributes[this.attribute.lookupAttribute];
                lookupAttribute.lookup.search();

                const result = await this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(lookupAttribute.lookup));
                if (result) {
                    await lookupAttribute.changeReference(result);

                    if (this.attribute.triggersRefresh)
                        await this.attribute._triggerAttributeRefresh(true);
                }
                else
                    this.pop("attribute.objects");
            }
            else {
                this.attribute.isValueChanged = true;
                this.attribute.parent.triggerDirty();

                if (this.attribute.triggersRefresh)
                    await this.attribute._triggerAttributeRefresh(true);
            }
        }

        private _delete(e: TapEvent) {
            const obj = <Vidyano.PersistentObject>e.model.obj;
            if (!obj.isNew)
                obj.isDeleted = true;
            else
                this.splice("attribute.objects", this.attribute.objects.indexOf(obj), 1);

            this.attribute.isValueChanged = true;
            this.attribute.parent.triggerDirty();

            if (this.attribute.triggersRefresh)
                this.attribute._triggerAttributeRefresh(true);
        }

        private _isActiveObject(activeObject: Vidyano.PersistentObject, obj: Vidyano.PersistentObject): boolean {
            return activeObject === obj;
        }

        private _setActiveObject(e: TapEvent) {
            if (!this.readOnly)
                this.set("activeObject", e.model.obj);

            e.stopPropagation();
        }

        private _titleMouseenter(e: MouseEvent) {
            const label = <HTMLElement>e.target;
            label.setAttribute("title", label.offsetWidth < label.scrollWidth ? label.textContent : "");
        }
    }

    @WebComponent.register({
        properties: {
            serviceObject: Object,
            columns: Array,
            editing: Boolean,
            fullEdit: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            softEdit: {
                type: Boolean,
                computed: "_computeSoftEdit(serviceObject)",
                value: false
            },
            lastUpdated: {
                type: Object,
                value: null,
                readOnly: true
            }
        },
        observers: [
            "_scrollNewDetailRowIntoView(serviceObject, columns, editing, isAttached)"
        ],
        forwardObservers: [
            "serviceObject.lastUpdated"
        ]
    })
    export class PersistentObjectAttributeAsDetailRow extends WebComponents.WebComponent {
        private fullEdit: boolean;
        readonly lastUpdated: Date; private _setLastUpdated: (lastUpdated: Date) => void;
        serviceObject: Vidyano.PersistentObject;

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

        private _computeSoftEdit(serviceObject: Vidyano.PersistentObject): boolean {
            return serviceObject && serviceObject.ownerDetailAttribute.objects[0] === serviceObject;
        }

        private _isPresenterAvailable(fullEdit: boolean, softEdit: boolean): boolean {
            return fullEdit || softEdit;
        }

        private _isSoftEditOnly(fullEdit: boolean, softEdit: boolean): boolean {
            return !fullEdit && softEdit;
        }

        private _setFullEdit(e: TapEvent) {
            this.fire("full-edit", null);
            Polymer.dom(this).flush();

            const attribute = this._getAttributeForColumn(this.serviceObject, e.model.column);
            const presenters = Enumerable.from(Polymer.dom(this.root).querySelectorAll("vi-persistent-object-attribute-presenter"));
            const presenter = <PersistentObjectAttributePresenter>presenters.firstOrDefault((p: PersistentObjectAttributePresenter) => p.attribute === attribute);
            if (!presenter)
                return;

            presenter.queueFocus();
        }
    }
}

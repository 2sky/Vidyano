module Vidyano.WebComponents {
    @Dialog.register({
        properties: {
            grid: Object,
            _columns: {
                type: Object,
                readOnly: true
            }
        },
        listeners: {
            "redistribute-columns": "_distributeColumns",
            "reorder-columns": "_reorderColumns"
        }
    })
    export class QueryGridConfigureDialog extends Dialog {
        private _columns: QueryGridConfigureDialogColumn[];

        private _set_columns: (columns: QueryGridConfigureDialogColumn[]) => void;

        constructor(public grid: QueryGrid) {
            super();

            this._set_columns(grid.query.columns.filter(c => c.width != "0").map(c => new Vidyano.WebComponents.QueryGridConfigureDialogColumn(c)));
            this._distributeColumns();
        }

        private _distributeColumns(e?: CustomEvent) {
            var columns = Enumerable.from(this._columns).orderBy(c => c.offset).memoize();

            requestAnimationFrame(() => {
                this._updateColumns(this.$["pinned"], columns.where(c => c.isPinned).toArray());
                this._updateColumns(this.$["unpinned"], columns.where(c => !c.isPinned).toArray());
            });

            if (e)
                e.stopPropagation();
        }

        private _updateColumns(target: HTMLElement, columns: QueryGridConfigureDialogColumn[]) {
            columns.forEach(col => target.appendChild(col));
        }

        private _reorderColumns(e: CustomEvent) {
            var children = <QueryGridConfigureDialogColumn[]>Polymer.dom(e.srcElement).children;
            var offsets = Enumerable.from(children).orderBy(c => c.offset).select(c => c.offset).toArray();

            children.forEach((child: QueryGridConfigureDialogColumn, index: number) => {
                child.offset = offsets[index];
            });
        }

        private _save() {
            var settings = this.app.service.application.userSettings["QueryGridSettings"] || (this.app.service.application.userSettings["QueryGridSettings"] = {});
            var querySettings = settings[this.grid.query.id] || (settings[this.grid.query.id] = {});

            (<QueryGridConfigureDialogColumn[]>Polymer.dom(this.$["pinned"]).children.concat(Polymer.dom(this.$["unpinned"]).children)).forEach(c => {
                var cr = querySettings[c.column.name];
                querySettings[c.column.name] = { offset: c.offset, isPinned: c.isPinned, isHidden: c.isHidden, dragWidth: cr != null ? cr.dragWidth : null };
            });

            this.app.service.application.saveUserSettings();

            this.instance.resolve();
        }

        private _reset() {
            var settings = this.app.service.application.userSettings["QueryGridSettings"];
            if (settings != null) {
                if (settings[this.grid.query.id] != null) {
                    delete settings[this.grid.query.id];

                    this.app.service.application.saveUserSettings();
                }
            }
        }
    }

    @Sortable.register({
        extends: "ul"
    })
    export class QueryGridConfigureDialogColumnList extends Sortable {
        protected _dragEnd() {
            this.fire("reorder-columns", {}, { bubbles: true });
        }
    }

    @WebComponent.register({
        extends: "li",
        properties: {
            label: {
                type: String,
                readOnly: true
            },
            isPinned: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            isHidden: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            }
        }
    })
    export class QueryGridConfigureDialogColumn extends WebComponent {
        isPinned: boolean;
        isHidden: boolean;
        offset: number;

        private _setLabel: (val: string) => void;
        private _setIsPinned: (val: boolean) => void;
        private _setIsHidden: (val: boolean) => void;

        constructor(public column: Vidyano.QueryColumn) {
            super();

            this.offset = column.offset;
            this._setLabel(column.label);
            this._setIsPinned(column.isPinned);
            this._setIsHidden(column.isHidden);
        }

        private _togglePin() {
            this._setIsPinned(!this.isPinned);

            this.fire("redistribute-columns", {}, { bubbles: true });
        }

        private _toggleVisible() {
            this._setIsHidden(!this.isHidden);
        }
    }
}
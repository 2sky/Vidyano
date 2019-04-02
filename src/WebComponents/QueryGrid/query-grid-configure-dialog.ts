namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            grid: Object,
            _columnElements: {
                type: Object,
                readOnly: true
            }
        },
        listeners: {
            "distribute-columns": "_distributeColumns",
            "reorder-columns": "_reorderColumns"
        }
    })
    export class QueryGridConfigureDialog extends Dialog {
        private readonly _columnElements: QueryGridConfigureDialogColumn[]; private _set_columnElements: (columns: QueryGridConfigureDialogColumn[]) => void;

        constructor(public grid: QueryGrid, private _settings: QueryGridUserSettings) {
            super();

            this._set_columnElements(this._settings.columns.filter(c => c.width !== "0").map(c => new Vidyano.WebComponents.QueryGridConfigureDialogColumn(c)));
            this._distributeColumns();
        }

        private _distributeColumns(e?: CustomEvent) {
            const columns = this._columnElements.orderBy(c => c.column.offset);

            requestAnimationFrame(() => {
                this._updateColumns(this.$.pinned, columns.filter(c => c.isPinned));
                this._updateColumns(this.$.unpinned, columns.filter(c => !c.isPinned));
            });

            if (e)
                e.stopPropagation();
        }

        private _updateColumns(target: HTMLElement, columns: QueryGridConfigureDialogColumn[]) {
            columns.orderBy(c => c.offset).forEach(col => Polymer.dom(target).appendChild(col));
        }

        private _reorderColumns(e: CustomEvent) {
            const children = <QueryGridConfigureDialogColumn[]>Polymer.dom(e.srcElement || <Node>this.grid.todo_checkEventTarget(e.target)).children;
            const offsets = children.orderBy(c => c.column.offset).map(c => c.column.offset);

            children.forEach((child: QueryGridConfigureDialogColumn, index: number) => {
                child.offset = offsets[index];
            });

            e.stopPropagation();
        }

        private _save() {
            this._columnElements.forEach(c => {
                c.column.isPinned = c.isPinned;
                c.column.isHidden = c.isHidden;
                c.column.offset = c.offset;

                if (c.calculatedWidth !== c.column.calculatedWidth) {
                    c.column.calculatedWidth = c.calculatedWidth;
                    c.column.width = c.column.column.width;
                }
            });

            this.close(true);
        }

        private _reset() {
            this._columnElements.forEach(c => {
                c.isPinned = c.column.column.isPinned;
                c.isHidden = c.column.column.isHidden;
                c.offset = c.column.column.offset;
                c.calculatedWidth = undefined;
            });

            this._distributeColumns();
        }
    }

    @WebComponent.register({
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
            column: Object,
            isPinned: {
                type: Boolean,
                reflectToAttribute: true
            },
            isHidden: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    })
    export class QueryGridConfigureDialogColumn extends WebComponent {
        offset: number;
        isPinned: boolean;
        isHidden: boolean;
        calculatedWidth: number;

        constructor(public column: QueryGridColumn) {
            super();

            this.offset = this.column.offset;
            this.isPinned = this.column.isPinned;
            this.isHidden = this.column.isHidden;
            this.calculatedWidth = this.column.calculatedWidth;
        }

        private _togglePin() {
            this.isPinned = !this.isPinned;

            this.fire("distribute-columns", {}, { bubbles: true });
        }

        private _toggleVisible() {
            this.isHidden = !this.isHidden;
        }
    }
}
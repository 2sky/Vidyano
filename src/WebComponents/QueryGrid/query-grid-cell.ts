namespace Vidyano.WebComponents {
    let renderRAFId: number;
    const renderWork: (() => boolean)[] = [];
    const renderTemplates: { [type: string]: { new (model: any): TemplateInstanceBase & Polymer.TemplateInstance }; } = { };

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            item: Object,
            column: {
                type: Object,
                observer: "_columnChanged"
            }
        },
        observers: [
            "_updateTemplate(item, column, isConnected)"
        ]
    })
    export class QueryGridCell extends Vidyano.WebComponents.WebComponent {
        private _cellType: string;
        private _instance: Polymer.TemplateInstance;
        private _parentRow: QueryGridRow;
        item: QueryResultItem;
        column: QueryGridColumn;

        private _computeAttribute(column: QueryGridColumn, persistentObject: Vidyano.PersistentObject): Vidyano.PersistentObjectAttribute {
            return persistentObject.getAttribute(column.name);
        }

        private async _updateTemplate(item: QueryResultItem, gridColumn: QueryGridColumn, isConnected: boolean) {
            if ([...arguments].some(arg => !arg))
                return;

            const work = () => {
                // Item changed between enqueue and render; remove it from queue
                if (item !== this.item)
                    return true;

                const shadowRoot = <ShadowRoot>this.parentNode.parentNode;
                if (shadowRoot && shadowRoot.host)
                    this._parentRow = <QueryGridRow>shadowRoot.host;
                else {
                    // Cell is not yet connected to the parent row; don't remove it from the render queue
                    return false;
                }

                if (!this._instance || this._cellType !== gridColumn.column.type) {
                    this._cellType = gridColumn.column.type;

                    // TODO: Update template when celltype changes
                    let templateClass = renderTemplates[gridColumn.column.type];
                    if (!templateClass) {
                        const resource = Resource.Load("query-grid-cell", this._cellType) || Resource.Load("query-grid-cell", "Default");
                        templateClass = renderTemplates[gridColumn.column.type] = Polymer.Templatize.templatize(resource.querySelector("template"));
                    }

                    this._instance = new templateClass({ value: null });
                    this.appendChild(this._instance.root);
                }

                (<any>this._instance).value = item ? item.getFullValue(gridColumn.name) : null;
                this._parentRow.cellRendered(this);

                return true;
            };

            renderWork.push(work.bind(this));
            if (!renderRAFId)
                renderRAFId = requestAnimationFrame(Vidyano.WebComponents.QueryGridCell._render);
        }

        private _columnChanged(column: QueryGridColumn) {
            if (!column)
                return;

            this.style.width = `var(--vi-query-grid-attribute-${this.column.name.replace(".", "-")}-width)`;
            this.updateStyles();
        }

        private static _render(time: number) {
            let now: number;

            do {
                const work = renderWork.shift();
                if (!work)
                    break;

                if (!work())
                    renderWork.push(work);

                now = window.performance.now();
            }
            while (now - time < 16);

            renderRAFId = renderWork.length ? requestAnimationFrame(Vidyano.WebComponents.QueryGridCell._render) : 0;
        }
    }
}
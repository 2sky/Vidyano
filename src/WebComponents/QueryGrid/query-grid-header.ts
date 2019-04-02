namespace Vidyano.WebComponents {
    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            column: {
                type: Object,
                observer: "_columnChanged"
            }
        }
    })
    export class QueryGridHeader extends Vidyano.WebComponents.WebComponent {
        column: QueryGridColumn;

        private _columnChanged(column: QueryGridColumn) {
            if (!column)
                return;

            this.style.width = `var(--vi-query-grid-attribute-${this.column.name.replace(".", "-")}-width)`;
            this.updateStyles();
        }
    }
}
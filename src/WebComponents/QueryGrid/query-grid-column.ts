namespace Vidyano.WebComponents {
    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            name: String,
            force: {
                type: Boolean,
                value: false
            },
            column: Object,
            width: {
                type: Number,
                value: 0
            }
        }
    })
    export class QueryGridColumn extends Vidyano.WebComponents.WebComponent {
        name: string;
        force: boolean;
        column: Vidyano.QueryColumn;
        width: number;
        grid: QueryGrid;
    }
}
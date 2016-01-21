module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            tab: Object,
            columns: {
                type: Number,
                computed: "_computeColumns(size, tab.columnCount)"
            },
            size: Object
        },
        forwardObservers: [
            "tab.groups"
        ]
    })
    export class PersistentObjectTab extends WebComponent {
        tab: Vidyano.PersistentObjectAttributeTab;

        private _computeColumns(size: Size, defaultColumnCount: number): number {
            if (defaultColumnCount)
                return defaultColumnCount;

            if (size.width >= 1500)
                return 4;
            else if (size.width > 1000)
                return 3;
            else if (size.width > 500)
                return 2;

            return 1;
        }
    }
}
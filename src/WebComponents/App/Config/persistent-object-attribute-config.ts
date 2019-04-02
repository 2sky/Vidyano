namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            type: String,
            name: String,
            noLabel: Boolean,
            parentId: String,
            parentObjectId: String,
            height: {
                type: String,
                value: "1"
            },
            width: {
                type: String,
                value: "attr.columnSpan"
            }
        }
    })
    export class PersistentObjectAttributeConfig extends TemplateConfig<Vidyano.PersistentObjectAttribute> {
        private _calculateHeight: (attr: Vidyano.PersistentObjectAttribute) => number;
        private _calculateWidth: (attr: Vidyano.PersistentObjectAttribute) => number;
        private height: string;
        private width: string;
        type: string;
        name: string;
        noLabel: boolean;
        parentId: string;
        parentObjectId: string;

        calculateHeight(attr: Vidyano.PersistentObjectAttribute): number {
            if (!this._calculateHeight) {
                if (/^\d+$/.test(this.height)) {
                    const height = parseInt(this.height);
                    this._calculateHeight = () => height;
                }
                else
                    this._calculateHeight = <any>new Function("attr", "return " + this.height);
            }

            const height = this._calculateHeight(attr);
            return typeof height !== "string" ? height : parseInt(height);
        }

        calculateWidth(attr: Vidyano.PersistentObjectAttribute): number {
            if (!this._calculateWidth) {
                if (/d+/.test(this.width)) {
                    const width = parseInt(this.width);
                    this._calculateWidth = () => width;
                }
                else
                    this._calculateWidth = <any>new Function("attr", "return " + this.width);
            }

            return Math.max(this._calculateWidth(attr), 1);
        }
    }
}
module Vidyano.WebComponents {
    export class PersistentObjectAttributeConfig extends WebComponent {
        private _calculateHeight: (attr: Vidyano.PersistentObjectAttribute) => number;
        private _calculateWidth: (attr: Vidyano.PersistentObjectAttribute) => number;
        private height: string;
        private width: string;
        type: string;
        name: string;
        parentId: string;
        parentObjectId: string;
        component: string;
        wrapAround: boolean;
        template: any;

        private _setTemplate: (template: HTMLElement) => void;

        attached() {
            super.attached();

            this._setTemplate(<HTMLElement>Polymer.dom(this).querySelector("template"));
        }

        calculateHeight(attr: Vidyano.PersistentObjectAttribute): number {
            if (!this._calculateHeight) {
                if (/d+/.test(this.height)) {
                    var height = parseInt(this.height);
                    this._calculateHeight = () => height;
                }
                else
                    this._calculateHeight = <any>new Function("attr", "return " + this.height);
            }

            return this._calculateHeight(attr);
        }

        calculateWidth(attr: Vidyano.PersistentObjectAttribute): number {
            if (!this._calculateWidth) {
                if (/d+/.test(this.width)) {
                    var width = parseInt(this.width);
                    this._calculateWidth = () => width;
                }
                else
                    this._calculateWidth = <any>new Function("attr", "return " + this.width);
            }

            return this._calculateWidth(attr);
        }
    }

    WebComponent.register(PersistentObjectAttributeConfig, WebComponents, "vi", {
        properties: {
            type: String,
            name: String,
            parentId: String,
            parentObjectId: String,
            height: {
                type: String,
                value: "2"
            },
            width: {
                type: String,
                value: "1"
            },
            template: {
                type: Object,
                readOnly: true
            }
        },
        hostAttributes: {
            "config": ""
        }
    });
}
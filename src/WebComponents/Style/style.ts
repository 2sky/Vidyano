namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            key: String
        }
    })
    export class Style extends Vidyano.WebComponents.WebComponent {
        static profile: boolean;

        private _uniqueId: string = Unique.get();
        private _styleElement: HTMLStyleElement;
        private _styles: { [key: string]: { node: Text; text: string; } } = {};
        key: string;

        connectedCallback() {
            super.connectedCallback();

            this.domHost.setAttribute("style-scope-id", this._uniqueId);
        }

        disconnectedCallback() {
            if (this._styleElement) {
                document.head.removeChild(this._styleElement);
                this._styleElement = undefined;
            }

            this.domHost.removeAttribute("style-scope-id");

            super.disconnectedCallback();
        }

        getStyle(name: string): string {
            return this._styles[name] ? this._styles[name].text : null;
        }

        setStyle(name: string, ...css: string[]) {
            let cssBody = "";
            css.filter(c => !StringEx.isNullOrEmpty(c)).forEach(c => {
                cssBody += this.key + "[style-scope-id=\"" + this._uniqueId + "\"] " + c + (css.length > 0 ? "\n" : "");
            });

            if (Vidyano.WebComponents.Style.profile)
                console.warn("Writing global style: " + name);

            if (!this._styleElement)
                this._styleElement = <HTMLStyleElement>document.head.appendChild(document.createElement("style"));

            if (this._styles[name])
                this._styles[name].node.nodeValue = this._styles[name].text = cssBody;
            else
                this._styles[name] = {
                    node: <Text>this._styleElement.appendChild(document.createTextNode(cssBody)),
                    text: cssBody
                };
        }
    }
}
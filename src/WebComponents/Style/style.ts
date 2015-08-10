module Vidyano.WebComponents {
    export class Style extends Vidyano.WebComponents.WebComponent {
        private _uniqueId: string = Unique.get();
        private _styleElement: HTMLStyleElement;
        private _styles: { [key: string]: Text } = {};
        key: string;

        attached() {
            super.attached();

            this.asElement.parentElement.setAttribute("style-scope-id", this._uniqueId);
        }

        detached() {
            if (this._styleElement) {
                document.head.removeChild(this._styleElement);
                this._styleElement = undefined;
            }

            this.asElement.parentElement.removeAttribute("style-scope-id");

            super.detached();
        }

        setStyle(name: string, ...css: string[]) {
            var cssBody = "";
            css.forEach(c => {
                cssBody += this.key + '[style-scope-id="' + this._uniqueId + '"] ' + c + (css.length > 0 ? "\n" : "");
            });

            if (!this._styleElement)
                this._styleElement = <HTMLStyleElement>document.head.appendChild(document.createElement("style"));

            var node = this._styles[name] || (this._styles[name] = <Text>this._styleElement.appendChild(document.createTextNode("")));
            node.textContent = cssBody;
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Style, Vidyano.WebComponents, "vi", {
        properties: {
            key: String
        }
    });
}
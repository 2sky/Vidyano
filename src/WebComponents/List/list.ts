namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            items: Array,
            as: String,
            parentScroller: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
        },
        observers: [
            "_hookIronListToScroller(parentScroller, isConnected)"
        ]
    })
    export class List extends WebComponent {
        parentScroller: boolean;

        private _hookIronListToScroller(parentScroller: boolean, isConnected: boolean) {
            if (!isConnected)
                return;

            if (parentScroller) {
                const template = this.$.parentScrollerTemplate;
                template["render"]();
            }

            this.async(() => {
                if (parentScroller !== this.parentScroller || !this.isConnected)
                    return;

                const list = this.shadowRoot.querySelector("#list");
                const scroller = <any>this.findParent(e => e instanceof Vidyano.WebComponents.Scroller, list);
                (<any>list).scrollTarget = scroller.$.wrapper;

                this._sizeChanged();
            });
        }

        private _bindIronListDataHost() {
            // Workaround for making sure events are delegated to the correct host
            const list = this.shadowRoot.querySelector("#list");
            if (list["dataHost"] && list["dataHost"]["_rootDataHost"] === this) {
                const dataHostParent = this.findParent(e => e["dataHost"]);
                if (dataHostParent)
                    list["dataHost"] = dataHostParent["dataHost"];
            }
        }

        private _sizeChanged() {
            const list = <PolymerBase>this.shadowRoot.querySelector("#list");
            if (!list || !list.fire)
                return;

            list.fire("iron-resize", null);
        }
    }
}
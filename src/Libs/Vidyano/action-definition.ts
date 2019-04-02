namespace Vidyano {
    export class ActionDefinition {
        private _name: string;
        private _displayName: string;
        private _isPinned: boolean;
        private _refreshQueryOnCompleted: boolean;
        private _keepSelectionOnRefresh: boolean;
        private _offset: number;
        private _iconData: string;
        private _reverseIconData: string;
        private _confirmation: string;
        private _options: Array<string> = [];
        private _selectionRule: (count: number) => boolean;
        private _showedOn: string[];

        constructor(service: Service, item: QueryResultItem) {
            this._name = item.getValue("Name");
            this._displayName = item.getValue("DisplayName");
            this._isPinned = item.getValue("IsPinned");
            this._confirmation = item.getValue("Confirmation");
            this._selectionRule = ExpressionParser.get(item.getValue("SelectionRule"));
            this._refreshQueryOnCompleted = item.getValue("RefreshQueryOnCompleted");
            this._keepSelectionOnRefresh = item.getValue("KeepSelectionOnRefresh");
            this._offset = item.getValue("Offset");
            this._showedOn = (<string>item.getValue("ShowedOn") || "").split(",").map(v => v.trim());

            const icon = item.getFullValue("Icon");

            const options = item.getValue("Options");
            this._options = !StringEx.isNullOrWhiteSpace(options) ? options.split(";") : [];

            if (icon != null) {
                const appIcon = service.icons[icon.objectId];
                if (StringEx.isNullOrWhiteSpace(appIcon))
                    return;

                const iconWidth = 20, iconHeight = 20;
                const img = new Image();
                img.width = iconWidth;
                img.height = iconHeight;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = iconWidth;
                    canvas.height = iconHeight;
                    const canvasContext = <CanvasRenderingContext2D>canvas.getContext("2d");
                    canvasContext.drawImage(img, 0, 0, iconWidth, iconHeight);

                    const imgd = canvasContext.getImageData(0, 0, iconWidth, iconHeight);
                    const pix = imgd.data;

                    for (let i = 0, n = pix.length; i < n; i += 4) {
                        pix[i] = 255 - pix[i];
                        pix[i + 1] = 255 - pix[i + 1];
                        pix[i + 2] = 255 - pix[i + 2];
                    }

                    canvasContext.putImageData(imgd, 0, 0);

                    this._reverseIconData = canvas.toDataURL("image/png");
                };
                img.src = appIcon.asDataUri();
            }
            else
                this._reverseIconData = null;
        }

        get name(): string {
            return this._name;
        }

        get displayName(): string {
            return this._displayName;
        }

        get isPinned(): boolean {
            return this._isPinned;
        }

        get refreshQueryOnCompleted(): boolean {
            return this._refreshQueryOnCompleted;
        }

        get keepSelectionOnRefresh(): boolean {
            return this._keepSelectionOnRefresh;
        }

        get offset(): number {
            return this._offset;
        }

        get iconData(): string {
            return this._iconData;
        }

        get reverseIconData(): string {
            return this._reverseIconData;
        }

        get confirmation(): string {
            return this._confirmation;
        }

        get options(): Array<string> {
            return this._options;
        }

        get selectionRule(): (count: number) => boolean {
            return this._selectionRule;
        }

        get showedOn(): string[] {
            return this._showedOn;
        }
    }
}
namespace Vidyano {
    "use strict";

    export class Language extends Vidyano.Common.Observable<ServiceObject> implements Service.Language {
        constructor(private _language: Service.Language, private _culture: string) {
            super();
        }

        get culture(): string {
            return this._culture;
        }

        get name(): string {
            return this._language.name;
        }

        get isDefault(): boolean {
            return this._language.isDefault;
        }

        get messages(): { [key: string]: string; } {
            return this._language.messages;
        }

        set messages(value: { [key: string]: string; }) {
            const oldMessages = this._language.messages;
            this.notifyPropertyChanged("messages", this._language.messages = value, oldMessages);
        }
    }
}
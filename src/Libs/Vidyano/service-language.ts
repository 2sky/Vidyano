namespace Vidyano {

    export class ServiceLanguage extends Vidyano.Common.Observable<ServiceObject> implements ILanguage {
        constructor(private _language: ILanguage) {
            super();
        }

        get culture(): string {
            return this._language.culture;
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
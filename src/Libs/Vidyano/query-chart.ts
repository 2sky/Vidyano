namespace Vidyano {
    export class QueryChart extends Vidyano.Common.Observable<QueryChart> {
        constructor(private _query: Vidyano.Query, private _label: string, private _name: string, private _options: any, private _type: string) {
            super();
        }

        get query(): Vidyano.Query {
            return this._query;
        }

        get label(): string {
            return this._label;
        }

        get name(): string {
            return this._name;
        }

        get options(): any {
            return this._options;
        }

        get type(): string {
            return this._type;
        }

        async execute(parameters: any = {}): Promise<any> {
            const result = await this._query.service.executeAction("QueryFilter.Chart", this._query.parent, this._query, null, Vidyano.extend(parameters, { name: this.name }));
            return JSON.parse(result.getAttributeValue("Data"));
        }
    }
}
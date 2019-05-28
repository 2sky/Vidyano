namespace Vidyano {
    export class ServiceWorkerActions {
        private static _types = new Map<string, any>();
        static async get<T>(name: string, db: IndexedDB): Promise<ServiceWorkerActions> {
            if (!(/^\w+$/.test(name))) {
                const classNameRecord = await db.getActionClass(name);
                if (!classNameRecord)
                    return null;

                name = classNameRecord.name;
            }

            let actionsClass = ServiceWorkerActions._types.get(name);
            if (actionsClass === undefined) {
                try {
                    actionsClass = eval.call(null, `ServiceWorker${name}Actions`);
                }
                catch (e) {
                    const className = await db.getActionClass(name);
                    if (className) {
                        try {
                            actionsClass = eval.call(null, `ServiceWorker${className}Actions`);
                        }
                        catch (ee) {
                            actionsClass = null;
                        }
                    }
                    else
                        actionsClass = null;
                }
                finally {
                    ServiceWorkerActions._types.set(name, actionsClass);
                }
            }

            const instance = new (actionsClass || ServiceWorkerActions)();
            instance._context = await db.createContext();

            return instance;
        }

        private _context: IIndexedDBContext;

        get context(): IIndexedDBContext {
            return this._context;
        }

        async onGetPersistentObject(parent: ReadOnlyPersistentObject, id: string, objectId?: string, isNew?: boolean): Promise<PersistentObject> {
            const po = await this.context.getPersistentObject(id, objectId);
            if (!po)
                return null;

            po.isNew = isNew;
            po.actions = (po.actions || []);

            const breadcrumbRE = /{([^{]+?)}/;
            do {
                const m = breadcrumbRE.exec(po.breadcrumb);
                if (!m)
                    break;

                const attribute = po.attributes.find(a => a.name === m[1]);
                if (!attribute)
                    continue;

                po.breadcrumb = po.breadcrumb.replace(m[0], attribute.value);
            } while (true);

            if (po.queries) {
                const autoQueries = po.queries.filter(q => q.autoQuery);
                for (let i = 0; i < autoQueries.length; i++) {
                    const query = po.queries[i];
                    query.result.items = (await this.onExecuteQuery(query, po)).items;
                }
            }

            return Wrappers.PersistentObjectWrapper._wrap(po);
        }

        async onGetQuery(id: string): Promise<Query> {
            const storedQuery = await this.context.getQuery(id);
            const query = <Query>Wrappers.QueryWrapper._wrap(storedQuery);

            if (query.autoQuery) {
                const result = await this.onExecuteQuery(query, null);
                query.result.items = result.items;
            }

            return query;
        }

        async onExecuteQuery(query: ReadOnlyQuery, parent: ReadOnlyPersistentObject): Promise<QueryResult> {
            const storedQuery = await this.context.getQuery(query.id);
            const result = storedQuery.result;
            result.sortOptions = query.sortOptions;
            result.items = await this.context.getQueryResults(query, parent);

            if (query.textSearch)
                result.items = this.onTextSearch(query.textSearch, result);

            result.items = this.onSortQueryResult(result);

            return result;
        }

        onTextSearch(textSearch: string, result: QueryResult): QueryResultItem[] {
            const items = result.items;
            if (!textSearch)
                return items;

            const columns = result.columns;
            const columnNames = columns.map(c => c.name);

            // Replace labels with column names
            columns.forEach(col => textSearch = textSearch.replace(new RegExp(col.label + ":", "ig"), col.name + ":"));

            const hasPrefix = new RegExp("^(" + columnNames.join("|") + "):", "i");
            const matches: [string, string, number, boolean][] = textSearch.match(/\S+/g).map(text => {
                let name: string = null;
                if (hasPrefix.test(text)) {
                    const textParts = text.split(":");
                    name = textParts[0].toLowerCase();
                    text = textParts[1];
                }

                return <[string, string, number, boolean]>[name, text.toLowerCase(), parseInt(text), BooleanEx.parse(text)];
            });

            return items.filter(item => {
                const values = item.values;
                return values.some(itemValue => {
                    const column = result.getColumn(itemValue.key);
                    if (column.type == "Image" || column.type == "BinaryFile" || column.type == "Time" || column.type == "NullableTime")
                        return false;

                    const value = DataType.fromServiceString(itemValue.value, column.type);
                    return matches.filter(m => m[0] == null || m[0] == column.name.toLowerCase()).some(match => {
                        if (DataType.isNumericType(column.type)) {
                            if (isNaN(match[2])) {
                                // TODO: Check expression
                                return false;
                            }
                            else
                                return Math.abs(match[2] - value) < 1;
                        }
                        else if (DataType.isDateTimeType(column.type)) {
                            // TODO
                            return false;
                        }
                        else if (DataType.isBooleanType(column.type)) {
                            return value == match[3];
                        }
                        else if (column.type === "KeyValueList")
                            return false; // TODO

                        return itemValue.value != null && itemValue.value.toLowerCase().indexOf(match[1]) != -1;
                    });
                });
            });
        }

        onSortQueryResult(result: QueryResult): QueryResultItem[] {
            const sortOptions: [QueryColumn, number][] = (result.sortOptions || "").split(";").map(option => option.trim()).map(option => {
                const optionParts = option.split(" ");
                const column = result.getColumn(optionParts[0]);
                if (!column)
                    return null;

                const sort = optionParts.length === 1 ? 1 : (<Service.SortDirection>optionParts[1] === "ASC" ? 1 : -1);
                return <[QueryColumn, number]>[column, sort];
            }).filter(so => so != null);

            const items = result.items.sort((i1, i2) => {
                for (let i = 0; i < sortOptions.length; i++) {
                    const s = sortOptions[i];

                    const valueItem1 = i1.getValue(s[0].name);
                    const value1 = valueItem1 ? valueItem1.value : "";

                    const valueItem2 = i2.getValue(s[0].name);
                    const value2 = valueItem2 ? valueItem2.value : "";

                    const result = this.onDataTypeCompare(value1, value2, s[0].type);
                    if (result)
                        return result * s[1];
                }

                return 0;
            });

            return items;
        }

        onDataTypeCompare(value1: any, value2: any = "", datatype: string = ""): number {
            if (DataType.isDateTimeType(datatype) || DataType.isNumericType(datatype))
                return DataType.fromServiceString(value1, datatype) - DataType.fromServiceString(value2, datatype);

            return value1.localeCompare(value2);
        }

        protected onFilter(query: Service.Query): QueryResultItem[] {
            throw "Not implemented";
        }

        async onExecuteQueryAction(action: string, query: ReadOnlyQuery, selectedItems: QueryResultItem[], parameters: Service.ExecuteActionParameters, parent?: ReadOnlyPersistentObject): Promise<PersistentObject> {
            if (action === "New")
                return this.onNew(query);
            else if (action === "BulkEdit") {
                const po = await this.onGetPersistentObject(null, query.persistentObject.id, selectedItems[0].id);
                po.stateBehavior = "StayInEdit";

                return po;
            }
            else if (action === "Delete")
                await this.onDelete(query, selectedItems);

            return null;
        }

        async onExecutePersistentObjectAction(action: string, persistentObject: PersistentObject, parameters: Service.ExecuteActionParameters): Promise<PersistentObject> {
            if (action === "Save")
                return this.onSave(persistentObject);
            else if (action === "Refresh")
                return this.onRefresh(persistentObject, parameters as Service.ExecuteActionRefreshParameters);

            return null;
        }

        async onNew(query: ReadOnlyQuery): Promise<PersistentObject> {
            return Wrappers.PersistentObjectWrapper._wrap(await this.context.getNewPersistentObject(query));
        }

        async onRefresh(persistentObject: PersistentObject, parameters: Service.ExecuteActionRefreshParameters): Promise<PersistentObject> {
            return persistentObject;
        }

        async onDelete(query: ReadOnlyQuery, selectedItems: QueryResultItem[]): Promise<void> {
            await this.context.delete(query, selectedItems);
        }

        async onCascadeDelete(item: Vidyano.QueryResultItem, query: Vidyano.ReadOnlyQuery, relatedItem: Vidyano.QueryResultItem, relatedQuery: Vidyano.ReadOnlyQuery): Promise<boolean> {
            return false;
        }

        onSave(obj: PersistentObject): Promise<PersistentObject> {
            if (obj.isNew)
                return this.saveNew(obj);

            return this.saveExisting(obj);
        }

        saveNew(newObj: PersistentObject): Promise<PersistentObject> {
            return this.context.savePersistentObject(newObj);
        }

        saveExisting(obj: PersistentObject): Promise<PersistentObject> {
            return this.context.savePersistentObject(obj);
        }
    }
}
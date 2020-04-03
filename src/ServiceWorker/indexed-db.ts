namespace Vidyano {
    export class IndexedDB<StoreName extends string> {
        private _initializing: Promise<void>;
        private _db: idb.DB;

        constructor() {
            this._initializing = new Promise<void>(async resolve => {
                this._db = await idb.open("vidyano.offline", 1, upgrade => {
                    upgrade.createObjectStore("Requests", { keyPath: "id" });
                    const queries = upgrade.createObjectStore("Queries", { keyPath: "id" });
                    queries.createIndex("WithResults", "hasResults");
                    queries.createIndex("ByPersistentObjectId", "persistentObject.id");
                    queries.createIndex("ByPersistentObjectIdWithResults", ["persistentObject.id", "hasResults"]);

                    const queryResults = upgrade.createObjectStore("QueryResults", { keyPath: ["persistentObjectId", "id"] });
                    queryResults.createIndex("ByPersistentObjectId", "persistentObjectId");

                    upgrade.createObjectStore("PersistentObjects", { keyPath: "id" });
                    upgrade.createObjectStore("ActionClassesById", { keyPath: "id" });

                    upgrade.createObjectStore("Changes", { keyPath: "id", autoIncrement: true });

                    upgrade.createObjectStore("Settings", { keyPath: "key" });
                });

                resolve();
            });
        }

        get db(): idb.DB {
            return this._db;
        }

        async createContext(): Promise<IndexedDBContext<StoreName>> {
            await this._initializing;

            return new IndexedDBContext(this);
        }
    }

    class IndexedDBContext<StoreName extends string> {
        private readonly _transaction: idb.Transaction;

        constructor(private _db: IndexedDB<StoreName>) {
            this._transaction = _db.db.transaction(["Requests", "Queries", "QueryResults", "ActionClassesById", "Changes", "viSettings"], "readwrite");
            this._transaction.complete.catch(e => {
                if (!e) // Abort also requires the transaction complete catch
                    return;

                console.error(e);
            });
        }

        async clear(storeName: StoreName): Promise<void> {
            const store = this._transaction.objectStore(storeName);
            await store.clear();
        }

        async exists(storeName: StoreName, key: string | string[]): Promise<boolean> {
            const store = this._transaction.objectStore(storeName);
            return !!await store.getKey(key);
        }

        saveChanges(): Promise<void> {
            return this._transaction.complete;
        }

        async save(storeName: StoreName, entry?: any): Promise<void> {
            await this._transaction.objectStore(storeName).put(entry);
        }

        async saveAll(storeName: StoreName, entries: any[]): Promise<void> {
            const store = this._transaction.objectStore(storeName);

            for (let i = 0; i < entries.length; i++)
                await store.put(entries[i]);
        }

        async add(storeName: StoreName, entry: any): Promise<void> {
            const store = this._transaction.objectStore(storeName);
            store.add(entry);
        }

        async addAll(storeName: StoreName, entries: any[]): Promise<void> {
            const store = this._transaction.objectStore(storeName);

            for (let i = 0; i < entries.length; i++)
                store.add(entries[i]);
        }

        async load(storeName: StoreName, key: string | string[]): Promise<any> {
            const store = this._transaction.objectStore(storeName);
            return await store.get(key);
        }

        async loadAll(storeName: StoreName, indexName?: string, key?: any): Promise<any[]> {
            const store = this._transaction.objectStore(storeName);

            if (indexName)
                return await store.index(indexName).getAll(key);

            return await store.getAll(key);
        }

        async deleteAll<K extends keyof StoreName>(storeName: string, condition: (item: any) => boolean): Promise<number>;
        async deleteAll<K extends keyof StoreName>(storeName: string, index: string, indexKey: IDBValidKey, condition: (item: any) => boolean): Promise<number>;
        async deleteAll<K extends keyof StoreName>(storeName: string, indexOrCondition: string | ((item: any) => boolean), indexKey?: IDBValidKey, condition?: (item: any) => boolean): Promise<number> {
            const store = this._transaction.objectStore(storeName);
            let cursor: idb.Cursor<any, any>;

            if (!indexKey) {
                condition = <(item: any) => boolean>indexOrCondition;
                cursor = await store.openKeyCursor();
            }
            else
                cursor = await store.index(<string>indexOrCondition).openCursor(indexKey);

            let nDeleted = 0;
            while (cursor && cursor.value) {
                if (condition(cursor.value)) {
                    await cursor.delete();
                    nDeleted++;
                }

                cursor = await cursor.continue();
            }

            return nDeleted;
        }
    }
}
namespace Vidyano {
    export abstract class IndexedDB {
        constructor(private readonly name: string, private readonly version: number) {
        }

        protected abstract initialize(upgrade: idb.UpgradeDB);

        private async _open(): Promise<idb.DB> {
            return await idb.open(this.name, this.version, upgrade => {
                this.initialize(upgrade);
            });
        }

        async transaction(callback: (transaction: IndexedDBTransaction) => Promise<any>, ...storeNames: string[]): Promise<any> {
            const db = await this._open();

            try {
                const transaction = db.transaction(storeNames, "readwrite");

                const result = await callback(new IndexedDBTransaction(transaction));
                await transaction.complete;

                return result;
            }
            finally {
                db.close();
            }
        }
    }

    export class IndexedDBTransaction {
        constructor(private readonly _transaction: idb.Transaction) {
        }

        async clear(storeName: string): Promise<void> {
            const store = this._transaction.objectStore(storeName);
            await store.clear();
        }

        async exists(storeName: string, key: string | string[]): Promise<boolean> {
            const store = this._transaction.objectStore(storeName);
            return !!await store.getKey(key);
        }

        saveChanges(): Promise<void> {
            return this._transaction.complete;
        }

        async save(storeName: string, entry?: any): Promise<void> {
            await this._transaction.objectStore(storeName).put(entry);
        }

        async saveAll(storeName: string, entries: any[]): Promise<void> {
            const store = this._transaction.objectStore(storeName);

            for (let i = 0; i < entries.length; i++)
                await store.put(entries[i]);
        }

        async add(storeName: string, entry: any): Promise<void> {
            const store = this._transaction.objectStore(storeName);
            store.add(entry);
        }

        async addAll(storeName: string, entries: any[]): Promise<void> {
            const store = this._transaction.objectStore(storeName);

            for (let i = 0; i < entries.length; i++)
                store.add(entries[i]);
        }

        async load(storeName: string, key: string | string[]): Promise<any> {
            const store = this._transaction.objectStore(storeName);
            return await store.get(key);
        }

        async loadAll(storeName: string, indexName?: string, key?: any): Promise<any[]> {
            const store = this._transaction.objectStore(storeName);

            if (indexName)
                return await store.index(indexName).getAll(key);

            return await store.getAll(key);
        }

        async deleteAll<K extends keyof string>(storeName: string, condition: (item: any) => boolean): Promise<number>;
        async deleteAll<K extends keyof string>(storeName: string, index: string, indexKey: IDBValidKey, condition: (item: any) => boolean): Promise<number>;
        async deleteAll<K extends keyof string>(storeName: string, indexOrCondition: string | ((item: any) => boolean), indexKey?: IDBValidKey, condition?: (item: any) => boolean): Promise<number> {
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

    export class IndexedDBVidyano extends IndexedDB {
        constructor() {
            super("vidyano", 1);
        }

        protected initialize(upgrade: idb.UpgradeDB) {
            if (upgrade.oldVersion < 1) {
                upgrade.createObjectStore("Requests", { keyPath: "id" });
                upgrade.createObjectStore("Settings", { keyPath: "key" });
            }
        }

        async setting(key: string, value?: string): Promise<string> {
            return this.transaction(async tx => {
                if (value) {
                    await tx.save("Settings", {
                        key: key,
                        value: value
                    });
                }
                else
                    await tx.deleteAll("Settings", setting => {
                        return setting.key === key;
                    });

                return value;
            }, "Settings");
        }

        async getClientData(): Promise<Service.ClientData> {
            return this.transaction(async tx => {
                const request = await tx.load("Requests", "GetClientData");
                return request.response;
            }, "Requests");
        }

        async saveClientData(clientData: Service.ClientData): Promise<void> {
            return this.transaction(async tx => {
                await tx.save("Requests", {
                    id: "GetClientData",
                    response: clientData
                });
            }, "Requests");
        }

        async getApplication(): Promise<Service.ApplicationResponse> {
            return this.transaction(async tx => {
                const request = await tx.load("Requests", "GetApplication");
                return request.response;
            }, "Requests");
        }

        async saveApplication(application: Service.ApplicationResponse): Promise<void> {
            return this.transaction(async tx => {
                await tx.save("Requests", {
                    id: "GetApplication",
                    response: application
                });
            }, "Requests");
        }
    }
}
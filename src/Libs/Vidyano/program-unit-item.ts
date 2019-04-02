namespace Vidyano {
    export class ProgramUnitItem extends ServiceObject {
        id: string;
        title: string;
        name: string;

        constructor(service: Service, unitItem: any, public path?: string) {
            super(service);

            this.id = unitItem.id;
            this.title = unitItem.title;
            this.name = unitItem.name;
        }
    }

    export class ProgramUnitItemGroup extends ProgramUnitItem {
        constructor(service: Service, unitItem: any, public items: ProgramUnitItem[]) {
            super(service, unitItem);
        }
    }

    export class ProgramUnitItemQuery extends ProgramUnitItem {
        queryId: string;

        constructor(service: Service, routes: IRoutes, unitItem: any, parent: ProgramUnit) {
            super(service, unitItem, parent.name + ProgramUnitItemQuery._getPath(routes, unitItem.query));

            this.queryId = unitItem.query;
        }

        private static _getPath(routes: IRoutes, id: string): string {
            const queries = routes.queries;
            for (const name in queries) {
                if (queries[name] === id)
                    return "/" + name;
            }

            return "/Query." + id;
        }
    }

    export class ProgramUnitItemPersistentObject extends ProgramUnitItem {
        persistentObjectId: string;
        persistentObjectObjectId: string;

        constructor(service: Service, routes: IRoutes, unitItem: any, parent: ProgramUnit) {
            super(service, unitItem, parent.name + ProgramUnitItemPersistentObject._getPath(routes, unitItem.persistentObject, unitItem.objectId));

            this.persistentObjectId = unitItem.persistentObject;
            this.persistentObjectObjectId = unitItem.objectId;
        }

        private static _getPath(routes: IRoutes, id: string, objectId: string): string {
            const persistentObjects = routes.persistentObjects;
            for (const name in persistentObjects) {
                if (persistentObjects[name] === id)
                    return "/" + name + (objectId ? "/" + objectId : "");
            }

            return "/PersistentObject." + id + (objectId ? "/" + objectId : "");
        }
    }

    export class ProgramUnitItemUrl extends ProgramUnitItem {
        constructor(service: Service, unitItem: any) {
            super(service, unitItem, unitItem.objectId);
        }
    }
}
namespace Vidyano {
    export class ProgramUnit extends ProgramUnitItem {
        offset: number;
        openFirst: boolean;
        items: ProgramUnitItem[];

        constructor(service: Service, routes: IRoutes, unit: any) {
            super(service, unit, unit.name);

            this.offset = unit.offset;
            this.openFirst = unit.openFirst;

            if (unit.items) {
                this.items = [];
                const usedGroups: { [key: string]: ProgramUnitItemGroup } = {};

                unit.items.forEach(itemData => {
                    let itemsTarget = this.items;

                    if (!itemData.group) {
                        const pathIndex = itemData.name.lastIndexOf("\\");
                        if (pathIndex >= 0) {
                            const groupNames = <string[]>itemData.name.split("\\");
                            groupNames.pop();

                            let groupId = null;
                            groupNames.forEach(groupName => {
                                const parentGroup = usedGroups[groupId];
                                let group = usedGroups[groupId = groupId ? `${groupId}\\${groupName}` : groupName];

                                if (!group) {
                                    usedGroups[groupId] = group = new ProgramUnitItemGroup(service, { id: groupId, title: groupName, name: groupId }, []);
                                    if (parentGroup)
                                        parentGroup.items.push(group);
                                    else
                                        this.items.push(group);
                                }

                                itemsTarget = group.items;
                            });
                        }
                    }
                    else {
                        if (!usedGroups[itemData.group.id])
                            itemsTarget.push(usedGroups[itemData.group.id] = new ProgramUnitItemGroup(service, itemData.group, []));

                        itemsTarget = usedGroups[itemData.group.id].items;
                    }

                    itemsTarget.push(this._createItem(routes, itemData));
                });
            }

            if (this.openFirst && this.items.length > 0 && !(this.items[0] instanceof ProgramUnitItemUrl)) {
                this.path = this.items[0].path;

                if (this.items[0].title === this.title)
                    this.items.splice(0, 1);
            }
        }

        private _createItem(routes: IRoutes, itemData: any): ProgramUnitItem {
            if (itemData.query)
                return new ProgramUnitItemQuery(this.service, routes, itemData, this);

            if (itemData.persistentObject)
                return new ProgramUnitItemPersistentObject(this.service, routes, itemData, this);

            return new ProgramUnitItemUrl(this.service, itemData);
        }
    }
}
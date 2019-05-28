namespace Vidyano.WebComponents {
    "use strict";

    interface ILogEntryGroup {
        today: boolean;
        date: Date;
        day: number;
        dayOfWeek: string;
        monthYear: string;
        entries: ILogEntry[];
    }

    interface ILogEntry {
        item: Vidyano.QueryResultItem;
        obj: Vidyano.PersistentObject;
        actionName: string;
        action: string;
        time: string;
        user: string;
        originalUser: string;
        busy: boolean;
        changes: ILogEntryChange[];
        inData: Vidyano.PersistentObject;
        outData: Vidyano.PersistentObject;
        href: string;
        groupIndex: number;
        entryIndex: number;
        expanded?: boolean;
    }

    interface ILogEntryChange {
        name: string;
        value: string;
    }

    type AuditPersistentObject = Vidyano.PersistentObject & {
        __audit_groups__?: ILogEntryGroup[];
        __audit_verticalScrollOffset__?: number;
        __audit_filter__?: string;
    };

    @WebComponent.register({
        properties: {
            persistentObject: Object,
            query: {
                type: Object,
                computed: "_computeQuery(persistentObject)"
            },
            groups: {
                type: Array,
                readOnly: true
            },
            search: String,
            filter: {
                type: String,
                readOnly: true,
                value: null
            },
            verticalScrollOffset: Number
        },
        forwardObservers: [
            "query.items"
        ],
        observers: [
            "_itemsChanged(query.items, persistentObject, app)",
            "_syncVerticalScrollOffset(verticalScrollOffset, persistentObject, isAttached)",
            "_syncFilter(filter, persistentObject, isAttached)"
        ]
    })
    export class Audit extends WebComponent {
        private _updating: Promise<any>;
        private _lastGroup: ILogEntryGroup;
        private readonly groups: ILogEntryGroup[]; private _setGroups: (groups: ILogEntryGroup[]) => void;
        private verticalScrollOffset: number;
        private search: string;
        private readonly filter: string; private _setFilter: (filter: string) => void;

        private _computeQuery(persistentObject: Vidyano.PersistentObject): Vidyano.Query {
            const logsVerbose = persistentObject.getQuery("LogsVerbose");
            logsVerbose.actions.forEach(a => {
                a.isVisible = false;
            });

            return logsVerbose;
        }

        private _syncVerticalScrollOffset(verticalScrollOffset: number, persistentObject: AuditPersistentObject, isAttached: boolean) {
            if (persistentObject && !isAttached && !isNaN(verticalScrollOffset))
                persistentObject.__audit_verticalScrollOffset__ = verticalScrollOffset;
            else if (!isNaN(persistentObject.__audit_verticalScrollOffset__)) {
                Polymer.dom(this).flush();

                const newVerticalScrollOffset = persistentObject.__audit_verticalScrollOffset__;
                persistentObject.__audit_verticalScrollOffset__ = Number.NaN;
                this.verticalScrollOffset = newVerticalScrollOffset;
            }
        }

        private _syncFilter(filter: string, persistentObject: AuditPersistentObject, isAttached: boolean) {
            if (persistentObject && !isAttached)
                persistentObject.__audit_filter__ = filter;
            else if (persistentObject.__audit_filter__) {
                Polymer.dom(this).flush();

                const filter = persistentObject.__audit_filter__;
                persistentObject.__audit_filter__ = null;
                this._setFilter(this.search = filter);
            }
        }

        private async _itemsChanged(items: Vidyano.QueryResultItem[], persistentObject: AuditPersistentObject) {
            if (!items)
                return;

            if (this._updating)
                await this._updating;

            let done: () => void;
            this._updating = new Promise((resolve) => done = resolve);

            this._setGroups(persistentObject.__audit_groups__ || (persistentObject.__audit_groups__ = []));

            const newItems = items.slice(this.groups.reduce((prev, curr) => prev + curr.entries.length, 0));
            for (let item of newItems) {
                const createdOn = <Date>item.values.CreatedOn;

                if (!this._lastGroup || this._lastGroup.date.getDate() !== createdOn.getDate() || this._lastGroup.date.getMonth() !== createdOn.getMonth() || this._lastGroup.date.getFullYear() !== createdOn.getFullYear()) {
                    const today = new Date();
                    this._lastGroup = {
                        today: today.getDate() === createdOn.getDate() && today.getMonth() === createdOn.getMonth() && today.getFullYear() === createdOn.getFullYear(),
                        date: createdOn,
                        day: createdOn.getDate(),
                        dayOfWeek: StringEx.format("{0:dddd}", createdOn),
                        monthYear: StringEx.format("{0:MMMM yyyy}", createdOn),
                        entries: []
                    };

                    this.push("groups", this._lastGroup);
                }

                const actionName = (<string>item.getValue("Action")).replace("PersistentObject.", "");
                const action = this.service.actionDefinitions.get(actionName);

                const logEntry: ILogEntry = {
                    item: item,
                    obj: null,
                    actionName: actionName,
                    action: action ? action.displayName : actionName,
                    time: StringEx.format("{0:T}", createdOn),
                    user: item.values.User,
                    originalUser: item.values.OriginalUser ? ` (${item.values.OriginalUser})` : "",
                    busy: true,
                    changes: [],
                    inData: null,
                    outData: null,
                    href: this.computePath(`${this.app.programUnit.name}/PersistentObject.${item.query.persistentObject.id}/${item.id}`),
                    groupIndex: this.groups.length - 1,
                    entryIndex: this.groups[this.groups.length - 1].entries.length
                };

                this.push(`groups.${logEntry.groupIndex}.entries`, logEntry);

                item.query.parent = null;
                logEntry.obj = await item.getPersistentObject();
                const [poIn, poOut] = <Vidyano.PersistentObject[]>await Promise.all([
                    (<Vidyano.PersistentObjectAttributeWithReference>logEntry.obj.getAttribute("IncomingDataReference")).getPersistentObject(),
                    (<Vidyano.PersistentObjectAttributeWithReference>logEntry.obj.getAttribute("OutgoingDataReference")).getPersistentObject()
                ]);

                logEntry.inData = this.service.hooks.onConstructPersistentObject(this.service, <Vidyano.Service.PersistentObject>this._getInData(poIn).parent);
                logEntry.changes = logEntry.inData.attributes.filter(a => a.isValueChanged).map(a => {
                    return {
                        name: a.label,
                        value: a.displayValue
                    };
                });

                logEntry.outData = this.service.hooks.onConstructPersistentObject(this.service, <Vidyano.Service.PersistentObject>this._getOutData(poOut).result);

                this.set(`groups.${this.groups.length - 1}.entries.${logEntry.entryIndex}.busy`, false);
            }

            done();
        }

        private _getInData(poIn: Vidyano.PersistentObject): any {
            const data = <string>poIn.getAttributeValue("Data");
            if (data[0] === "{")
                return JSON.parse(data);

            const dataLines = data.split("\r\n");
            const boundary = dataLines[0];
            const blocks: string[][] = [];
            for (let line of dataLines) {
                if (line.startsWith(boundary)) {
                    blocks.push([]);
                    continue;
                }

                blocks[blocks.length - 1].push(line);
            }

            const dataBlockIndex = blocks.findIndex(block => block[0].contains(`name="data"`));
            const dataBlock = blocks[dataBlockIndex];
            const dataLineIndex = dataBlock.findIndex(line => line[0] === "{");

            return JSON.parse(dataBlock.slice(dataLineIndex).join("\r\n"));
        }

        private _getOutData(poOut: Vidyano.PersistentObject): any {
            const data = <string>poOut.getAttributeValue("Data");
            if (data[0] === "{")
                return JSON.parse(data);

            const div = document.createElement("div");
            div.innerHTML = data;

            let value = div.querySelector("textarea").value;
            if (value.startsWith("<![CDATA["))
                value = value.substring("<![CDATA[".length, value.length - "]]>".length);

            return JSON.parse(value);
        }

        private _filterEntry(filter: string): (entry: ILogEntry) => boolean {
            if (!this.filter)
                return () => true;

            filter = this.filter.toLowerCase();
            return entry => {
                if (entry.changes.some(c => c.name.toLowerCase().contains(filter) || c.value.toLowerCase().contains(filter)))
                    return true;

                if (entry.outData && entry.outData.notification && entry.outData.notification.toLowerCase().contains(filter))
                    return true;

                return false;
            };
        }

        private _entryActionIcon(item: ILogEntry): string {
            const icon = `Action_${item.actionName}`;
            return !Icon.Exists(icon) ? "Action_Default$" : icon;
        }

        private _open(e: TapEvent) {
            const item = <ILogEntry>e.model.entry;
            const sourceEvent = <MouseEvent>e.detail.sourceEvent;
            if (sourceEvent && (sourceEvent.ctrlKey || sourceEvent.shiftKey))
                window.open(item.href);
            else
                this.service.hooks.onOpen(item.obj);

            e.stopPropagation();
            e.preventDefault();
            sourceEvent.stopPropagation();
            sourceEvent.preventDefault();
        }

        private _filter() {
            this._setFilter(this.search);
        }

        private _expand(e: TapEvent) {
            const entry = <ILogEntry>e.model.entry;
            this.set(`groups.${entry.groupIndex}.entries.${entry.entryIndex}.expanded`, !entry.expanded);

            e.stopPropagation();
            e.detail.sourceEvent.stopPropagation();
        }

        private _expandIcon(entry: ILogEntry, expanded: boolean): string {
            return expanded ? "CaretDown" : "CaretUp";
        }

        private _moreInfo(entry: ILogEntry): Vidyano.PersistentObjectAttribute[] {
            return Enumerable.from(entry.obj.attributes).orderBy(attr => attr.offset).where(attr => {
                return attr.name !== "CreatedOn" &&
                    attr.name !== "User" &&
                    attr.name !== "OriginalUser" &&
                    attr.name !== "IncomingDataLength" &&
                    attr.name !== "IncomingDataReference" &&
                    attr.name !== "OutgoingDataLength" &&
                    attr.name !== "OutgoingDataReference" &&
                    !!attr.value;
            }).toArray();
        }
    }
}
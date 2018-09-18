namespace Vidyano.WebComponents {
    "use strict";

    interface IEntry {
        type: "Date" | "LogEntry";
    }

    interface IEntryDate extends IEntry {
        type: "Date";
        day: number;
        dayOfWeek: string;
        monthYear: string;
    }

    interface ILogEntry extends IEntry {
        type: "LogEntry";
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
        lastOfDate?: boolean;
        href: string;
    }

    interface ILogEntryChange {
        name: string;
        value: string;
    }

    type AuditPersistentObject = Vidyano.PersistentObject & {
        __audit_entries__?: IEntry[];
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
            entries: {
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
        private _lastDate: Date;
        private readonly entries: IEntry[]; private _setEntries: (entries: IEntry[]) => void;
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

            this._setEntries(persistentObject.__audit_entries__ || (persistentObject.__audit_entries__ = []));

            const newItems = items.slice(this.entries.length);
            for (let item of newItems) {
                const createdOn = <Date>item.values.CreatedOn;

                if (!this._lastDate || this._lastDate.getDate() !== createdOn.getDate() || this._lastDate.getMonth() !== createdOn.getMonth() || this._lastDate.getFullYear() !== createdOn.getFullYear()) {
                    this._lastDate = createdOn;
                    const dateEntry: IEntryDate = {
                        type: "Date",
                        day: createdOn.getDate(),
                        dayOfWeek: StringEx.format("{0:dddd}", createdOn),
                        monthYear: StringEx.format("{0:MMMM yyyy}", createdOn)
                    };

                    if (this.entries.length > 0)
                        this.set(`items.${this.entries.length - 1}.lastOfDate`, true);

                    this.push("entries", dateEntry);
                }

                const actionName = (<string>item.getValue("Action")).replace("PersistentObject.", "");
                const action = this.service.actionDefinitions.get(actionName);

                const logEntry: ILogEntry = {
                    type: "LogEntry",
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
                    href: this.computePath(`${this.app.programUnit.name}/PersistentObject.${item.query.persistentObject.id}/${item.id}`)
                };
                this.push("entries", logEntry);

                item.query.parent = null;
                logEntry.obj = await item.getPersistentObject();
                const [poIn, poOut] = <Vidyano.PersistentObject[]>await Promise.all([
                    (<Vidyano.PersistentObjectAttributeWithReference>logEntry.obj.getAttribute("IncomingDataReference")).getPersistentObject(),
                    (<Vidyano.PersistentObjectAttributeWithReference>logEntry.obj.getAttribute("OutgoingDataReference")).getPersistentObject()
                ]);

                logEntry.inData = this.service.hooks.onConstructPersistentObject(this.service, <Vidyano.IServicePersistentObject>JSON.parse(poIn.getAttributeValue("Data")).parent);
                logEntry.changes = logEntry.inData.attributes.filter(a => a.isValueChanged).map(a => {
                    return {
                        name: a.label,
                        value: a.displayValue
                    };
                });

                logEntry.outData = this.service.hooks.onConstructPersistentObject(this.service, <Vidyano.IServicePersistentObject>JSON.parse(poOut.getAttributeValue("Data")).result);

                this.set(`entries.${this.entries.length - 1}.busy`, false);
            }

            done();
        }

        private _is(entry: IEntry, type: string, filter: string): boolean {
            if (entry.type !== type)
                return false;

            if (!filter || entry.type !== "LogEntry")
                return true;

            filter = filter.toLowerCase();

            const logEntry = <ILogEntry>entry;
            if (logEntry.changes.some(c => c.name.toLowerCase().contains(filter) || c.value.toLowerCase().contains(filter)))
                return true;

            if (logEntry.outData && logEntry.outData.notification && logEntry.outData.notification.toLowerCase().contains(filter))
                return true;

            return false;
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
    }
}
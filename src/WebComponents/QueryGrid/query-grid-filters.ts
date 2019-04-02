namespace Vidyano.WebComponents {
    interface IQueryFilter {
        filter?: QueryFilter;
        groupName?: string;
        children?: IQueryFilter[];
    }

    @WebComponent.register({
        properties: {
            query: Object,
            queryFilters: {
                type: Object,
                computed: "query.filters"
            },
            hidden: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHidden(query.filters)"
            },
            filters: {
                type: Array,
                computed: "query.filters.filters"
            },
            userFilters: {
                type: Array,
                computed: "_computeUserFilters(filters)"
            },
            lockedFilters: {
                type: Array,
                computed: "_computeLockedFilters(filters)"
            },
            hasFilters: {
                type: Boolean,
                computed: "_computeHasFilters(filters)"
            },
            currentFilter: {
                type: Object,
                computed: "query.filters.currentFilter"
            },
            isFiltering: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.isFiltering"
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeDisabled(filters, currentFilter)"
            },
            canReset: {
                type: Boolean,
                computed: "_computeCanReset(currentFilter)"
            },
            canSave: {
                type: Boolean,
                computed: "_computeCanSave(currentFilter, canSaveAs)"
            },
            canSaveAs: {
                type: Boolean,
                computed: "_computeCanSaveAs(currentFilter)"
            },
            editLabel: {
                type: String,
                computed: "query.filters.actions.Edit.displayName"
            },
            saveCurrentLabel: {
                type: String,
                computed: "_computeCurrentFilterSaveLabel(currentFilter)"
            }
        },
        forwardObservers: [
            "query.isFiltering",
            "query.filters",
            "query.filters.filters",
            "query.filters.currentFilter"
        ]
    })
    export class QueryGridFilters extends Vidyano.WebComponents.WebComponent {
        private _preventColumnFilterChangedListener: boolean;
        query: Vidyano.Query;
        queryFilters: Vidyano.QueryFilters;
        currentFilter: Vidyano.QueryFilter;

        private _computeUserFilters(filters: QueryFilter[]): IQueryFilter[] {
            return this._computeFilters(filters, false);
        }

        private _computeLockedFilters(filters: QueryFilter[]): IQueryFilter[] {
            return this._computeFilters(filters, true);
        }

        private _computeFilters(filters: QueryFilter[], isLocked: boolean): IQueryFilter[] {
            if (!filters)
                return null;

            const orderedFilters = filters.filter(f => f.isLocked === isLocked).orderBy(f => f.name.split("\n", 2)[0].toLowerCase());
            if (orderedFilters.length === 0)
                return null;

            const result: IQueryFilter[] = [];
            let group: IQueryFilter;
            orderedFilters.forEach(filter => {
                if (!filter.name)
                    return;

                const nameParts = filter.name.split("\n", 2);
                if (nameParts.length === 1)
                    result.push({ filter: filter });
                else {
                    if (group && group.groupName === nameParts[0])
                        group.children.push({ filter: filter });
                    else {
                        result.push(group = {
                            groupName: nameParts[0],
                            children: [{ filter: filter }]
                        });
                    }
                }
            });

            return result;
        }

        private _catchGroupTap(e: Polymer.TapEvent) {
            e.stopPropagation();
        }

        private _filterNonGroupName(name: string): string {
            if (!name)
                return name;

            const nameParts = name.split("\n", 2);
            return nameParts.length === 1 ? nameParts[0] : nameParts[1];
        }

        private _computeHidden(filters: Vidyano.QueryFilters): boolean {
            return !filters;
        }

        private _computeDisabled(filters: QueryFilter[], currentFilter: QueryFilter): boolean {
            return (!filters || filters.length === 0) && !currentFilter;
        }

        private _computeHasFilters(filters: QueryFilters[]): boolean {
            return !!filters && filters.length > 0;
        }

        private _computeCanReset(currentFilter: QueryFilter): boolean {
            return !!currentFilter;
        }

        private _computeCanSave(currentFilter: QueryFilter, canSaveAs: boolean): boolean {
            return !canSaveAs && !!currentFilter && !currentFilter.isLocked && !currentFilter.persistentObject.isNew;
        }

        private _computeCurrentFilterSaveLabel(currentFilter: QueryFilter): string {
            return !!currentFilter ? `${this.translateMessage("Save")} '${currentFilter.name}'` : "";
        }

        private _computeCanSaveAs(currentFilter: QueryFilter): boolean {
            return !!currentFilter && currentFilter.persistentObject.isNew;
        }

        private _computeFilterEditLabel(filter: QueryFilter): string {
            return this.query.service.actionDefinitions["Edit"].displayName;
        }

        private _reset() {
            Vidyano.WebComponents.Popup.closeAll();
            this.query.filters.currentFilter = null;
        }

        private _load(e: Polymer.TapEvent) {
            this.queryFilters.currentFilter = <Vidyano.QueryFilter>e.model.filter.filter;
        }

        private async _saveAs() {
            this.app.showDialog(new Vidyano.WebComponents.QueryGridFilterDialog(this.query.filters, await this.query.filters.createNew()));
        }

        private _save() {
            this.query.filters.save();
        }

        private async _edit(e: Polymer.TapEvent) {
            const filter = <Vidyano.QueryFilter>e.model.filter.filter;
            this.app.showDialog(new Vidyano.WebComponents.QueryGridFilterDialog(this.query.filters, filter));
        }

        private async _delete(e: Polymer.TapEvent) {
            const filter = <Vidyano.QueryFilter>e.model.filter.filter;

            const result = await this.app.showMessageDialog({
                title: this._nonGroupName(filter.name),
                titleIcon: "Action_Delete",
                message: this.translateMessage("AskForDeleteFilter", this._nonGroupName(filter.name)),
                actions: [this.translateMessage("Delete"), this.translateMessage("Cancel")],
                actionTypes: ["Danger"]
            });

            if (result === 0)
                await this.query.filters.delete(filter);
        }

        private _showUserFilterSeparator(canReset: boolean, canSave: boolean, canSaveAs: boolean): boolean {
            return canReset || canSave || canSaveAs;
        }

        private _hasGroupName(filter: IQueryFilter): boolean {
            return !!filter.groupName;
        }

        private _hasNoGroupName(filter: IQueryFilter): boolean {
            return !filter.groupName;
        }
    }
}

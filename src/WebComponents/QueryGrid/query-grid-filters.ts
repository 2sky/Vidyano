﻿namespace Vidyano.WebComponents {
    "use strict";

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
                computed: "_computeFilters(query.filters.filters)"
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

        private _computeFilters(filters: QueryFilter[]): QueryFilter[] {
            return filters;
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
            return this.query.service.actionDefinitions.get("Edit").displayName;
        }

        private _reset() {
            Vidyano.WebComponents.Popup.closeAll();
            this.query.filters.currentFilter = null;
        }

        private _load(e: Event) {
            const name = (<HTMLElement>e.currentTarget).getAttribute("data-filter");
            if (!name)
                return;

            this.queryFilters.currentFilter = this.queryFilters.getFilter(name);
        }

        private async _saveAs() {
            await this.app.importComponent("PersistentObjectDialog");
            const newFilter = await this.query.filters.createNew();

            let dialog: Vidyano.WebComponents.PersistentObjectDialog;
            this.app.showDialog(dialog = new Vidyano.WebComponents.PersistentObjectDialog(newFilter.persistentObject, {
                save: async (po, close) => {
                    try {
                        await this.query.filters.save(newFilter);
                        this.query.filters.currentFilter = newFilter;
                        close();
                    }
                    catch (e) {
                        dialog.persistentObject = newFilter.persistentObject = Enumerable.from(this.query.filters.detailsAttribute.objects).last(po => po.isNew);
                    }
                },
                cancel: async close => {
                    await this.query.filters.delete(newFilter);
                    close();
                },
                noHeader: true
            }));
        }

        private _save() {
            this.query.filters.save();
        }

        private async _edit(e: TapEvent) {
            e.stopPropagation();

            await this.app.importComponent("PersistentObjectDialog");

            const filter = <Vidyano.QueryFilter>e.model.filter;
            this.app.showDialog(new Vidyano.WebComponents.PersistentObjectDialog(filter.persistentObject, {
                save: async (po, close) => {
                    await this.query.filters.save(filter);
                    close();
                },
                noHeader: true
            }));
        }

        private async _delete(e: TapEvent) {
            e.stopPropagation();

            const name = (<HTMLElement>e.currentTarget).getAttribute("data-filter");
            if (!name)
                return;

            const result = await this.app.showMessageDialog({
                title: name,
                titleIcon: "Action_Delete",
                message: this.translateMessage("AskForDeleteFilter", name),
                actions: [this.translateMessage("Delete"), this.translateMessage("Cancel")],
                actionTypes: ["Danger"]
            });

            if (result === 0)
                await this.query.filters.delete(name);
        }

        private _userFilters(filters: Vidyano.QueryFilter[]): Vidyano.QueryFilter[] {
            return filters ? filters.filter(f => !f.isLocked) : null;
        }

        private _lockedFilters(filters: Vidyano.QueryFilter[]): Vidyano.QueryFilter[] {
            return filters ? filters.filter(f => f.isLocked) : null;
        }
    }
}

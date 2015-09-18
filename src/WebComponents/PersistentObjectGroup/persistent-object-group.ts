module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            group: Object,
            label: {
                type: String,
                computed: "_computeLabel(group)"
            }
        }
    })
    export class PersistentObjectGroup extends WebComponent {
        group: Vidyano.PersistentObjectAttributeGroup;

        private _computeLabel(group: Vidyano.PersistentObjectAttributeGroup): string {
            return group.label;
        }
    }
}
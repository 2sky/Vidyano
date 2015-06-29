module Vidyano.WebComponents {
    export class PersistentObjectGroup extends WebComponent {
        group: Vidyano.PersistentObjectAttributeGroup;

        private _computeLabel(group: Vidyano.PersistentObjectAttributeGroup): string {
            return group.label;
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.PersistentObjectGroup, Vidyano.WebComponents, "vi", {
        properties: {
            group: Object,
            label: {
                type: String,
                computed: "_computeLabel(group)"
            }
        }
    });
}
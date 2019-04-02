namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            noSpacing: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    })
    export class Grid extends WebComponent {
    }
}
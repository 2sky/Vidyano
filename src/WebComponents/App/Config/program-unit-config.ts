module Vidyano.WebComponents {
    @TemplateConfig.register({
        properties: {
            name: String
        }
    })
    export class ProgramUnitConfig extends TemplateConfig<Vidyano.ProgramUnit> {
        name: string;
    }
}
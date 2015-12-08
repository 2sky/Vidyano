module Vidyano.WebComponents {
    @Resource.register
    export class Icon extends Resource {
        constructor(source?: string) {
            super();

            this.source = source;
        }

        protected get _contentTarget(): Node {
            return this.$["svgHost"];
        }

        static Load(source: string): DocumentFragment {
            return Resource.Load(source, "VI-ICON");
        }

        static Exists(name: string): boolean {
            return Resource.Exists(name, "VI-ICON");
        }
    }
}
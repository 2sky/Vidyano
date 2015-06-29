module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeDropDown extends WebComponents.Attributes.PersistentObjectAttribute {
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeDropDown, {
    }, ctor => {
        Attributes["PersistentObjectAttributeEnum"] = ctor;
        });
}
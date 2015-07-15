module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeAsDetail extends WebComponents.Attributes.PersistentObjectAttribute {
        getDisplayValue(obj: Vidyano.PersistentObject, column: QueryColumn): string {
            var attr = this.getAttributeForColumn(obj, column);
            return attr && attr.displayValue || "";
        }

        getAttributeForColumn(obj: Vidyano.PersistentObject, column: QueryColumn): Vidyano.PersistentObjectAttribute {
            return obj.attributesByName[column.name];
        }

        isVisible(column: QueryColumn) {
            return !column.isHidden && column.width !== "0";
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeAsDetail, {
        forwardObservers: [
            "attribute.objects"
        ]
    });
}
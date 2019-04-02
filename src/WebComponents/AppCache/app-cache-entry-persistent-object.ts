namespace Vidyano.WebComponents {
    export class AppCacheEntryPersistentObject extends AppCacheEntry {
        private _persistentObject: Vidyano.PersistentObject;
        selectedMasterTab: Vidyano.PersistentObjectTab;
        selectedDetailTab: Vidyano.PersistentObjectTab;

        constructor(idOrPo: string | Vidyano.PersistentObject, public objectId?: string) {
            super(typeof idOrPo === "string" ? idOrPo : (idOrPo instanceof Vidyano.PersistentObject ? idOrPo.id : null));

            if (idOrPo instanceof Vidyano.PersistentObject) {
                this.persistentObject = idOrPo;
                this.objectId = this.persistentObject.objectId;
            }
        }

        get persistentObject(): Vidyano.PersistentObject {
            return this._persistentObject;
        }

        set persistentObject(po: Vidyano.PersistentObject) {
            if (po === this._persistentObject)
                return;

            this._persistentObject = po;
            this.selectedMasterTab = this.selectedDetailTab = null;
        }

        isMatch(entry: AppCacheEntryPersistentObject): boolean {
            if (!(entry instanceof AppCacheEntryPersistentObject))
                return false;

            if (entry.persistentObject != null && entry.persistentObject === this.persistentObject)
                return true;

            return (super.isMatch(entry) || (entry.persistentObject && this.id === entry.persistentObject.fullTypeName)) && (entry.objectId === this.objectId || StringEx.isNullOrEmpty(entry.objectId) && StringEx.isNullOrEmpty(this.objectId));
        }
    }
}
namespace Vidyano.WebComponents {
    export class AppCacheEntry {
        constructor(public id: string) {
        }

        isMatch(entry: AppCacheEntry): boolean {
            return entry.id === this.id;
        }
    }
}
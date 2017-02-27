namespace Vidyano {
    "use strict";

    export namespace Common {
        export interface ISubjectNotifier<TSource, TDetail> {
            notify: (source: TSource, detail?: TDetail) => void;
        }

        export class PropertyChangedArgs {
            constructor(public propertyName: string, public newValue: any, public oldValue: any) {
            }
        }

        export interface ISubjectDisposer {
            (): void;
        }

        export class Subject<TSource, TDetail> {
            private _observers: ((sender: TSource, detail: TDetail) => void)[] = [];

            constructor(notifier: ISubjectNotifier<TSource, TDetail>) {
                notifier.notify = (source: TSource, detail: TDetail) => {
                    for (const i in this._observers)
                        this._observers[i](source, detail);
                };
            }

            attach(observer: ISubjectObserver<TSource, TDetail>): ISubjectDisposer {
                const id = this._observers.length;
                this._observers.push(observer);

                return <ISubjectDisposer>this._detach.bind(this, id);
            }

            private _detach(observerId: number) {
                delete this._observers[observerId];
            }
        }

        export interface ISubjectObserver<TSource, TDetail> {
            (sender: TSource, detail: TDetail): void;
        }

        export class Observable<T> {
            private _propertyChangedNotifier: Vidyano.Common.ISubjectNotifier<T, Vidyano.Common.PropertyChangedArgs>;
            propertyChanged: Vidyano.Common.Subject<T, Vidyano.Common.PropertyChangedArgs>;

            constructor() {
                this.propertyChanged = new Vidyano.Common.Subject<T, Vidyano.Common.PropertyChangedArgs>(this._propertyChangedNotifier = { notify: undefined });
            }

            protected notifyPropertyChanged(propertyName: string, newValue: any, oldValue?: any) {
                this._propertyChangedNotifier.notify(<T><any>this, {
                    propertyName: propertyName,
                    newValue: newValue,
                    oldValue: oldValue
                });
            }
        }

        export interface IPropertyChangedObserver<T> extends ISubjectObserver<T, Vidyano.Common.PropertyChangedArgs> {
        }
    }
}
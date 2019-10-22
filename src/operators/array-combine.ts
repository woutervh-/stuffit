import { Store } from '../store';
import { Subscription } from '../subscription';

export class ArrayCombineStore<T extends unknown[]> extends Store<T> {
    private sources: { [K in keyof T]: Store<T[K]> };
    private subscriptions: Subscription[] | undefined = undefined;

    public constructor(sources: { [K in keyof T]: Store<T[K]> }) {
        super();
        this.sources = sources;
    }

    public get state() {
        return ArrayCombineStore.combine<T>(this.sources);
    }

    protected start() {
        if (this.subscriptions === undefined) {
            this.subscriptions = this.sources.map(this.subscribeTo);
        }
    }

    protected stop() {
        if (this.subscriptions !== undefined) {
            for (const subscription of this.subscriptions) {
                subscription.unsubscribe();
            }
            this.subscriptions = undefined;
        }
    }

    private subscribeTo = (source: Store<unknown>) => {
        return source.subscribe(this.handleNext);
    }

    private handleNext = () => {
        this.notify();
    }

    private static combine<T extends unknown[]>(sources: { [K in keyof T]: Store<T[K]> }) {
        return sources.map((source) => source.state) as T;
    }
}

export const arrayCombine = <T extends unknown[]>(...sources: { [K in keyof T]: Store<T[K]> }): ArrayCombineStore<T> => {
    return new ArrayCombineStore<T>(sources);
};

export const arrayCombineApply = <T extends unknown[]>(sources: { [K in keyof T]: Store<T[K]> }): ArrayCombineStore<T> => {
    return new ArrayCombineStore<T>(sources);
};

import { Store } from '../store';
import { Subscription } from '../subscription';

export class ArrayMergeStore<T extends unknown[]> extends Store<T[number]> {
    private sources: { [K in keyof T]: Store<T[K]> };
    private subscriptions: Subscription[] = [];

    public constructor(sources: { [K in keyof T]: Store<T[K]> }) {
        super(ArrayMergeStore.merge(sources));
        this.sources = sources;
    }

    protected start() {
        this.subscriptions = this.sources.map(this.subscribeTo);
    }

    protected stop() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];
    }

    private subscribeTo = (source: Store<T[number]>) => {
        return source.subscribe(this.handleNext);
    }

    private handleNext = (value: T[number]) => {
        this.setInnerState(value);
    }

    private static merge<T extends unknown[]>(sources: { [K in keyof T]: Store<T[K]> }): T[number] {
        if (sources.length >= 1) {
            return sources[sources.length - 1].state;
        } else {
            throw new Error('There must be at least one source.');
        }
    }
}

export const arrayMerge = <T extends unknown[]>(...sources: { [K in keyof T]: Store<T[K]> }): ArrayMergeStore<T> => {
    return new ArrayMergeStore<T>(sources);
};

export const arrayMergeApply = <T extends unknown[]>(sources: { [K in keyof T]: Store<T[K]> }): ArrayMergeStore<T> => {
    return new ArrayMergeStore<T>(sources);
};

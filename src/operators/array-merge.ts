import { Dependency } from '../dependency';
import { Store } from '../store';

export class ArrayMergeStore<T extends unknown[]> extends Store<T[number]> {
    private dependencies: Dependency<T[number]>[];

    public constructor(sources: { [K in keyof T]: Store<T[K]> }) {
        super(ArrayMergeStore.merge(sources));
        this.dependencies = sources.map((source) => new Dependency(source, this.handleNext));
    }

    protected preStart() {
        Dependency.startAll(this.dependencies);
        Dependency.updateAll(this.dependencies);
    }

    protected start() {
        //
    }

    protected stop() {
        Dependency.stopAll(this.dependencies);
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

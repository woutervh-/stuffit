import { Dependency } from '../dependency';
import { Store } from '../store';

export class ArrayCombineStore<T extends unknown[]> extends Store<T> {
    private dependencies: Dependency<T[number]>[];

    public constructor(private sources: { [K in keyof T]: Store<T[K]> }) {
        super(ArrayCombineStore.combine<T>(sources));
        this.dependencies = sources.map((source) => new Dependency(source, this.handleNext));
    }

    protected preStart() {
        Dependency.updateAll(this.dependencies);
    }

    protected start() {
        Dependency.startAll(this.dependencies);
    }

    protected stop() {
        Dependency.stopAll(this.dependencies);
    }

    private handleNext = () => {
        this.setInnerState(ArrayCombineStore.combine<T>(this.sources));
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

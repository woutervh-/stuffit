import { Dependency } from '../dependency';
import { Store } from '../store';

// TODO: the behavior of this operator can be improved so that a change in the source store does not trigger a refresh which will use the last store for a new value.
// TODO: this requires that we keep track of the previously used store and compare during updates.
// TODO: it will be easier to do this if the store subscription can accept a listener that takes the store itself, not the new state.

export class ArrayMergeDynamicStore<T extends unknown[]> extends Store<T[number]> {
    private dependency: Dependency<{ [K in keyof T]: Store<T[K]> }>;
    private dependencies: Dependency<T[number]>[];
    private sources: Store<T[number]>[];
    // TODO: private previousSource: Store<T[number]>; // Keep track of previously used store; then when this store is deleted emit a new value.

    public constructor(source: Store<{ [K in keyof T]: Store<T[K]> }>) {
        super(ArrayMergeDynamicStore.merge<T>(source.state));
        this.dependency = new Dependency(source, this.handleSourceNext);
        this.dependencies = source.state.map((store) => new Dependency(store, this.handleNext));
        this.sources = source.state;
    }

    protected preStart() {
        this.dependency.update();
        Dependency.updateAll(this.dependencies);
    }

    protected start() {
        this.dependency.start();
        Dependency.startAll(this.dependencies);
    }

    protected stop() {
        this.dependency.stop();
        Dependency.stopAll(this.dependencies);
    }

    private handleSourceNext = (newSources: { [K in keyof T]: Store<T[K]> }) => {
        const oldSources = this.sources;
        for (let i = 0; i < oldSources.length; i++) {
            const source = oldSources[i];
            if (!newSources.includes(source)) {
                this.dependencies[i].stop();
            }
        }
        this.sources = newSources;

        const newDependencies: Dependency<T[number]>[] = [];
        for (const newSource of newSources) {
            const index = oldSources.indexOf(newSource);
            if (index >= 0) {
                newDependencies.push(this.dependencies[index]);
            } else {
                const dependency = new Dependency(newSource, this.handleNext);
                newDependencies.push(dependency);
                dependency.start();
            }
        }
        this.dependencies = newDependencies;

        this.setInnerState(ArrayMergeDynamicStore.merge<T>(newSources)); // TODO: only do this if the previously used store was deleted, or if any new store was added (the latest).
    }

    private handleNext = (value: T[number]) => {
        this.setInnerState(value);
    }

    private static merge<T extends unknown[]>(state: { [K in keyof T]: Store<T[K]> }): T[number] {
        if (state.length >= 1) {
            return state[state.length - 1].state;
        } else {
            throw new Error('There must be at least one source.');
        }
    }
}

export const arrayMergeDynamic = <T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>): ArrayMergeDynamicStore<T> => {
    return new ArrayMergeDynamicStore<T>(source);
};

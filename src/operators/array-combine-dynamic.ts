import { Dependency } from '../dependency';
import { Store } from '../store';

export class ArrayCombineDynamicStore<T extends unknown[]> extends Store<T> {
    private dependency: Dependency<{ [K in keyof T]: Store<T[K]> }>;
    private dependencies: Dependency<T[number]>[];
    private sources: { [K in keyof T]: Store<T[K]> };

    public constructor(source: Store<{ [K in keyof T]: Store<T[K]> }>) {
        super(ArrayCombineDynamicStore.combine<T>(source.state));
        this.dependency = new Dependency(source, this.handleSourceNext);
        this.dependencies = source.state.map((store) => new Dependency(store, this.handleNext));
        this.sources = source.state;
    }

    protected preStart() {
        Dependency.startAll(this.dependencies);
        Dependency.updateAll(this.dependencies);
        this.dependency.start();
        this.dependency.update();
    }

    protected start() {
        //
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

        this.setInnerState(ArrayCombineDynamicStore.combine<T>(newSources));
    }

    private handleNext = () => {
        this.setInnerState(ArrayCombineDynamicStore.combine<T>(this.sources));
    }

    private static combine<T extends unknown[]>(state: { [K in keyof T]: Store<T[K]> }) {
        return state.map((source) => source.state) as T;
    }
}

export const arrayCombineDynamic = <T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>): ArrayCombineDynamicStore<T> => {
    return new ArrayCombineDynamicStore<T>(source);
};

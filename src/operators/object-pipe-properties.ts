import { Dependency } from '../dependency';
import { PushStore } from '../push-store';
import { Store } from '../store';

export class ObjectPipePropertiesStore<T extends string, U extends { [Key in T]: unknown }, V extends { [Key in T]: unknown }> extends Store<V> {
    private dependency: Dependency<U>;
    private targetDependencies: { [Key in T]: Dependency<V[T]> };

    private constructor(source: Store<U>, private transform: (source: Store<U[T]>, key: T) => Store<V[T]>, initialState: V, private sources: { [Key in T]: PushStore<U[T]> }, private targets: { [Key in T]: Store<V[T]> }) {
        super(initialState);
        this.dependency = new Dependency(source, this.handleSourceNext);
        this.targetDependencies = {} as { [Key in T]: Dependency<V[T]> };
        for (const key of Object.keys(targets)) {
            this.targetDependencies[key as T] = new Dependency(targets[key as T], this.handleNext);
        }
    }

    protected preStart() {
        Dependency.startAll(this.getDependenciesArray());
        Dependency.updateAll(this.getDependenciesArray());
        this.dependency.start();
        this.dependency.update();
    }

    protected start() {
        //
    }

    protected stop() {
        this.dependency.stop();
        Dependency.stopAll(this.getDependenciesArray());
    }

    private handleSourceNext = (values: U) => {
        const oldKeys = new Set(Object.keys(this.sources));
        const newKeys = new Set(Object.keys(values));
        let deletedOrAdded = false;

        for (const key of oldKeys) {
            if (!newKeys.has(key)) {
                this.targetDependencies[key as T].stop();
                deletedOrAdded = true;
            }
        }

        const newSources = {} as { [Key in T]: PushStore<U[T]> };
        const newTargets = {} as { [Key in T]: Store<V[T]> };
        const newDependencies = {} as { [Key in T]: Dependency<V[T]> };
        for (const key of newKeys) {
            if (oldKeys.has(key)) {
                newSources[key as T] = this.sources[key as T];
                newTargets[key as T] = this.targets[key as T];
                newDependencies[key as T] = this.targetDependencies[key as T];
                if (this.sources[key as T].state !== values[key as T]) {
                    this.sources[key as T].setState(values[key as T]);
                }
            } else {
                newSources[key as T] = new PushStore<U[T]>(values[key as T]);
                newTargets[key as T] = newSources[key as T].pipe((source) => this.transform(source, key as T));
                newDependencies[key as T] = new Dependency(newTargets[key as T], this.handleNext);
                newDependencies[key as T].start();
                deletedOrAdded = true;
            }
        }

        this.sources = newSources;
        this.targets = newTargets;
        this.targetDependencies = newDependencies;

        if (deletedOrAdded) {
            this.handleNext();
        }
    }

    private handleNext = () => {
        const result = {} as V;
        for (const key of Object.keys(this.targets)) {
            result[key as T] = this.targets[key as T].state;
        }
        this.setInnerState(result);
    }

    private getDependenciesArray() {
        return Object.keys(this.targetDependencies).map((key) => this.targetDependencies[key as T]);
    }

    public static fromSourceAndTransform<T extends string, U extends { [Key in T]: unknown }, V extends { [Key in T]: unknown }>(source: Store<U>, transform: (source: Store<U[T]>, key: T) => Store<V[T]>) {
        const sourceState = source.state;
        const sources = {} as { [Key in T]: PushStore<U[T]> };
        const targets = {} as { [Key in T]: Store<V[T]> };
        const targetState = {} as V;
        for (const key of Object.keys(sourceState)) {
            sources[key as T] = new PushStore<U[T]>(sourceState[key as T]);
            targets[key as T] = sources[key as T].pipe((source) => transform(source, key as T));
            targetState[key as T] = targets[key as T].state;
        }
        return new ObjectPipePropertiesStore(source, transform, targetState, sources, targets);
    }
}

export const objectPipeProperties = <T extends string, U extends { [Key in T]: unknown }, V extends { [Key in T]: unknown }>(transform: (source: Store<U[T]>, key: T) => Store<V[T]>) => (source: Store<U>): ObjectPipePropertiesStore<T, U, V> => {
    return ObjectPipePropertiesStore.fromSourceAndTransform(source, transform);
};

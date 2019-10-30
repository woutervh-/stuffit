import { PushStore } from '../push-store';
import { Store } from '../store';
import { Subscription } from '../subscription';

export class ObjectPipePropertiesStore<T extends string, U extends { [Key in T]: unknown }, V extends { [Key in T]: unknown }> extends Store<V> {
    private source: Store<U>;
    private subscription: Subscription | undefined = undefined;
    private transform: (source: Store<U[T]>, key: T) => Store<V[T]>;
    private sources: { [Key in T]: PushStore<U[T]> };
    private targets: { [Key in T]: Store<V[T]> };
    private subscriptions = {} as { [Key in T]: Subscription };

    private constructor(source: Store<U>, transform: (source: Store<U[T]>, key: T) => Store<V[T]>, initialState: V, sources: { [Key in T]: PushStore<U[T]> }, targets: { [Key in T]: Store<V[T]> }) {
        super(initialState);
        this.source = source;
        this.transform = transform;
        this.sources = sources;
        this.targets = targets;
    }

    protected preStart() {
        //
    }

    protected start() {
        for (const key of Object.keys(this.targets)) {
            this.subscriptions[key as T] = this.targets[key as T].subscribe(this.handleChange);
        }
        if (this.subscription === undefined) {
            this.subscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
        for (const key of Object.keys(this.subscriptions)) {
            this.subscriptions[key as T].unsubscribe();
        }
        this.subscriptions = {} as { [Key in T]: Subscription };
    }

    private handleNext = (values: U) => {
        const oldKeys = new Set(Object.keys(this.sources));
        const newKeys = new Set(Object.keys(values));
        let deletedOrAdded = false;

        for (const key of oldKeys) {
            if (!newKeys.has(key)) {
                this.subscriptions[key as T].unsubscribe();
                deletedOrAdded = true;
            }
        }

        const newSources = {} as { [Key in T]: PushStore<U[T]> };
        const newTargets = {} as { [Key in T]: Store<V[T]> };
        const newSubscriptions = {} as { [Key in T]: Subscription };
        for (const key of newKeys) {
            if (oldKeys.has(key)) {
                newSources[key as T] = this.sources[key as T];
                newTargets[key as T] = this.targets[key as T];
                newSubscriptions[key as T] = this.subscriptions[key as T];
                if (this.sources[key as T] !== values[key as T]) {
                    this.sources[key as T].setState(values[key as T]);
                }
            } else {
                newSources[key as T] = new PushStore<U[T]>(values[key as T]);
                newTargets[key as T] = newSources[key as T].pipe((source) => this.transform(source, key as T));
                newSubscriptions[key as T] = newTargets[key as T].subscribe(this.handleChange);
                deletedOrAdded = true;
            }
        }

        this.sources = newSources;
        this.targets = newTargets;
        this.subscriptions = newSubscriptions;

        if (deletedOrAdded) {
            this.handleChange();
        }
    }

    private handleChange = () => {
        const result = {} as V;
        for (const key of Object.keys(this.targets)) {
            result[key as T] = this.targets[key as T].state;
        }
        this.setInnerState(result);
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

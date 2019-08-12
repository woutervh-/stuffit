import { Store } from '../store';
import { Subscription } from '../subscription';

export class ObjectPipeDynamicStore<T, U, V extends { [Key: string]: Store<T> }> extends Store<{ [Key in keyof V]: Store<U> }> {
    private source: Store<V>;
    private transform: (source: Store<T>) => Store<U>;
    private sourceSubscription: Subscription | undefined = undefined;
    private sources: { [Key in keyof T]: Store<T[Key]> };

    public constructor(source: Store<V>, transform: (source: Store<T>) => Store<U>) {
        super(ObjectPipeDynamicStore.pipe(source.state, transform));
        this.source = source;
        this.transform = transform;
    }

    protected start() {
        if (this.sourceSubscription === undefined) {
            this.sourceSubscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop() {
        if (this.sourceSubscription !== undefined) {
            this.sourceSubscription.unsubscribe();
            this.sourceSubscription = undefined;
        }
    }

    private handleNext = () => {
        this.setInnerState(this.project(this.source.state));
    }

    private static pipe<T, U, V extends { [Key: string]: Store<T> }>(sources: V, transform: (source: Store<T>) => Store<U>) {
        const result = {} as { [Key in keyof V]: Store<U> };
        for (const key of Object.keys(sources)) {
            result[key as keyof V] = transform(sources[key] as unknown as Store<T>);
        }
        return result;
    }
}

export const objectPipeDynamic = <T, U>(transform: (source: Store<T>) => Store<U>) => <V extends { [Key: string]: Store<T> }>(source: Store<V>): ObjectPipeDynamicStore<T, U, V> => {
    return new ObjectPipeDynamicStore(source, transform);
};

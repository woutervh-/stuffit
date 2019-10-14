import { Store } from '../store';
import { Subscription } from '../subscription';

export class ArrayMergeDynamicStore<T extends unknown[]> extends Store<T[number]> {
    private source: Store<{ [K in keyof T]: Store<T[K]> }>;
    private subscription: Subscription | undefined = undefined;
    private sources: Store<T[number]>[] = [];
    private subscriptions: Subscription[] = [];

    public constructor(source: Store<{ [K in keyof T]: Store<T[K]> }>) {
        super(ArrayMergeDynamicStore.merge<T>(source));
        this.source = source;
    }

    protected start() {
        this.handleSourceNext(this.source.state);
        if (this.subscription === undefined) {
            this.subscription = this.source.subscribe(this.handleSourceNext);
        }
    }

    protected stop() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.sources = [];
        this.subscriptions = [];
    }

    private handleSourceNext = (newSources: { [K in keyof T]: Store<T[K]> }) => {
        const oldSources = this.sources;
        for (let i = 0; i < oldSources.length; i++) {
            const source = oldSources[i];
            if (!newSources.includes(source)) {
                this.subscriptions[i].unsubscribe();
            }
        }
        this.sources = newSources;

        const newSubscriptions: Subscription[] = [];
        for (const newSource of newSources) {
            const index = oldSources.indexOf(newSource);
            if (index >= 0) {
                newSubscriptions.push(this.subscriptions[index]);
            } else {
                newSubscriptions.push(newSource.subscribe(this.handleNext));
            }
        }
        this.subscriptions = newSubscriptions;

        this.setInnerState(ArrayMergeDynamicStore.merge<T>(this.source));
    }

    private handleNext = (value: T[number]) => {
        this.setInnerState(value);
    }

    private static merge<T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>): T[number] {
        if (source.state.length >= 1) {
            return source.state[source.state.length - 1].state;
        } else {
            throw new Error('There must be at least one source.');
        }
    }
}

export const arrayMergeDynamic = <T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>): ArrayMergeDynamicStore<T> => {
    return new ArrayMergeDynamicStore<T>(source);
};

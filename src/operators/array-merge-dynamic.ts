import { Store } from '../store';
import { Subscription } from '../subscription';

export class ArrayMergeDynamicStore<T extends unknown[]> extends Store<T[number]> {
    private source: Store<{ [K in keyof T]: Store<T[K]> }>;
    private subscription: Subscription | undefined = undefined;
    private sources: Store<T[number]>[] = [];
    private subscriptions: Subscription[] = [];
    private lastChangedSource: Store<T[number]> | undefined = undefined;

    public constructor(source: Store<{ [K in keyof T]: Store<T[K]> }>) {
        super();
        this.source = source;
    }

    public get state() {
        return ArrayMergeDynamicStore.merge<T>(this.source, this.lastChangedSource);
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
    }

    private handleNext = (value: T[number], source: Store<T[number]>) => {
        this.lastChangedSource = source;
        this.notify();
    }

    private static merge<T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>, lastChangedStore: Store<T[number]> | undefined): T[number] {
        if (lastChangedStore && source.state.includes(lastChangedStore)) {
            return lastChangedStore.state;
        }
        if (source.state.length >= 1) {
            return source.state[source.state.length - 1].state;
        }
        throw new Error('There must be at least one source.');
    }
}

export const arrayMergeDynamic = <T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>): ArrayMergeDynamicStore<T> => {
    return new ArrayMergeDynamicStore<T>(source);
};

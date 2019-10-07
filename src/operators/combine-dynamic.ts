import { Store } from '../store';
import { Subscription } from '../subscription';

export class CombineDynamicStore<T extends unknown[]> extends Store<T> {
    private source: Store<{ [K in keyof T]: Store<T[K]> }>;
    private sourceSubscription: Subscription | undefined = undefined;
    private sources: Store<T[number]>[] = [];
    private subscriptions: Subscription[] = [];

    public constructor(source: Store<{ [K in keyof T]: Store<T[K]> }>) {
        super(CombineDynamicStore.combine<T>(source));
        this.source = source;
    }

    protected start() {
        this.handleSourceNext(this.source.state);
        if (this.sourceSubscription === undefined) {
            this.sourceSubscription = this.source.subscribe(this.handleSourceNext);
        }
    }

    protected stop() {
        if (this.sourceSubscription !== undefined) {
            this.sourceSubscription.unsubscribe();
            this.sourceSubscription = undefined;
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

        this.setInnerState(CombineDynamicStore.combine<T>(this.source));
    }

    private handleNext = () => {
        this.setInnerState(CombineDynamicStore.combine<T>(this.source));
    }

    private static combine<T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>) {
        return source.state.map((source) => source.state) as T;
    }
}

export const combineDynamic = <T extends unknown[]>(source: Store<{ [K in keyof T]: Store<T[K]> }>): CombineDynamicStore<T> => {
    return new CombineDynamicStore<T>(source);
};
import { Store } from '../store';
import { Subscription } from '../subscription';

export class ObjectCombineDynamicStore<T extends { [Key: string]: unknown }> extends Store<T> {
    private source: Store<{ [Key in keyof T]: Store<T[Key]> }>;
    private sourceSubscription: Subscription | undefined = undefined;
    private sources: { [Key in keyof T]: Store<T[Key]> };
    private subscriptions = {} as { [Key in keyof T]: Subscription };

    public constructor(source: Store<{ [Key in keyof T]: Store<T[Key]> }>) {
        super(ObjectCombineDynamicStore.combine(source.state));
        this.source = source;
        this.sources = source.state;
    }

    protected start() {
        for (const key of Object.keys(this.sources)) {
            this.subscriptions[key as keyof T] = this.sources[key].subscribe(this.handleNextInner);
        }
        if (this.sourceSubscription === undefined) {
            this.sourceSubscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop() {
        if (this.sourceSubscription !== undefined) {
            this.sourceSubscription.unsubscribe();
            this.sourceSubscription = undefined;
        }
        for (const key of Object.keys(this.subscriptions)) {
            this.subscriptions[key].unsubscribe();
        }
        this.subscriptions = {} as { [Key in keyof T]: Subscription };
    }

    private handleNext = (newSources: { [Key in keyof T]: Store<T[Key]> }) => {
        const oldKeys = new Set(Object.keys(this.sources));
        const newKeys = new Set(Object.keys(newSources));
        let deletedOrAdded = false;

        // Remove old subscriptions.
        for (const key of oldKeys) {
            if (!newKeys.has(key) || this.sources[key] !== newSources[key]) {
                this.subscriptions[key].unsubscribe();
                delete this.subscriptions[key];
                deletedOrAdded = true;
            }
        }
        this.sources = newSources;

        const newSubscriptions = {} as { [Key in keyof T]: Subscription };
        for (const key of newKeys) {
            if (key in this.subscriptions) {
                // Copy old subscriptions if nothing changed.
                newSubscriptions[key as keyof T] = this.subscriptions[key];
            } else {
                // Create new subscription if something changed.
                newSubscriptions[key as keyof T] = newSources[key].subscribe(this.handleNextInner);
                deletedOrAdded = true;
            }
        }
        this.subscriptions = newSubscriptions;

        if (deletedOrAdded) {
            this.setInnerState(ObjectCombineDynamicStore.combine(this.source.state));
        }
    }

    private handleNextInner = () => {
        this.setInnerState(ObjectCombineDynamicStore.combine(this.source.state));
    }

    private static combine<T extends { [Key: string]: unknown }>(sources: { [Key in keyof T]: Store<T[Key]> }) {
        const result = {} as T;
        for (const key of Object.keys(sources)) {
            result[key as keyof T] = sources[key].state;
        }
        return result;
    }
}

export const objectCombineDynamic = <T extends { [Key: string]: unknown }>(source: Store<{ [Key in keyof T]: Store<T[Key]> }>): ObjectCombineDynamicStore<T> => {
    return new ObjectCombineDynamicStore(source);
};

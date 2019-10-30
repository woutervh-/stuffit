import { Store } from '../store';
import { Subscription } from '../subscription';

export class ObjectCombinePropertiesStore<T extends {}> extends Store<T> {
    private source: Store<{ [Key in keyof T]: Store<T[Key]> }>;
    private subscription: Subscription | undefined = undefined;
    private sources = {} as { [Key in keyof T]: Store<T[Key]> };
    private subscriptions = {} as { [Key in keyof T]: Subscription };

    public constructor(source: Store<{ [Key in keyof T]: Store<T[Key]> }>) {
        super(ObjectCombinePropertiesStore.combine(source.state));
        this.source = source;
    }

    protected preStart() {
        //
    }

    protected start() {
        for (const key of Object.keys(this.source.state)) {
            this.sources[key as keyof T] = this.source.state[key as keyof T] as Store<T[keyof T]>;
            this.subscriptions[key as keyof T] = this.source.state[key as keyof T].subscribe(this.handleChange);
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
            this.subscriptions[key as keyof T].unsubscribe();
        }
        this.sources = {} as { [Key in keyof T]: Store<T[Key]> };
        this.subscriptions = {} as { [Key in keyof T]: Subscription };
    }

    private handleNext = (newSources: { [Key in keyof T]: Store<T[Key]> }) => {
        const oldSources = this.sources;
        for (const key of Object.keys(oldSources)) {
            if (!(key in newSources) || oldSources[key as keyof T] !== newSources[key as keyof T]) {
                this.subscriptions[key as keyof T].unsubscribe();
                delete this.subscriptions[key as keyof T];
            }
        }
        this.sources = newSources;

        const newSubscriptions = {} as { [Key in keyof T]: Subscription };
        for (const key of Object.keys(newSources)) {
            if (key in this.subscriptions) {
                newSubscriptions[key as keyof T] = this.subscriptions[key as keyof T];
            } else {
                newSubscriptions[key as keyof T] = newSources[key as keyof T].subscribe(this.handleChange);
            }
        }
        this.subscriptions = newSubscriptions;

        this.handleChange();
    }

    private handleChange = () => {
        this.setInnerState(ObjectCombinePropertiesStore.combine(this.source.state));
    }

    private static combine<T extends { [Key: string]: unknown }>(sources: { [Key in keyof T]: Store<T[Key]> }): T {
        const values = {} as T;
        for (const key of Object.keys(sources)) {
            values[key as keyof T] = sources[key].state;
        }
        return values;
    }
}

export const objectCombineProperties = <T extends {}>(source: Store<{ [Key in keyof T]: Store<T[Key]> }>): ObjectCombinePropertiesStore<T> => {
    return new ObjectCombinePropertiesStore(source);
};

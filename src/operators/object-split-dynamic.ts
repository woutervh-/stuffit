import { PushStore } from '../push-store';
import { Store } from '../store';
import { Subscription } from '../subscription';

export class ObjectSplitDynamicStore<T extends { [Key: string]: unknown }> extends Store<{ [Key in keyof T]: Store<T[Key]> }> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;

    public constructor(source: Store<T>) {
        super(ObjectSplitDynamicStore.split(source.state));
        this.source = source;
    }

    protected start() {
        if (this.subscription === undefined) {
            this.subscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    private handleNext = (value: T) => {
        const oldKeys = new Set(Object.keys(this.state));
        const newKeys = new Set(Object.keys(value));

        let deletedOrAdded = false;
        const next = {} as { [Key in keyof T]: Store<T[Key]> };

        // Check for deleted keys.
        for (const key of oldKeys) {
            if (!newKeys.has(key)) {
                deletedOrAdded = true;
                break;
            }
        }

        for (const key of newKeys) {
            if (!oldKeys.has(key)) {
                // Add stores with new keys.
                next[key as keyof T] = new PushStore<T[keyof T]>(value[key] as T[keyof T]);
                deletedOrAdded = true;
            } else {
                next[key as keyof T] = this.state[key as keyof T];
                // Update existing stores if value has changed.
                if (next[key as keyof T].state !== value[key]) {
                    (next[key as keyof T] as PushStore<T[keyof T]>).setState(value[key] as T[keyof T]);
                }
            }
        }

        if (deletedOrAdded) {
            this.setInnerState(next);
        }
    }

    private static split<T extends { [Key: string]: unknown }>(value: T) {
        const result = {} as { [Key in keyof T]: Store<T[Key]> };
        for (const key of Object.keys(value)) {
            result[key as keyof T] = new PushStore<T[keyof T]>(value[key] as T[keyof T]);
        }
        return result;
    }
}

export const objectSplitDynamic = <T extends { [Key: string]: unknown }>(source: Store<T>): ObjectSplitDynamicStore<T> => {
    return new ObjectSplitDynamicStore(source);
};

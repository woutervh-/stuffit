import { Subscription } from './subscription';

export abstract class Store<T> {
    private innerState: T;
    private listenerCounter: number = 0;
    private activeListeners: Map<number, (value: T) => void> = new Map();
    private passiveListeners: Map<number, (value: T) => void> = new Map();

    public constructor(initialState: T) {
        this.innerState = initialState;
    }

    public get state(): T {
        return this.innerState;
    }

    public subscribe(listener: (value: T) => void, passive: boolean = false): Subscription {
        const token = this.listenerCounter++;
        const store = this;
        const subscription: Subscription = {
            unsubscribe() {
                if (store.activeListeners.has(token)) {
                    if (store.activeListeners.size === 1) {
                        store.stop();
                    }
                    store.activeListeners.delete(token);
                }
                if (store.passiveListeners.has(token)) {
                    store.passiveListeners.delete(token);
                }
            },
            activate() {
                if (store.passiveListeners.has(token)) {
                    store.passiveListeners.delete(token);
                }
                if (!store.activeListeners.has(token)) {
                    store.activeListeners.set(token, listener);
                    if (store.activeListeners.size === 1) {
                        store.start();
                    }
                }
            },
            deactivate() {
                if (store.activeListeners.has(token)) {
                    if (store.activeListeners.size === 1) {
                        store.stop();
                    }
                    store.activeListeners.delete(token);
                }
                if (!store.passiveListeners.has(token)) {
                    store.passiveListeners.set(token, listener);
                }
            }
        };
        if (passive) {
            subscription.deactivate();
        } else {
            subscription.activate();
        }
        return subscription;
    }

    public pipe<U>(transform: (source: this) => Store<U>): Store<U> {
        return transform(this);
    }

    public compose<U>(transform: (source: this) => U): U {
        return transform(this);
    }

    protected setInnerState(state: T) {
        this.innerState = state;
        this.notify(state);
    }

    protected abstract start(): void;
    protected abstract stop(): void;

    private notify(value: T) {
        for (const listener of this.activeListeners.values()) {
            listener(value);
        }
        for (const listener of this.passiveListeners.values()) {
            listener(value);
        }
    }
}

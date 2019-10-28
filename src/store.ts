import { Subscription } from './subscription';

export abstract class Store<T> {
    protected start?: () => void;
    protected stop?: () => void;

    private innerState: T;
    private innerVersion: number = 0;
    private listenerCounter: number = 0;
    private listeners: Map<number, (store: Store<T>) => void> = new Map();

    public constructor(initialState: T) {
        this.innerState = initialState;
    }

    public get state(): T {
        return this.innerState;
    }

    public get version(): number {
        return this.innerVersion;
    }

    public subscribe(listener: (store: Store<T>) => void, immediate: boolean = false): Subscription {
        const token = this.listenerCounter++;
        this.listeners.set(token, listener);
        if (this.start && this.listeners.size === 1) {
            this.start();
        }
        const subscription = {
            store: this,
            token,
            unsubscribe() {
                if (this.store.stop && this.store.listeners.size === 1) {
                    this.store.stop();
                }
                this.store.listeners.delete(this.token);
            }
        };
        if (immediate) {
            listener(this);
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
        this.innerVersion += 1;
        this.innerState = state;
        this.notify();
    }

    private notify() {
        for (const listener of this.listeners.values()) {
            listener(this);
        }
    }
}

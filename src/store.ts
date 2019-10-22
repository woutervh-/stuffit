import { Subscription } from './subscription';

export abstract class Store<T> {
    private listenerCounter: number = 0;
    private listeners: Map<number, (value: T, store: Store<T>) => void> = new Map();

    public abstract get state(): T;

    public subscribe(listener: (value: T, store: Store<T>) => void): Subscription {
        const token = this.listenerCounter++;
        this.listeners.set(token, listener);
        if (this.listeners.size === 1) {
            this.start();
        }
        return {
            unsubscribe: () => {
                if (this.listeners.size === 1) {
                    this.stop();
                }
                this.listeners.delete(token);
            }
        };
    }

    public pipe<U>(transform: (source: this) => Store<U>): Store<U> {
        return transform(this);
    }

    public compose<U>(transform: (source: this) => U): U {
        return transform(this);
    }

    protected abstract start(): void;
    protected abstract stop(): void;

    protected notify() {
        const state = this.state;
        for (const listener of this.listeners.values()) {
            listener(state, this);
        }
    }
}

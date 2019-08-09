import { Subscription } from './subscription';

export abstract class Store<T> {
    private innerState: T;
    private listenerCounter: number = 0;
    private listeners: Map<number, (value: T) => void> = new Map();

    public constructor(initialState: T) {
        this.innerState = initialState;
    }

    public get state(): T {
        return this.innerState;
    }

    public subscribe(listener: (value: T) => void): Subscription {
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

    public pipe<U>(transform: (source: this) => Store<U>) {
        return transform(this);
    }

    public compose<U>(transform: (source: this) => U) {
        return transform(this);
    }

    protected setInnerState(state: T) {
        this.innerState = state;
        this.notify(state);
    }

    protected abstract start(): void;
    protected abstract stop(): void;

    private notify(value: T) {
        for (const listener of this.listeners.values()) {
            listener(value);
        }
    }
}

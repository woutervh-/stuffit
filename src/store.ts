import { Subscription } from './subscription';

export abstract class Store<T> {
    private innerVersion: number = 0;
    private innerState: T;
    private listenerCounter: number = 0;
    private listeners: Map<number, (state: T) => void> = new Map();

    public constructor(initialState: T) {
        this.innerState = initialState;
    }

    public get version(): number {
        return this.innerVersion;
    }

    public get state(): T {
        return this.innerState;
    }

    public subscribe(listener: (state: T) => void = Store.noOp, immediate?: boolean): Subscription {
        const token = this.listenerCounter++;
        if (this.listeners.size === 0) {
            this.preStart();
        }
        this.listeners.set(token, listener);
        if (this.listeners.size === 1) {
            this.start();
        }
        const subscription = {
            store: this,
            token,
            unsubscribe() {
                if (this.store.listeners.size === 1) {
                    this.store.stop();
                }
                this.store.listeners.delete(this.token);
            }
        };
        if (immediate) {
            listener(this.innerState);
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
        this.notify(state);
    }

    protected abstract preStart(): void;
    protected abstract start(): void;
    protected abstract stop(): void;

    private notify(state: T) {
        for (const listener of this.listeners.values()) {
            listener(state);
        }
    }

    private static noOp() {
        //
    }
}

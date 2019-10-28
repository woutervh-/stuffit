import { Store } from './store';
import { Subscription } from './subscription';

interface Subscribable<T> {
    subscribe(listener: (store: StorePrimitive<T>) => void, immediate?: boolean): Subscription;
}

interface Versioned {
    version: number;
}

interface StorePrimitive<T> extends Subscribable<T>, Versioned { }

interface Dependency<T> {
    callback: (store: StorePrimitive<T>) => void;
    subscription: Subscription | null;
    version: number | null;
}

export abstract class Operator<T> extends Store<T> {
    private dependencies: Map<StorePrimitive<unknown>, Dependency<unknown>> = new Map();

    public addDependency<T>(store: StorePrimitive<T>, callback: (store: StorePrimitive<T>) => void) {
        if (this.dependencies.has(store)) {
            throw new Error('Dependency already exists.');
        }
        const subscription = this.hasStarted()
            ? store.subscribe(this.handleChange)
            : null;
        this.dependencies.set(store, { callback, subscription, version: null });
    }

    public removeDependency(store: StorePrimitive<unknown>) {
        if (!this.dependencies.has(store)) {
            throw new Error('Dependency does not exist.');
        }
        if (this.hasStarted()) {
            const dependency = this.dependencies.get(store)!;
            dependency.subscription!.unsubscribe();
        }
        this.dependencies.delete(store);
    }

    public hasChanges() {
        for (const [store, dependency] of this.dependencies.entries()) {
            if (dependency.version !== store.version) {
                return true;
            }
        }
        return false;
    }

    public flushChanges() {
        for (const [store, dependency] of this.dependencies.entries()) {
            if (dependency.version !== store.version) {
                dependency.version = store.version;
                dependency.callback(store);
            }
        }
    }

    public get state() {
        if (this.hasChanges()) {
            this.flushChanges();
        }
        return super.state;
    }

    protected start = () => {
        for (const [store, dependency] of this.dependencies.entries()) {
            dependency.subscription = store.subscribe(this.handleChange);
        }
    }

    protected stop = () => {
        for (const dependency of this.dependencies.values()) {
            dependency.subscription!.unsubscribe();
        }
    }

    protected initialize = () => {
        this.flushChanges();
    }

    private handleChange = (store: StorePrimitive<unknown>) => {
        const dependency = this.dependencies.get(store)!;
        dependency.version = store.version;
        dependency.callback(store);
        this.notify();
    }
}

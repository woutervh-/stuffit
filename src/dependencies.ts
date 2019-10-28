import { Subscription } from './subscription';

interface Subscribable<T> {
    subscribe(listener: (store: Store<T>) => void, immediate?: boolean): Subscription;
}

interface Versioned {
    version: number;
}

interface Store<T> extends Subscribable<T>, Versioned { }

interface Dependency<T> {
    callback: (store: Store<T>) => void;
    subscription: Subscription | null;
    version: number;
}

export class Dependencies {
    private dependencies: Map<Store<unknown>, Dependency<unknown>> = new Map();
    private enabled: boolean = false;

    public addDependency<T>(store: Store<T>, callback: (store: Store<T>) => void) {
        if (this.dependencies.has(store)) {
            throw new Error('Dependency already exists.');
        }
        const subscription = this.enabled
            ? store.subscribe(this.handleChange)
            : null;
        this.dependencies.set(store, { callback, subscription, version: store.version });
    }

    public removeDependency(store: Store<unknown>) {
        if (!this.dependencies.has(store)) {
            throw new Error('Dependency does not exist.');
        }
        if (this.enabled) {
            const dependency = this.dependencies.get(store)!;
            dependency.subscription!.unsubscribe();
        }
        this.dependencies.delete(store);
    }

    public enable() {
        if (this.enabled) {
            throw new Error('Already enabled.');
        }
        for (const [store, dependency] of this.dependencies.entries()) {
            dependency.subscription = store.subscribe(this.handleChange);
        }
        this.enabled = true;
    }

    public disable() {
        if (!this.enabled) {
            throw new Error('Already disabled.');
        }
        for (const dependency of this.dependencies.values()) {
            dependency.subscription!.unsubscribe();
        }
        this.enabled = false;
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

    private handleChange = (store: Store<unknown>) => {
        const dependency = this.dependencies.get(store)!;
        dependency.version = store.version;
        dependency.callback(store);
    }
}

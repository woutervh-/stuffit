import { Store } from './store';
import { Subscription } from './subscription';

interface Dependency {
    subscription: Subscription | null;
}

export abstract class Operator<T> extends Store<T> {
    private dependencies: Map<Store<unknown>, Dependency> = new Map();

    protected addDependency<T>(source: Store<T>) {
        if (this.dependencies.has(source as Store<unknown>)) {
            throw new Error('Dependency already exists.');
        }
        const subscription = this.hasStarted()
            ? source.subscribe(this.handleChange)
            : null;
        this.dependencies.set(source as Store<unknown>, { subscription });
    }

    protected removeDependency(source: Store<unknown>) {
        if (!this.dependencies.has(source)) {
            throw new Error('Dependency does not exist.');
        }
        if (this.hasStarted()) {
            this.dependencies.get(source)!.subscription!.unsubscribe();
        }
        this.dependencies.delete(source);
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

    private handleChange = () => {
        this.incrementVersion();
    }
}

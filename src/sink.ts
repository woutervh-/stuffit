import { Store } from './store';
import { Subscription } from './subscription';

export abstract class Sink<T> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;

    public constructor(source: Store<T>) {
        this.source = source;
    }

    public start() {
        this.handleNext(this.source.state);
        if (!this.subscription) {
            this.subscription = this.source.subscribe((value) => this.handleNext(value));
        }
        return this;
    }

    public stop() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
        return this;
    }

    public hasStarted(): boolean {
        return this.subscription !== undefined;
    }

    protected abstract handleNext(value: T): void;
}

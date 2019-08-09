import { Store } from './store';
import { Subscription } from './subscription';

export abstract class Sink<T> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;

    public constructor(source: Store<T>) {
        this.source = source;
    }

    public start() {
        if (!this.subscription) {
            this.handleNext(this.source.state);
            this.subscription = this.source.subscribe(this.handleNext);
        }
    }

    public stop() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    protected abstract handleNext(value: T): void;
}

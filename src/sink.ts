import { Store } from './store';
import { Subscription } from './subscription';

export abstract class Sink<T> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;
    private first = true;

    public constructor(source: Store<T>) {
        this.source = source;
    }

    public start() {
        if (this.first) {
            this.handleNext(this.source.state);
            this.first = false;
        }
        if (!this.subscription) {
            this.subscription = this.source.subscribe((value) => this.handleNext(value));
        }
    }

    public stop() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    public hasStarted() {
        return this.subscription !== undefined;
    }

    protected abstract handleNext(value: T): void;
}

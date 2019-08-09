import { Store } from '../store';
import { Subscription } from '../subscription';

export class ThrottleStore<T> extends Store<T> {
    private source: Store<T>;
    private limit: number | 'raf';
    private subscription: Subscription | undefined = undefined;
    private throttledState: { value: T } | undefined = undefined;
    private throttleTimeout: number | undefined = undefined;

    constructor(source: Store<T>, limit: number | 'raf') {
        super(source.state);
        this.source = source;
        this.limit = limit;
    }

    protected start() {
        if (this.subscription === undefined) {
            this.subscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
        if (this.throttleTimeout !== undefined) {
            if (typeof this.limit === 'number') {
                clearTimeout(this.throttleTimeout);
            } else {
                cancelAnimationFrame(this.throttleTimeout);
            }
            this.throttleTimeout = undefined;
        }
        this.throttledState = undefined;
    }

    private handleThrottledCallback = () => {
        this.throttleTimeout = undefined;
        if (this.throttledState) {
            this.setInnerState(this.throttledState.value);
            this.throttledState = undefined;
        }
    }

    private handleNext = (value: T) => {
        if (this.throttleTimeout === undefined) {
            this.setInnerState(value);

            if (typeof this.limit === 'number') {
                this.throttleTimeout = setTimeout(this.handleThrottledCallback, this.limit);
            } else {
                this.throttleTimeout = requestAnimationFrame(this.handleThrottledCallback);
            }
        } else {
            this.throttledState = { value };
        }
    }
}

export const throttle = (limit: number | 'raf') => <T>(source: Store<T>): ThrottleStore<T> => {
    return new ThrottleStore(source, limit);
};

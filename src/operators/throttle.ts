import { Store } from '../store';
import { Subscription } from '../subscription';

export class ThrottleStore<T> extends Store<T> {
    private source: Store<T>;
    private limit: number | 'raf';
    private subscription: Subscription | undefined = undefined;
    private throttledState: { value: T } | undefined = undefined;
    private throttleTimeout: number | undefined = undefined;

    public constructor(source: Store<T>, limit: number | 'raf') {
        super(source.state);
        this.source = source;
        this.limit = limit;
    }

    protected preStart() {
        //
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
        this.clearTimeout();
        this.throttledState = undefined;
    }

    private handleThrottledCallback = () => {
        this.throttleTimeout = undefined;
        if (this.throttledState) {
            this.setInnerState(this.throttledState.value);
            this.throttledState = undefined;
            this.setTimeout();
        }
    }

    private handleNext = (value: T) => {
        if (this.throttleTimeout === undefined) {
            this.setInnerState(value);
            this.setTimeout();
        } else {
            this.throttledState = { value };
        }
    }

    private setTimeout() {
        if (this.throttleTimeout !== undefined) {
            return;
        }
        if (typeof this.limit === 'number') {
            this.throttleTimeout = setTimeout(this.handleThrottledCallback, this.limit);
        } else {
            this.throttleTimeout = requestAnimationFrame(this.handleThrottledCallback);
        }
    }

    private clearTimeout() {
        if (this.throttleTimeout === undefined) {
            return;
        }
        if (typeof this.limit === 'number') {
            clearTimeout(this.throttleTimeout);
        } else {
            cancelAnimationFrame(this.throttleTimeout);
        }
        this.throttleTimeout = undefined;
    }
}

export const throttle = (limit: number | 'raf') => <T>(source: Store<T>): ThrottleStore<T> => {
    return new ThrottleStore(source, limit);
};

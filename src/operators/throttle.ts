import { Dependency } from '../dependency';
import { Store } from '../store';

export class ThrottleStore<T> extends Store<T> {
    private dependency: Dependency<T>;
    private throttledState: { value: T } | undefined = undefined;
    private throttleTimeout: number | undefined = undefined;

    public constructor(source: Store<T>, private limit: number | 'raf') {
        super(source.state);
        this.dependency = new Dependency(source, this.handleNext);
    }

    protected preStart() {
        this.dependency.start();
        this.dependency.update();
    }

    protected start() {
        //
    }

    protected stop() {
        this.dependency.stop();
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

import { Operator } from '../operator';
import { Store } from '../store';

export class ThrottleOperator<T> extends Operator<T> {
    private throttleTimeout: number | null = null;
    private lastThrottleVersion: number | null = null;

    public constructor(private source: Store<T>, private limit: number | 'raf') {
        super();
        this.addDependency(source);
    }

    public get state() {
        return this.source.state;
    }

    protected handleChange() {
        this.incrementVersion();

        if (this.throttleTimeout === null) {
            this.setTimeout();
            this.notify();
        }
    }

    protected stop() {
        super.stop();
        if (this.throttleTimeout !== null) {
            this.clearTimeout();
        }
    }

    private handleThrottledCallback = () => {
        this.throttleTimeout = null;
        if (this.lastThrottleVersion !== this.source.version) {
            this.setTimeout();
            this.notify();
        }
    }

    private setTimeout() {
        if (this.throttleTimeout !== null) {
            return;
        }
        this.lastThrottleVersion = this.source.version;
        if (this.limit === 'raf') {
            this.throttleTimeout = requestAnimationFrame(this.handleThrottledCallback);
        } else {
            this.throttleTimeout = setTimeout(this.handleThrottledCallback, this.limit);
        }
    }

    private clearTimeout() {
        if (this.throttleTimeout === null) {
            return;
        }
        if (this.limit === 'raf') {
            cancelAnimationFrame(this.throttleTimeout);
        } else {
            clearTimeout(this.throttleTimeout);
        }
        this.throttleTimeout = null;
    }
}

export const throttle = (limit: number | 'raf') => <T>(source: Store<T>): ThrottleOperator<T> => {
    return new ThrottleOperator(source, limit);
};

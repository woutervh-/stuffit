import { Store } from '../store';
import { Subscription } from '../subscription';

export class DebounceStore<T> extends Store<T> {
    private source: Store<T>;
    private wait: number;
    private immediate: boolean;
    private subscription: Subscription | undefined = undefined;
    private timeout: number | undefined = undefined;

    public constructor(source: Store<T>, wait: number, immediate?: boolean) {
        super(source.state);
        this.source = source;
        this.wait = wait;
        this.immediate = !!immediate;
    }

    protected start = () => {
        if (this.subscription === undefined) {
            this.subscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop = () => {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    private clearTimeout() {
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    private handleNext = (value: T) => {
        const callNow = this.immediate && this.timeout === undefined;
        this.clearTimeout();
        this.timeout = setTimeout(() => {
            this.timeout = undefined;
            if (!this.immediate) {
                this.setInnerState(value);
            }
        }, this.wait);
        if (callNow) {
            this.setInnerState(value);
        }
    }
}

export const debounce = (wait: number, immediate?: boolean) => <T>(source: Store<T>): DebounceStore<T> => {
    return new DebounceStore(source, wait, immediate);
};

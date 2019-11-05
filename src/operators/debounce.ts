import { Dependency } from '../dependency';
import { Store } from '../store';

export class DebounceStore<T> extends Store<T> {
    private dependency: Dependency<T>;
    private timeout: number | undefined = undefined;

    public constructor(source: Store<T>, private wait: number, private immediate?: boolean) {
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

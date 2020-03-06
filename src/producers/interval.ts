import { Store } from '../store';

export class IntervalStore extends Store<number> {
    private timer: number | undefined = undefined;
    private timeout: number;
    private immediate: boolean;

    public constructor(timeout: number, immediate?: boolean) {
        super(0);
        this.timeout = timeout;
        this.immediate = !!immediate;
    }

    protected preStart() {
        //
    }

    protected start() {
        if (this.timer === undefined) {
            if (this.immediate) {
                this.handleInterval();
            }
            this.timer = setInterval(this.handleInterval, this.timeout);
        }
    }

    protected stop() {
        if (this.timer !== undefined) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    private handleInterval = () => {
        this.setInnerState(this.state + 1);
    }
}

export const fromInterval = (timeout: number, immediate?: boolean): IntervalStore => {
    return new IntervalStore(timeout, immediate);
};

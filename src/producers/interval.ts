import { Store } from '../store';

export class IntervalStore extends Store<number> {
    private timer: number | undefined = undefined;
    private timeout: number;

    public constructor(timeout: number) {
        super(0);
        this.timeout = timeout;
    }

    protected start() {
        if (this.timer === undefined) {
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

export const fromInterval = (timeout: number): IntervalStore => {
    return new IntervalStore(timeout);
};

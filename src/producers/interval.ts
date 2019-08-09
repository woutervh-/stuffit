import { Store } from '../store';

export class IntervalStore extends Store<number> {
    private timer: number | undefined = undefined;
    private timeout: number;
    private counter = 0;

    constructor(timeout: number) {
        super();
        this.timeout = timeout;
    }

    public get state() {
        return this.counter;
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
        this.counter += 1;
        this.notify(this.state);
    }
}

export const fromInterval = (timeout: number): IntervalStore => {
    return new IntervalStore(timeout);
};

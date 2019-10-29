import { Store } from '../store';

export class IntervalStore extends Store<number> {
    private timer: number | undefined = undefined;

    public constructor(private timeout: number) {
        super();
    }

    public get state() {
        return this.version;
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
        this.incrementVersion();
        this.notify();
    }
}

export const fromInterval = (timeout: number): IntervalStore => {
    return new IntervalStore(timeout);
};

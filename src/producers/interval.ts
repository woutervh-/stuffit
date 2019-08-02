import { Store } from '../store';

export class IntervalStore extends Store<number> {
    private timer: number | undefined = undefined;
    private timeout: number;

    constructor(timeout: number) {
        super();
        this.timeout = timeout;
    }

    public get state() {
        return 0;
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
        this.notify(this.state);
    }
}

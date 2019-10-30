import { Store } from './store';
import { Subscription } from './subscription';

export class Dependency<T> {
    private innerSource: Store<T>;
    private lastVersion: number;
    private subscription: Subscription | null = null;

    public constructor(source: Store<T>, private callback: (state: T) => void) {
        this.innerSource = source;
        this.lastVersion = source.version;
    }

    public start() {
        if (this.subscription) {
            return;
        }
        this.subscription = this.innerSource.subscribe(this.handleNext);
    }

    public stop() {
        if (!this.subscription) {
            return;
        }
        this.subscription.unsubscribe();
        this.subscription = null;
    }

    public get version() {
        return this.lastVersion;
    }

    public get source() {
        return this.innerSource;
    }

    public update() {
        if (this.lastVersion !== this.innerSource.version) {
            this.handleNext(this.innerSource.state);
        }
    }

    public hasStarted() {
        return this.subscription !== undefined;
    }

    private handleNext = (state: T) => {
        this.lastVersion = this.innerSource.version;
        this.callback(state);
    }
}

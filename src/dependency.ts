import { Store } from './store';
import { Subscription } from './subscription';

export class Dependency<T> {
    private subscription: Subscription | null = null;
    private lastVersion: number;

    public constructor(private source: Store<T>, private callback: (state: T) => void) {
        this.lastVersion = source.version;
    }

    public start() {
        if (this.subscription) {
            return;
        }
        this.subscription = this.source.subscribe(this.handleNext);
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

    public update() {
        if (this.lastVersion !== this.source.version) {
            this.handleNext(this.source.state);
        }
    }

    private handleNext = (state: T) => {
        this.lastVersion = this.source.version;
        this.callback(state);
    }
}

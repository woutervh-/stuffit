import { Store } from '../store';
import { Subscription } from '../subscription';

export class CombineStore<T extends unknown[]> extends Store<T> {
    private sources: Store<unknown>[];

    private subscriptions: Subscription[] | undefined = undefined;

    constructor(sources: { [K in keyof T]: Store<T[K]> }) {
        super();
        this.sources = sources;
    }

    public get state() {
        return this.sources.map((source) => source.state) as T;
    }

    protected start() {
        if (this.subscriptions === undefined) {
            this.subscriptions = this.sources.map(this.subscribeTo);
        }
    }

    protected stop() {
        if (this.subscriptions !== undefined) {
            for (const subscription of this.subscriptions) {
                subscription.unsubscribe();
            }
            this.subscriptions = undefined;
        }
    }

    private subscribeTo = (source: Store<unknown>) => {
        return source.subscribe(this.handleNext);
    }

    private handleNext = () => {
        this.notify(this.state);
    }
}

export const combine = <T extends unknown[]>(...sources: { [K in keyof T]: Store<T[K]> }): CombineStore<T> => {
    return new CombineStore<T>(sources);
};

export const combineApply = <T extends unknown[]>(sources: { [K in keyof T]: Store<T[K]> }): CombineStore<T> => {
    return new CombineStore<T>(sources);
};

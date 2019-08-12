import { Store } from '../store';
import { Subscription } from '../subscription';

export class CombineStore<T extends unknown[]> extends Store<T> {
    private sources: { [K in keyof T]: Store<T[K]> };
    private subscriptions: Subscription[] | undefined = undefined;

    public constructor(sources: { [K in keyof T]: Store<T[K]> }) {
        super(CombineStore.combine<T>(sources));
        this.sources = sources;
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
        this.setInnerState(CombineStore.combine<T>(this.sources));
    }

    private static combine<T extends unknown[]>(sources: { [K in keyof T]: Store<T[K]> }) {
        return sources.map((source) => source.state) as T;
    }
}

export const combine = <T extends unknown[]>(...sources: { [K in keyof T]: Store<T[K]> }): CombineStore<T> => {
    return new CombineStore<T>(sources);
};

export const combineApply = <T extends unknown[]>(sources: { [K in keyof T]: Store<T[K]> }): CombineStore<T> => {
    return new CombineStore<T>(sources);
};

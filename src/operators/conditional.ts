import { Store } from '../store';
import { Subscription } from '../subscription';

export class ConditionalStore<T, U, V> extends Store<U | V> {
    private source: Store<T>;
    private test: (value: T) => boolean;
    private sourceIf: Store<U>;
    private sourceElse: Store<V>;
    private sourceSubscription: Subscription | undefined = undefined;
    private ifSubscription: Subscription | undefined = undefined;
    private elseSubscription: Subscription | undefined = undefined;

    public constructor(source: Store<T>, test: (value: T) => boolean, sourceIf: Store<U>, sourceElse: Store<V>) {
        super(ConditionalStore.conditional(source.state, test, sourceIf.state, sourceElse.state));
        this.source = source;
        this.test = test;
        this.sourceIf = sourceIf;
        this.sourceElse = sourceElse;
    }

    protected start() {
        this.handleSourceNext();
        if (this.sourceSubscription === undefined) {
            this.sourceSubscription = this.source.subscribe(this.handleSourceNext);
        }
    }

    protected stop() {
        if (this.sourceSubscription !== undefined) {
            this.sourceSubscription.unsubscribe();
            this.sourceSubscription = undefined;
        }
        if (this.ifSubscription !== undefined) {
            this.ifSubscription.unsubscribe();
            this.ifSubscription = undefined;
        }
        if (this.elseSubscription !== undefined) {
            this.elseSubscription.unsubscribe();
            this.elseSubscription = undefined;
        }
    }

    private handleSourceNext = () => {
        if (this.test(this.source.state)) {
            if (this.elseSubscription) {
                this.elseSubscription.unsubscribe();
                this.elseSubscription = undefined;
            }
            if (!this.ifSubscription) {
                this.handleBranchNext(this.sourceIf.state);
                this.ifSubscription = this.sourceIf.subscribe(this.handleBranchNext);
            }
        } else {
            if (this.ifSubscription) {
                this.ifSubscription.unsubscribe();
                this.ifSubscription = undefined;
            }
            if (!this.elseSubscription) {
                this.handleBranchNext(this.sourceElse.state);
                this.elseSubscription = this.sourceElse.subscribe(this.handleBranchNext);
            }
        }
    }

    private handleBranchNext = (value: U | V) => {
        this.setInnerState(value);
    }

    private static conditional<T, U, V>(state: T, test: (value: T) => boolean, stateIf: U, stateElse: V): U | V {
        return test(state) ? stateIf : stateElse;
    }
}

export const conditional = <T>(test: (value: T) => boolean) => <U, V>(sourceIf: Store<U>, sourceElse: Store<V>) => (source: Store<T>): ConditionalStore<T, U, V> => {
    return new ConditionalStore(source, test, sourceIf, sourceElse);
};

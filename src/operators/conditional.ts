import { Store } from '../store';
import { Subscription } from '../subscription';

export class ConditionalStore<T, U> extends Store<T | U> {
    private source: Store<boolean>;
    private sourceIf: Store<T>;
    private sourceElse: Store<U>;
    private sourceSubscription: Subscription | undefined = undefined;
    private ifSubscription: Subscription | undefined = undefined;
    private elseSubscription: Subscription | undefined = undefined;

    public constructor(source: Store<boolean>, sourceIf: Store<T>, sourceElse: Store<U>) {
        super(ConditionalStore.conditional(source.state, sourceIf.state, sourceElse.state));
        this.source = source;
        this.sourceIf = sourceIf;
        this.sourceElse = sourceElse;
    }

    protected start = () => {
        this.handleSourceNext();
        if (this.sourceSubscription === undefined) {
            this.sourceSubscription = this.source.subscribe(this.handleSourceNext);
        }
    }

    protected stop = () => {
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
        if (this.source.state) {
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

    private handleBranchNext = (value: T | U) => {
        this.setInnerState(value);
    }

    private static conditional<T, U>(state: boolean, stateIf: T, stateElse: U): T | U {
        return state ? stateIf : stateElse;
    }
}

export const conditional = <T, U>(sourceIf: Store<T>, sourceElse: Store<U>) => (source: Store<boolean>): ConditionalStore<T, U> => {
    return new ConditionalStore(source, sourceIf, sourceElse);
};

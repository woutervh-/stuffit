import { Dependency } from '../dependency';
import { Store } from '../store';

export class ConditionalStore<T, U> extends Store<T | U> {
    private sourceDependency: Dependency<boolean>;
    private activeDependency: Dependency<T> | Dependency<U>;

    public constructor(source: Store<boolean>, private sourceIf: Store<T>, private sourceElse: Store<U>) {
        super(source.state ? sourceIf.state : sourceElse.state);
        this.sourceDependency = new Dependency(source, this.handleSourceNext);
        this.activeDependency = source.state
            ? new Dependency(sourceIf, this.handleBranchNext)
            : new Dependency(sourceElse, this.handleBranchNext);
    }

    protected preStart() {
        this.activeDependency.start();
        this.activeDependency.update();
        this.sourceDependency.start();
        this.sourceDependency.update();
    }

    protected start() {
        //
    }

    protected stop() {
        this.activeDependency.stop();
        this.sourceDependency.stop();
    }

    private handleSourceNext = (state: boolean) => {
        if (state) {
            if (this.activeDependency.source === this.sourceElse) {
                this.activeDependency.stop();
                this.activeDependency = new Dependency(this.sourceIf, this.handleBranchNext);
                this.activeDependency.start();
                this.handleBranchNext(this.sourceIf.state);
            }
        } else {
            if (this.activeDependency.source === this.sourceIf) {
                this.activeDependency.stop();
                this.activeDependency = new Dependency(this.sourceElse, this.handleBranchNext);
                this.activeDependency.start();
                this.handleBranchNext(this.sourceElse.state);
            }
        }
    }

    private handleBranchNext = (value: T | U) => {
        this.setInnerState(value);
    }
}

export const conditional = <T, U>(sourceIf: Store<T>, sourceElse: Store<U>) => (source: Store<boolean>): ConditionalStore<T, U> => {
    return new ConditionalStore(source, sourceIf, sourceElse);
};

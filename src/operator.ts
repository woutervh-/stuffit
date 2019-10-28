import { Dependencies } from './dependencies';
import { Store } from './store';

export abstract class Operator<T> extends Store<T> {
    protected dependencies = new Dependencies();

    public get state() {
        if (this.dependencies.hasChanges()) {
            this.dependencies.flushChanges();
        }
        return super.state;
    }

    protected start = () => {
        this.dependencies.enable();
    }

    protected stop = () => {
        this.dependencies.disable();
    }
}

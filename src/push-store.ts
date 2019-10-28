import { MaterializedStore } from './materialized-store';

export class PushStore<T> extends MaterializedStore<T> {
    public setState(newState: T) {
        super.setState(newState);
    }
}

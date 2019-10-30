import * as chai from 'chai';
import { ArrayMergeStore } from '../../src/operators/array-merge';
import { PushStore } from '../../src/push-store';

let evenSource: PushStore<number>;
let oddSource: PushStore<number>;

beforeEach(() => {
    evenSource = new PushStore(0);
    oddSource = new PushStore(1);
});

describe('ArrayMergeStore', () => {
    describe('#state', () => {
        it('Initially starts with the state of the last store in the array.', () => {
            const store = new ArrayMergeStore([evenSource, oddSource]);
            chai.assert.strictEqual(store.state, 1);
        });

        it('Copies the state of the latest changed source to the current state.', () => {
            const store = new ArrayMergeStore([evenSource, oddSource]);
            const subscription = store.subscribe();

            evenSource.setState(2);
            chai.assert.strictEqual(store.state, 2);
            oddSource.setState(3);
            chai.assert.strictEqual(store.state, 3);
            oddSource.setState(5);
            chai.assert.strictEqual(store.state, 5);
            evenSource.setState(4);
            chai.assert.strictEqual(store.state, 4);

            subscription.unsubscribe();
        });
    });
});

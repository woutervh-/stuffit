import * as chai from 'chai';
import { ArrayCombineStore } from '../../src/operators/array-combine';
import { PushStore } from '../../src/push-store';

let evenSource: PushStore<number>;
let oddSource: PushStore<number>;

beforeEach(() => {
    evenSource = new PushStore(0);
    oddSource = new PushStore(1);
});

describe('ArrayCombineStore', () => {
    describe('#state', () => {
        it('Copies all the states of the sources and combines them into an array.', () => {
            const store = new ArrayCombineStore([evenSource, oddSource]);
            const subscription = store.subscribe();

            chai.assert.deepStrictEqual(store.state, [0, 1]);
            evenSource.setState(2);
            chai.assert.deepStrictEqual(store.state, [2, 1]);
            oddSource.setState(3);
            chai.assert.deepStrictEqual(store.state, [2, 3]);

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies the subscriber whenever one of the underlying sources changes state.', () => {
            let count = 0;
            const store = new ArrayCombineStore([evenSource, oddSource]);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.deepStrictEqual(count, 0);
            evenSource.setState(2);
            chai.assert.deepStrictEqual(count, 1);
            oddSource.setState(3);
            chai.assert.deepStrictEqual(count, 2);
            oddSource.setState(5);
            chai.assert.deepStrictEqual(count, 3);

            subscription.unsubscribe();
        });
    });
});

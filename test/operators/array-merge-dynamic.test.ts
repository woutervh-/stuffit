import * as chai from 'chai';
import { ArrayMergeDynamicStore } from '../../src/operators/array-merge-dynamic';
import { PushStore } from '../../src/push-store';
import { Store } from '../../src/store';

let source: PushStore<Store<number>[]>;
let zeroRemainderSource: PushStore<number>;
let oneRemainderSource: PushStore<number>;
let twoRemainderSource: PushStore<number>;

beforeEach(() => {
    zeroRemainderSource = new PushStore(0);
    oneRemainderSource = new PushStore(1);
    twoRemainderSource = new PushStore(2);
    source = new PushStore<Store<number>[]>([zeroRemainderSource, oneRemainderSource]);
});

describe('ArrayMergeDynamicStore', () => {
    describe('#state', () => {
        it('Initially starts with the state of the last store in the array.', () => {
            const store = new ArrayMergeDynamicStore(source);
            chai.assert.strictEqual(store.state, 1);
        });

        it('Copies the state of the latest changed source to the current state.', () => {
            const store = new ArrayMergeDynamicStore(source);
            const subscription = store.subscribe();

            zeroRemainderSource.setState(3);
            chai.assert.strictEqual(store.state, 3);
            oneRemainderSource.setState(4);
            chai.assert.strictEqual(store.state, 4);
            oneRemainderSource.setState(7);
            chai.assert.strictEqual(store.state, 7);
            zeroRemainderSource.setState(6);
            chai.assert.strictEqual(store.state, 6);

            subscription.unsubscribe();
        });

        it('Updates its active sources based on changes in the source store.', () => {
            const store = new ArrayMergeDynamicStore(source);
            const subscription = store.subscribe();

            chai.assert.strictEqual(store.state, 1);
            source.setState([zeroRemainderSource, twoRemainderSource]);
            chai.assert.strictEqual(store.state, 2);
            zeroRemainderSource.setState(3);
            chai.assert.strictEqual(store.state, 3);
            twoRemainderSource.setState(5);
            chai.assert.strictEqual(store.state, 5);

            source.setState([oneRemainderSource, zeroRemainderSource]);
            chai.assert.strictEqual(store.state, 3);

            source.setState([zeroRemainderSource, oneRemainderSource]);
            chai.assert.strictEqual(store.state, 1);

            subscription.unsubscribe();
        });

        it('Forgets about previous sources that are no longer in the source store.', () => {
            const store = new ArrayMergeDynamicStore(source);
            const subscription = store.subscribe();

            chai.assert.strictEqual(store.state, 1);
            source.setState([zeroRemainderSource, twoRemainderSource]);
            chai.assert.strictEqual(store.state, 2);
            oneRemainderSource.setState(4);
            chai.assert.strictEqual(store.state, 2);

            subscription.unsubscribe();
        });
    });
});

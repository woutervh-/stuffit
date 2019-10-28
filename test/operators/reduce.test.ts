import * as chai from 'chai';
import { ReduceOperator } from '../../src/operators/reduce';
import { PushStore } from '../../src/push-store';

let source: PushStore<number>;

beforeEach(() => {
    source = new PushStore(1);
});

describe('ReduceOperator', () => {
    describe('#state', () => {
        it('Reduces over the source states starting with the initial state.', () => {
            const store = new ReduceOperator(source, (sum, value) => sum + value, 0);
            chai.assert.strictEqual(store.state, 1);
            source.setState(2);
            chai.assert.strictEqual(store.state, 3);
        });

        it('Does not reduce over new source values when there is no request for state.', () => {
            const store = new ReduceOperator(source, (sum, value) => sum + value, 0);
            source.setState(2);
            source.setState(3);
            source.setState(4);
            chai.assert.strictEqual(store.state, 4);
        });
    });

    describe('#subscribe', () => {
        it('Notifies subscribers when the underlying source has changed.', () => {
            let count = 0;
            const store = new ReduceOperator(source, (sum, value) => sum + value, 0);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.strictEqual(count, 0);
            source.setState(1);
            chai.assert.strictEqual(count, 1);
            source.setState(2);
            chai.assert.strictEqual(count, 2);
            source.setState(2);
            chai.assert.strictEqual(count, 3);

            subscription.unsubscribe();
        });
    });
});

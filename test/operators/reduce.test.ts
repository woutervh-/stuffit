import * as assert from 'assert';
import { reduce } from '../../src/operators/reduce';
import { PushStore } from '../../src/push-store';

let source: PushStore<number>;

beforeEach(() => {
    source = new PushStore(1);
});

describe('ReduceOperator', () => {
    describe('#state', () => {
        it('Applies the reduce function to the current state and the source state, starting with an initial value.', () => {
            const store = reduce<number, number>((sum, value) => sum + value, 0)(source);
            assert.deepStrictEqual(store.state, 1);
            source.setState(2);
            assert.deepStrictEqual(store.state, 3);
            source.setState(3);
            assert.deepStrictEqual(store.state, 6);
        });
    });

    describe('Laziness', () => {
        it('Applies the reduce function lazily.', () => {
            let count = 0;
            const store = reduce<number, number>((sum, value) => (count += 1, sum + value), 0)(source);

            assert.deepStrictEqual(count, 0);

            source.setState(1);
            assert.deepStrictEqual(count, 0);

            source.setState(2);
            assert.deepStrictEqual(count, 0);

            assert.deepStrictEqual(store.state, 2);
            assert.deepStrictEqual(count, 1);
        });
    });
});

import * as assert from 'assert';
import { map } from '../../src/operators/map';
import { PushStore } from '../../src/push-store';

let source: PushStore<number>;

beforeEach(() => {
    source = new PushStore(0);
});

describe('MapOperator', () => {
    describe('#state', () => {
        it('Maps the input state to the output of the project function.', () => {
            const store = map<number, number>(() => 42)(source);
            assert.deepStrictEqual(store.state, 42);
            source.setState(1);
            assert.deepStrictEqual(store.state, 42);
        });
    });
});

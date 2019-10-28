import * as chai from 'chai';
import { MapOperator } from '../../src/operators/map';
import { PushStore } from '../../src/push-store';

let source: PushStore<number>;

beforeEach(() => {
    source = new PushStore(0);
});

describe('MapOperator', () => {
    describe('#state', () => {
        it('Maps the state using the given project function.', () => {
            const store = new MapOperator(source, () => 42);
            chai.assert.strictEqual(store.state, 42);
            source.setState(1);
            chai.assert.strictEqual(store.state, 42);
        });
    });
});

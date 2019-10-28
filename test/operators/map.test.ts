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

    describe('#subscribe', () => {
        it('Passes source state change notifications along to the subscriber.', () => {
            let count = 0;
            const store = map<number, number>(() => 42)(source);
            const subscription = store.subscribe(() => (count += 1, assert.deepStrictEqual(store.state, 42)));

            source.setState(1);
            assert.deepStrictEqual(count, 1);

            source.setState(2);
            assert.deepStrictEqual(count, 2);

            subscription.unsubscribe();
            source.setState(3);
            assert.deepStrictEqual(count, 2);
        });
    });

    describe('Laziness', () => {
        it('Will only use the project function when source state has changed and the current state is requested.', () => {
            let count = 0;
            const store = map<number, number>(() => (count += 1, 42))(source);

            assert.deepStrictEqual(count, 0);

            store.state; // tslint:disable-line:no-unused-expression get property will trigger lazy evaluation.
            assert.deepStrictEqual(count, 1);

            store.state; // tslint:disable-line:no-unused-expression get property will trigger lazy evaluation.
            assert.deepStrictEqual(count, 1);

            source.setState(1);
            assert.deepStrictEqual(count, 1);

            store.state; // tslint:disable-line:no-unused-expression get property will trigger lazy evaluation.
            assert.deepStrictEqual(count, 2);
        });
    });
});

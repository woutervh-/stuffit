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

        it('Passes the source state into the project function.', () => {
            const store = new MapOperator(source, (input) => input);
            chai.assert.strictEqual(store.state, 0);
            source.setState(42);
            chai.assert.strictEqual(store.state, 42);
        });
    });

    describe('#subscribe', () => {
        it('Notifies subscribers when the underlying source has changed.', () => {
            let count = 0;
            const store = new MapOperator(source, () => 42);
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

    describe('Laziness', () => {
        it('Will only call the project function when the source has new input.', () => {
            let count = 0;
            const store = new MapOperator(source, () => (count += 1, 42));

            // When the state is requested, the project function should be called.
            store.state; // tslint:disable-line:no-unused-expression getter will trigger lazy evaluation.
            chai.assert.strictEqual(count, 1);

            // When the source has changed and the state is requested, the project function should be called.
            source.setState(1);
            store.state; // tslint:disable-line:no-unused-expression getter will trigger lazy evaluation.
            chai.assert.strictEqual(count, 2);
        });

        it('Will only call the project function when the client requests the state.', () => {
            let count = 0;
            const store = new MapOperator(source, () => (count += 1, 42));

            // Initially the project function should not be called.
            chai.assert.strictEqual(count, 0);

            // When the state is requested, the project function should be called.
            store.state; // tslint:disable-line:no-unused-expression getter will trigger lazy evaluation.
            chai.assert.strictEqual(count, 1);

            // When the state is requested but the source has not changed, the project function should not be called.
            store.state; // tslint:disable-line:no-unused-expression getter will trigger lazy evaluation.
            chai.assert.strictEqual(count, 1);
        });
    });
});

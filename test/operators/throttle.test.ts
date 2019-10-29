import * as chai from 'chai';
import * as sinon from 'sinon';
import { ThrottleOperator } from '../../src/operators/throttle';
import { PushStore } from '../../src/push-store';

let clock: sinon.SinonFakeTimers;
let source: PushStore<number>;

beforeEach(() => {
    clock = sinon.useFakeTimers();
    source = new PushStore(0);
});

afterEach(() => {
    clock.restore();
});

describe('throttle', () => {
    describe('#state', () => {
        it('Always has an updated state, despite the source updating more frequently than the throttle timeout.', () => {
            const store = new ThrottleOperator(source, 100);

            chai.assert.strictEqual(store.state, 0);
            source.setState(1);
            chai.assert.strictEqual(store.state, 1);
            source.setState(2);
            chai.assert.strictEqual(store.state, 2);
        });
    });

    describe('#subscribe', () => {
        it('Will notify subscribers of state changes at most once per configured timeout.', () => {
            let count = 0;
            const store = new ThrottleOperator(source, 100);
            const subscription = store.subscribe(() => count += 1);

            source.setState(1);
            chai.assert.strictEqual(count, 1);
            source.setState(2);
            chai.assert.strictEqual(count, 1);
            source.setState(3);
            chai.assert.strictEqual(count, 1);

            clock.tick(150);

            chai.assert.strictEqual(count, 2);
            source.setState(4);
            chai.assert.strictEqual(count, 2);

            clock.tick(150);

            chai.assert.strictEqual(count, 3);

            clock.tick(150);

            chai.assert.strictEqual(count, 3);
            source.setState(5);
            chai.assert.strictEqual(count, 4);

            subscription.unsubscribe();
        });
    });
});

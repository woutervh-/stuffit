import * as chai from 'chai';
import * as sinon from 'sinon';
import { ThrottleStore } from '../../src/operators/throttle';
import { PushStore } from '../../src/push-store';
import { counterSubscriber } from '../counter-subscriber';

describe('ThrottleStore', () => {
    let clock: sinon.SinonFakeTimers;
    let source: PushStore<number>;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        source = new PushStore(0);
    });

    afterEach(() => {
        clock.restore();
    });

    describe('#subscribe', () => {
        it('Will notify subscribers of state changes at most once per configured timeout.', () => {
            const store = new ThrottleStore(source, 100);
            const subscription = store.compose(counterSubscriber);

            source.setState(1);
            chai.assert.strictEqual(subscription.count, 1);
            source.setState(2);
            chai.assert.strictEqual(subscription.count, 1);
            source.setState(3);
            chai.assert.strictEqual(subscription.count, 1);

            clock.tick(150);

            chai.assert.strictEqual(subscription.count, 2);
            source.setState(4);
            chai.assert.strictEqual(subscription.count, 2);

            clock.tick(150);

            chai.assert.strictEqual(subscription.count, 3);

            clock.tick(150);

            chai.assert.strictEqual(subscription.count, 3);
            source.setState(5);
            chai.assert.strictEqual(subscription.count, 4);

            subscription.unsubscribe();
        });
    });
});

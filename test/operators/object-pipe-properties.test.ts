import * as chai from 'chai';
import { Dependency } from '../../src/dependency';
import { ObjectPipePropertiesStore } from '../../src/operators/object-pipe-properties';
import { PushStore } from '../../src/push-store';
import { Store } from '../../src/store';
import { counterSubscriber } from '../counter-subscriber';

const negative = (source: Store<number>): Store<number> => {
    return new class extends Store<number> {
        private dependency: Dependency<number>;

        public constructor(source: Store<number>) {
            super(-source.state);
            this.dependency = new Dependency(source, this.handleNext);
        }

        protected preStart() {
            this.dependency.update();
        }

        protected start() {
            this.dependency.start();
        }

        protected stop() {
            this.dependency.stop();
        }

        private handleNext = (state: number) => this.setInnerState(-state);
    }(source);
};

describe('ObjectPipePropertiesStore', () => {
    let source: PushStore<{ zero: number, one: number, two: number }>;

    beforeEach(() => {
        source = new PushStore<(typeof source)['state']>({
            zero: 0,
            one: 1,
            two: 2
        });
    });

    describe('#state', () => {
        it('Initially starts with a transformed version of the initial state.', () => {
            const store = ObjectPipePropertiesStore.fromSourceAndTransform<keyof (typeof source)['state'], (typeof source)['state'], (typeof source)['state']>(source, negative);
            chai.assert.deepStrictEqual(store.state, { zero: -0, one: -1, two: -2 });
        });

        it('Updates its state after the source changes.', () => {
            const store = ObjectPipePropertiesStore.fromSourceAndTransform<keyof (typeof source)['state'], (typeof source)['state'], (typeof source)['state']>(source, negative);
            const subscription = store.subscribe();

            source.setState({ zero: 3, one: 1, two: 2 });
            chai.assert.deepStrictEqual(store.state, { zero: -3, one: -1, two: -2 });
            source.setState({ zero: 3, one: 4, two: 2 });
            chai.assert.deepStrictEqual(store.state, { zero: -3, one: -4, two: -2 });
            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.deepStrictEqual(store.state, { zero: -3, one: -4, two: -5 });
            source.setState({ zero: 0, one: 1, two: 2 });
            chai.assert.deepStrictEqual(store.state, { zero: -0, one: -1, two: -2 });

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Does not update when no value has changed in the source object.', () => {
            const store = ObjectPipePropertiesStore.fromSourceAndTransform<keyof (typeof source)['state'], (typeof source)['state'], (typeof source)['state']>(source, negative);
            const subscription = store.compose(counterSubscriber);

            chai.assert.strictEqual(subscription.count, 0);
            source.setState({ zero: 0, one: 1, two: 2 });
            chai.assert.strictEqual(subscription.count, 0);

            subscription.unsubscribe();
        });

        it('Updates to the most current state when it is started.', () => {
            const store = ObjectPipePropertiesStore.fromSourceAndTransform<keyof (typeof source)['state'], (typeof source)['state'], (typeof source)['state']>(source, negative);

            chai.assert.deepStrictEqual(store.state, { zero: -0, one: -1, two: -2 });
            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.deepStrictEqual(store.state, { zero: -0, one: -1, two: -2 });

            const subscription = store.subscribe();
            chai.assert.deepStrictEqual(store.state, { zero: -3, one: -4, two: -5 });

            subscription.unsubscribe();
        });

        it('Does not require additional subscriber notifications when updating its state after starting.', () => {
            const store = ObjectPipePropertiesStore.fromSourceAndTransform<keyof (typeof source)['state'], (typeof source)['state'], (typeof source)['state']>(source, negative);

            chai.assert.deepStrictEqual(store.state, { zero: -0, one: -1, two: -2 });
            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.deepStrictEqual(store.state, { zero: -0, one: -1, two: -2 });

            const subscription = store.compose(counterSubscriber);
            chai.assert.deepStrictEqual(store.state, { zero: -3, one: -4, two: -5 });
            chai.assert.strictEqual(subscription.count, 0);

            subscription.unsubscribe();
        });
    });
});

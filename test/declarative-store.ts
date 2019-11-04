import { Store } from '../src/store';

export const declareStore = <T>(options: { initialState: T, preStart: () => void, start: (setState: (state: T) => void) => void, stop: () => void }) => {
    return new class extends Store<T> {
        public constructor() {
            super(options.initialState);
        }

        protected preStart() {
            options.preStart();
        }

        protected start() {
            options.start(this.setState);
        }

        protected stop() {
            options.stop();
        }

        private setState = (state: T) => {
            this.setInnerState(state);
        }
    }();
};

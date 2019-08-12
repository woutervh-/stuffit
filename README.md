!! Documentation work in progress !!

# Description

Observable stores with a set of operators and producers.
The stores behave like **hot** observables.
They can be eager or lazy.

## Synopsis

*Example using the stores as observables*

```typescript
import * as Stuffit from 'stuffit';

const jsonData$ = Stuffit.Producers
    .fromInterval(5000)
    .pipe(Stuffit.Operators.map(async () => {
        const response = await fetch('http://example.org/file.json');
        const data = await response.json();
        return data;
    }))
    .pipe(Stuffit.Operators.map(Stuffit.Producers.fromPromise))
    .pipe(Stuffit.Operators.flatten);

const subscription = jsonData$.subscribe(console.log);

// Later, clean up the subscription...
subscription.unsubscribe();
```

*Example using the stores as state containers*

```typescript
import * as Stuffit from 'stuffit';

// Initialize with 0.
const counterStore = new Stuffit.PushStore(0);
// Increment the state. Side note: the observable part of the store will emit a new event.
counterStore.setState(counterStore.state + 1);
console.log(counterStore.state); // "1" is logged.
```

*Example creating your own store*

```typescript
import * as Stuffit from 'stuffit';

class CounterStore extends Stuffit.PushStore<number> {
    public constructor() {
        super(0);
    }

    public increment() {
        this.setState(this.state + 1);
    }

    public decrement() {
        this.setState(this.state - 1);
    }

    public reset() {
        this.setState(0);
    }
}

const counterStore = new CounterStore();
const subscription = counterStore.subscribe(console.log);
counterStore.increment(); // "1" is logged.
counterStore.increment(); // "2" is logged.
counterStore.reset(); // "0" is logged.
```

# Classes

* [Store](src/store.ts)
* [PushStore](src/push-store.ts)
* [Sink](src/sink.ts)

# Operators

* [combine](src/operators/README.md#combine)
* [distinct](src/operators/README.md#distinct)
* [flatten](src/operators/README.md#flatten)
* [history](src/operators/README.md#history)
* [map](src/operators/README.md#map)
* [pick](src/operators/README.md#pick)
* [pluck](src/operators/README.md#pluck)
* [throttle](src/operators/README.md#throttle)

# Producers

* [fromInterval](src/producers/README.md)
* [fromPromise](src/producers/README.md)
* [fromValue](src/producers/README.md)

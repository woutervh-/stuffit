!! Documentation work in progress !!

# Description

Observable state stores with a set of operators and producers.
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

# Documentation

In the world of stores we can think of data flowing to and from three different kind of objects:

- [Producers](docs/producers.md): they create data and consume none.
- [Sinks](docs/sinks.md): they consume data but do not produce any.
- [Operators](docs/operators.md): they take data from one or more source stores and transform it into new data. In a sense they're both a producer and a sink.

## Classes

* [Store](docs/store.md)
* [PushStore](docs/push-store.md)
* [Sink](docs/sinks.md#Sink)

## Operators

* [combine](docs/operators.md#combine)
* [distinct](docs/operators.md#distinct) (aliases: skip)
* [flatten](docs/operators.md#flatten)
* [history](docs/operators.md#history)
* [map](docs/operators.md#map)
* [pick](docs/operators.md#pick)
* [pluck](docs/operators.md#pluck)
* [throttle](docs/operators.md#throttle)

## Producers

* [fromInterval](docs/producers.md#fromInterval)
* [fromPromise](docs/producers.md#fromPromise)
* [fromValue](docs/producers.md#fromValue)

## Sinks

* [simple](docs/sinks.md#simple)

# Usage with other libraries

Stuffit can be used to save the state of your application and it is agnostic of the frameworks you use.
In principle you have the responsibility to connect the stores to your application. To make things easy however you can use some existing "plugins" to do the work for you:

- For connecting to React: https://www.npmjs.com/package/stuffit-react

# Class: Store

*Source: [src/store.ts](../src/store.ts)*

Store is a class representing a container for application state.
It always has some state which can be retrieved at any time.
Additionally it allows listeners to register for state change notifications.

```typescript
abstract class Store<T>;
```

## constructor

Store is always constructed with some initial state.

```typescript
public constructor(initialState: T);
```

## state

The current state can always be retrieved at any time using the state getter.

```typescript
public get state(): T;
```

## subscribe

You can register listeners that will be called when the state changes.
In order to avoid memory leaks and to stop stores which use resources while they are active, you should unsubscribe from the store when you no longer need it using the returned [Subscription](subscription.md).

```typescript
public subscribe(listener: (value: T) => void): Subscription;
```

## pipe

You may want to do something with the values of the store whenever they become available.
You can subscribe to the store as described above and act upon them however you want.
Often you may want to set the state of one store as a result of the values coming from another store.
For the most common of such operations there are classes that help with performing these patterns.
They are called [Operators](operators.md) because they operate on one or more operand stores.
For your convenience, these classes also have higher-order functions that will accept some parameters and a source (operand) store.
For even more convenience, the `pipe` method exists for unary operators, which allows for elegant chaining syntax.

```typescript
public pipe<U>(transform: (source: this) => Store<U>): Store<U>;
```

## compose

Sometimes you may want to transform the store into something completely different.
For your convenience, there is a `compose` method that lets you do this.
Again, this allows for elegant chaining syntax.

```typescript
public compose<U>(transform: (source: this) => U): U;
```

## setInnerState

ℹ️ *protected method - only relevant to implementers of a `Store` class.*

A class which extends the Store class can decide to change the state of the Store at any moment.
This can be done using the `setInnerState` method.
This will trigger all subscriptions to be called with the newly set state.

```typescript
protected setInnerState(state: T);
```

## start

ℹ️ *protected method - only relevant to implementers of a `Store` class.*

A store starts with 0 subscribers in a deactivated state.
When the number of subscriptions goes up from 0 to 1, the store will enter the activated state.
The abstract method `start` will be called when this happens, so the implementing class can choose to open resources only when it is needed.
It is up to the implementer whether to open resources and change the store's state only when the store is activated or not.
A store which opens resources and/or emits new state values even when it is deactivated is called **eager** and a store which only does this in the activated state is called **lazy**.

```typescript
protected abstract start(): void;
```

## stop

ℹ️ *protected method - only relevant to implementers of the `Store` class.*

A store with 1 or more subscribers is in an activated state.
When the number of subscriptions goes from 1 to 0, the store will enter the deactivated state.
The abstract method `stop` will be called when this happens, so the implementing class can close resources if they are no longer needed.

```typescript
protected abstract stop(): void;
```

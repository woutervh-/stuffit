# Sink

*Source: [src/sink.ts](../src/sink.ts)*

Sink is a class that can be helpful in some situations.
A sink must be started and stopped manually.
When it is started, it will take action whenever the source store emits a state change.
Additionally, whenever it is started, it will also take action.
The action mentioned here depends on the implementation of a specific sink.

## constructor

A sink always needs some source store.

```typescript
public constructor(source: Store<T>);
```

## start

A sink must be started in order for it to take action.
Starting a sink will cause the action to be taken with the current state of the source store.
Afterwards, whenever the source store emits state changes, the action will be taken again.

```typescript
public start();
```

## stop

After a sink has been started, it can be stopped.
This will stop the action from being taken, until restarted.

```typescript
public stop();
```

## hasStarted

Indicates whether the sink is in active mode or not (i.e. if the last call to `start` was after the last call to `stop`).

```typescript
public hasStarted(): boolean;
```

## handleNext

ℹ️ *protected method - only relevant to implementers of the `Sink` class.*

This is the action taken by the sink.
It will be called when the sink is started.
Afterwards, it will also be called when the source store emits state changes.
When the sink is stopped, this method will no longer be called.
The arugment passed to this method will always be the current state of the source store.

```typescript
protected abstract handleNext(value: T): void;
```

# Sinks

The implementations of the `Sink` class are listed here.

## simple

A simple `Sink` which will just invoke a callback whenever the sink takes action.

```typescript
public constructor(source: Store<T>, listener: (value: T) => void);
```

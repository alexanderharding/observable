# @observable/core

A lightweight, [RxJS](https://rxjs.dev/)-inspired implementation of the
[Observer pattern](https://refactoring.guru/design-patterns/observer) in JavaScript. Features
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)'s with
[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)-based
[`unsubscription`](https://jsr.io/@observable/core/doc/~/Observer.signal), supporting both
synchronous and asynchronous [producers](#producer).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { Observable } from "@observable/core";

const observable = new Observable<0>((observer) => {
  // Create a timeout as our producer to next a successful execution code (0) after 1 second.
  const producer = setTimeout(() => {
    // A value has been produced, notify next.
    observer.next(0);
    // The producer is done, notify return.
    observer.return();
  }, 1_000);
  // Add an abort listener to handle unsubscription by canceling the producer.
  observer.signal.addEventListener("abort", () => clearTimeout(producer), {
    once: true,
  });
});
```

# Glossary And Semantics

When discussing and documenting [`Observable`](https://jsr.io/@observable/core/~/Observable)s, it's
important to have a common language and a known set of rules around what is going on. This document
is an attempt to standardize these things so we can try to control the language in our docs, and
hopefully other publications about this library, so we can discuss reactive programming with this
library on consistent terms.

While not all of the documentation for this library reflects this terminology, it's a goal to ensure
it does, and to ensure the language and names around the library use this document as a source of
truth and unified language.

## Major Entities

There are high level entities that are frequently discussed. It's important to define them
separately from other lower-level concepts, because they relate to the nature of
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

### Consumer

Any system or thing that is being notified of [producer](#producer) [notifications](#notification).

### Producer

Any system or thing that is the source of values that are being pushed to the [consumer](#consumer).
This can be a wide variety of things, from a
[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
to a simple iteration over an
[`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

### Subscription

A contract where a [consumer](#consumer) is [observing](#observation) values pushed by a
[producer](#producer).

## Major Actions

There are specific actions and events that occur between [major entities](#major-entities) in the
library that need to be defined. These are the highest level events that occur within various parts
of the library.

### Observation

A [consumer](#consumer) reacting to [producer](#producer) [notifications](#notification).

### Observation Chain

When an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) uses another
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) as a [producer](#producer), an
"observation chain" is set up. That is a chain of [observation](#observation) such that multiple
[observers](#observation) are notifying each other in a unidirectional way toward the final
[consumer](#consumer).

### Notification

The act of a [producer](#producer) pushing
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values,
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n values, or
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s to a [consumer](#consumer) to be
[observed](#observation).

## Major Concepts

Some of what we discuss is conceptual. These are mostly common traits of behaviors that can manifest
in [push-based](#push) reactive systems.

### Cold

An [`Observable`](https://jsr.io/@observable/core/~/Observable) is "cold" when it creates a new
[producer](#producer) during [`subscribe`](https://jsr.io/@observable/core/~/Observable.subscribe)
for every new [subscription](#subscription). As a result, "cold"
[`Observable`](https://jsr.io/@observable/core/~/Observable)s are _always_ [unicast](#unicast),
being one [producer](#producer) [observed](#observation) by one [consumer](#consumer). Cold
[`Observable`](https://jsr.io/@observable/core/~/Observable)s can be made [hot](#hot) but not the
other way around.

### Hot

An [`Observable`](https://jsr.io/@observable/core/~/Observable) is "hot", when its
[producer](#producer) was created outside of the context of the
[`subscribe`](https://jsr.io/@observable/core/~/Observable.subscribe) action. This means that the
"hot" [`Observable`](https://jsr.io/@observable/core/~/Observable) is almost always
[multicast](#multicast). It is possible that a "hot"
[`Observable`](https://jsr.io/@observable/core/~/Observable) is still _technically_
[unicast](#unicast), if it is engineered to only allow one [subscription](#subscription) at a time,
however, there is no straightforward mechanism for this in the library, and the scenario is an
unlikely one. For the purposes of discussion, all "hot"
[`Observable`](https://jsr.io/@observable/core/~/Observable)s can be assumed to be
[multicast](#multicast). Hot [`Observable`](https://jsr.io/@observable/core/~/Observable)s cannot be
made [cold](#cold).

### Multicast

The act of one [producer](#producer) being [observed](#observation) by **many**
[consumers](#consumer).

### Unicast

The act of one [producer](#producer) being [observed](#observation) by **only one**
[consumer](#consumer).

### Push

[`Observer`](https://jsr.io/@observable/core/doc/~/Observer)s are a push-based type. That means
rather than having the [consumer](#consumer) call a function or perform some other action to get a
value, the [consumer](#consumer) receives values as soon as the [producer](#producer) has produced
them, via a registered [next](https://jsr.io/@observable/core/doc/~/Observer.next) handler.

### Pull

Pull-based systems are the opposite of [push](#push)-based. In a pull-based type or system, the
[consumer](#consumer) must request each value the [producer](#producer) has produced manually,
perhaps long after the [producer](#producer) has actually done so. Examples of such systems are
[`Functions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
and
[`Iterators`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

## Minor Entities

There are low level entities that are rarely discussed.

### Operator

A factory function that creates an [operator function](#operator-function).

### Operator Function

A function that takes an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable), and maps
it to a new [`Observable`](https://jsr.io/@observable/core/doc/~/Observable). Nothing more, nothing
less. [Operator functions](#operator-function) are created by [operators](#operator).

### Operation

An action taken while handling a [notification](#notification), as set up by an
[operator](#operator) and/or [operator function](#operator-function). During
[subscription](#subscription) to that
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable), [operations](#operation) are
performed in an order dictated by the [observation chain](#observation-chain).

### Stream

A "stream" or "streaming" in the case of
[`observables`](https://jsr.io/@observable/core/doc/~/Observable), refers to the collection of
[operations](#operation), as they are processed during a [subscription](#subscription). This is not
to be confused with node Streams, and the word "stream", on its own, should be used sparingly in
documentation and articles. Instead, prefer [observation chain](#observation-chain),
[operations](#operation), or [subscription](#subscription). "Streaming" is less ambiguous, and is
fine to use given this defined meaning.

### Source

An [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that will supply values to
another [`Observable`](https://jsr.io/@observable/core/doc/~/Observable). This [source](#source),
will be the [producer](#producer) for the resulting
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and all of its
[subscriptions](#subscriptions). Sources may generally be any type of
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

### Notifier

An [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that is being used to notify
another [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that it needs to perform
some action. The action should only occur on a
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next) and _never_ on
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return) or
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw).

## Other Concepts

### Unhandled Errors

An "unhandled error" is any [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n value
that is not handled by a [consumer](#consumer)-provided function, which is generally provided during
the [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) action by constructing
a new [`Observer`](https://jsr.io/@observable/core/doc/~/Observer). If no
[`throw handler`](https://jsr.io/@observable/core/doc/~/Observer.throw) was provided, this library
will assume the error is "unhandled" and rethrow it on a new callstack to prevent
["producer interference"](#producer-interference).

### Producer Interference

[Producer](#producer) interference happens when an error is allowed to unwind the library's
callstack during [notification](#notification). When this happens, the error could break things like
for-loops in [upstream](#upstream-and-downstream) [sources](#source) that are notifying
[consumers](#consumer) during a [multicast](#multicast). That would cause the other
[consumers](#consumer) in that [multicast](#multicast) to suddenly stop receiving values without
logical explanation. The library goes out of its way to prevent
["producer interference"](#producer-interference) by ensuring that all unhandled errors are thrown
on a separate callstack.

### Upstream And Downstream

The order in which [notifications](#notification) are processed by [operations](#operation) in a
[stream](#stream) have a directionality to them. "Upstream" refers to an [operations](#operation)
that was already processed before the current [operations](#operation) , and "downstream" refers to
an [operations](#operation) that will be processed after the current [operations](#operation).

## Differences From [RxJS](https://rxjs.dev/)

While inspired by [RxJS](https://rxjs.dev/), this library takes a different approach in several key
areas. These differences are driven by a **simplicity-first** design philosophy that prioritizes
correctness, maintainability, and ease of understanding.

### Simplicity First

This library is designed to be minimal and focused. Rather than providing an exhaustive set of
operators and features, it aims to provide a solid foundation with correct semantics. The API
surface is intentionally small, making it easier to learn, debug, and reason about.

### Composition Over Inheritance

[RxJS](https://rxjs.dev/) relies heavily on class inheritance for its internal implementation. This
library instead favors **composition**.

This design choice has a significant benefit for users who want to create custom implementations. In
[RxJS](https://rxjs.dev/), attempting to create a custom `Observable` or `Subject` using the
`implements` keyword is painful because [RxJS](https://rxjs.dev/) classes expose their entire
implementation—including internal and private properties—as part of the class definition. This means
your custom implementation must somehow satisfy or work around these internal details.

This library solves this problem by separating the **public interface** from the **class
implementation** using three components:

1. An **interface** (or type) that exposes _only_ the public API
2. A **constructor interface** that types the class and abstracts away private members
3. A **class expression** that contains all the private implementation details

For example, the `Observable` interface only requires a single `subscribe` method:

```ts
interface Observable<Value = unknown> {
  subscribe(observer: Observer<Value>): void;
}
```

The constructor interface
([`ObservableConstructor`](https://jsr.io/@observable/core/doc/~/ObservableConstructor)) defines the
`new` signature and `prototype`, ensuring the class is typed to only expose the public `Observable`
interface:

```ts
interface ObservableConstructor {
  new <Value>(subscribe: (observer: Observer<Value>) => void): Observable<Value>;
  readonly prototype: Observable;
}
```

The actual class expression with its private `#subscribe` field is then assigned to this constructor
type, effectively obfuscating the private members from the public API:

```ts
const Observable: ObservableConstructor = class {
  readonly #subscribe: (observer: Observer) => void;
  // ... implementation details hidden from consumers
};
```

This means you can easily create your own custom observable by implementing just the public
interface:

```ts
import type { Observable, Observer } from "@observable/core";

class MyCustomObservable<T> implements Observable<T> {
  subscribe(observer: Observer<T>): void {
    // Your custom implementation here
  }
}
```

The same pattern applies to all classes in this library. You only need to implement the public
contract, not internal implementation details.

### Correct Teardown Ordering

One of the most significant differences is how this library handles the ordering of teardown
([`unsubscription`](https://jsr.io/@observable/core/doc/~/Observer.signal)) relative to terminal
[notifications](#notification) ([`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) and
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)).

In [RxJS](https://rxjs.dev/), the historical behavior has been to notify the [consumer](#consumer)
of completion or error _before_
[unsubscribing](https://jsr.io/@observable/core/doc/~/Observer.signal) from the [source](#source).
This ordering can cause reentrancy bugs where a [source](#source) synchronously emits back into
itself before cleanup occurs. This is a
[known issue in RxJS](https://github.com/ReactiveX/rxjs/issues/7443) that has persisted for nearly a
decade.

This library takes the correct approach: **teardown always occurs before terminal notifications**.
When [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) or
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) is called, the
[`Observer`](https://jsr.io/@observable/core/doc/~/Observer) first aborts via its
[`signal`](https://jsr.io/@observable/core/doc/~/Observer.signal), and _then_ notifies the
[consumer](#consumer).

This ordering aligns with how JavaScript's other constructs behave:

**Iterables finalize before the consumer knows iteration is complete:**

```ts
function* iterable() {
  try {
    yield 1;
  } finally {
    console.log("finalized");
  }
}

for (const value of iterable()) {
  console.log(value);
}
console.log("consumer knows iteration is complete");

// Logs:
// 1
// finalized
// consumer knows iteration is complete
```

**Promises finalize before resolving:**

```ts
Promise.resolve(1)
  .finally(() => console.log("finalized"))
  .then(console.log);

// Logs:
// finalized
// 1
```

By following this principle, this library avoids an entire class of reentrancy bugs that can occur
in [RxJS](https://rxjs.dev/), making [observation chains](#observation-chain) more predictable and
correct.

### Native AbortController Integration

Rather than inventing a custom `Subscription` type, this library uses the web-native
[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) and
[`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) APIs for
[`unsubscription`](https://jsr.io/@observable/core/doc/~/Observer.signal). This makes it trivial to
integrate with other APIs that support abort signals (like
[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)) and reduces the learning curve
for developers already familiar with these web standards.

This approach also solves the
["synchronous firehose" problem](https://github.com/ReactiveX/rxjs/discussions/6345) that plagues
[RxJS](https://rxjs.dev/). In [RxJS](https://rxjs.dev/), when a synchronous [producer](#producer)
emits many values rapidly (a "firehose"), there's no reliable way for the [consumer](#consumer) to
[unsubscribe](https://jsr.io/@observable/core/doc/~/Observer.signal) mid-stream.

With an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)-based
system, the [consumer](#consumer) creates the controller _before_
[subscribeing](https://jsr.io/@observable/core/doc/~/Observable.subscribe) and passes its
[`signal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to the
[`Observer`](https://jsr.io/@observable/core/doc/~/Observer). This means the [consumer](#consumer)
already has a reference to abort at any time—even during synchronous emissions:

```ts
const controller = new AbortController();

firehose.subscribe({
  signal: controller.signal,
  next: (value) => {
    if (value >= 3) controller.abort(); // Unsubscribe mid-stream
  },
});
```

The [producer](#producer) can check `observer.signal.aborted` on each iteration to respect
unsubscription:

```ts
const firehose = new Observable<number>((observer) => {
  let n = 0;
  while (!observer.signal.aborted && n < 1_000_000) {
    observer.next(n++);
  }
});
```

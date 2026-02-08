# [@observable/core](https://jsr.io/@observable/core)

A lightweight, [RxJS](https://rxjs.dev/)-inspired implementation of the
[Observer pattern](https://refactoring.guru/design-patterns/observer) in JavaScript. Features
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s with
[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)-based
[unsubscription](https://jsr.io/@observable/core/doc/~/Observer.signal), supporting both synchronous
and asynchronous [producers](#producer).

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
  // Add an abort listener to cancel the producer.
  observer.signal.addEventListener("abort", () => clearTimeout(producer), {
    once: true,
  });
});
```

# Glossary And Semantics

When discussing and documenting [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s,
it's important to have a common language and a known set of rules around what is going on. This
document is an attempt to standardize these things so we can try to control the language in our
docs, and hopefully other publications about this library, so we can discuss reactive programming
with this library on consistent terms.

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
[`Observer`](https://jsr.io/@observable/core/doc/~/Observer)s are notifying each other in a
unidirectional way toward the final [consumer](#consumer).

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

An [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) is "cold" when it creates a new
[producer](#producer) during
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) for every new
[consumer](#consumer). As a result, "cold"
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s are _always_ [unicast](#unicast),
being one [producer](#producer) [observed](#observation) by one [consumer](#consumer). Cold
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s can be made [hot](#hot) but not
the other way around.

### Hot

An [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) is "hot", when its
[producer](#producer) was created outside of the context of the
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe). This means that the "hot"
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) is almost always
[multicast](#multicast). It is possible that a "hot"
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) is still _technically_
[unicast](#unicast), if it is engineered to only allow one [consumer](#consumer) at a time, however,
there is no straightforward mechanism for this in the library, and the scenario is an unlikely one.
For the purposes of discussion, all "hot"
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s can be assumed to be
[multicast](#multicast). Hot [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s
cannot be made [cold](#cold).

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
[observation](#observation) of that
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable), [operations](#operation) are
performed in an order dictated by the [observation chain](#observation-chain).

### Stream

A "stream" or "streaming" in the case of
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s, refers to the collection of
[operations](#operation), as they are processed during [observation](#observation). This is not to
be confused with node Streams, and the word "stream", on its own, should be used sparingly in
documentation and articles. Instead, prefer [observation chain](#observation-chain),
[operations](#operation), or [consumer](#consumer). "Streaming" is less ambiguous, and is fine to
use given this defined meaning.

### Source

An [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that will supply values to
another [`Observable`](https://jsr.io/@observable/core/doc/~/Observable). This [source](#source),
will be the [producer](#producer) for the resulting
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and all of its
[consumers](#consumer). Sources may generally be any type of
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

An "unhandled error" is any
[`throw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw)n value
that is not handled by a [consumer](#consumer)-provided function, which is generally provided during
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) by constructing a new
[`Observer`](https://jsr.io/@observable/core/doc/~/Observer). If no
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

# Differences From [RxJS](https://rxjs.dev/)

While inspired by [RxJS](https://rxjs.dev/), this library takes a different approach in several key
areas that are worth discussing here.

## Simplicity First

This library is designed to be minimal and focused. Rather than providing an exhaustive set of
features, it aims to provide a solid foundation with correct and predictable semantics. The API
surface is intentionally small, making it easier to learn, debug, and reason about.

## Composition Over Inheritance

[RxJS](https://rxjs.dev/) relies heavily on class inheritance. At a glance this is fine, especially
within the bounds of the [RxJS](https://rxjs.dev/) library, but once you want to create your own
custom implementations it falls apart. This is because implementing classes requires you to
implement the _entire_ interface, including internal and private members. This library goes out of
its way to use composition to provide a simple interface and hide internal and private members so
that you can create custom implementations without headache.

### Example

```ts
import { Observable, type Observer, Subject } from "@observable/core";

type Customer = Readonly<Record<"email" | "name", string>>;

// No errors! It's that easy
class CustomerService implements Observable<Customer> {
  readonly #customer = new Observable<Customer>(async (observer) => {
    try {
      const response = await fetch("https://www.example.com/api/customer", {
        signal: observer.signal,
      });
      observer.next(await response.json());
      observer.return();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // The consumer has likely unsubscribed which should not be treated
        // as an error in Observables. Though we probably don't need to,
        // we'll return the observer just in-case the AbortError was not a
        // result of unsubscription.
        observer.return();
      } else observer.throw(error);
    }
  });

  subscribe(observer: Observer<Customer>): void {
    this.#customer.subscribe(observer);
  }
}
```

## Correct Teardown Ordering

This is a [known issue in RxJS](https://github.com/ReactiveX/rxjs/issues/7443) that has persisted
for nearly a decade. This library fixes this problem by reversing the ordering of teardown
([unsubscription](https://jsr.io/@observable/core/doc/~/Observer.signal)) relative to terminal
[notifications](#notification) ([`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) and
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)).

## Native AbortController Integration

With the wide support of
[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) since 2019,
there's no longer the need for a custom `Subscription` implementation. This makes it trivial to
integrate with other APIs that support abort signals (like
[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)) while also solving the
["synchronous firehose" problem](https://github.com/ReactiveX/rxjs/discussions/6345).

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/core, a lightweight RxJS-inspired Observable library that is FUNDAMENTALLY DIFFERENT from RxJS.

CRITICAL DIFFERENCES FROM RxJS:
1. Observer methods: `next`, `return`, `throw` — NOT `next`, `complete`, `error`
2. Unsubscription: Use `AbortController`/`AbortSignal` — NOT `Subscription.unsubscribe()`
3. `subscribe()` returns `void` — NOT a Subscription object
4. Teardown: Use `observer.signal.addEventListener("abort", cleanup)` — NOT return a teardown function
5. Operators: Standalone curried functions with `pipe()` — NOT methods on Observable
6. Teardown ordering: Abort happens BEFORE terminal notification handlers run (fixes RxJS bug)

OBSERVER INTERFACE:
```ts
interface Observer<Value> {
  readonly signal: AbortSignal;
  next(value: Value): void;
  return(): void;      // Called when producer finishes successfully
  throw(value: unknown): void;  // Called when producer errors
}
```

OBSERVATION PATTERN:
```ts
const controller = new AbortController();
observable.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
// To abort:
controller.abort();
```

CREATING OBSERVABLES:
```ts
new Observable<T>((observer) => {
  // Setup producer
  const cleanup = () => { /* cleanup logic */ };
  
  observer.signal.addEventListener("abort", cleanup, { once: true });
  
  // Emit values
  observer.next(value);
  
  // Finish successfully
  observer.return();
  // OR throw error
  observer.throw(error);
});
```

COMMON MISTAKES TO AVOID:
- Using `complete()` instead of `return()`
- Using `error()` instead of `throw()`
- Returning a teardown function from Observable constructor
- Expecting `subscribe()` to return a Subscription
- Using `subscription.unsubscribe()` instead of `controller.abort()`
````

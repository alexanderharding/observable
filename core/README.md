# @xan/observable-core

A lightweight, [RxJS](https://rxjs.dev/)-inspired library implementing the
[Observer pattern](https://refactoring.guru/design-patterns/observer) in JavaScript. Features
[`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable)'s with
[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)-based
[`unsubscription`]((https://jsr.io/@xan/observable-core/doc/~/Observer.signal)), supporting both
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
import { Observable } from "@xan/observable-core";

const observable = new Observable<0>((observer) => {
  // Note that this logic is invoked for every new subscribe action.

  // If the observer is already aborted, there's no work to do.
  if (observer.signal.aborted) return;

  // Create a timeout as our producer to next a value after 1 second.
  const producer = setTimeout(() => {
    // Next the value to the observer.
    observer.next(0);
    // The producer is done, notify complete.
    observer.complete();
  }, 1000);

  // Add an abort listener to handle unsubscription by canceling the producer.
  observer.signal.addEventListener("abort", () => clearTimeout(producer), {
    once: true,
  });
});
```

# Glossary And Semantics

When discussing and documenting observables, it's important to have a common language and a known
set of rules around what is going on. This document is an attempt to standardize these things so we
can try to control the language in our docs, and hopefully other publications about this library, so
we can discuss reactive programming with this library on consistent terms.

While not all of the documentation for this library reflects this terminology, it's a goal of the
team to ensure it does, and to ensure the language and names around the library use this document as
a source of truth and unified language.

## Major Entities

There are high level entities that are frequently discussed.

### Consumer

Any system or thing that is being notified of [producer](#producer) notifications.

### Producer

Any system or thing that is the source of values that are being pushed to the [consumer](#consumer).
This can be a wide variety of things, from a `Promise` to a simple iteration over an `Array`.

### Subscription

A contract where a [consumer](#consumer) is [`observing`](#observation) values pushed by a
[producer](#producer).

## Major Actions

There are specific actions and events that occur between major entities in the library that need to
be defined. These major actions are the highest level events that occur within various parts of the
library.

### Observation

A [consumer](#consumer) reacting to [producer](#producer) notifications.

### Observation Chain

When an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) uses another
[`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) as a [producer](#producer), an
"observation chain" is set up. That is a chain of [observation](#observation) such that multiple
[observers](#observation) are notifying each other in a unidirectional way toward the final
[consumer](#consumer).

### Notification

The act of a [producer](#producer) pushing
[`nexted`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) values,
[`thrown`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw) values, or
[`returns`](https://jsr.io/@xan/observable-core/doc/~/Observer.return) to a [consumer](#consumer) to
be [`observed`]((#observation)).

## Major Concepts

Some of what we discuss is conceptual. These are mostly common traits of behaviors that can manifest
in push-based reactive systems.

### Cold

An observable is "cold" when it creates a new [producer](#producer) during
[`subscribe`](https://jsr.io/@xan/observable-core/~/Observable.subscribe) for every new
[subscription](#subscription). As a result, "cold"
[observables](https://jsr.io/@xan/observable-core/~/Observable) are _always_ [unicast](#unicast),
being one [producer](#producer) [observed](#observation) by one [consumer](#consumer). Cold
[observables](https://jsr.io/@xan/observable-core/~/Observable) can be made [hot](#hot) but not the
other way around.

### Hot

An observable is "hot", when its [producer](#producer) was created outside of the context of the
[`subscribe`](https://jsr.io/@xan/observable-core/~/Observable.subscribe) action. This means that
the "hot" observable is almost always [multicast](#multicast). It is possible that a "hot"
observable is still _technically_ [unicast](#unicast), if it is engineered to only allow one
[subscription](#subscription) at a time, however, there is no straightforward mechanism for this in
the library, and the scenario is an unlikely one. For the purposes of discussion, all "hot"
[observables](https://jsr.io/@xan/observable-core/~/Observable) can be assumed to be
[multicast](#multicast). Hot [observables](https://jsr.io/@xan/observable-core/~/Observable) cannot
be made [cold](#cold).

### Multicast

The act of one [producer](#producer) being [observed](#observation) by **many**
[consumers](#consumer).

### Unicast

The act of one [producer](#producer) being [observed](#observation) by **only one**
[consumer](#consumer).

### Push

[Observers](https://jsr.io/@xan/observable-core/doc/~/Observer) are a push-based type. That means
rather than having the [consumer](#consumer) call a function or perform some other action to get a
value, the [consumer](#consumer) receives values as soon as the [producer](#producer) has produced
them, via a registered [next](https://jsr.io/@xan/observable-core/doc/~/Observer.next) handler.

### Pull

Pull-based systems are the opposite of [push](#push)-based. In a pull-based type or system, the
[consumer](#consumer) must request each value the [producer](#producer) has produced manually,
perhaps long after the [producer](#producer) has actually done so. Examples of such systems are
[`Functions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
and
[`Iterators`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

## Minor Entities

### Source

An [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that will supply values to
another [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable). This
[source](#source), will be the [producer](#producer) for the resulting
[`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) and all of its
[subscriptions](#subscriptions). Sources may generally be any type of
[`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable).

### Notifier

An [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that is being used to notify
another [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that it needs to
perform some action. The action should only occur on a
[`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) and _never_ on
[`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return) or
[`throw`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw).

## Other Concepts

### Unhandled Errors

An "unhandled error" is any [`thrown`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw)
value that is not handled by a [consumer](#consumer)-provided function, which is generally provided
during the [`subscribe`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe) action by
constructing a new [`Observer`](https://jsr.io/@xan/observable-core/doc/~/Observer). If no
[`throw handler`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw) was provided, this
library will assume the error is "unhandled" and rethrow it on a new callstack to prevent
["producer interference"](#producer-interference).

### Producer Interference

[Producer](#producer) interference happens when an error is allowed to unwind the library's
callstack during [notification](#notification). When this happens, the error could break things like
for-loops in [upstream](#upstream-and-downstream) [sources](#source) that are notifying
[consumers](#consumer) during a [multicast](#multicast). That would cause the other
[consumers](#consumer) in that [multicast](#multicast) to suddenly stop receiving values without
logical explanation. The library goes out of its way to prevent producer interference by ensuring
that all unhandled errors are thrown on a separate callstack.

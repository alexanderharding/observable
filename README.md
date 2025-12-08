# @xan/observable

A template for connecting an [`Observer`](https://jsr.io/@xan/observer/doc/~/Observer), as a
[`consumer`](https://jsr.io/@xan/observer#consumer), to a
[`producer`](https://jsr.io/@xan/observer#producer), via a
[`subscribe`](https://jsr.io/@xan/observable/doc/~/.subscribe) action.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { Observable } from "@xan/observable";

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

While not all of the documentation for this library reflects this terminology, it is a goal of the
team to ensure it does, and to ensure the language and names around the library use this document as
a source of truth and unified language.

## Major Actions

There are specific actions and events that occur between major entities in the library that need to
be defined. These major actions are the highest level events that occur within various parts of the
library.

### Observation Chain

When an [observable](https://jsr.io/@xan/observable/doc/~/Observable) uses another
[observable](https://jsr.io/@xan/observable/doc/~/Observable) as a
[producer](https://jsr.io/@xan/observer#producer), an "observation chain" is set up. That is a chain
of [observation](https://jsr.io/@xan/observerhttps://jsr.io/@xan/observer#observation) such that
multiple [observers](https://jsr.io/@xan/observer#observation) are notifying each other in a
unidirectional way toward the final [consumer](https://jsr.io/@xan/observer#consumer).

## Major Concepts

Some of what we discuss is conceptual. These are mostly common traits of behaviors that can manifest
in [observables](https://jsr.io/@xan/observable/doc/~/Observable) or in push-based reactive systems.

### Cold

An observable is "cold" when it creates a new [producer](https://jsr.io/@xan/observer#producer)
during [subscribe](https://jsr.io/@xan/observable/doc/~/Observable.subscribe) for every new
[subscription](https://jsr.io/@xan/observer#subscription). As a result, "cold"
[observables](https://jsr.io/@xan/observable/doc/~/Observable) are _always_
[unicast](https://jsr.io/@xan/observer#unicast), being one
[producer](https://jsr.io/@xan/observer#producer)
[observed](https://jsr.io/@xan/observer#observation) by one
[consumer](https://jsr.io/@xan/observer#consumer). Cold
[observables](https://jsr.io/@xan/observable/doc/~/Observable) can be made [hot](#hot) but not the
other way around.

### Hot

An observable is "hot", when its [producer](https://jsr.io/@xan/observer#producer) was created
outside of the context of the [subscribe](https://jsr.io/@xan/observable/doc/~/Observable.subscribe)
action. This means that the "hot" observable is almost always
[multicast](https://jsr.io/@xan/observer#multicast). It is possible that a "hot" observable is still
_technically_ unicast, if it is engineered to only allow one
[subscription](https://jsr.io/@xan/observer#subscription) at a time, however, there is no
straightforward mechanism for this in the library, and the scenario is an unlikely one. For the
purposes of discussion, all "hot" [observables](https://jsr.io/@xan/observable/doc/~/Observable) can
be assumed to be [multicast](https://jsr.io/@xan/observer#multicast). Hot
[observables](https://jsr.io/@xan/observable/doc/~/Observable) cannot be made [cold](#cold).

## Minor Entities

### Source

An [observable](https://jsr.io/@xan/observable/doc/~/Observable) that will supply values to another
[observable](https://jsr.io/@xan/observable/doc/~/Observable). This [source](#source), will be the
[producer](https://jsr.io/@xan/observer#producer) for the resulting
[observable](https://jsr.io/@xan/observable/doc/~/Observable) and all of its
[subscriptions](https://jsr.io/@xan/observer#subscriptions). Sources may generally be any type of
[observable](https://jsr.io/@xan/observable/doc/~/Observable).

### Notifier

An [observable](https://jsr.io/@xan/observable/doc/~/Observable) that is being used to notify
another [observable](https://jsr.io/@xan/observable/doc/~/Observable) that it needs to perform some
action. The action should only occur on a [next](https://jsr.io/@xan/observer/doc/~/Observer.next)
and never on [throw](https://jsr.io/@xan/observer/doc/~/Observer.throw) or
[return](https://jsr.io/@xan/observer/doc/~/Observer.return).

## Other Concepts

[@xan/observer](https://jsr.io/@xan/observer#glossary-and-semantics)

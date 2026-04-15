# [@observable/all](https://jsr.io/@observable/all)

[Pushes](https://jsr.io/@observable/core#push) an
[`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of
the latest values from _all_ of the given `observables` in
[iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)
order.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Array of observables

```ts
import { all } from "@observable/all";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const observable1 = forOf([1, 2, 3]);
const observable2 = forOf([4, 5, 6]);
const observable3 = forOf([7, 8, 9]);
const controller = new AbortController();

all([observable1, observable2, observable3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" [3, 6, 7]
// "next" [3, 6, 8]
// "next" [3, 6, 9]
// "return"
```

Array with an empty observable

```ts
import { all } from "@observable/all";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";

const observable1 = forOf([1, 2, 3]);
const observable2 = forOf([7, 8, 9]);
const controller = new AbortController();

all([observable1, empty, observable2]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

Empty observable array

```ts
import { all } from "@observable/all";

const controller = new AbortController();

all([]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

Iterable of observables

```ts
import { all } from "@observable/all";
import { Subject } from "@observable/core";

const subject1 = new Subject<number>();
const subject2 = subject1;
const subject3 = new Subject<number>();
const controller = new AbortController();

all(new Set([subject1, subject2, subject3])).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject2.next(1);
subject1.next(2);
subject3.next(3); // "next" [2, 3]
subject1.next(4); // "next" [4, 3]
subject2.next(5); // "next" [4, 5]
subject1.return();
subject3.return(); // "return"
subject2.return();
```

Iterable with an empty observable

```ts
import { all } from "@observable/all";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";

const observable1 = forOf([1, 2, 3]);
const observable2 = forOf([7, 8, 9]);
const controller = new AbortController();

all(new Set([observable1, empty, observable2])).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/all from the @observable library ecosystem.

WHAT IT DOES:
`all(input)` nexts an Array of the latest values from _all_ of `input`'s Observables — in index order when `input` is an array, or in iteration order for other iterables. Emitting starts when each of `input`'s Observables has nexted its first value. If any of them is empty, the returned Observable returns without nexting. Each emitted array is a frozen snapshot.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Similar to RxJS `combineLatest`

USAGE PATTERN:
```ts
import { all } from "@observable/all";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const source1 = forOf([1, 2, 3]);
const source2 = forOf([4, 5, 6]);
const source3 = forOf([7, 8, 9]);

const controller = new AbortController();

all([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

// Output:
// [3, 6, 7]  — each of input's Observables has nexted its first value
// [3, 6, 8]
// [3, 6, 9]
// "done"
```

WHEN ONE OF INPUT'S OBSERVABLES IS EMPTY:
```ts
import { empty } from "@observable/empty";

const source1 = forOf([1, 2, 3]);
const source2 = forOf([7, 8, 9]);

all([source1, empty, source2]).subscribe({
  next: (value) => console.log(value),  // Never called
  return: () => console.log("done"),    // Called immediately — returns without nexting
  ...
});
// Output: "done"
```

SEE ALSO:
- `merge` — nexts every value from every Observable in the input
- `race` — mirrors the first of input's Observables to next
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)

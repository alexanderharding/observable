# [@observable/flat-map](https://jsr.io/@observable/flat-map)

Projects each value to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
sequentially.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { Subject } from "@observable/core";
import { flatMap } from "@observable/flat-map";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observableLookup = {
  a: new Subject<number>(),
  b: new Subject<number>(),
  c: new Subject<number>(),
} as const;

pipe(forOf(["a", "b", "c"]), flatMap((value) => observableLookup[value])).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

observableLookup.b.next(1); // ignored
observableLookup.a.next(2);
observableLookup.a.next(3);
observableLookup.a.return();
observableLookup.c.next(4); // ignored
observableLookup.b.next(5);
observableLookup.b.next(6);
observableLookup.b.return();
observableLookup.c.next(7);
observableLookup.c.next(8);
observableLookup.c.return();

// Console output:
// "next" 2
// "next" 3
// "next" 5
// "next" 6
// "next" 7
// "next" 8
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/flat-map from the @observable library ecosystem.

WHAT IT DOES:
`flatMap(project)` projects each source value to an Observable and subscribes to them sequentially — waiting for each inner Observable to return before subscribing to the next. Also known as `concatMap` in RxJS.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `flatMap` is a standalone function used with `pipe()` — NOT a method on Observable
- This is called `flatMap` (like `concatMap` in RxJS), NOT `flatMap` from RxJS which is `mergeMap`

USAGE PATTERN:
```ts
import { flatMap } from "@observable/flat-map";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

const lookup = {
  a: forOf([1, 2, 3]),
  b: forOf([4, 5, 6]),
  c: forOf([7, 8, 9]),
};

pipe(
  forOf(["a", "b", "c"]),
  flatMap((key) => lookup[key])
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3, 4, 5, 6, 7, 8, 9
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

SEQUENTIAL EXECUTION:
Each inner Observable returns before the next one starts:
```ts
pipe(
  forOf(["file1", "file2", "file3"]),
  flatMap((file) => uploadFile(file))  // Uploads one at a time
).subscribe({ ... });
```

SEE ALSO:
- `mergeMap` — subscribes to all inner Observables concurrently
- `switchMap` — cancels previous inner Observable when new value arrives
- `exhaustMap` — ignores new values while inner Observable is active
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)

# @observable/take-until

Takes [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
[source](https://jsr.io/@observable/core#source) until
[notified](https://jsr.io/@observable/core#notifier) to stop.

## Build

Automated by [Deno](https://deno.land/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { Subject } from "@observable/core";
import { takeUntil } from "@observable/take-until";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = new Subject<number>();
const notifier = new Subject<void>();

pipe(source, takeUntil(notifier)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source.next(1); // "next" 1
source.next(2); // "next" 2
notifier.next(); // "return"
source.next(3);
source.return();
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)

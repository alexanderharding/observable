# @observable/throw-error

Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that will
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) the given value immediately upon
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Example

```ts
import { throwError } from "@observable/throw-error";

const controller = new AbortController();

throwError(new Error("throw")).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value), // Never called
  return: () => console.log("return"), // Never called
  throw: (value) => console.log("throw", value), // Called immediately
});
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)

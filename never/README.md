# @observable/never

An [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that does nothing on
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Example

```ts
import { never } from "@observable/never";

const controller = new AbortController();

never.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value), // Never called
  return: () => console.log("return"), // Never called
  throw: (value) => console.log("throw", value), // Never called
});
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)

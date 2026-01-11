import type { Observable } from "@xan/observable-core";
import {
  identity,
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@xan/observable-internal";
import { of } from "./of.ts";
import { pipe } from "./pipe.ts";
import { mergeMap } from "./merge-map.ts";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) which concurrently
 * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)s all values from every given {@linkcode sources|source}.
 */
export function merge<Value>(
  // Accepting an Iterable is a design choice for performance (iterables are lazily evaluated) and
  // flexibility (can accept any iterable, not just arrays).
  sources: Iterable<Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");
  return pipe(of(sources), mergeMap(identity));
}

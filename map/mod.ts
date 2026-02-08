import { isObservable, Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { pipe } from "@observable/pipe";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * {@linkcode project|Projects} each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * {@linkcode In|value} from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a new {@linkcode Out|value}.
 * @example
 * ```ts
 * import { map } from "@observable/map";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe([1, 2, 3], ofIterable(), map((value) => value * 2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 2
 * // "next" 4
 * // "next" 6
 * // "return"
 * ```
 */
export function map<In, Out>(
  project: (value: In, index: number) => Out,
): (source: Observable<In>) => Observable<Out> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function mapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = pipe(source, asObservable());
    return new Observable((observer) => {
      let index = 0;
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(project(value, index++)),
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}

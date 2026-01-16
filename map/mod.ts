import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * {@linkcode project|Projects} each {@linkcode In|value} from the [source](https://jsr.io/@observable/core#source)
 * to a new {@linkcode Out|value}.
 * @example
 * ```ts
 * import { map } from "@observable/map";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(of([1, 2, 3]), map((value) => value * 2)).subscribe({
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
    source = toObservable(source);
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

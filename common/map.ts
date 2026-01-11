import { isObservable, Observable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { pipe } from "./pipe.ts";
import { asObservable } from "./as-observable.ts";

/**
 * {@linkcode project|Projects} each {@linkcode In|value} from the [source](https://jsr.io/@xan/observable-core#source)
 * to a new {@linkcode Out|value}.
 * @example
 * ```ts
 * import { map, pipe, of } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 *
 * pipe(of([1, 2, 3]), map((x) => x * 2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // 2
 * // 4
 * // 6
 * // return
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

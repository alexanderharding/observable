import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { pipe } from "@observable/pipe";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { mergeMap } from "@observable/merge-map";
import { merge } from "@observable/merge";
import { defer } from "@observable/defer";
import { sequence } from "@observable/sequence";

/**
 * Recursively {@linkcode project|projects} each [source](https://jsr.io/@observable/core#source) value
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { expand } from "@observable/expand";
 * import { sequence } from "@observable/sequence";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 *
 * const controller = new AbortController();
 *
 * // Recursively double values until >= 16
 * pipe(
 *   sequence([2]),
 *   expand((value) => value < 16 ? sequence([value * 2]) : empty),
 * ).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 2
 * // "next" 4
 * // "next" 8
 * // "next" 16
 * // "return"
 * ```
 * @example
 * ```ts
 * import { expand } from "@observable/expand";
 * import { sequence } from "@observable/sequence";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 *
 * // Traverse a tree structure
 * interface Node {
 *   id: string;
 *   children: Node[];
 * }
 *
 * const tree: Node = {
 *   id: "root",
 *   children: [
 *     { id: "a", children: [{ id: "a1", children: [] }] },
 *     { id: "b", children: [] },
 *   ],
 * };
 *
 * const controller = new AbortController();
 *
 * pipe(
 *   sequence([tree]),
 *   expand((node) =>
 *     node.children.length ? sequence(node.children) : empty
 *   ),
 * ).subscribe({
 *   signal: controller.signal,
 *   next: (node) => console.log("visited", node.id),
 *   return: () => console.log("done"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "visited" "root"
 * // "visited" "a"
 * // "visited" "a1"
 * // "visited" "b"
 * // "done"
 * ```
 */
export function expand<Value>(
  project: (value: Value, index: number) => Observable<Value>,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function expandFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return defer(() => {
      let index = 0;
      return pipe(
        source,
        mergeMap((value) =>
          merge([
            sequence([value]),
            pipe(defer(() => project(value, index++)), expand((value) => project(value, index++))),
          ])
        ),
      );
    });
  };
}

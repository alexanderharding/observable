import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * A unary function that takes a {@linkcode source|value} and returns it.
 * @param source - The {@linkcode source|value} to return.
 * @returns The {@linkcode source} value.
 */
export function pipe<const Value>(source: Value): Value;
/**
 * Pipe a {@linkcode source|value} through a {@linkcode fn}.
 * @param source - The {@linkcode source|value} to pipe.
 * @param fn - The {@linkcode fn} to pipe the {@linkcode source|value} through.
 * @returns The result of the {@linkcode fn}.
 */
export function pipe<const In, Out>(source: In, fn: (value: In) => Out): Out;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn2}.
 */
export function pipe<const In, A, B>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
): B;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn3}.
 */
export function pipe<const In, A, B, C>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
): C;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn4}.
 */
export function pipe<const In, A, B, C, D>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
): D;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn5}.
 */
export function pipe<const In, A, B, C, D, E>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
): E;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn6}.
 */
export function pipe<const In, A, B, C, D, E, F>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
): F;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn7}.
 */
export function pipe<const In, A, B, C, D, E, F, G>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
): G;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn8}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
): H;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn9}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
): I;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn10}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I, J>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
): J;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn11}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I, J, K>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
): K;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn12}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I, J, K, L>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
): L;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn13}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I, J, K, L, M>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
): M;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn14}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
): N;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn15}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
): O;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn16}.
 */
export function pipe<const In, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
): P;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn17}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
): Q;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn18}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
): R;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn19}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
): S;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn20}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
): T;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn21}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
  fn21: (value: T) => U,
): U;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn22}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
  fn21: (value: T) => U,
  fn22: (value: U) => V,
): V;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn23}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
  fn21: (value: T) => U,
  fn22: (value: U) => V,
  fn23: (value: V) => W,
): W;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn24}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
  fn21: (value: T) => U,
  fn22: (value: U) => V,
  fn23: (value: V) => W,
  fn24: (value: W) => X,
): X;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn25}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
  fn21: (value: T) => U,
  fn22: (value: U) => V,
  fn23: (value: V) => W,
  fn24: (value: W) => X,
  fn25: (value: X) => Y,
): Y;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the {@linkcode fn26}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
  fn21: (value: T) => U,
  fn22: (value: U) => V,
  fn23: (value: V) => W,
  fn24: (value: W) => X,
  fn25: (value: X) => Y,
  fn26: (value: Y) => Z,
): Z;
/**
 * Pipe a {@linkcode source|value} through a series of unary functions.
 * @param source - The {@linkcode source|value} to pipe.
 * @returns The result of the last {@linkcode fns|fn}.
 */
export function pipe<
  const In,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
>(
  source: In,
  fn1: (value: In) => A,
  fn2: (value: A) => B,
  fn3: (value: B) => C,
  fn4: (value: C) => D,
  fn5: (value: D) => E,
  fn6: (value: E) => F,
  fn7: (value: F) => G,
  fn8: (value: G) => H,
  fn9: (value: H) => I,
  fn10: (value: I) => J,
  fn11: (value: J) => K,
  fn12: (value: K) => L,
  fn13: (value: L) => M,
  fn14: (value: M) => N,
  fn15: (value: N) => O,
  fn16: (value: O) => P,
  fn17: (value: P) => Q,
  fn18: (value: Q) => R,
  fn19: (value: R) => S,
  fn20: (value: S) => T,
  fn21: (value: T) => U,
  fn22: (value: U) => V,
  fn23: (value: V) => W,
  fn24: (value: W) => X,
  fn25: (value: X) => Y,
  fn26: (value: Y) => Z,
  ...fns: ReadonlyArray<(value: P) => unknown>
): unknown;
export function pipe<Value>(
  source: Value,
  ...fns: ReadonlyArray<(value: Value) => Value>
): Value {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  for (let index = 0; index < fns.length; index++) {
    const fn = fns[index];
    if (typeof fn !== "function") {
      throw new ParameterTypeError(index, "Function");
    }
    source = fn(source);
  }
  return source;
}

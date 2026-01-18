import { pipe } from "./mod.ts";
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

Deno.test("pipe should throw MinimumArgumentsRequiredError when called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    // @ts-expect-error: testing invalid usage
    () => pipe(),
    MinimumArgumentsRequiredError,
    "1 argument required but 0 present",
  );
});

Deno.test("pipe should throw ParameterTypeError when second argument is not a function", () => {
  // Arrange / Act / Assert
  assertThrows(
    // @ts-expect-error: testing invalid usage
    () => pipe(1, "not a function"),
    ParameterTypeError,
    "Parameter 2 is not of type 'Function'",
  );
});

Deno.test("pipe should throw ParameterTypeError when any argument after the first is not a function", () => {
  // Arrange / Act / Assert
  assertThrows(
    // @ts-expect-error: testing invalid usage
    () => pipe(1, (x: number) => x + 1, null),
    ParameterTypeError,
    "Parameter 3 is not of type 'Function'",
  );
});

Deno.test("pipe should throw ParameterTypeError when middle argument is not a function", () => {
  // Arrange / Act / Assert
  assertThrows(
    () =>
      pipe(
        1,
        (x: number) => x + 1,
        // @ts-expect-error: testing invalid usage
        42,
        (x: number) => x * 2,
      ),
    ParameterTypeError,
    "Parameter 3 is not of type 'Function'",
  );
});

Deno.test("pipe should return the source value when called with only one argument", () => {
  // Arrange
  const source = { key: "value" };

  // Act
  const result = pipe(source);

  // Assert
  assertStrictEquals(result, source);
});

Deno.test("pipe should return primitives unchanged when called with only source", () => {
  // Arrange / Act / Assert
  assertStrictEquals(pipe(42), 42);
  assertStrictEquals(pipe("hello"), "hello");
  assertStrictEquals(pipe(true), true);
  assertStrictEquals(pipe(null), null);
  assertStrictEquals(pipe(undefined), undefined);
});

Deno.test("pipe should apply a single function to the source", () => {
  // Arrange
  const double = (x: number) => x * 2;

  // Act
  const result = pipe(5, double);

  // Assert
  assertStrictEquals(result, 10);
});

Deno.test("pipe should work with type-changing transformations", () => {
  // Arrange
  const stringify = (x: number) => String(x);

  // Act
  const result = pipe(42, stringify);

  // Assert
  assertStrictEquals(result, "42");
});

Deno.test("pipe should chain two functions correctly", () => {
  // Arrange
  const addOne = (x: number) => x + 1;
  const double = (x: number) => x * 2;

  // Act
  const result = pipe(5, addOne, double);

  // Assert
  assertStrictEquals(result, 12);
});

Deno.test("pipe should chain three functions correctly", () => {
  // Arrange
  const addOne = (x: number) => x + 1;
  const double = (x: number) => x * 2;
  const stringify = (x: number) => `Value: ${x}`;

  // Act
  const result = pipe(5, addOne, double, stringify);

  // Assert
  assertStrictEquals(result, "Value: 12");
});

Deno.test("pipe should chain many functions correctly", () => {
  // Arrange
  const addOne = (x: number) => x + 1;

  // Act
  const result = pipe(
    0,
    addOne,
    addOne,
    addOne,
    addOne,
    addOne,
    addOne,
    addOne,
    addOne,
    addOne,
    addOne,
  );

  // Assert
  assertStrictEquals(result, 10);
});

Deno.test("pipe should allow any kind of custom piping", () => {
  // Arrange / Act
  const result = pipe(2.165, Math.floor, String);

  // Assert
  assertStrictEquals(result, "2");
});

Deno.test("pipe should handle transformations between different types", () => {
  // Arrange
  const parseNumber = (s: string) => parseInt(s, 10);
  const double = (x: number) => x * 2;
  const toArray = (x: number) => [x];

  // Act
  const result = pipe("21", parseNumber, double, toArray);

  // Assert
  assertEquals(result, [42]);
});

Deno.test("pipe should work with object transformations", () => {
  // Arrange
  const addName = (obj: { id: number }) => ({ ...obj, name: "test" });
  const addActive = (obj: { id: number; name: string }) => ({
    ...obj,
    active: true,
  });

  // Act
  const result = pipe({ id: 1 }, addName, addActive);

  // Assert
  assertEquals(result, { id: 1, name: "test", active: true });
});

Deno.test("pipe should work with array transformations", () => {
  // Arrange
  const double = (arr: number[]) => arr.map((x) => x * 2);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const stringify = (x: number) => `Sum: ${x}`;

  // Act
  const result = pipe([1, 2, 3], double, sum, stringify);

  // Assert
  assertStrictEquals(result, "Sum: 12");
});

Deno.test("pipe should handle functions that return undefined", () => {
  // Arrange
  const returnUndefined = () => undefined;

  // Act
  const result = pipe(42, returnUndefined);

  // Assert
  assertStrictEquals(result, undefined);
});

Deno.test("pipe should handle functions that return null", () => {
  // Arrange
  const returnNull = () => null;

  // Act
  const result = pipe(42, returnNull);

  // Assert
  assertStrictEquals(result, null);
});

Deno.test("pipe should handle async functions (returning promises)", async () => {
  // Arrange
  const asyncDouble = (x: number) => Promise.resolve(x * 2);
  const asyncAddOne = (p: Promise<number>) => p.then((x) => x + 1);

  // Act
  const result = await pipe(5, asyncDouble, asyncAddOne);

  // Assert
  assertStrictEquals(result, 11);
});

Deno.test("pipe should preserve function execution order", () => {
  // Arrange
  const order: number[] = [];
  const fn1 = (x: number) => {
    order.push(1);
    return x;
  };
  const fn2 = (x: number) => {
    order.push(2);
    return x;
  };
  const fn3 = (x: number) => {
    order.push(3);
    return x;
  };

  // Act
  pipe(0, fn1, fn2, fn3);

  // Assert
  assertEquals(order, [1, 2, 3]);
});

Deno.test("pipe should propagate errors thrown by functions", () => {
  // Arrange
  const error = new Error("test error");
  const throwError = () => {
    throw error;
  };

  // Act / Assert
  assertThrows(() => pipe(42, throwError), Error, "test error");
});

Deno.test("pipe should work with built-in functions", () => {
  // Arrange / Act
  const result = pipe(-5, Math.abs, Math.sqrt);

  // Assert
  assertStrictEquals(result, Math.sqrt(5));
});

Deno.test("pipe should work with arrow functions", () => {
  // Arrange / Act
  const result = pipe(
    "  hello world  ",
    (s) => s.trim(),
    (s) => s.toUpperCase(),
    (s) => s.split(" "),
  );

  // Assert
  assertEquals(result, ["HELLO", "WORLD"]);
});

Deno.test("pipe should work with bound methods", () => {
  // Arrange
  const toUpperCase = (s: string) => s.toUpperCase();

  // Act
  const result = pipe([1, 2, 3], (a) => a.join("-"), toUpperCase);

  // Assert
  assertStrictEquals(result, "1-2-3");
});

Deno.test("pipe should handle Symbol values", () => {
  // Arrange
  const sym = Symbol("test");
  const getDescription = (s: symbol) => s.description;

  // Act
  const result = pipe(sym, getDescription);

  // Assert
  assertStrictEquals(result, "test");
});

Deno.test("pipe should handle BigInt values", () => {
  // Arrange
  const double = (x: bigint) => x * 2n;
  const addOne = (x: bigint) => x + 1n;

  // Act
  const result = pipe(5n, double, addOne);

  // Assert
  assertStrictEquals(result, 11n);
});

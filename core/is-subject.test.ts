import { assertEquals } from "@std/assert";
import { isSubject } from "./is-subject.ts";
import { Subject } from "./subject.ts";

Deno.test(
  "isSubject should return true if the value is an instance of Subject",
  () => {
    // Arrange
    const subject = new Subject();

    // Act
    const result = isSubject(subject);

    // Assert
    assertEquals(result, true);
  },
);

Deno.test(
  "isSubject should return true if the value is a custom Subject",
  () => {
    // Arrange
    const subject: Subject = {
      subscribe: () => {},
      signal: new AbortController().signal,
      next: () => {},
      return: () => {},
      throw: () => {},
    };

    // Act
    const result = isSubject(subject);

    // Assert
    assertEquals(result, true);
  },
);

Deno.test(
  "isSubject should return false if the value is an empty object",
  () => {
    // Arrange
    const value = {};

    // Act
    const result = isSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test("isSubject should return false if the value is null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isSubject(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isSubject should return false if the value is undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isSubject(value);

  // Assert
  assertEquals(result, false);
});

Deno.test(
  "isSubject should return false if 'subscribe' is not a function",
  () => {
    // Arrange
    const value:
      & Omit<Subject, "subscribe">
      & Record<"subscribe", "not a function"> = {
        subscribe: "not a function",
        signal: new AbortController().signal,
        next: () => {},
        return: () => {},
        throw: () => {},
      };

    // Act
    const result = isSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test(
  "isSubject should return false if 'signal' is not an instance of AbortSignal",
  () => {
    // Arrange
    const value:
      & Omit<Subject, "signal">
      & Record<"signal", "not an AbortSignal"> = {
        subscribe: () => {},
        signal: "not an AbortSignal",
        next: () => {},
        return: () => {},
        throw: () => {},
      };

    // Act
    const result = isSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test("isSubject should return false if 'next' is not a function", () => {
  // Arrange
  const value: Omit<Subject, "next"> & Record<"next", "not a function"> = {
    subscribe: () => {},
    signal: new AbortController().signal,
    next: "not a function",
    return: () => {},
    throw: () => {},
  };

  // Act
  const result = isSubject(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isSubject should return false if 'return' is not a function", () => {
  // Arrange
  const value: Omit<Subject, "return"> & Record<"return", "not a function"> = {
    subscribe: () => {},
    signal: new AbortController().signal,
    next: () => {},
    return: "not a function",
    throw: () => {},
  };

  // Act
  const result = isSubject(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isSubject should return false if 'throw' is not a function", () => {
  // Arrange
  const value: Omit<Subject, "throw"> & Record<"throw", "not a function"> = {
    subscribe: () => {},
    signal: new AbortController().signal,
    next: () => {},
    return: () => {},
    throw: "not a function",
  };

  // Act
  const result = isSubject(value);

  // Assert
  assertEquals(result, false);
});

Deno.test(
  "isSubject should return false if 'signal' is not an instance of AbortSignal",
  () => {
    // Arrange
    const value:
      & Omit<Subject, "signal">
      & Record<"signal", "not an AbortSignal"> = {
        subscribe: () => {},
        signal: "not an AbortSignal",
        next: () => {},
        return: () => {},
        throw: () => {},
      };

    // Act
    const result = isSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

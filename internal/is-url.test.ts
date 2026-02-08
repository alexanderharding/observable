import { assertEquals, assertThrows } from "@std/assert";
import { isURL } from "./is-url.ts";
import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";
import { noop } from "./noop.ts";

Deno.test("isURL should throw if called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => isURL(...([] as unknown as Parameters<typeof isURL>)),
    MinimumArgumentsRequiredError,
    "1 argument required but 0 present",
  );
});

Deno.test("isURL should return true for a URL instance", () => {
  // Arrange
  const value = new URL("https://www.example.com");

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isURL should return true for a URL instance with path", () => {
  // Arrange
  const value = new URL("https://www.example.com/path/to/resource");

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isURL should return true for a URL instance with query params", () => {
  // Arrange
  const value = new URL("https://www.example.com?foo=bar&baz=qux");

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isURL should return true for a URL instance with hash", () => {
  // Arrange
  const value = new URL("https://www.example.com#section");

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isURL should return true for a URL instance with auth", () => {
  // Arrange
  const value = new URL("https://user:pass@www.example.com");

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isURL should return true for a URL instance with port", () => {
  // Arrange
  const value = new URL("https://www.example.com:8080");

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isURL should return true for a URL-like object", () => {
  // Arrange
  const value: URL = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isURL should return false for undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false for null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false for a string", () => {
  // Arrange
  const value = "https://www.example.com";

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false for a number", () => {
  // Arrange
  const value = 42;

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false for a boolean", () => {
  // Arrange
  const value = true;

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false for a plain object", () => {
  // Arrange
  const value = {};

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false for an array", () => {
  // Arrange
  const value: unknown[] = [];

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false for a function", () => {
  // Arrange
  const value = noop;

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if href is missing", () => {
  // Arrange
  const value = {
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if href is not a string", () => {
  // Arrange
  const value = {
    href: 123,
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if origin is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if origin is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: null,
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if protocol is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if protocol is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: 443,
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if username is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if username is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: undefined,
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if password is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if password is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: Symbol("password"),
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if host is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if host is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: ["www.example.com"],
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if hostname is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if hostname is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: { name: "www.example.com" },
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if port is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if port is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: 8080,
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if pathname is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if pathname is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: ["/"],
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if search is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if search is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: new URLSearchParams(),
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if searchParams is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if hash is missing", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if hash is not a string", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: Symbol("#section"),
    toString: () => "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if toString is missing", () => {
  // Arrange
  const value = Object.create(null, {
    href: { value: "https://www.example.com/" },
    origin: { value: "https://www.example.com" },
    protocol: { value: "https:" },
    username: { value: "" },
    password: { value: "" },
    host: { value: "www.example.com" },
    hostname: { value: "www.example.com" },
    port: { value: "" },
    pathname: { value: "/" },
    search: { value: "" },
    searchParams: { value: new URLSearchParams() },
    hash: { value: "" },
    toJSON: { value: () => "https://www.example.com/" },
  });

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if toString is not a function", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: "https://www.example.com/",
    toJSON: () => "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if toJSON is missing", () => {
  // Arrange
  const value = Object.create(null, {
    href: { value: "https://www.example.com/" },
    origin: { value: "https://www.example.com" },
    protocol: { value: "https:" },
    username: { value: "" },
    password: { value: "" },
    host: { value: "www.example.com" },
    hostname: { value: "www.example.com" },
    port: { value: "" },
    pathname: { value: "/" },
    search: { value: "" },
    searchParams: { value: new URLSearchParams() },
    hash: { value: "" },
    toString: { value: () => "https://www.example.com/" },
  });

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isURL should return false if toJSON is not a function", () => {
  // Arrange
  const value = {
    href: "https://www.example.com/",
    origin: "https://www.example.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.example.com",
    hostname: "www.example.com",
    port: "",
    pathname: "/",
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
    toString: () => "https://www.example.com/",
    toJSON: "https://www.example.com/",
  };

  // Act
  const result = isURL(value);

  // Assert
  assertEquals(result, false);
});

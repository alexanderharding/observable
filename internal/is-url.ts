import { isObject } from "./is-object.ts";
import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode URL} interface.
 * @example
 * ```ts
 * import { isURL } from "@observable/internal";
 *
 * isURL(new URL("https://www.example.com")); // true
 * isURL({}); // false
 * ```
 */
export function isURL(value: unknown): value is URL {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof URL ||
    (isObject(value) &&
      "href" in value &&
      typeof value.href === "string" &&
      "origin" in value &&
      typeof value.origin === "string" &&
      "protocol" in value &&
      typeof value.protocol === "string" &&
      "username" in value &&
      typeof value.username === "string" &&
      "password" in value &&
      typeof value.password === "string" &&
      "host" in value &&
      typeof value.host === "string" &&
      "hostname" in value &&
      typeof value.hostname === "string" &&
      "port" in value &&
      typeof value.port === "string" &&
      "pathname" in value &&
      typeof value.pathname === "string" &&
      "search" in value &&
      typeof value.search === "string" &&
      "searchParams" in value &&
      "hash" in value &&
      typeof value.hash === "string" &&
      "toString" in value &&
      typeof value.toString === "function" &&
      "toJSON" in value &&
      typeof value.toJSON === "function")
  );
}

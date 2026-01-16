# [@observable](https://jsr.io/@observable) Monorepo

A set of lightweight, modern reactive libraries inspired by [RxJS](https://rxjs.dev/), implementing
the [Observer pattern](https://refactoring.guru/design-patterns/observer) in JavaScript.

## What You'll Find Here

- A tribute to [RxJS](https://rxjs.dev/), built for real-world use.
- Carefully crafted utilities and primitives by a solo developer who loves reactive programming.

## What You Won't Find Here

- A drop-in replacement for [RxJS](https://rxjs.dev/). [RxJS](https://rxjs.dev/) remains the gold
  standard for enterprise-scale projects, while this monorepo aims for simplicity and focus.

## Repository Expectations

### SOLID Principles

Adhere to the SOLID design principles as much as possible. We could say a lot, but will defer to
myriad of online resources that outline the merits of these principles.

- **Single Responsibility**
- **Open/Closed**
- **Liskov Substitution**
- **Interface Segregation**
- **Dependency Inversion**

### Composition Over Inheritance

Class definitions should be expressions that leverage
[declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) and
private API obfuscation to achieve pure encapsulation.

```ts
interface Example {
  foo(): void;
  bar(): void;
}

interface ExampleConstructor {
  new (): A;
  readonly prototype: A;
}

const Example: ExampleConstructor = class {
  foo(): void {
    this.#foo();
  }

  #foo(): void {
    // Do something
  }

  bar(): void {
    this.#bar();
  }

  #bar(): void {
    // Do something
  }
};
```

### Immutability

All object instances, constructors, and prototypes **must be frozen** to prevent runtime mutation.
This ensures predictable behavior and guards against accidental modification.

```ts
const Example: ExampleConstructor = class {
  constructor() {
    Object.freeze(this);
  }
};

Object.freeze(Example);
Object.freeze(Example.prototype);
```

### Runtime Argument Validation

All public functions and methods **must validate their arguments** at runtime using the standard
`TypeError` type.

```ts
function example(value: string): void {
  if (arguments.length === 0) {
    throw new TypeError("1 argument required but 0 present");
  }
  if (typeof value !== "string") {
    throw new TypeError("Parameter 1 is not of type 'String'");
  }
}
```

All public methods **must validate their 'this' instance** at runtime using the standard `TypeError`
type.

```ts
const Example: ExampleConstructor = class {
  foo() {
    if (!(this instanceof Example)) {
      throw new TypeError("'this' is not instanceof 'Example'");
    }
  }
};
```

### Shallow Call Stacks for Debugging

Validation must occur **at the entry point** of each public function, not delegated to shared
validation helpers buried in the call stack. This keeps stack traces shallow and points errors
directly to the user's call site, making debugging straightforward.

```ts
// ✓ Good: Validation at entry point produces a shallow stack trace
function map<In, Out>(transform: (value: In) => Out): (source: In[]) => Out[] {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof transform !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function mapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!Array.isArray(source)) throw new ParameterTypeError(0, "Array");
    // ...
  };
}

// ✗ Bad: Delegating to a validation helper adds noise to the stack trace
function map<In, Out>(transform: (value: In) => Out) {
  validateFunction(transform); // Adds extra frame(s) to stack
  return function mapFn(source) {
    validateArray(source); // Adds extra frame(s) to stack
    // ...
  };
}
```

When a user passes invalid arguments, the error should point directly to their code — not to
internal library plumbing.

### Type Guards

Provide `is*` type guard functions for all unique public interfaces. Type guards must:

- Accept `unknown` and return a type predicate
- Support both class instances and POJOs
- Validate required arguments

```ts
function isUser(value: unknown): value is User {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof User ||
    (isObject(value) &&
      "id" in value &&
      typeof value.id === "string" &&
      "name" in value &&
      typeof value.name === "string")
  );
}
```

### Symbol.toStringTag

All classes **must implement `Symbol.toStringTag`** for proper object stringification.

```ts
const Example: ExampleConstructor = class {
  readonly [Symbol.toStringTag] = "Example";
};

// Usage:
`${new Example()}`; // "[object Example]"
```

### Pure Functions

Functions should be pure wherever possible:

- **Deterministic** — Same inputs always produce the same output
- **No side effects** — No mutations, I/O, or external state changes
- **Referentially transparent** — Can be replaced with its return value

### Documentation

All public APIs **must have JSDoc documentation** including:

- A description of purpose and behavior
- `@example` blocks with runnable code samples

````ts
/**
 * Calculates the sum of all numbers in an array.
 * @example
 * ```ts
 * sum([1, 2, 3]); // 6
 * sum([]); // 0
 * ```
 */
export function sum(values: number[]): number;
````

### Testing

Tests follow the **Arrange/Act/Assert** pattern with descriptive test names that explain the
expected behavior. Each test should focus on a single behavior.

```ts
Deno.test("sum should return 0 for an empty array", () => {
  // Arrange
  const values: Array<number> = [];

  // Act
  const result = sum(values);

  // Assert
  assertEquals(result, 0);
});
```

### Internal Utilities

Reusable utilities should be centralized in a dedicated internal package/module. Internal functions
that should not be exported are marked with `@internal Do NOT export.` in their JSDoc.

```ts
/**
 * Clamps a value between a minimum and maximum.
 * @internal Do NOT export.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

export class InstanceofError extends TypeError {
  constructor(target: string, expected: string) {
    super(`'${target}' is not instanceof '${expected}'`);
  }
}

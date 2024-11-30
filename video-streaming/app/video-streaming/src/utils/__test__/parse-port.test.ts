import * as E from 'fp-ts/Either';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parsePort } from '../parse-env';

describe('parsePort', () => {
  let originalPort: string | undefined;

  beforeEach(() => {
    originalPort = process.env.PORT;
  });

  afterEach(() => {
    process.env.PORT = originalPort;
  });

  it('should return an error if PORT is not defined', () => {
    delete process.env.PORT;
    const result = parsePort();
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.message).toBe('PORT is not defined');
    }
  });

  it('should return an error if PORT is not a number', () => {
    process.env.PORT = 'not-a-number';
    const result = parsePort();
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.message).toBe('PORT is not a number');
    }
  });

  it('should return an error if PORT is out of range', () => {
    process.env.PORT = '70000';
    const result = parsePort();
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.message).toBe('PORT is not a number');
    }
  });

  it('should return the port number if PORT is valid', () => {
    process.env.PORT = '3000';
    const result = parsePort();
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(3000);
    }
  });
});

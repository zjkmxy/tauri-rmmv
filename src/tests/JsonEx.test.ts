import { expect, test } from "vitest";
import { JsonEx } from "../rpg/core/JsonEx";

test('Duplicated array', () => {
  const array = [1, 2, 3];
  const obj = { a1: array, a2: array };
  (array as unknown as Record<string, string>).hoge = 'fuga';
  const result = JsonEx.parse(JsonEx.stringify(obj));
  expect(result.a1 === result.a2).toBeTruthy();
  expect(obj.a1 === obj.a2).toBeTruthy();
  // expect(result.a1.hoge).toStrictEqual('fuga');  // This is not kept
})

test('Circular link', () => {
  const a = {} as Record<string, unknown>;
  const b = { a };
  a.b = b;
  const obj = { a1: a, a2: a };
  const result = JsonEx.parse(JsonEx.stringify(obj));
  expect(result.a1 === result.a2).toBeTruthy();
  expect(obj.a1 === obj.a2).toBeTruthy();
  expect(result.a1.b.a === result.a1).toBeTruthy();
})

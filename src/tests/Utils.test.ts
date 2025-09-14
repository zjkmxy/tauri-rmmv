import { expect, test } from 'vitest';
import { base64ToBytes, bytesToBase64, callCC } from '../rpg/core/Utils';


const multiplyArray = (nums: number[]): number => {
  const multiplyArrayRecur = (i: number, prod: number, exit: (result: number) => void): number => {
    if (i === nums.length) {
      return prod;
    }
    const cur = nums[i];
    if (cur === 0) {
      exit(0);
      // Never execute.
    }
    return multiplyArrayRecur(i + 1, prod * cur, exit);
  };
  return callCC((exit) => multiplyArrayRecur(0, 1, exit));
};

test('callCC test 1', () => {
  expect(multiplyArray([]) === 1).toBeTruthy();
});

test('callCC test 2', () => {
  expect(multiplyArray([2, 0, NaN]) === 0).toBeTruthy();
});

test('callCC test 3', () => {
  expect(multiplyArray([1, 2, 3]) === 6).toBeTruthy();
});

test('callCC test 4', () => {
  expect(multiplyArray([NaN, 0, NaN]) === 0).toBeTruthy();
});

test('bytesToBase64 test', () => {
  expect(bytesToBase64(new Uint8Array([0x00, 0x0a, 0x0b, 0x10, 0xfa, 0x01])) === 'AAoLEPoB').toBeTruthy();
});

test('base64ToBytes test', () => {
  expect(base64ToBytes('AAoLEPoB')).toStrictEqual(new Uint8Array([0x00, 0x0a, 0x0b, 0x10, 0xfa, 0x01]));
});
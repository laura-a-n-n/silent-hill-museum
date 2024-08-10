import { expect, test } from "vitest";
import Stripifier from "../wasm/stripifier/stripifier";

test("should stripify", async () => {
  const stripifier = Stripifier.getInstance();
  const array = [0, 1, 2, 3, 2, 1];
  const vertexCount = 4;
  const reply = await stripifier.triangleStripFromList(array, vertexCount);
  expect(Array.from(reply ?? [])).toEqual([0, 1, 2, 3]);
});

test("should properly handle orientations with degenerate triangles", async () => {
  const stripifier = Stripifier.getInstance();
  const array = [0, 1, 2, 1, 2, 3];
  const vertexCount = 4;
  const reply = await stripifier.triangleStripFromList(array, vertexCount);
  expect(Array.from(reply ?? [])).toEqual([
    0, 1, 2 /* first triangle */, 2 /* degenerate 1 2 2 */,
    1 /* degenerate 2 2 1 */, 1 /* degenerate 2 1 1 */,
    3 /* degenerate 1 1 3 */, 2 /* second triangle 1 3 2 */,
  ]);
});

test("should throw on incorrect vertex count", async () => {
  const stripifier = Stripifier.getInstance();
  const array = [0, 1, 2, 3, 2, 1, 4, 1, 2];
  const vertexCount = 4;
  expect(
    async () => await stripifier.triangleStripFromList(array, vertexCount)
  ).rejects.toThrow();
});

test("should throw on invalid triangle list", async () => {
  const stripifier = Stripifier.getInstance();
  const array = [0, 1, 2, 3, 4]; // its length is not divisible by 3
  const vertexCount = 5;
  expect(
    async () => await stripifier.triangleStripFromList(array, vertexCount)
  ).rejects.toThrow();
});

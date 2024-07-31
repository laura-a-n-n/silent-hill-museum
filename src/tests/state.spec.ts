import { expect, test } from "vitest";
import {
  constructIndex,
  destructureIndex,
  fileIndices,
  travelAlongLevel,
} from "../files";

test("should correctly round-trip file index", () => {
  const index = constructIndex("chr", "favorites", "org.mdl");
  const array = destructureIndex(index);
  expect(array).toEqual(["chr", "favorites", "org.mdl"]);
});

test("should not allow more arguments than necessary", () => {
  // @ts-expect-error
  expect(() => constructIndex("chr", "agl", "3sk.mdl", "agl")).toThrowError();
});

test("should not allow empty folders", () => {
  for (let i = 0; i < fileIndices[1].length - 1; i++) {
    expect(fileIndices[1][i + 1] - fileIndices[1][i]).toBeGreaterThan(1);
  }
});

test("should travel along levels correctly", () => {
  // these may not always hold. when the structure changes, rewrite them
  expect(fileIndices[0].length === 2);
  expect(travelAlongLevel(0, 0, 1)).toEqual(fileIndices[0][1]);
  expect(travelAlongLevel(0, 0, -1)).toEqual(fileIndices[0][1]);
  expect(travelAlongLevel(0, 0, 2)).toEqual(fileIndices[0][0]);

  expect(travelAlongLevel(2, 1, 1)).toEqual(4);
  expect(travelAlongLevel(2, 1, 5)).toEqual(15);
});

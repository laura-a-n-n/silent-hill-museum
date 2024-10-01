export type Enum<T> = T[keyof T];

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export type VertexLike = { x: number; y: number; z: number };
export type BoundingBox = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : TupleOf<T, N, []>
  : never;
type TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : TupleOf<T, N, [T, ...R]>;

// Type to map indices to values
export type IndexedValues<T extends readonly (readonly number[])[]> = {
  [K in keyof T]: T[K] extends readonly number[] ? T[K][number] : never;
}[number];

// Helper type to extract the actual values from the indices
export type MapIndicesToValues<
  T extends readonly (readonly number[])[],
  V extends readonly any[]
> = {
  [K in keyof T]: T[K] extends readonly number[]
    ? { [I in T[K][number]]: V[I] }[T[K][number]]
    : never;
};

export type TupleSplit<
  T,
  N extends number,
  O extends readonly any[] = readonly []
> = O["length"] extends N
  ? [O, T]
  : T extends readonly [infer F, ...infer R]
  ? TupleSplit<readonly [...R], N, readonly [...O, F]>
  : [O, T];
export type TakeFirst<T extends readonly any[], N extends number> = TupleSplit<
  T,
  N
>[0];
export type SkipFirst<T extends readonly any[], N extends number> = TupleSplit<
  T,
  N
>[1];
export type TupleSlice<
  T extends readonly any[],
  S extends number,
  E extends number
> = SkipFirst<TakeFirst<T, E>, S>;
export type Arr<N extends number, T extends any[] = []> = T["length"] extends N
  ? T
  : Arr<N, [...T, any]>;
export type Decrement<N extends number> = Arr<N> extends [any, ...infer U]
  ? U["length"]
  : never;
export type TupleSliceUnion<
  T extends readonly any[],
  Start extends number,
  End extends number
> = End extends Start
  ? TupleSlice<T, Start, End>
  : TupleSliceUnion<T, Start, Decrement<End>> | TupleSlice<T, Start, End>;

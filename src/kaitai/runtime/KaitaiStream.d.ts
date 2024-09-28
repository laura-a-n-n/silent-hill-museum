// KaitaiStream.d.ts
declare class KaitaiStream {
  constructor(arrayBuffer: ArrayBuffer | any, byteOffset?: number);

  buffer: ArrayBuffer;
  byteOffset: number;
  dataView: DataView;
  pos: number;
  bits: number;
  bitsLeft: number;
  size: number;

  static endianness: boolean;
  static depUrls: {
    zlib?: string;
  };

  writeBackChildStreams(): void;
  toByteArray(): Uint8Array;

  _trimAlloc(): void;
  alignToByte(): void;
  isEof(): boolean;
  seek(pos: number): void;

  readS1(): number;
  readS2be(): number;
  readS4be(): number;
  readS8be(): number;
  readS2le(): number;
  readS4le(): number;
  readS8le(): number;

  readU1(): number;
  readU2be(): number;
  readU4be(): number;
  readU8be(): number;
  readU2le(): number;
  readU4le(): number;
  readU8le(): number;

  readF4be(): number;
  readF8be(): number;
  readF4le(): number;
  readF8le(): number;

  readBitsInt(n: number): number;

  readBytes(len: number): Uint8Array;
  readBytesFull(): Uint8Array;
  readBytesTerm(
    terminator: number,
    include: boolean,
    consume: boolean,
    eosError: boolean
  ): Uint8Array;

  ensureFixedContents(expected: Uint8Array): Uint8Array;

  static bytesStripRight(data: Uint8Array, padByte: number): Uint8Array;
  static bytesTerminate(
    data: Uint8Array,
    term: number,
    include: boolean
  ): Uint8Array;
  static bytesToStr(arr: Uint8Array, encoding: string): string;

  static processXorOne(data: Uint8Array, key: number): Uint8Array;
  static processXorMany(data: Uint8Array, key: Uint8Array): Uint8Array;
  static processRotateLeft(
    data: Uint8Array,
    amount: number,
    groupSize: number
  ): Uint8Array;
  static processZlib(buf: Uint8Array | ArrayBuffer): Uint8Array;

  static mod(a: number, b: number): number;
  static arrayMin(arr: number[]): number;
  static arrayMax(arr: number[]): number;
  static arraySum(arr: number[]): number;
  static arrayAvg(arr: number[]): number;
}

declare class UnexpectedDataError extends Error {
  constructor(expected: Uint8Array, actual: Uint8Array);
}

export = KaitaiStream;
export as namespace KaitaiStream;

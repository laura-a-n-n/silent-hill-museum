// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
    function ccall(ident: any, returnType?: string, argTypes?: any[], args?: any, opts?: any): any;
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
    function cwrap(ident: any, returnType?: string, argTypes?: any[], opts?: any): (...args: any[]) => any;
    const HEAPF32: any;
    const HEAPF64: any;
    const HEAP_DATA_VIEW: any;
    const HEAP8: any;
    const HEAPU8: any;
    const HEAP16: any;
    const HEAPU16: any;
    const HEAP32: any;
    const HEAPU32: any;
    const HEAP64: any;
    const HEAPU64: any;
}
interface WasmModule {
  _get_triangle_strip(_0: number, _1: number, _2: number): number;
  _get_return_size(): number;
  _malloc(_0: number): number;
  _free(_0: number): void;
}

export type MainModule = WasmModule & typeof RuntimeExports;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;

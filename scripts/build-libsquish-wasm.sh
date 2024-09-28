#!/bin/bash

ARGS="src/wasm/libsquish/cpp/*.cpp -O3 \
    -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sASSERTIONS=1 -sALLOW_MEMORY_GROWTH \
    -sEXPORTED_FUNCTIONS=_GetStorageRequirements,_CompressImage,_DecompressImage,_free,_malloc \
    -sEXPORT_ES6=1"
RELAXED_WASM_ARGS="-msimd128 -mrelaxed-simd -msse -msse2 -sWASM=1 \
    -DUSE_RELAXED_SIMD -o src/wasm/libsquish/dist/libsquish_relaxed.js \
    --emit-tsd libsquish_relaxed.d.ts"
WASM_ARGS="-msimd128 -msse -msse2 -sWASM=1 \
    -o src/wasm/libsquish/dist/libsquish.js --emit-tsd libsquish.d.ts"
NO_SIMD_ARGS="-sWASM=1 -o src/wasm/libsquish/dist/libsquish_no_simd.js \
    -DSQUISH_USE_SSE=0 --emit-tsd libsquish_no_simd.d.ts"

echo "Building WASM"
em++ $ARGS $WASM_ARGS
echo "Building WASM with relaxed SIMD"
em++ $ARGS $RELAXED_WASM_ARGS
echo "Building WASM without SIMD"
em++ $ARGS $NO_SIMD_ARGS

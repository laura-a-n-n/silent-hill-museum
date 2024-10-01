#!/bin/bash
emcc src/wasm/stripifier/cpp/main.cpp -o src/wasm/stripifier/dist/stripifier.js \
    -sEXPORTED_FUNCTIONS=_get_triangle_strip,_free,_malloc,_get_return_size \
    -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sASSERTIONS=1 \
    -sWASM=1 --emit-tsd stripifier.d.ts -sEXPORT_ES6=1

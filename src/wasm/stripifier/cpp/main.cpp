#include "vendor/meshoptimizer.h"
#include "vendor/stripifier.cpp"
#include <iostream>
#include <vector>

extern "C"
{
    size_t return_size;

    unsigned int *get_triangle_strip(unsigned int *triangle_array, int size, int vertex_count)
    {
        size_t index_count = size;

        // Allocate memory for the triangle strip
        static std::vector<unsigned int> triangle_strip(meshopt_stripifyBound(index_count));

        // Convert the triangle list to a triangle strip
        size_t strip_size = meshopt_stripify(triangle_strip.data(), triangle_array, index_count, vertex_count, 0);

        // Resize the strip to the actual size
        triangle_strip.resize(strip_size);

        return_size = strip_size;
        return triangle_strip.data();
    }

    size_t get_return_size()
    {
        return return_size;
    }
}

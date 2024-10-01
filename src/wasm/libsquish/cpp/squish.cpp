/* -----------------------------------------------------------------------------

    Copyright (c) 2006 Simon Brown                          si@sjbrown.co.uk

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to    deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   -------------------------------------------------------------------------- */

#include "squish.h"
#include "colourset.h"
#include "maths.h"
#include "rangefit.h"
#include "clusterfit.h"
#include "colourblock.h"
#include "alpha.h"
#include "singlecolourfit.h"

#include <cstdlib>

namespace squish {

static int FixFlags( int flags )
{
    // grab the flag bits
    int method = flags & ( kDxt1 | kDxt3 | kDxt5 );
    int fit = flags & ( kColourIterativeClusterFit | kColourClusterFit | kColourRangeFit );
    int extra = flags & kWeightColourByAlpha;

    // set defaults
    if( method != kDxt3 && method != kDxt5 )
        method = kDxt1;
    if( fit != kColourRangeFit && fit != kColourIterativeClusterFit )
        fit = kColourClusterFit;

    // done
    return method | fit | extra;
}

void CompressMasked( float const* bgra, int mask, void* block, int flags, float* metric )
{
    // fix any bad flags
    flags = FixFlags( flags );

    // get the block locations
    void* colourBlock = block;
    void* alphaBock = block;
    if( ( flags & ( kDxt3 | kDxt5 ) ) != 0 )
        colourBlock = reinterpret_cast< u8* >( block ) + 8;

    // create the minimal point set
    ColourSet colours( bgra, mask, flags );

    // check the compression type and compress colour
    if( colours.GetCount() == 1 )
    {
        // always do a single colour fit
        SingleColourFit fit( &colours, flags );
        fit.Compress( colourBlock );
    }
    else if( ( flags & kColourRangeFit ) != 0 || colours.GetCount() == 0 )
    {
        // do a range fit
        RangeFit fit( &colours, flags, metric );
        fit.Compress( colourBlock );
    }
    else
    {
        // default to a cluster fit (could be iterative or not)
        ClusterFit fit( &colours, flags, metric );
        fit.Compress( colourBlock );
    }

    // compress alpha separately if necessary
    if( ( flags & kDxt3 ) != 0 )
        CompressAlphaDxt3( bgra, mask, alphaBock );
    else if( ( flags & kDxt5 ) != 0 )
        CompressAlphaDxt5( bgra, mask, alphaBock );
}

void Decompress( float* bgra, void const* block, int flags )
{
    // fix any bad flags
    flags = FixFlags( flags );

    // get the block locations
    void const* colourBlock = block;
    void const* alphaBock = block;
    if( ( flags & ( kDxt3 | kDxt5 ) ) != 0 )
        colourBlock = reinterpret_cast< u8 const* >( block ) + 8;

    // decompress colour
    DecompressColour( bgra, colourBlock, ( flags & kDxt1 ) != 0 );

    // decompress alpha separately if necessary
    if( ( flags & kDxt3 ) != 0 )
        DecompressAlphaDxt3( bgra, alphaBock );
    else if( ( flags & kDxt5 ) != 0 )
        DecompressAlphaDxt5( bgra, alphaBock );
}

} // namespace squish

using namespace squish;

extern "C" {
int GetStorageRequirements( int width, int height, int flags )
{
    // fix any bad flags
    flags = FixFlags( flags );

    // compute the storage requirements
    int blockcount = ( ( width + 3 )/4 ) * ( ( height + 3 )/4 );
    int blocksize = ( ( flags & kDxt1 ) != 0 ) ? 8 : 16;
    return blockcount*blocksize;
}

void CompressImage( u8 const* bgra_u8, int width, int height, void* blocks, int flags, float* metric )
{
    // fix any bad flags
    flags = FixFlags( flags );

    // initialise the block output
    u8* targetBlock = reinterpret_cast< u8* >( blocks );
    int bytesPerBlock = ( ( flags & kDxt1 ) != 0 ) ? 8 : 16;

    // loop over blocks
    for( int y = 0; y < height; y += 4 )
    {
        for( int x = 0; x < width; x += 4 )
        {
            // build the 4x4 block of pixels
            float sourceBgra[16*4];
            float* targetPixel = sourceBgra;
            int mask = 0;
            for( int py = 0; py < 4; ++py )
            {
                for( int px = 0; px < 4; ++px )
                {
                    // get the source pixel in the image
                    int sx = x + px;
                    int sy = y + py;

                    // enable if we're in the image
                    if( sx < width && sy < height )
                    {
                        // copy the bgra value
                        u8 const* sourcePixel = bgra_u8 + 4*( width*sy + sx );
                        for( int i = 0; i < 4; ++i )
                            *targetPixel++ = (*sourcePixel++) * (1.0f / 255.0f);

                        // enable this pixel
                        mask |= ( 1 << ( 4*py + px ) );
                    }
                    else
                    {
                        // skip this pixel as its outside the image
                        targetPixel += 4;
                    }
                }
            }

            // compress it into the output
            CompressMasked( sourceBgra, mask, targetBlock, flags, metric );

            // advance
            targetBlock += bytesPerBlock;
        }
    }
}

void DecompressImage( u8* bgra, int width, int height, void const* blocks, int flags )
{
    // fix any bad flags
    flags = FixFlags( flags );

    // initialise the block input
    u8 const* sourceBlock = reinterpret_cast< u8 const* >( blocks );
    int bytesPerBlock = ( ( flags & kDxt1 ) != 0 ) ? 8 : 16;

    // loop over blocks
    for( int y = 0; y < height; y += 4 )
    {
        for( int x = 0; x < width; x += 4 )
        {
            // decompress the block
            float targetBgra[4*16];
            Decompress( targetBgra, sourceBlock, flags );

            // write the decompressed pixels to the correct image locations
            float const* sourcePixel = targetBgra;
            for( int py = 0; py < 4; ++py )
            {
                for( int px = 0; px < 4; ++px )
                {
                    // get the target location
                    int sx = x + px;
                    int sy = y + py;
                    if( sx < width && sy < height )
                    {
                        u8* targetPixel = bgra + 4*( width*sy + sx );

                        // copy the rgba value
                        for( int i = 0; i < 4; ++i )
                            *targetPixel++ = (*sourcePixel++) * 255.0;
                    }
                    else
                    {
                        // skip this pixel as its outside the image
                        sourcePixel += 4;
                    }
                }
            }

            // advance
            sourceBlock += bytesPerBlock;
        }
    }
}

} // extern "C"

void squishCompressMasked( float const* bgra, int mask, void* block, int flags, float* metric )
{
    squish::CompressMasked( bgra, mask, block, flags, metric );
}

void squishCompress( float const* bgra, void* block, int flags, float* metric )
{
    squish::CompressMasked( bgra, 0xffff, block, flags, metric );
}

void squishDecompress( float* bgra, void const* block, int flags )
{
    squish::Decompress( bgra, block, flags );
}

int squishGetStorageRequirements( int width, int height, int flags )
{
    return squish::GetStorageRequirements( width, height, flags );
}

void squishCompressImage( float const* bgra, int width, int height, void* blocks, int flags, float* metric )
{
    squish::CompressImage( bgra, width, height, blocks, flags, metric );
}

void squishDecompressImage( float* bgra, int width, int height, void const* blocks, int flags )
{
    squish::DecompressImage( bgra, width, height, blocks, flags );
}


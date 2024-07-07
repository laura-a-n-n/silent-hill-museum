# Oversimplified S3/DXTn decompression. Just supports color, no alpha.

def rgb565_to_rgb888(rgb565):
    # source: https://rgbcolorpicker.com/565
    # Shift the red value to the right by 11 bits.
    red5 = rgb565 >> 11
    # Shift the green value to the right by 5 bits and extract the lower 6 bits.
    green6 = (rgb565 >> 5) & 0b111111
    # Extract the lower 5 bits.
    blue5 = rgb565 & 0b11111
    # Convert 5-bit red to 8-bit red.
    red8 = round(red5 / 31 * 255)
    # Convert 6-bit green to 8-bit green.
    green8 = round(green6 / 63 * 255)
    # Convert 5-bit blue to 8-bit blue.
    blue8 = round(blue5 / 31 * 255)
    return red8 / 255, green8 / 255, blue8 / 255

def rgb565_int_to_3d(x):
    # Convert a RGB 5:6:5 integer to a 3d tuple
    return ((x >> 11) & 0b11111, (x >> 5) & 0b111111, x & 0b11111)

def rgb565_3d_to_int(x):
    # Convert a RGB 5:6:5 3d tuple to an integer
    return int(x[2]) | (int(x[1]) << 5) | (int(x[0]) << 11)

def lerp_3d(a, b, t):
    # Lerp two 3d tuples/lists
    return (
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t
    )

def decompress_color_row(blocks, color0, color1):
    # Decompress DXT1 color info, assume no alpha channel.
    colors = [
        rgb565_to_rgb888(color0),
        rgb565_to_rgb888(color1),
        lerp_3d(rgb565_to_rgb888(color0), rgb565_to_rgb888(color1), 1 / 3),
        lerp_3d(rgb565_to_rgb888(color0), rgb565_to_rgb888(color1), 2 / 3),
    ]
    return [colors[block] for block in blocks]

def unpack_color_row(color_row):
    # Given an 8-byte chunk of DXT1 color data, unpack into its components

    # Split the first 4 bytes into 2-byte chunks (little endian)
    color0 = (color_row[1] << 8) | color_row[0]
    color1 = (color_row[3] << 8) | color_row[2]

    # Sixteen two-bit chunks
    blocks = []
    for i in range(4, 8):
        byte = color_row[i]
        blocks.extend([(byte >> (2*j)) & 0b11 for j in range(4)])

    return blocks, color0, color1

def read_color_data(data):
    # Given DXT-compressed bytes, get only the color data

    if len(data) % 16 != 0:
        raise ValueError("Input length must be a multiple of 16")

    windows = []
    window_count = len(data) // 16

    for i in range(window_count):
        start_index = i * 16
        end_index = start_index + 16
        
        # Get the "right half" of the bytes (last 8 bytes)
        right_half = data[end_index - 8:end_index]
        
        # Append to the chunks list
        windows.append(right_half)

    return windows

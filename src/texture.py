import os
import struct
import argparse

import numpy as np
from PIL import Image

from common import validate_and_exec
from decompress import read_color_data, unpack_color_row, decompress_color_row

TEXTURE_COUNT_LOCATION = 0x8
INITIAL_TEXTURE_HEADER_SIZE = 0x10
DIMENSIONS_OFFSET = 0x04
SPRITE_COUNT_OFFSET = 0x0C
MAIN_HEADER_SIZE = 0x20
SPRITE_HEADER_SIZE = 0x20

def extract_image_data(filename: str):
    images = []

    with open(filename, 'rb') as file:
        file.seek(TEXTURE_COUNT_LOCATION)
        texture_info_bytes = file.read(8)
        (texture_count, main_header_offset) = struct.unpack('<2I', texture_info_bytes)
        current_offset = main_header_offset + INITIAL_TEXTURE_HEADER_SIZE

        for index in range(texture_count):
            image = []

            file.seek(current_offset + DIMENSIONS_OFFSET)
            dimensions_bytes = file.read(4)
            (width, height) = struct.unpack('<2H', dimensions_bytes)

            file.seek(current_offset + SPRITE_COUNT_OFFSET)
            sprite_count = struct.unpack('<H', file.read(2))[0]

            file.seek(current_offset + MAIN_HEADER_SIZE + SPRITE_HEADER_SIZE * sprite_count)
            file_content = file.read(width * height)

            color_rows = read_color_data(file_content)

            for i in range(height // 4):
                image.extend([[], [], [], []])

                for j in range(width // 4):
                    row = color_rows[i * (width // 4) + j]
                    unpacked = unpack_color_row(row)
                    decompressed = decompress_color_row(*unpacked)

                    for k in range(4):
                        image[i * 4 + k].extend([
                            decompressed[k * 4], 
                            decompressed[k * 4 + 1],
                            decompressed[k * 4 + 2],
                            decompressed[k * 4 + 3]
                        ])

            print(f"Finished processing texture {index + 1}.")
            images.append(image)
            current_offset += width * height + MAIN_HEADER_SIZE + SPRITE_HEADER_SIZE * sprite_count

    print("Done processing textures!")
    return images

def handle_file(filename: str, args):
    print(f"Reading file {filename}...")
    image_data = extract_image_data(filename)

    for index, image in enumerate(image_data):
        filename_base, _extension = os.path.splitext(
            os.path.basename(filename))
        output_filename = f"output/{filename_base}{"" if len(image_data) == 1 else index}.png"

        directory = os.path.dirname(output_filename)
        if not os.path.exists(directory):
            os.makedirs(directory)

        print(f"Saving to {output_filename}...")
        np_image = np.array(image)
        if not args.unflip:
            np_image = np.flip(np_image, 0)
        pil_image = Image.fromarray((np_image * 255).astype(np.uint8))
        pil_image.save(output_filename)

    return True

def main():
    parser = argparse.ArgumentParser(description='...')
    parser.add_argument('path', help='The file or folder to process')
    parser.add_argument('--unflip', help='If true, will produce a rightside-up image', action='store_true')
    validate_and_exec(parser, handle_file, '.mdl')
    print("Done!")

if __name__ == "__main__":
    main()
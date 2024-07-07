# Converts an item .mdl file from Silent Hill 2 (PC) to .obj.
# Not tested on characters.

import argparse
import os
import struct
from common import validate_and_exec

MESH_DATA_MAGIC = b'\x03\x00\xff\xff'
GEOMETRY_HEADER_OFFSET = 0x80
TRIANGLE_INDEX_OFFSET = 0x10
VERTEX_CHUNK_SIZE = 0x30
UV_OFFSET = 0x14

def extract_mdl_data(filename: str):
    with open(filename, 'rb') as file:
        file_content = file.read()
        start_index = file_content.find(MESH_DATA_MAGIC)

        if start_index == -1:
            print("File did not have the expected format.")
            return

        # Move to Model3_VertexOffsetHeader
        geometry_header_start = start_index + GEOMETRY_HEADER_OFFSET
        file.seek(geometry_header_start)

        # Read vertex count and vertex data offset
        vertex_count_bytes = file.read(4)
        vertex_count = struct.unpack('<I', vertex_count_bytes)[0]
        vertex_data_offset_bytes = file.read(4)
        vertex_data_offset = struct.unpack('<I', vertex_data_offset_bytes)[0]

        # Skip to start_index + 16 (triangle_index_offset position)
        file.seek(geometry_header_start + TRIANGLE_INDEX_OFFSET)
        triangle_index_offset_bytes = file.read(4)
        triangle_index_offset = struct.unpack('<I', triangle_index_offset_bytes)[0]

        # Print or process the read values
        print(f"Vertex Count: {vertex_count}")
        print(f"Vertex Data Offset: {vertex_data_offset}")
        print(f"Triangle Index Offset: {triangle_index_offset}")

        # Compute absolute offsets
        triangle_index_start = start_index + triangle_index_offset
        vertex_data_start = start_index + vertex_data_offset

        # Read index buffer data
        file.seek(triangle_index_start)
        triangle_index_count = (vertex_data_start - triangle_index_start) // 2
        triangle_indices_bytes = file.read(triangle_index_count * 2)
        triangle_indices = struct.unpack(f"<{triangle_index_count}h", triangle_indices_bytes)
        print(f"Triangle index count: {triangle_index_count}")

        vertices = []
        for vertex_index in range(vertex_count):
            # Move to the next vertex (next 48 bytes)
            file.seek(vertex_data_start + VERTEX_CHUNK_SIZE * vertex_index)

            # Read position
            xyz_bytes = file.read(16)
            [x, y, z, w] = struct.unpack('<4f', xyz_bytes)

            # Read uv coords
            file.seek(UV_OFFSET, 1)
            uv_bytes = file.read(8)
            [u, v] = struct.unpack('<2f', uv_bytes)
            vertices.append((x, y, z, w, u, v))

        print("Data seems OK!")
        return {'vertices': vertices, 'triangle_indices': triangle_indices}


def write_to_obj(mdl_data, path: str):
    vertices = mdl_data['vertices']
    triangle_indices = mdl_data['triangle_indices']

    directory = os.path.dirname(path)
    if not os.path.exists(directory):
        os.makedirs(directory)

    with open(path, 'w') as f:
        for i, v in enumerate(vertices):
            (x, y, z, w, _, __) = v
            f.write(f'v {x:.4f} {y:.4f} {z:.4f} {w:.4f}\n')
        f.write('\n')

        for v in vertices:
            (x, y, z, w, u, v) = v
            f.write(f'vt {u} {v}\n')
        f.write('\n')

        # triangle strip
        true_face_count = 0
        for i in range(2, len(triangle_indices)):
            v0, v1, v2 = triangle_indices[i-2] + \
                1, triangle_indices[i-1] + 1, triangle_indices[i] + 1
            if v0 == v1 or v1 == v2 or v0 == v2:
                # remove degenerate triangles
                continue
            if i % 2 == 0:
                f.write(f'f {v0}/{v0} {v1}/{v1} {v2}/{v2}\n')
            else:
                f.write(f'f {v2}/{v2} {v1}/{v1} {v0}/{v0}\n')
            true_face_count += 1
        f.write('\n')
        print(f"Face count: {true_face_count}")

def handle_file(filename: str, _args):
    print(f"Reading file: {filename}")
    mdl_data = extract_mdl_data(filename)

    filename_base, extension = os.path.splitext(
        os.path.basename(filename))
    output_filename = f"output/{filename_base}.obj"

    write_to_obj(mdl_data, output_filename)
    print(f"Wrote model data to {output_filename}")
    return True

def main():
    parser = argparse.ArgumentParser(description='...')
    parser.add_argument('path', help='The file or folder to process')
    validate_and_exec(parser, handle_file, '.mdl')

if __name__ == "__main__":
    main()

# Converts an item .mdl file from Silent Hill 2 (PC) to .obj.
# Not tested on characters.

import argparse
import os
import struct

def process_file(filename: str):
    MESH_DATA_MAGIC = b'\x03\x00\xff\xff'
    GEOMETRY_HEADER_OFFSET = 0x80
    TRIANGLE_INDEX_OFFSET = 0x10
    VERTEX_CHUNK_SIZE = 0x30
    UV_OFFSET = 0x14

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
        triangle_count = (vertex_data_start - triangle_index_start) // 2
        triangle_indices_bytes = file.read(triangle_count * 2)
        triangle_indices = struct.unpack(f"<{triangle_count}h", triangle_indices_bytes)
        print(f"Triangle count: {triangle_count}")

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

        print("Example vertices:")
        for i, vertex in enumerate(vertices[:5]):
            print(f"Vertex {i + 1}: X={vertex[0]}, Y={vertex[1]}, Z={vertex[2]}, W={vertex[3]}, U={vertex[4]}, V={vertex[5]}")
        
        print("Data seems OK!")
        return {"vertices": vertices, "triangles": triangle_indices}

def write_to_obj(mdl_data, path: str):
  vertices = mdl_data['vertices']
  triangles = mdl_data['triangles']
  with open(path, 'w') as f:
      for i, v in enumerate(vertices):
          (x, y, z, w, _, __) = v
          f.write(f'v  {x:.4f} {y:.4f} {z:.4f}\n')
      f.write('\n')

      for v in vertices:
          (x, y, z, w, u, v) = v
          f.write(f'vt {u} {v}\n')
      f.write('\n')

      # triangle strip
      true_face_count = 0
      for i in range(2, len(triangles)):
          v0, v1, v2 = triangles[i-2] + 1, triangles[i-1] + 1, triangles[i] + 1
          if v0 == v1 or v1 == v2 or v0 == v2:
              # remove degenerate triangles
              continue
          if i % 2 == 0:
              f.write(f'f  {v0} {v1} {v2}\n')
          else:
              f.write(f'f  {v2} {v1} {v0}\n')
          true_face_count += 1
      f.write('\n')
      print(f"Face count: {true_face_count}")

def validate_args(args):
    filename = args.filename
    
    # Check if file exists
    if not os.path.isfile(filename):
        raise argparse.ArgumentTypeError(f"{filename} does not exist or is not a valid file.")
    
    # Check file extension
    if not filename.lower().endswith('.mdl'):
        raise argparse.ArgumentTypeError(f"{filename} should have a .mdl extension.")

def main():
    parser = argparse.ArgumentParser(description='...')
    parser.add_argument('filename', help='The main file to process')
    
    args = parser.parse_args()
    
    # Validate arguments
    try:
        validate_args(args)
    except argparse.ArgumentTypeError as e:
        parser.error(e)
    
    filename_base, extension = os.path.splitext(os.path.basename(args.filename))
    output_filename = f"output/{filename_base}.obj"

    # Print and use the new filename
    print(f"Reading file: {args.filename}")
    mdl_data = process_file(args.filename)
    write_to_obj(mdl_data, output_filename)

if __name__ == "__main__":
    main()

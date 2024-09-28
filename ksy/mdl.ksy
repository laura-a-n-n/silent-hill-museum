meta:
  id: mdl
  title: Silent Hill 2 model format
  application: Silent Hill 2 (PC)
  file-extension: mdl
  endian: le

doc: |
  Mdl is the proprietary 3D model format of Silent Hill 2 (PC). It describes
  geometry, textures, skeleton data, and more. This structure does not describe
  the PS2 mdl format, yet.

seq:
  - id: header
    size: 64
    type: file_header
  - id: model_data
    type: model

instances:
  texture_data:
    pos: _root.header.texture_header_offset
    size-eos: true
    type: texture_data
    if: _root.header.texture_count > 0 and _root.header.no_texture_id == 0

types:
  file_header:
    seq:
      - id: no_texture_id
        type: u1
        doc: |
          Indicates whether this model has a texture associated with it? 
          True for models with "notex" in the filename, e.g. 
          "hll_jms_notex.mdl".
      - id: padding
        size: 3
      - id: character_id
        type: u4
        doc: Internal ID used by the game engine for this model.
      - id: texture_count
        type: u4
        doc: Number of textures in this model.
      - id: texture_header_offset
        type: u4
        doc: Absolute byte offset to the start of texture data.
      - id: model_header_offset
        type: u4
        doc: Absolute byte offset to the start of general model data.
      - id: kg1_header_offset
        type: u4
        doc: Absolute byte offset to the start of embedded shadow data.

  model:
    doc: Model container. All offsets are relative to the start of this header.
    seq:
      - id: magic
        contents: [0x03, 0x00, 0xff, 0xff]
        doc: And that's a magic number! It's 0x03 0x00 0xff 0xff.
      - id: model_version
        -orig-id: revision
        type: u4
      - id: initial_matrices_offset
        type: u4
        doc: Offset to initial bone matrices in model space.
      - id: bone_count
        type: u4
        doc: Number of bones.
      - id: skeleton_data_offset
        type: u4
        doc: Offset to skeleton data.
      - id: bone_pairs_count
        type: u4
        doc: Number of bone pairs (for linear blend skinning).
      - id: bone_pairs_offset
        type: u4
        doc: Offset to bone pairs, specified in pairs of bytes.
      - id: default_pcms_offset
        type: u4
        doc: Offset to default parent-child matrices for bone pairs.
      - id: primitive_headers_count
        type: u4
        doc: Number of disjoint primitives.
      - id: primitive_headers_offset
        type: u4
        doc: Offset to headers describing each primitive.
      - id: transparent_primitive_headers_count
        type: u4
        doc: |
          Number of transparent primitive headers, used for separate parts such
          as hair? On the PS2 version, this field is called "n_vu0_parts",
          suggesting that these were handled by the VU0 coprocessor, while
          the opaque primitive headers were handled by the VU1 coprocessor.
      - id: transparent_primitive_headers_offset
        type: u4
        doc: |
          Offset to transparent primitive headers, used for separate parts such
          as hair? On the PS2 version, this field is called "n_vu0_parts",
          suggesting that these were handled by the VU0 coprocessor, while
          the opaque primitive headers were handled by the VU1 coprocessor.
      - id: texture_blocks_count
        type: u4
        doc: Number of texture blocks.
      - id: texture_blocks_offset
        type: u4
        doc: Offset to the texture blocks.
      - id: texture_id_count
        type: u4
        doc: Number of unique texture IDs used by the game engine.
      - id: texture_id_offset
        type: u4
        doc: Offset to texture ID data.
      - id: junk_padding_offset
        type: u4
        doc: |
          Offset to a sequence of copied bytes used to pad out the file in the
          PC version. It starts copying from the start of this header until it
          reaches the cluster node data. On the PS2 version, this space is used
          for a block called "texture_id_params".
      - id: cluster_node_count
        type: u4
        doc: Number of cluster nodes for this object. Purpose unknown.
      - id: cluster_node_offset
        type: u4
        doc: Offset to cluster node data for this object. Purpose unknown.
      - id: cluster_count
        type: u4
        doc: Number of clusters for this object. Purpose unknown.
      - id: cluster_offset
        type: u4
        doc: Offset to func_data for this object. Purpose unknown.
      - id: func_data_count
        type: u4
        doc: Unknown count.
      - id: func_data_offset
        type: u4
        doc: Unknown offset.
      - id: hit_offset
        type: u4
        doc: Unknown offset.
      - id: box_offset
        type: u4
        doc: Unknown offset.
      - id: flag
        type: u4
        doc: Unknown flag.
      - id: relative_matrices_offset
        type: u4
        doc: Unknown offset.
      - id: relative_trans_offset
        type: u4
        doc: Unknown offset.
      - id: reserved
        size: 16
      - id: vertex_count
        type: u4
        doc: Number of vertices.
      - id: vertex_data_offset
        type: u4
        doc: Offset to vertex data.
      - id: transparent_vertex_count
        type: u4
        doc: Number of transparent vertices.
      - id: transparent_vertex_data_offset
        type: u4
        doc: Offset to transparent vertex data.
      - id: triangle_index_offset
        type: u4
        doc: Offset to triangle index data.
      - id: transparent_triangle_index_offset
        type: u4
        doc: Offset to transparent triangle index data.
      - id: opaque_cluster_map_count
        type: u4
        doc: Unknown original name.
      - id: transparent_cluster_map_count
        type: u4
        doc: Unknown original name.
      - id: cluster_map_offset
        type: u4
        doc: Unknown original name.
      - id: pad0
        size: 12
      - id: initial_matrices
        type: transformation_matrix
        repeat: expr
        repeat-expr: bone_count
        doc: |
          Matrices that represent the pose of each bone in model space. This is
          an array of matrices where `initial_matrices[i]` goes with bone `i`.
      - id: skeleton_tree
        type: u1
        repeat: expr
        repeat-expr: bone_count
        doc: |
          A graph having a tree structure that represents the skeleton. This is
          an array of indices where bone `i` is the parent of
          `skeleton_tree[i]`. If `skeleton_tree[i]` is 255, then the bone `i`
          represents a root node.
      - id: pad1
        type: u1
        repeat: expr
        repeat-expr: 16 - bone_count % 16
        if: bone_count % 16 > 0
      - id: bone_pairs
        type: skeleton_pair
        repeat: expr
        repeat-expr: bone_pairs_count
      - id: pad2
        type: u1
        repeat: expr
        repeat-expr: 16 - (2 * bone_pairs_count) % 16
        if: (2 * bone_pairs_count) % 16 > 0
      - id: default_pcms_matrices
        type: transformation_matrix
        repeat: expr
        repeat-expr: bone_pairs_count
        doc: |
          Matrices that represent relative transformations between bones. For
          index `i`, let `parent` equal `bone_pairs[i].parent` and `child`
          equal `bone_pairs[i].child`. Then `default_pcms_matrices[i]` is equal
          to `inverse(initial_matrices[child]) * initial_matrices[parent]`.
      - id: texture_metadata
        type: texture_metadata
        if: _root.header.texture_count > 0
    instances:
      junk_padding:
        pos: junk_padding_offset + 64
        size: cluster_node_offset - junk_padding_offset
      cluster_nodes:
        pos: cluster_node_offset + 64
        type: s2_vector
        if: cluster_node_count > 0
        repeat: expr
        repeat-expr: cluster_node_count
        doc: Morph targets for facial animation.
      cluster_node_normals:
        pos: cluster_node_offset + cluster_node_count * 6
          + 64 + cluster_node_padding_amount
        type: s2_vector
        repeat: expr
        repeat-expr: cluster_node_count
        if: cluster_nodes_have_normals
      cluster_nodes_have_normals:
        value: cluster_node_offset + cluster_node_count * 6
          + 64 + cluster_node_padding_amount != cluster_offset + 64
        doc: This is a helper, not part of the original mdl structure.
      cluster_node_normals_offset:
        value: cluster_node_offset + cluster_node_count * 6
          + 64 + cluster_node_padding_amount
        doc: This is a helper, not part of the original mdl structure.
      cluster_node_padding_amount:
        value: cluster_node_count % 8 != 0 ?
          (16 - cluster_node_count * 6 % 16):0
        doc: This is a helper, not part of the original mdl structure.
      clusters:
        pos: cluster_offset + 64
        type: cluster
        repeat: expr
        repeat-expr: cluster_count
        if: cluster_count > 0
      cluster_maps:
        pos: cluster_map_offset + 64
        type: cluster_maps
        doc: Unknown original name.
      geometry:
        pos: primitive_headers_offset + 64
        type: geometry
        doc: The start of the geometry data.

  cluster_maps:
    seq:
      - id: opaque
        type: cluster_mapping
        repeat: expr
        repeat-expr: _root.model_data.opaque_cluster_map_count
      - id: transparent
        type: cluster_mapping
        repeat: expr
        repeat-expr: _root.model_data.transparent_cluster_map_count
  cluster_mapping:
    seq:
      - id: source_start_index
        type: u2
      - id: target_start_index
        type: u2
      - id: count
        type: u2
    doc: Unknown original IDs for all properties.
  cluster:
    seq:
      - id: node_count
        type: u4
        -orig-id: n_nodes
      - id: offset
        type: u4
        -orig-id: element_offset
    instances:
      data:
        pos: offset + 64
        type: cluster_data_list
  cluster_data_list:
    seq:
      - id: vertices
        type: cluster_data
        repeat: expr
        repeat-expr: _parent.node_count
      - id: alignment
        size: 16 - (_io.pos % 16)
        if: _io.pos % 16 != 0
      - id: normals
        type: cluster_data
        if: _root.model_data.cluster_nodes_have_normals
        repeat: expr
        repeat-expr: _parent.node_count
  cluster_data:
    seq:
      - id: vector
        type: s2_vector
      - id: vertex_index
        type: s2

  geometry:
    seq:
      - id: primitive_headers
        type: primitive_header_wrapper
        repeat: expr
        repeat-expr: _root.model_data.primitive_headers_count
      - id: triangle_indices
        type: index_list
        # This field has silly formatting to get the parser to work right?
        size: (_root.model_data.vertex_data_offset >
          _root.model_data.transparent_primitive_headers_offset ?
          _root.model_data.transparent_primitive_headers_offset
          :_root.model_data.vertex_data_offset) -
          _root.model_data.triangle_index_offset
        doc: List of vertex indices, which represent triangle strips.
    instances:
      vertex_list:
        type: vertex_data
        pos: _root.model_data.vertex_data_offset + 64
        repeat: expr
        repeat-expr: _root.model_data.vertex_count
      transparent_primitive_headers:
        type: transparent_primitive_header_wrapper
        pos: _root.model_data.transparent_primitive_headers_offset + 64
        repeat: expr
        repeat-expr: _root.model_data.transparent_primitive_headers_count
        if: _root.model_data.transparent_primitive_headers_count > 0
      transparent_triangle_indices:
        type: index_list
        pos: _root.model_data.transparent_triangle_index_offset + 64
        size: _root.model_data.transparent_vertex_data_offset -
          _root.model_data.transparent_triangle_index_offset
        doc: List of vertex indices, which represent triangle strips.
        if: _root.model_data.transparent_primitive_headers_count > 0
      transparent_vertex_list:
        type: transparent_vertex_data
        pos: _root.model_data.transparent_vertex_data_offset + 64
        repeat: expr
        repeat-expr: _root.model_data.transparent_vertex_count
        if: _root.model_data.transparent_primitive_headers_count > 0

  vertex_data:
    seq:
      - id: x
        type: f4
        doc: The x-coordinate of the vertex.
      - id: y
        type: f4
        doc: The y-coordinate of the vertex.
      - id: z
        type: f4
        doc: The z-coordinate of the vertex.
      - id: bone_weight_0
        type: f4
        valid:
          min: 0
          max: 1
        doc: The first bone weight of the vertex.
      - id: bone_weight_1
        type: f4
        valid:
          min: 0
          max: 1
        doc: The second bone weight of the vertex.
      - id: bone_weight_2
        type: f4
        valid:
          min: 0
          max: 1
        doc: The third bone weight of the vertex.
      - id: bone_weight_3
        type: f4
        valid:
          min: 0
          max: 1
        doc: The fourth bone weight of the vertex.
      - id: normals
        type: s2
        repeat: expr
        repeat-expr: 3
      - id: alignment
        type: u2
        valid: 0
      - id: u
        type: f4
        doc: The texture coordinate along the horizontal axis (x), from 0 to 1.
      - id: v
        type: f4
        doc: The texture coordinate along the vertical axis (y), from 0 to 1.
      - id: bone_index_0
        type: u1
        doc: |
          The first bone index. This indexes into the primitive bone array, not
          the overall skeleton array!
      - id: bone_index_1
        type: u1
        valid:
          expr: bone_index_1 == 0 or bone_index_1 == 255 or bone_weight_1 > 0
        doc: |
          The second bone (or bone pair?) index.
      - id: bone_index_2
        type: u1
        valid:
          expr: bone_index_2 == 0 or bone_index_2 == 255 or bone_weight_2 > 0
        doc: |
          The third bone (or bone pair?) index.
      - id: bone_index_3
        type: u1
        valid:
          expr: bone_index_3 == 0 or bone_index_3 == 255 or bone_weight_3 > 0
        doc: |
          The fourth bone (or bone pair?) index.
  skeleton_pair:
    seq:
      - id: parent
        type: u1
      - id: child
        type: u1
    doc: Represents a parent-child bone relationship.

  primitive_header_wrapper:
    seq:
      - id: primitive_header_size
        type: u4
      - id: body
        size: primitive_header_size - 4
        type: primitive_header
  primitive_header:
    doc: |
      Description for a primitive, in the OpenGL sense of the word
      "primitive". In this case, the primitives are triangle strips, but
      the triangle list can contain degenerate triangles that are used to
      separate strips.
    seq:
      - id: pad0
        size: 4
      - id: bone_count
        type: u4
        doc: Number of bones that this primitive depends on.
      - id: bone_indices_offset
        type: u4
        doc: Offset from this header to a bone list. See bone_indices.
      - id: bone_pairs_count
        type: u4
        doc: Number of bone pairs that this primitive depends on.
      - id: bone_pairs_offset
        type: u4
        doc: Offset to a bone pair indices list. See bone_pair_indices.
      - id: texture_index_count
        type: u4
        doc: Appears to be the texture indices for this primitive?
      - id: texture_index_offset
        type: u4
        doc: Appears to be the texture index offset for this primitive?
      - id: sampler_states_offset
        type: u4
        doc: |
          From FF24, this is an offset to ADDRESSU, ADDRESSV, MAGFILTER and 
          MINFILTER sampler states.
      - id: material_type
        type: u1
        enum: material_type
        doc: See FrozenFish24's SH2MapTools/Sh2ModelMaterialEditor/Model.py#L75
      - id: unknown_byte0
        type: u1
        doc: Possibly material-related, see `material_type`.
      - id: pose_index
        type: u1
        doc: |
          If zero, this primitive is always visible. Otherwise, it may be
          hidden and swapped out at various times, e.g. for James's hands.
      - id: unknown_byte1
        type: u1
      - id: backface_culling
        type: u4
      - id: unknown_float0
        type: f4
        doc: From FF24, reported to affect diffuse color somehow.
      - id: unknown_float1
        type: f4
        doc: From FF24, reported to affect ambient color somehow.
      - id: specular_scale
        type: f4
        doc: From FF24, larger value = smaller specular.
      - id: unknown_section0
        size: 8
        doc: Unknown purpose.
      - id: pad1
        size: 4
      - id: diffuse_color
        type: f4
        repeat: expr
        repeat-expr: 3
        doc: From FF24, this is the diffuse color.
      - id: pad2
        size: 4
      - id: ambient_color
        type: f4
        repeat: expr
        repeat-expr: 3
        doc: From FF24, this is the ambient color.
      - id: pad3
        size: 4
      - id: specular_color
        type: f4
        repeat: expr
        repeat-expr: 3
        doc: From FF24, this is the specular color (range 0-128).
      - id: pad4
        size: 4
      - id: primitive_start_index
        type: u4
        doc: Offset into the triangle index array where the primitive begins.
      - id: primitive_length
        type: u4
        doc: The length of the primitive in the triangle index array.
      - id: pad5
        size: 4
      - id: bone_indices
        type: u2
        repeat: expr
        repeat-expr: bone_count
        doc: |
          The bone index array from this primitive. An important point is that
          the bone indices specified by a given vertex go into this array, not
          the overall skeleton array. Unclear why these are u2 if bones are u1?
    instances:
      bone_pair_indices:
        pos: bone_pairs_offset - 4
        size: bone_pairs_count * 2
        type: index_list
        doc: |
          A list of bone pair indices. See bone_indices doc comment, a similar
          concept applies.
      texture_indices:
        pos: texture_index_offset - 4
        size: texture_index_count * 2
        type: index_list
        doc: A list of texture indices? TODO
      sampler_states:
        pos: sampler_states_offset - 4
        type: u1
        repeat: expr
        repeat-expr: 4
    enums:
      material_type:
        1: unlit
        2: matte
        3: matte_plus
        4: glossy

  transparent_primitive_header_wrapper:
    seq:
      - id: transparent_primitive_header_size
        type: u4
      - id: body
        size: transparent_primitive_header_size - 4
        type: transparent_primitive_header
  transparent_primitive_header:
    seq:
      - id: pad0
        size: 4
      - id: texture_index_count
        type: u4
        doc: There's only ever one, so could be wrong?
      - id: texture_index_offset
        type: u4
      - id: marker_offset
        type: u4
      - id: unknown_count
        type: u4
      - id: unknown_section0
        size: 24
      - id: pad1
        type: u4
      - id: unknown_floats0
        type: f4
        repeat: expr
        repeat-expr: 3
      - id: pad2
        type: u4
      - id: unknown_floats1
        type: f4
        repeat: expr
        repeat-expr: 3
      - id: unknown_section1
        size: 20
      - id: primitive_start_index
        type: u4
        doc: Offset into the triangle index array where the primitive begins.
      - id: primitive_length
        type: u4
        doc: The length of the primitive in the triangle index array.
      - id: primitive_index
        type: u4
        doc: Appears to be an array index for this primitive header.
      - id: texture_index
        type: u4
      - id: pad3
        size: 12
      - id: marker
        size: 4
        doc: |
          And that's a--an almost... magic... number...? Turns out this can be
          [0x03, 0x03, 0x02, 0x02], or [0x03, 0x03, 0x01, 0x01].
  transparent_vertex_data:
    seq:
      - id: x
        type: f4
        doc: The x-coordinate of the vertex.
      - id: y
        type: f4
        doc: The y-coordinate of the vertex.
      - id: z
        type: f4
        doc: The z-coordinate of the vertex.
      - id: w
        type: f4
        valid: 1
      - id: bone_weights
        type: f4
        repeat: expr
        repeat-expr: 4
      - id: normal_x
        type: f4
        doc: The x-coordinate of the normal vector.
      - id: normal_y
        type: f4
        doc: The y-coordinate of the normal vector.
      - id: normal_z
        type: f4
        valid:
          expr: normal_x*normal_x + normal_y*normal_y + normal_z*normal_z -
            1.0 < 0.05
        doc: The z-coordinate of the normal vector.
      - id: unknown1
        size: 4
      - id: u
        type: f4
        doc: The texture coordinate along the horizontal axis (x), from 0 to 1.
      - id: v
        type: f4
        doc: The texture coordinate along the vertical axis (y), from 0 to 1.
      - id: unknown2
        size: 8
      - id: bone_index
        type: u1
      - id: unknown3
        type: u1
      - id: bone_pair_index0
        type: u1
      - id: unknown4
        type: u1
      - id: bone_pair_index1
        type: u1
      - id: unknown5
        type: u1
      - id: bone_pair_index2
        type: u1
      - id: unknown6
        type: u1
  texture_data:
    seq:
      - id: magic
        contents: [0x01, 0x09, 0x99, 0x19]
        doc: And that's a magic number!
      - id: unknown
        size: 12
      - id: textures
        type: texture_container
        repeat: expr
        repeat-expr: _root.header.texture_count
  texture_container:
    seq:
      - id: texture_id
        type: u4
      - id: width
        type: u2
      - id: height
        type: u2
      - id: width2
        type: u2
      - id: height2
        type: u2
      - id: sprite_count
        type: u2
      - id: unknown_section
        size: 18
      - id: sprite_headers
        type: sprite_header
        repeat: expr
        repeat-expr: sprite_count
      - id: data
        size: sprite_headers[0].format.to_i != 0 ?
          width*height:width*height/2
  sprite_header:
    seq:
      - id: sprite_id
        type: u4
      - id: x
        type: u2
      - id: y
        type: u2
      - id: width
        type: u2
      - id: height
        type: u2
      - id: format
        type: u1
        enum: texture_format
      - id: unknown0
        type: u1
      - id: importance
        type: u2
      - id: data_size
        type: u4
        doc: Unknown purpose.
      - id: all_size
        type: u4
        doc: Unknown purpose.
      - id: pad
        size: 4
      - id: unknown1
        -orig-id: bitw
        type: u1
      - id: unknown2
        -orig-id: bith
        type: u1
      - id: end_magic
        -orig-id: marker
        type: u2
    enums:
      texture_format:
        0: dxt1
        1: dxt2
        2: dxt3
        3: dxt4
        4: dxt5
        8: paletted
        24: rgbx8
        32: rgba8

  texture_metadata:
    seq:
      - id: main_texture_ids
        type: u4
        repeat: expr
        repeat-expr: _parent.texture_blocks_count
        doc: TODO
      - id: pad
        size: 16 - (4 * _parent.texture_blocks_count) % 16
        if: _parent.texture_blocks_count % 4 > 0
      - id: texture_pairs
        type: texture_pair
        repeat: expr
        repeat-expr: _parent.texture_id_count
        doc: TODO
  texture_pair:
    doc: TODO
    seq:
      - id: texture_index
        type: u4
      - id: sprite_id
        type: u4
        valid:
          min: 1

  index_list:
    seq:
      - id: array
        type: u2
        repeat: eos
  s2_vector:
    seq:
      - id: x
        type: s2
      - id: y
        type: s2
      - id: z
        type: s2
  transformation_matrix:
    doc: |
      Represents a 4x4 column-major transformation matrix.
    seq:
      - id: rotation00
        type: f4
      - id: rotation10
        type: f4
      - id: rotation20
        type: f4
      - id: pad0
        type: f4
        valid: 0
      - id: rotation01
        type: f4
      - id: rotation11
        type: f4
      - id: rotation21
        type: f4
      - id: pad1
        type: f4
        valid: 0
      - id: rotation02
        type: f4
      - id: rotation12
        type: f4
      - id: rotation22
        type: f4
      - id: pad2
        type: f4
        valid: 0
      - id: translation_x
        type: f4
      - id: translation_y
        type: f4
      - id: translation_z
        type: f4
      - id: translation_w
        type: f4
        valid: 1

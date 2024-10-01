// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild


/**
 * Mdl is the proprietary 3D model format of Silent Hill 2 (PC). It describes
 * geometry, textures, skeleton data, and more. This structure does not describe
 * the PS2 mdl format, yet.
 */
declare class Mdl {
  constructor(io: any, parent?: any, root?: any);
  __type: 'Mdl';
  _io: any;
  _read: () => void;
  _fetchInstances: () => void;
  _write__seq: (_io: KaitaiStream) => void;
  _writeBackChildStreams: () => void;

  textureData: Mdl.TextureData;
  header: Mdl.FileHeader;
  modelData: Mdl.Model;
  _raw_header: Uint8Array;
  _raw__m_textureData: Uint8Array;
}

declare namespace Mdl {
  class Cluster {
    constructor(io: any, parent?: any, root?: any);
    __type: 'Cluster';
    _io: any;

    data: Mdl.ClusterDataList;
    nodeCount: number;
    offset: number;
  }
}

declare namespace Mdl {
  class ClusterData {
    constructor(io: any, parent?: any, root?: any);
    __type: 'ClusterData';
    _io: any;

    vector: Mdl.S2Vector;
    vertexIndex: number;
  }
}

declare namespace Mdl {
  class ClusterDataList {
    constructor(io: any, parent?: any, root?: any);
    __type: 'ClusterDataList';
    _io: any;

    vertices: Mdl.ClusterData[];
    alignment: Uint8Array;
    normals: Mdl.ClusterData[];
  }
}


/**
 * Unknown original IDs for all properties.
 */
declare namespace Mdl {
  class ClusterMapping {
    constructor(io: any, parent?: any, root?: any);
    __type: 'ClusterMapping';
    _io: any;

    sourceStartIndex: number;
    targetStartIndex: number;
    count: number;
  }
}

declare namespace Mdl {
  class ClusterMaps {
    constructor(io: any, parent?: any, root?: any);
    __type: 'ClusterMaps';
    _io: any;

    opaque: Mdl.ClusterMapping[];
    transparent: Mdl.ClusterMapping[];
  }
}

declare namespace Mdl {
  class FileHeader {
    constructor(io: any, parent?: any, root?: any);
    __type: 'FileHeader';
    _io: any;


    /**
     * Indicates whether this model has a texture associated with it? 
     * True for models with "notex" in the filename, e.g. 
     * "hll_jms_notex.mdl".
     */
    noTextureId: number;
    padding: Uint8Array;

    /**
     * Internal ID used by the game engine for this model.
     */
    characterId: number;

    /**
     * Number of textures in this model.
     */
    textureCount: number;

    /**
     * Absolute byte offset to the start of texture data.
     */
    textureHeaderOffset: number;

    /**
     * Absolute byte offset to the start of general model data.
     */
    modelHeaderOffset: number;

    /**
     * Absolute byte offset to the start of embedded shadow data.
     */
    kg1HeaderOffset: number;
  }
}

declare namespace Mdl {
  class Geometry {
    constructor(io: any, parent?: any, root?: any);
    __type: 'Geometry';
    _io: any;

    transparentPrimitiveHeaders: Mdl.TransparentPrimitiveHeaderWrapper[];

    /**
     * List of vertex indices, which represent triangle strips.
     */
    transparentTriangleIndices: Mdl.IndexList;
    transparentVertexList: Mdl.TransparentVertexData[];
    vertexList: Mdl.VertexData[];
    primitiveHeaders: Mdl.PrimitiveHeaderWrapper[];

    /**
     * List of vertex indices, which represent triangle strips.
     */
    triangleIndices: Mdl.IndexList;
    _raw_triangleIndices: Uint8Array;
    _raw__m_transparentTriangleIndices: Uint8Array;
  }
}

declare namespace Mdl {
  class IndexList {
    constructor(io: any, parent?: any, root?: any);
    __type: 'IndexList';
    _io: any;

    array: number[];
  }
}


/**
 * Model container. All offsets are relative to the start of this header.
 */
declare namespace Mdl {
  class Model {
    constructor(io: any, parent?: any, root?: any);
    __type: 'Model';
    _io: any;


    /**
     * Unknown original name.
     */
    clusterMaps: Mdl.ClusterMaps;
    clusterNodeNormals: Mdl.S2Vector[];

    /**
     * This is a helper, not part of the original mdl structure.
     */
    clusterNodeNormalsOffset: number;

    /**
     * This is a helper, not part of the original mdl structure.
     */
    clusterNodePaddingAmount: number;

    /**
     * Morph targets for facial animation.
     */
    clusterNodes: Mdl.S2Vector[];

    /**
     * This is a helper, not part of the original mdl structure.
     */
    clusterNodesHaveNormals: boolean;
    clusters: Mdl.Cluster[];

    /**
     * The start of the geometry data.
     */
    geometry: Mdl.Geometry;

    /**
     * And that's a magic number! It's 0x03 0x00 0xff 0xff.
     */
    magic: Uint8Array;
    modelVersion: number;

    /**
     * Offset to initial bone matrices in model space.
     */
    initialMatricesOffset: number;

    /**
     * Number of bones.
     */
    boneCount: number;

    /**
     * Offset to skeleton data.
     */
    skeletonDataOffset: number;

    /**
     * Number of bone pairs (for linear blend skinning).
     */
    bonePairsCount: number;

    /**
     * Offset to bone pairs, specified in pairs of bytes.
     */
    bonePairsOffset: number;

    /**
     * Offset to default parent-child matrices for bone pairs.
     */
    defaultPcmsOffset: number;

    /**
     * Number of disjoint primitives.
     */
    primitiveHeadersCount: number;

    /**
     * Offset to headers describing each primitive.
     */
    primitiveHeadersOffset: number;

    /**
     * Number of transparent primitive headers, used for separate parts such
     * as hair? On the PS2 version, this field is called "n_vu0_parts",
     * suggesting that these were handled by the VU0 coprocessor, while
     * the opaque primitive headers were handled by the VU1 coprocessor.
     */
    transparentPrimitiveHeadersCount: number;

    /**
     * Offset to transparent primitive headers, used for separate parts such
     * as hair? On the PS2 version, this field is called "n_vu0_parts",
     * suggesting that these were handled by the VU0 coprocessor, while
     * the opaque primitive headers were handled by the VU1 coprocessor.
     */
    transparentPrimitiveHeadersOffset: number;

    /**
     * Number of texture blocks.
     */
    textureBlocksCount: number;

    /**
     * Offset to the texture blocks.
     */
    textureBlocksOffset: number;

    /**
     * Number of unique texture IDs used by the game engine.
     */
    textureIdCount: number;

    /**
     * Offset to texture ID data.
     */
    textureIdOffset: number;

    /**
     * Offset to a sequence of copied bytes used to pad out the file in the
     * PC version. It starts copying from the start of this header until it
     * reaches the cluster node data. On the PS2 version, this space is used
     * for a block called "texture_id_params".
     */
    junkPaddingOffset: number;

    /**
     * Number of cluster nodes for this object. Purpose unknown.
     */
    clusterNodeCount: number;

    /**
     * Offset to cluster node data for this object. Purpose unknown.
     */
    clusterNodeOffset: number;

    /**
     * Number of clusters for this object. Purpose unknown.
     */
    clusterCount: number;

    /**
     * Offset to func_data for this object. Purpose unknown.
     */
    clusterOffset: number;

    /**
     * Unknown count.
     */
    funcDataCount: number;

    /**
     * Unknown offset.
     */
    funcDataOffset: number;

    /**
     * Unknown offset.
     */
    hitOffset: number;

    /**
     * Unknown offset.
     */
    boxOffset: number;

    /**
     * Unknown flag.
     */
    flag: number;

    /**
     * Unknown offset.
     */
    relativeMatricesOffset: number;

    /**
     * Unknown offset.
     */
    relativeTransOffset: number;
    reserved: Uint8Array;

    /**
     * Number of vertices.
     */
    vertexCount: number;

    /**
     * Offset to vertex data.
     */
    vertexDataOffset: number;

    /**
     * Number of transparent vertices.
     */
    transparentVertexCount: number;

    /**
     * Offset to transparent vertex data.
     */
    transparentVertexDataOffset: number;

    /**
     * Offset to triangle index data.
     */
    triangleIndexOffset: number;

    /**
     * Offset to transparent triangle index data.
     */
    transparentTriangleIndexOffset: number;

    /**
     * Unknown original name.
     */
    opaqueClusterMapCount: number;

    /**
     * Unknown original name.
     */
    transparentClusterMapCount: number;

    /**
     * Unknown original name.
     */
    clusterMapOffset: number;
    pad0: Uint8Array;

    /**
     * Matrices that represent the pose of each bone in model space. This is
     * an array of matrices where `initial_matrices[i]` goes with bone `i`.
     */
    initialMatrices: Mdl.TransformationMatrix[];

    /**
     * A graph having a tree structure that represents the skeleton. This is
     * an array of indices where bone `i` is the parent of
     * `skeleton_tree[i]`. If `skeleton_tree[i]` is 255, then the bone `i`
     * represents a root node.
     */
    skeletonTree: number[];
    pad1: number[];
    bonePairs: Mdl.SkeletonPair[];
    pad2: number[];

    /**
     * Matrices that represent relative transformations between bones. For
     * index `i`, let `parent` equal `bone_pairs[i].parent` and `child`
     * equal `bone_pairs[i].child`. Then `default_pcms_matrices[i]` is equal
     * to `inverse(initial_matrices[child]) * initial_matrices[parent]`.
     */
    defaultPcmsMatrices: Mdl.TransformationMatrix[];
    textureMetadata: Mdl.TextureMetadata;
  }
}


/**
 * Description for a primitive, in the OpenGL sense of the word
 * "primitive". In this case, the primitives are triangle strips, but
 * the triangle list can contain degenerate triangles that are used to
 * separate strips.
 */
declare namespace Mdl {
  class PrimitiveHeader {
    constructor(io: any, parent?: any, root?: any);
    __type: 'PrimitiveHeader';
    _io: any;


    /**
     * A list of bone pair indices. See bone_indices doc comment, a similar
     * concept applies.
     */
    bonePairIndices: Mdl.IndexList;
    samplerStates: number[];

    /**
     * A list of texture indices? TODO
     */
    textureIndices: Mdl.IndexList;
    pad0: Uint8Array;

    /**
     * Number of bones that this primitive depends on.
     */
    boneCount: number;

    /**
     * Offset from this header to a bone list. See bone_indices.
     */
    boneIndicesOffset: number;

    /**
     * Number of bone pairs that this primitive depends on.
     */
    bonePairsCount: number;

    /**
     * Offset to a bone pair indices list. See bone_pair_indices.
     */
    bonePairsOffset: number;

    /**
     * Appears to be the texture indices for this primitive?
     */
    textureIndexCount: number;

    /**
     * Appears to be the texture index offset for this primitive?
     */
    textureIndexOffset: number;

    /**
     * From FF24, this is an offset to ADDRESSU, ADDRESSV, MAGFILTER and 
     * MINFILTER sampler states.
     */
    samplerStatesOffset: number;

    /**
     * See FrozenFish24's SH2MapTools/Sh2ModelMaterialEditor/Model.py#L75
     */
    materialType: Mdl.PrimitiveHeader.MaterialType;

    /**
     * Possibly material-related, see `material_type`.
     */
    unknownByte0: number;

    /**
     * If zero, this primitive is always visible. Otherwise, it may be
     * hidden and swapped out at various times, e.g. for James's hands.
     */
    poseIndex: number;
    unknownByte1: number;
    backfaceCulling: number;

    /**
     * From FF24, reported to affect diffuse color somehow.
     */
    unknownFloat0: number;

    /**
     * From FF24, reported to affect ambient color somehow.
     */
    unknownFloat1: number;

    /**
     * From FF24, larger value = smaller specular.
     */
    specularScale: number;

    /**
     * Unknown purpose.
     */
    unknownSection0: Uint8Array;
    pad1: Uint8Array;

    /**
     * From FF24, this is the diffuse color.
     */
    diffuseColor: number[];
    pad2: Uint8Array;

    /**
     * From FF24, this is the ambient color.
     */
    ambientColor: number[];
    pad3: Uint8Array;

    /**
     * From FF24, this is the specular color (range 0-128).
     */
    specularColor: number[];
    pad4: Uint8Array;

    /**
     * Offset into the triangle index array where the primitive begins.
     */
    primitiveStartIndex: number;

    /**
     * The length of the primitive in the triangle index array.
     */
    primitiveLength: number;
    pad5: Uint8Array;

    /**
     * The bone index array from this primitive. An important point is that
     * the bone indices specified by a given vertex go into this array, not
     * the overall skeleton array. Unclear why these are u2 if bones are u1?
     */
    boneIndices: number[];
    _raw__m_bonePairIndices: Uint8Array;
    _raw__m_textureIndices: Uint8Array;
  }
}

declare namespace Mdl {
  namespace PrimitiveHeader {
    enum MaterialType {
      UNLIT = 1,
      MATTE = 2,
      MATTE_PLUS = 3,
      GLOSSY = 4,
    }
  }
}

declare namespace Mdl {
  class PrimitiveHeaderWrapper {
    constructor(io: any, parent?: any, root?: any);
    __type: 'PrimitiveHeaderWrapper';
    _io: any;

    primitiveHeaderSize: number;
    body: Mdl.PrimitiveHeader;
    _raw_body: Uint8Array;
  }
}

declare namespace Mdl {
  class S2Vector {
    constructor(io: any, parent?: any, root?: any);
    __type: 'S2Vector';
    _io: any;

    x: number;
    y: number;
    z: number;
  }
}


/**
 * Represents a parent-child bone relationship.
 */
declare namespace Mdl {
  class SkeletonPair {
    constructor(io: any, parent?: any, root?: any);
    __type: 'SkeletonPair';
    _io: any;

    parent: number;
    child: number;
  }
}

declare namespace Mdl {
  class SpriteHeader {
    constructor(io: any, parent?: any, root?: any);
    __type: 'SpriteHeader';
    _io: any;

    spriteId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    format: Mdl.SpriteHeader.TextureFormat;
    unknown0: number;
    importance: number;

    /**
     * Unknown purpose.
     */
    dataSize: number;

    /**
     * Unknown purpose.
     */
    allSize: number;
    pad: Uint8Array;
    unknown1: number;
    unknown2: number;
    endMagic: number;
  }
}

declare namespace Mdl {
  namespace SpriteHeader {
    enum TextureFormat {
      DXT1 = 0,
      DXT2 = 1,
      DXT3 = 2,
      DXT4 = 3,
      DXT5 = 4,
      PALETTED = 8,
      RGBX8 = 24,
      RGBA8 = 32,
    }
  }
}

declare namespace Mdl {
  class TextureContainer {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TextureContainer';
    _io: any;

    textureId: number;
    width: number;
    height: number;
    width2: number;
    height2: number;
    spriteCount: number;
    unknownSection: Uint8Array;
    spriteHeaders: Mdl.SpriteHeader[];
    data: Uint8Array;
  }
}

declare namespace Mdl {
  class TextureData {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TextureData';
    _io: any;


    /**
     * And that's a magic number!
     */
    magic: Uint8Array;
    unknown: Uint8Array;
    textures: Mdl.TextureContainer[];
  }
}

declare namespace Mdl {
  class TextureMetadata {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TextureMetadata';
    _io: any;


    /**
     * TODO
     */
    mainTextureIds: number[];
    pad: Uint8Array;

    /**
     * TODO
     */
    texturePairs: Mdl.TexturePair[];
  }
}


/**
 * TODO
 */
declare namespace Mdl {
  class TexturePair {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TexturePair';
    _io: any;

    textureIndex: number;
    spriteId: number;
  }
}


/**
 * Represents a 4x4 column-major transformation matrix.
 */
declare namespace Mdl {
  class TransformationMatrix {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TransformationMatrix';
    _io: any;

    rotation00: number;
    rotation10: number;
    rotation20: number;
    pad0: number;
    rotation01: number;
    rotation11: number;
    rotation21: number;
    pad1: number;
    rotation02: number;
    rotation12: number;
    rotation22: number;
    pad2: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    translationW: number;
  }
}

declare namespace Mdl {
  class TransparentPrimitiveHeader {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TransparentPrimitiveHeader';
    _io: any;

    pad0: Uint8Array;

    /**
     * There's only ever one, so could be wrong?
     */
    textureIndexCount: number;
    textureIndexOffset: number;
    markerOffset: number;
    unknownCount: number;
    unknownSection0: Uint8Array;
    pad1: number;
    unknownFloats0: number[];
    pad2: number;
    unknownFloats1: number[];
    unknownSection1: Uint8Array;

    /**
     * Offset into the triangle index array where the primitive begins.
     */
    primitiveStartIndex: number;

    /**
     * The length of the primitive in the triangle index array.
     */
    primitiveLength: number;

    /**
     * Appears to be an array index for this primitive header.
     */
    primitiveIndex: number;
    textureIndex: number;
    pad3: Uint8Array;

    /**
     * And that's a--an almost... magic... number...? Turns out this can be
     * [0x03, 0x03, 0x02, 0x02], or [0x03, 0x03, 0x01, 0x01].
     */
    marker: Uint8Array;
  }
}

declare namespace Mdl {
  class TransparentPrimitiveHeaderWrapper {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TransparentPrimitiveHeaderWrapper';
    _io: any;

    transparentPrimitiveHeaderSize: number;
    body: Mdl.TransparentPrimitiveHeader;
    _raw_body: Uint8Array;
  }
}

declare namespace Mdl {
  class TransparentVertexData {
    constructor(io: any, parent?: any, root?: any);
    __type: 'TransparentVertexData';
    _io: any;


    /**
     * The x-coordinate of the vertex.
     */
    x: number;

    /**
     * The y-coordinate of the vertex.
     */
    y: number;

    /**
     * The z-coordinate of the vertex.
     */
    z: number;
    w: number;
    boneWeights: number[];

    /**
     * The x-coordinate of the normal vector.
     */
    normalX: number;

    /**
     * The y-coordinate of the normal vector.
     */
    normalY: number;

    /**
     * The z-coordinate of the normal vector.
     */
    normalZ: number;
    unknown1: Uint8Array;

    /**
     * The texture coordinate along the horizontal axis (x), from 0 to 1.
     */
    u: number;

    /**
     * The texture coordinate along the vertical axis (y), from 0 to 1.
     */
    v: number;
    unknown2: Uint8Array;
    boneIndex: number;
    unknown3: number;
    bonePairIndex0: number;
    unknown4: number;
    bonePairIndex1: number;
    unknown5: number;
    bonePairIndex2: number;
    unknown6: number;
  }
}

declare namespace Mdl {
  class VertexData {
    constructor(io: any, parent?: any, root?: any);
    __type: 'VertexData';
    _io: any;


    /**
     * The x-coordinate of the vertex.
     */
    x: number;

    /**
     * The y-coordinate of the vertex.
     */
    y: number;

    /**
     * The z-coordinate of the vertex.
     */
    z: number;

    /**
     * The first bone weight of the vertex.
     */
    boneWeight0: number;

    /**
     * The second bone weight of the vertex.
     */
    boneWeight1: number;

    /**
     * The third bone weight of the vertex.
     */
    boneWeight2: number;

    /**
     * The fourth bone weight of the vertex.
     */
    boneWeight3: number;
    normals: number[];
    alignment: number;

    /**
     * The texture coordinate along the horizontal axis (x), from 0 to 1.
     */
    u: number;

    /**
     * The texture coordinate along the vertical axis (y), from 0 to 1.
     */
    v: number;

    /**
     * The first bone index. This indexes into the primitive bone array, not
     * the overall skeleton array!
     */
    boneIndex0: number;

    /**
     * The second bone (or bone pair?) index.
     */
    boneIndex1: number;

    /**
     * The third bone (or bone pair?) index.
     */
    boneIndex2: number;

    /**
     * The fourth bone (or bone pair?) index.
     */
    boneIndex3: number;
  }
}

export = Mdl;
export as namespace Mdl;

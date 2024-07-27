// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.Mdl = factory(root.KaitaiStream);
  }
}(typeof self !== 'undefined' ? self : this, function (KaitaiStream) {
/**
 * Mdl is the proprietary 3D model format of Silent Hill 2 (PC). It describes
 * geometry, textures, skeleton data, and more. This structure does not describe
 * the PS2 mdl format, yet.
 */

var Mdl = (function() {
  function Mdl(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Mdl.prototype._read = function() {
    this._raw_header = this._io.readBytes(64);
    var _io__raw_header = new KaitaiStream(this._raw_header);
    this.header = new FileHeader(_io__raw_header, this, this._root);
    this.modelData = new Model(this._io, this, this._root);
  }

  var SecondaryPrimitiveHeader = Mdl.SecondaryPrimitiveHeader = (function() {
    function SecondaryPrimitiveHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SecondaryPrimitiveHeader.prototype._read = function() {
      this.pad0 = this._io.readBytes(4);
      this.textureIndexCount = this._io.readU4le();
      this.textureIndexOffset = this._io.readU4le();
      this.markerOffset = this._io.readU4le();
      this.unknownCount = this._io.readU4le();
      this.unknownSection0 = this._io.readBytes(24);
      this.pad1 = this._io.readU4le();
      this.unknownFloats0 = [];
      for (var i = 0; i < 3; i++) {
        this.unknownFloats0.push(this._io.readF4le());
      }
      this.pad2 = this._io.readU4le();
      this.unknownFloats1 = [];
      for (var i = 0; i < 3; i++) {
        this.unknownFloats1.push(this._io.readF4le());
      }
      this.unknownSection1 = this._io.readBytes(20);
      this.primitiveStartIndex = this._io.readU4le();
      this.primitiveLength = this._io.readU4le();
      this.primitiveIndex = this._io.readU4le();
      this.textureIndex = this._io.readU4le();
      this.pad3 = this._io.readBytes(12);
      this.marker = this._io.readBytes(4);
    }

    /**
     * There's only ever one, so could be wrong?
     */

    /**
     * Offset into the triangle index array where the primitive begins.
     */

    /**
     * The length of the primitive in the triangle index array.
     */

    /**
     * Appears to be an array index for this primitive header.
     */

    /**
     * And that's a--an almost... magic... number...? Turns out this can be
     * [0x03, 0x03, 0x02, 0x02], or [0x03, 0x03, 0x01, 0x01].
     */

    return SecondaryPrimitiveHeader;
  })();

  var SpriteHeader = Mdl.SpriteHeader = (function() {
    SpriteHeader.TextureFormat = Object.freeze({
      DXT1: 0,
      DXT2: 1,
      DXT3: 2,
      DXT4: 3,
      DXT5: 4,
      PALETTED: 8,
      RGBX8: 24,
      RGBA8: 32,

      0: "DXT1",
      1: "DXT2",
      2: "DXT3",
      3: "DXT4",
      4: "DXT5",
      8: "PALETTED",
      24: "RGBX8",
      32: "RGBA8",
    });

    function SpriteHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SpriteHeader.prototype._read = function() {
      this.spriteId = this._io.readU4le();
      this.x = this._io.readU2le();
      this.y = this._io.readU2le();
      this.width = this._io.readU2le();
      this.height = this._io.readU2le();
      this.format = this._io.readU1();
      this.unknown0 = this._io.readU1();
      this.importance = this._io.readU2le();
      this.dataSize = this._io.readU4le();
      this.allSize = this._io.readU4le();
      this.pad = this._io.readBytes(4);
      this.unknown1 = this._io.readU1();
      this.unknown2 = this._io.readU1();
      this.endMagic = this._io.readU2le();
    }

    /**
     * Unknown purpose.
     */

    /**
     * Unknown purpose.
     */

    return SpriteHeader;
  })();

  /**
   * Model container. All offsets are relative to the start of this header.
   */

  var Model = Mdl.Model = (function() {
    function Model(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Model.prototype._read = function() {
      this.magic = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [3, 0, 255, 255]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([3, 0, 255, 255], this.magic, this._io, "/types/model/seq/0");
      }
      this.modelVersion = this._io.readU4le();
      this.initialMatricesOffset = this._io.readU4le();
      this.boneCount = this._io.readU4le();
      this.skeletonDataOffset = this._io.readU4le();
      this.bonePairsCount = this._io.readU4le();
      this.bonePairsOffset = this._io.readU4le();
      this.defaultPcmsOffset = this._io.readU4le();
      this.primitiveHeadersCount = this._io.readU4le();
      this.primitiveHeadersOffset = this._io.readU4le();
      this.secondaryPrimitiveHeadersCount = this._io.readU4le();
      this.secondaryPrimitiveHeadersOffset = this._io.readU4le();
      this.textureBlocksCount = this._io.readU4le();
      this.textureBlocksOffset = this._io.readU4le();
      this.textureIdCount = this._io.readU4le();
      this.textureIdOffset = this._io.readU4le();
      this.junkPaddingOffset = this._io.readU4le();
      this.clusterNodeCount = this._io.readU4le();
      this.clusterNodeOffset = this._io.readU4le();
      this.clusterCount = this._io.readU4le();
      this.clusterOffset = this._io.readU4le();
      this.funcDataCount = this._io.readU4le();
      this.funcDataOffset = this._io.readU4le();
      this.hitOffset = this._io.readU4le();
      this.boxOffset = this._io.readU4le();
      this.flag = this._io.readU4le();
      this.relativeMatricesOffset = this._io.readU4le();
      this.relativeTransOffset = this._io.readU4le();
      this.reserved = this._io.readBytes(16);
      this.vertexCount = this._io.readU4le();
      this.vertexDataOffset = this._io.readU4le();
      this.secondaryVertexCount = this._io.readU4le();
      this.secondaryVertexDataOffset = this._io.readU4le();
      this.triangleIndexOffset = this._io.readU4le();
      this.secondaryTriangleIndexOffset = this._io.readU4le();
      this.unknown3 = this._io.readU4le();
      this.unknown4 = this._io.readU4le();
      this.unknown5 = this._io.readU4le();
      this.pad0 = this._io.readBytes(12);
      this.initialMatrices = [];
      for (var i = 0; i < this.boneCount; i++) {
        this.initialMatrices.push(new TransformationMatrix(this._io, this, this._root));
      }
      this.skeletonTree = [];
      for (var i = 0; i < this.boneCount; i++) {
        this.skeletonTree.push(this._io.readU1());
      }
      if (KaitaiStream.mod(this.boneCount, 16) > 0) {
        this.pad1 = [];
        for (var i = 0; i < (16 - KaitaiStream.mod(this.boneCount, 16)); i++) {
          this.pad1.push(this._io.readU1());
        }
      }
      this.bonePairs = [];
      for (var i = 0; i < this.bonePairsCount; i++) {
        this.bonePairs.push(new SkeletonPair(this._io, this, this._root));
      }
      if (KaitaiStream.mod((2 * this.bonePairsCount), 16) > 0) {
        this.pad2 = [];
        for (var i = 0; i < (16 - KaitaiStream.mod((2 * this.bonePairsCount), 16)); i++) {
          this.pad2.push(this._io.readU1());
        }
      }
      this.defaultPcmsMatrices = [];
      for (var i = 0; i < this.bonePairsCount; i++) {
        this.defaultPcmsMatrices.push(new TransformationMatrix(this._io, this, this._root));
      }
      if (this._root.header.textureCount > 0) {
        this.textureMetadata = new TextureMetadata(this._io, this, this._root);
      }
    }

    /**
     * Currently unknown purpose/interpretation
     */
    Object.defineProperty(Model.prototype, 'clusterNodes', {
      get: function() {
        if (this._m_clusterNodes !== undefined)
          return this._m_clusterNodes;
        var _pos = this._io.pos;
        this._io.seek(this.clusterNodeOffset);
        this._m_clusterNodes = this._io.readBytes((this.clusterNodeCount * 6));
        this._io.seek(_pos);
        return this._m_clusterNodes;
      }
    });

    /**
     * Unknown purpose and size computation.
     */
    Object.defineProperty(Model.prototype, 'clusters', {
      get: function() {
        if (this._m_clusters !== undefined)
          return this._m_clusters;
        var _pos = this._io.pos;
        this._io.seek(this.clusterOffset);
        this._m_clusters = this._io.readBytes(0);
        this._io.seek(_pos);
        return this._m_clusters;
      }
    });

    /**
     * The start of the geometry data.
     */
    Object.defineProperty(Model.prototype, 'geometry', {
      get: function() {
        if (this._m_geometry !== undefined)
          return this._m_geometry;
        var _pos = this._io.pos;
        this._io.seek((this.primitiveHeadersOffset + 64));
        this._m_geometry = new Geometry(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_geometry;
      }
    });

    /**
     * And that's a magic number! It's 0x03 0x00 0xff 0xff.
     */

    /**
     * Offset to initial bone matrices in model space.
     */

    /**
     * Number of bones.
     */

    /**
     * Offset to skeleton data.
     */

    /**
     * Number of bone pairs (for linear blend skinning?).
     */

    /**
     * Offset to bone pairs, specified in pairs of bytes.
     */

    /**
     * Offset to default parent-child matrices for bone pairs.
     */

    /**
     * Number of disjoint primitives.
     */

    /**
     * Offset to headers describing each primitive.
     */

    /**
     * Number of secondary primitive headers, used for separate parts such
     * as hair? On the PS2 version, this field is called "n_vu0_parts",
     * suggesting that these were handled by the VU0 coprocessor, while
     * the primary primitive headers were handled by the VU1 coprocessor.
     */

    /**
     * Offset to secondary primitive headers, used for separate parts such
     * as hair? On the PS2 version, this field is called "n_vu0_parts",
     * suggesting that these were handled by the VU0 coprocessor, while
     * the primary primitive headers were handled by the VU1 coprocessor.
     */

    /**
     * Number of texture blocks.
     */

    /**
     * Offset to the texture blocks.
     */

    /**
     * Number of unique texture IDs used by the game engine.
     */

    /**
     * Offset to texture ID data.
     */

    /**
     * Offset to a sequence of copied bytes used to pad out the file in the
     * PC version. It starts copying from the start of this header until it
     * reaches the cluster node data. On the PS2 version, this space is used
     * for a block called "texture_id_params".
     */

    /**
     * Number of cluster nodes for this object. Purpose unknown.
     */

    /**
     * Offset to cluster node data for this object. Purpose unknown.
     */

    /**
     * Number of clusters for this object. Purpose unknown.
     */

    /**
     * Offset to clusters for this object. Purpose unknown.
     */

    /**
     * Unknown count.
     */

    /**
     * Unknown offset.
     */

    /**
     * Unknown offset.
     */

    /**
     * Unknown offset.
     */

    /**
     * Unknown flag.
     */

    /**
     * Unknown offset.
     */

    /**
     * Unknown offset.
     */

    /**
     * Number of vertices.
     */

    /**
     * Offset to vertex data.
     */

    /**
     * Number of secondary vertices.
     */

    /**
     * Offset to secondary vertex data.
     */

    /**
     * Offset to triangle index data.
     */

    /**
     * Offset to secondary triangle index data.
     */

    /**
     * Matrices that represent the pose of each bone in model space. This is
     * an array of matrices where `initial_matrices[i]` goes with bone `i`.
     */

    /**
     * A graph having a tree structure that represents the skeleton. This is
     * an array of indices where bone `i` is the parent of
     * `skeleton_tree[i]`. If `skeleton_tree[i]` is 255, then the bone `i`
     * represents a root node.
     */

    /**
     * Matrices that represent relative transformations between bones. For
     * index `i`, let `parent` equal `bone_pairs[i].parent` and `child`
     * equal `bone_pairs[i].child`. Then `default_pcms_matrices[i]` is equal
     * to `inverse(initial_matrices[child]) * initial_matrices[parent]`.
     */

    return Model;
  })();

  var VertexData = Mdl.VertexData = (function() {
    function VertexData(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    VertexData.prototype._read = function() {
      this.x = this._io.readF4le();
      this.y = this._io.readF4le();
      this.z = this._io.readF4le();
      this.boneWeight0 = this._io.readF4le();
      if (!(this.boneWeight0 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight0, this._io, "/types/vertex_data/seq/3");
      }
      if (!(this.boneWeight0 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight0, this._io, "/types/vertex_data/seq/3");
      }
      this.boneWeight1 = this._io.readF4le();
      if (!(this.boneWeight1 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight1, this._io, "/types/vertex_data/seq/4");
      }
      if (!(this.boneWeight1 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight1, this._io, "/types/vertex_data/seq/4");
      }
      this.boneWeight2 = this._io.readF4le();
      if (!(this.boneWeight2 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight2, this._io, "/types/vertex_data/seq/5");
      }
      if (!(this.boneWeight2 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight2, this._io, "/types/vertex_data/seq/5");
      }
      this.boneWeight3 = this._io.readF4le();
      if (!(this.boneWeight3 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight3, this._io, "/types/vertex_data/seq/6");
      }
      if (!(this.boneWeight3 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight3, this._io, "/types/vertex_data/seq/6");
      }
      this.unknownSection = this._io.readBytes(8);
      this.u = this._io.readF4le();
      this.v = this._io.readF4le();
      this.boneIndex0 = this._io.readU1();
      this.boneIndex1 = this._io.readU1();
      var _ = this.boneIndex1;
      if (!( ((this.boneIndex1 == 0) || (this.boneIndex1 == 255) || (this.boneWeight1 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex1, this._io, "/types/vertex_data/seq/11");
      }
      this.boneIndex2 = this._io.readU1();
      var _ = this.boneIndex2;
      if (!( ((this.boneIndex2 == 0) || (this.boneIndex2 == 255) || (this.boneWeight2 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex2, this._io, "/types/vertex_data/seq/12");
      }
      this.boneIndex3 = this._io.readU1();
      var _ = this.boneIndex3;
      if (!( ((this.boneIndex3 == 0) || (this.boneIndex3 == 255) || (this.boneWeight3 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex3, this._io, "/types/vertex_data/seq/13");
      }
    }

    /**
     * The x-coordinate of the vertex.
     */

    /**
     * The y-coordinate of the vertex.
     */

    /**
     * The z-coordinate of the vertex.
     */

    /**
     * The first bone weight of the vertex.
     */

    /**
     * The second bone weight of the vertex.
     */

    /**
     * The third bone weight of the vertex.
     */

    /**
     * The fourth bone weight of the vertex.
     */

    /**
     * The texture coordinate along the horizontal axis (x), from 0 to 1.
     */

    /**
     * The texture coordinate along the vertical axis (y), from 0 to 1.
     */

    /**
     * The first bone index. This indexes into the primitive bone array, not
     * the overall skeleton array!
     */

    /**
     * The second bone (or bone pair?) index.
     */

    /**
     * The third bone (or bone pair?) index.
     */

    /**
     * The fourth bone (or bone pair?) index.
     */

    return VertexData;
  })();

  var PrimitiveHeaderWrapper = Mdl.PrimitiveHeaderWrapper = (function() {
    function PrimitiveHeaderWrapper(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PrimitiveHeaderWrapper.prototype._read = function() {
      this.primitiveHeaderSize = this._io.readU4le();
      this._raw_body = this._io.readBytes((this.primitiveHeaderSize - 4));
      var _io__raw_body = new KaitaiStream(this._raw_body);
      this.body = new PrimitiveHeader(_io__raw_body, this, this._root);
    }

    return PrimitiveHeaderWrapper;
  })();

  var SecondaryVertexData = Mdl.SecondaryVertexData = (function() {
    function SecondaryVertexData(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SecondaryVertexData.prototype._read = function() {
      this.x = this._io.readF4le();
      this.y = this._io.readF4le();
      this.z = this._io.readF4le();
      this.unknownFloat0 = this._io.readF4le();
      this.unknownFloat1 = this._io.readF4le();
      this.unknownFloat2 = this._io.readF4le();
      this.unknown0 = this._io.readBytes(8);
      this.normalX = this._io.readF4le();
      this.normalY = this._io.readF4le();
      this.normalZ = this._io.readF4le();
      var _ = this.normalZ;
      if (!(((((this.normalX * this.normalX) + (this.normalY * this.normalY)) + (this.normalZ * this.normalZ)) - 1.0) < 0.05)) {
        throw new KaitaiStream.ValidationExprError(this.normalZ, this._io, "/types/secondary_vertex_data/seq/9");
      }
      this.unknown1 = this._io.readBytes(4);
      this.u = this._io.readF4le();
      this.v = this._io.readF4le();
      this.unknown2 = this._io.readBytes(8);
      this.initialMatrixIndex = this._io.readU1();
      this.unknownBytes0 = [];
      for (var i = 0; i < 3; i++) {
        this.unknownBytes0.push(this._io.readU1());
      }
      this.unknownBytes1 = [];
      for (var i = 0; i < 4; i++) {
        this.unknownBytes1.push(this._io.readU1());
      }
    }

    /**
     * The x-coordinate of the vertex.
     */

    /**
     * The y-coordinate of the vertex.
     */

    /**
     * The z-coordinate of the vertex.
     */

    /**
     * The x-coordinate of the normal vector.
     */

    /**
     * The y-coordinate of the normal vector.
     */

    /**
     * The z-coordinate of the normal vector.
     */

    /**
     * The texture coordinate along the horizontal axis (x), from 0 to 1.
     */

    /**
     * The texture coordinate along the vertical axis (y), from 0 to 1.
     */

    /**
     * Which initial matrix to multiply this vertex by.
     */

    return SecondaryVertexData;
  })();

  var SecondaryPrimitiveHeaderWrapper = Mdl.SecondaryPrimitiveHeaderWrapper = (function() {
    function SecondaryPrimitiveHeaderWrapper(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SecondaryPrimitiveHeaderWrapper.prototype._read = function() {
      this.secondaryPrimitiveHeaderSize = this._io.readU4le();
      this._raw_body = this._io.readBytes((this.secondaryPrimitiveHeaderSize - 4));
      var _io__raw_body = new KaitaiStream(this._raw_body);
      this.body = new SecondaryPrimitiveHeader(_io__raw_body, this, this._root);
    }

    return SecondaryPrimitiveHeaderWrapper;
  })();

  var TextureMetadata = Mdl.TextureMetadata = (function() {
    function TextureMetadata(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TextureMetadata.prototype._read = function() {
      this.mainTextureIds = [];
      for (var i = 0; i < this._parent.textureBlocksCount; i++) {
        this.mainTextureIds.push(this._io.readU4le());
      }
      if (KaitaiStream.mod(this._parent.textureBlocksCount, 4) > 0) {
        this.pad = this._io.readBytes((16 - KaitaiStream.mod((4 * this._parent.textureBlocksCount), 16)));
      }
      this.texturePairs = [];
      for (var i = 0; i < this._parent.textureIdCount; i++) {
        this.texturePairs.push(new TexturePair(this._io, this, this._root));
      }
    }

    /**
     * TODO
     */

    /**
     * TODO
     */

    return TextureMetadata;
  })();

  /**
   * TODO
   */

  var TexturePair = Mdl.TexturePair = (function() {
    function TexturePair(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TexturePair.prototype._read = function() {
      this.textureIndex = this._io.readU4le();
      this.spriteId = this._io.readU4le();
      if (!(this.spriteId >= 1)) {
        throw new KaitaiStream.ValidationLessThanError(1, this.spriteId, this._io, "/types/texture_pair/seq/1");
      }
    }

    return TexturePair;
  })();

  /**
   * Description for a primitive, in the OpenGL sense of the word
   * "primitive". In this case, the primitives are triangle strips, but
   * the triangle list can contain degenerate triangles that are used to
   * separate strips.
   */

  var PrimitiveHeader = Mdl.PrimitiveHeader = (function() {
    function PrimitiveHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PrimitiveHeader.prototype._read = function() {
      this.pad0 = this._io.readBytes(4);
      this.boneCount = this._io.readU4le();
      this.boneIndicesOffset = this._io.readU4le();
      this.bonePairsCount = this._io.readU4le();
      this.bonePairsOffset = this._io.readU4le();
      this.textureIndexCount = this._io.readU4le();
      this.textureIndexOffset = this._io.readU4le();
      this.markerOffset = this._io.readU4le();
      this.unknownSection0 = this._io.readBytes(28);
      this.pad1 = this._io.readBytes(4);
      this.unknownFloats0 = [];
      for (var i = 0; i < 3; i++) {
        this.unknownFloats0.push(this._io.readF4le());
      }
      this.pad2 = this._io.readBytes(4);
      this.unknownFloats1 = [];
      for (var i = 0; i < 3; i++) {
        this.unknownFloats1.push(this._io.readF4le());
      }
      this.pad3 = this._io.readBytes(4);
      this.unknownSection1 = this._io.readBytes(16);
      this.primitiveStartIndex = this._io.readU4le();
      this.primitiveLength = this._io.readU4le();
      this.pad4 = this._io.readBytes(4);
      this.boneIndices = [];
      for (var i = 0; i < this.boneCount; i++) {
        this.boneIndices.push(this._io.readU2le());
      }
    }

    /**
     * A list of bone pair indices. See bone_indices doc comment, a similar
     * concept applies.
     */
    Object.defineProperty(PrimitiveHeader.prototype, 'bonePairIndices', {
      get: function() {
        if (this._m_bonePairIndices !== undefined)
          return this._m_bonePairIndices;
        var _pos = this._io.pos;
        this._io.seek((this.bonePairsOffset - 4));
        this._raw__m_bonePairIndices = this._io.readBytes((this.bonePairsCount * 2));
        var _io__raw__m_bonePairIndices = new KaitaiStream(this._raw__m_bonePairIndices);
        this._m_bonePairIndices = new IndexList(_io__raw__m_bonePairIndices, this, this._root);
        this._io.seek(_pos);
        return this._m_bonePairIndices;
      }
    });

    /**
     * A list of texture indices? TODO
     */
    Object.defineProperty(PrimitiveHeader.prototype, 'textureIndices', {
      get: function() {
        if (this._m_textureIndices !== undefined)
          return this._m_textureIndices;
        var _pos = this._io.pos;
        this._io.seek((this.textureIndexOffset - 4));
        this._raw__m_textureIndices = this._io.readBytes((this.textureIndexCount * 2));
        var _io__raw__m_textureIndices = new KaitaiStream(this._raw__m_textureIndices);
        this._m_textureIndices = new IndexList(_io__raw__m_textureIndices, this, this._root);
        this._io.seek(_pos);
        return this._m_textureIndices;
      }
    });

    /**
     * Seems to always be 0x03 0x03 0x02 0x02, but see also the marker field
     * of the secondary_primitive_header type.
     */
    Object.defineProperty(PrimitiveHeader.prototype, 'marker', {
      get: function() {
        if (this._m_marker !== undefined)
          return this._m_marker;
        var _pos = this._io.pos;
        this._io.seek((this.markerOffset - 4));
        this._m_marker = this._io.readBytes(4);
        this._io.seek(_pos);
        return this._m_marker;
      }
    });

    /**
     * Number of bones that this primitive depends on.
     */

    /**
     * Offset from this header to a bone list. See bone_indices.
     */

    /**
     * Number of bone pairs that this primitive depends on.
     */

    /**
     * Offset to a bone pair indices list. See bone_pair_indices.
     */

    /**
     * Appears to be the texture indices for this primitive?
     */

    /**
     * Appears to be the texture index offset for this primitive?
     */

    /**
     * Offset to a marker sequence, which ends the header.
     */

    /**
     * Unknown purpose.
     */

    /**
     * Curious unknown floats. Often seem to be around 2 / 3.
     */

    /**
     * Curious unknown floats. Often seem to be around 1 / 3.
     */

    /**
     * Purpose unknown.
     */

    /**
     * Offset into the triangle index array where the primitive begins.
     */

    /**
     * The length of the primitive in the triangle index array.
     */

    /**
     * The bone index array from this primitive. An important point is that
     * the bone indices specified by a given vertex go into this array, not
     * the overall skeleton array. Unclear why these are u2 if bones are u1?
     */

    return PrimitiveHeader;
  })();

  /**
   * Represents a parent-child bone relationship.
   */

  var SkeletonPair = Mdl.SkeletonPair = (function() {
    function SkeletonPair(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SkeletonPair.prototype._read = function() {
      this.parent = this._io.readU1();
      this.child = this._io.readU1();
    }

    return SkeletonPair;
  })();

  var TextureContainer = Mdl.TextureContainer = (function() {
    function TextureContainer(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TextureContainer.prototype._read = function() {
      this.textureId = this._io.readU4le();
      this.width = this._io.readU2le();
      this.height = this._io.readU2le();
      this.width2 = this._io.readU2le();
      this.height2 = this._io.readU2le();
      this.spriteCount = this._io.readU2le();
      this.unknownSection = this._io.readBytes(18);
      this.spriteHeaders = [];
      for (var i = 0; i < this.spriteCount; i++) {
        this.spriteHeaders.push(new SpriteHeader(this._io, this, this._root));
      }
      this.data = this._io.readBytes((this.spriteHeaders[0].format != 0 ? (this.width * this.height) : Math.floor((this.width * this.height) / 2)));
    }

    return TextureContainer;
  })();

  var IndexList = Mdl.IndexList = (function() {
    function IndexList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    IndexList.prototype._read = function() {
      this.array = [];
      var i = 0;
      while (!this._io.isEof()) {
        this.array.push(this._io.readU2le());
        i++;
      }
    }

    return IndexList;
  })();

  var FileHeader = Mdl.FileHeader = (function() {
    function FileHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    FileHeader.prototype._read = function() {
      this.noTextureId = this._io.readU1();
      this.padding = this._io.readBytes(3);
      this.characterId = this._io.readU4le();
      this.textureCount = this._io.readU4le();
      this.textureHeaderOffset = this._io.readU4le();
      this.modelHeaderOffset = this._io.readU4le();
      this.kg1HeaderOffset = this._io.readU4le();
    }

    /**
     * Indicates whether this model has a texture associated with it? 
     * True for models with "notex" in the filename, e.g. 
     * "hll_jms_notex.mdl".
     */

    /**
     * Internal ID used by the game engine for this model.
     */

    /**
     * Number of textures in this model.
     */

    /**
     * Absolute byte offset to the start of texture data.
     */

    /**
     * Absolute byte offset to the start of general model data.
     */

    /**
     * Absolute byte offset to the start of embedded shadow data.
     */

    return FileHeader;
  })();

  var Geometry = Mdl.Geometry = (function() {
    function Geometry(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Geometry.prototype._read = function() {
      this.primitiveHeaders = [];
      for (var i = 0; i < this._root.modelData.primitiveHeadersCount; i++) {
        this.primitiveHeaders.push(new PrimitiveHeaderWrapper(this._io, this, this._root));
      }
      this._raw_triangleIndices = this._io.readBytes(((this._root.modelData.vertexDataOffset > this._root.modelData.secondaryPrimitiveHeadersOffset ? this._root.modelData.secondaryPrimitiveHeadersOffset : this._root.modelData.vertexDataOffset) - this._root.modelData.triangleIndexOffset));
      var _io__raw_triangleIndices = new KaitaiStream(this._raw_triangleIndices);
      this.triangleIndices = new IndexList(_io__raw_triangleIndices, this, this._root);
    }
    Object.defineProperty(Geometry.prototype, 'vertexList', {
      get: function() {
        if (this._m_vertexList !== undefined)
          return this._m_vertexList;
        var _pos = this._io.pos;
        this._io.seek((this._root.modelData.vertexDataOffset + 64));
        this._m_vertexList = [];
        for (var i = 0; i < this._root.modelData.vertexCount; i++) {
          this._m_vertexList.push(new VertexData(this._io, this, this._root));
        }
        this._io.seek(_pos);
        return this._m_vertexList;
      }
    });
    Object.defineProperty(Geometry.prototype, 'secondaryPrimitiveHeaders', {
      get: function() {
        if (this._m_secondaryPrimitiveHeaders !== undefined)
          return this._m_secondaryPrimitiveHeaders;
        if (this._root.modelData.secondaryPrimitiveHeadersCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this._root.modelData.secondaryPrimitiveHeadersOffset + 64));
          this._m_secondaryPrimitiveHeaders = [];
          for (var i = 0; i < this._root.modelData.secondaryPrimitiveHeadersCount; i++) {
            this._m_secondaryPrimitiveHeaders.push(new SecondaryPrimitiveHeaderWrapper(this._io, this, this._root));
          }
          this._io.seek(_pos);
        }
        return this._m_secondaryPrimitiveHeaders;
      }
    });

    /**
     * List of vertex indices, which represent triangle strips.
     */
    Object.defineProperty(Geometry.prototype, 'secondaryTriangleIndices', {
      get: function() {
        if (this._m_secondaryTriangleIndices !== undefined)
          return this._m_secondaryTriangleIndices;
        if (this._root.modelData.secondaryPrimitiveHeadersCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this._root.modelData.secondaryTriangleIndexOffset + 64));
          this._raw__m_secondaryTriangleIndices = this._io.readBytes((this._root.modelData.secondaryVertexDataOffset - this._root.modelData.secondaryTriangleIndexOffset));
          var _io__raw__m_secondaryTriangleIndices = new KaitaiStream(this._raw__m_secondaryTriangleIndices);
          this._m_secondaryTriangleIndices = new IndexList(_io__raw__m_secondaryTriangleIndices, this, this._root);
          this._io.seek(_pos);
        }
        return this._m_secondaryTriangleIndices;
      }
    });
    Object.defineProperty(Geometry.prototype, 'secondaryVertexList', {
      get: function() {
        if (this._m_secondaryVertexList !== undefined)
          return this._m_secondaryVertexList;
        if (this._root.modelData.secondaryPrimitiveHeadersCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this._root.modelData.secondaryVertexDataOffset + 64));
          this._m_secondaryVertexList = [];
          for (var i = 0; i < this._root.modelData.secondaryVertexCount; i++) {
            this._m_secondaryVertexList.push(new SecondaryVertexData(this._io, this, this._root));
          }
          this._io.seek(_pos);
        }
        return this._m_secondaryVertexList;
      }
    });

    /**
     * List of vertex indices, which represent triangle strips.
     */

    return Geometry;
  })();

  var TextureData = Mdl.TextureData = (function() {
    function TextureData(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TextureData.prototype._read = function() {
      this.magic = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [1, 9, 153, 25]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([1, 9, 153, 25], this.magic, this._io, "/types/texture_data/seq/0");
      }
      this.unknown = this._io.readBytes(12);
      this.textures = [];
      for (var i = 0; i < this._root.header.textureCount; i++) {
        this.textures.push(new TextureContainer(this._io, this, this._root));
      }
    }

    /**
     * And that's a magic number!
     */

    return TextureData;
  })();

  /**
   * Represents a 4x4 column-major transformation matrix.
   */

  var TransformationMatrix = Mdl.TransformationMatrix = (function() {
    function TransformationMatrix(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TransformationMatrix.prototype._read = function() {
      this.rotation00 = this._io.readF4le();
      this.rotation10 = this._io.readF4le();
      this.rotation20 = this._io.readF4le();
      this.pad0 = this._io.readF4le();
      if (!(this.pad0 == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.pad0, this._io, "/types/transformation_matrix/seq/3");
      }
      this.rotation01 = this._io.readF4le();
      this.rotation11 = this._io.readF4le();
      this.rotation21 = this._io.readF4le();
      this.pad1 = this._io.readF4le();
      if (!(this.pad1 == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.pad1, this._io, "/types/transformation_matrix/seq/7");
      }
      this.rotation02 = this._io.readF4le();
      this.rotation12 = this._io.readF4le();
      this.rotation22 = this._io.readF4le();
      this.pad2 = this._io.readF4le();
      if (!(this.pad2 == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.pad2, this._io, "/types/transformation_matrix/seq/11");
      }
      this.translationX = this._io.readF4le();
      this.translationY = this._io.readF4le();
      this.translationZ = this._io.readF4le();
      this.translationW = this._io.readF4le();
      if (!(this.translationW == 1)) {
        throw new KaitaiStream.ValidationNotEqualError(1, this.translationW, this._io, "/types/transformation_matrix/seq/15");
      }
    }

    return TransformationMatrix;
  })();
  Object.defineProperty(Mdl.prototype, 'textureData', {
    get: function() {
      if (this._m_textureData !== undefined)
        return this._m_textureData;
      if ( ((this._root.header.textureCount > 0) && (this._root.header.noTextureId == 0)) ) {
        var _pos = this._io.pos;
        this._io.seek(this._root.header.textureHeaderOffset);
        this._raw__m_textureData = this._io.readBytesFull();
        var _io__raw__m_textureData = new KaitaiStream(this._raw__m_textureData);
        this._m_textureData = new TextureData(_io__raw__m_textureData, this, this._root);
        this._io.seek(_pos);
      }
      return this._m_textureData;
    }
  });

  return Mdl;
})();
return Mdl;
}));

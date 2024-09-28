// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

import KaitaiStream from "./runtime/KaitaiStream";

var _;

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

    this._should_write_textureData = false;
    this.textureData__to_write = true;
  }
  Mdl.prototype._read = function() {
    this._raw_header = this._io.readBytes(64);
    var _io__raw_header = new KaitaiStream(this._raw_header);
    this.header = new FileHeader(_io__raw_header, this, this._root);
    this.header._read();
    this.modelData = new Model(this._io, this, this._root);
    this.modelData._read();
  }

  Mdl.prototype._fetchInstances = function() {
    this.header._fetchInstances()
    this.modelData._fetchInstances()
    if ( ((this._root.header.textureCount > 0) && (this._root.header.noTextureId == 0)) ) {
      _ = this.textureData
      this.textureData._fetchInstances()
    }
  }

  Mdl.prototype._write__seq = function(io) {
    this._io = io;
    this._should_write_textureData = this.textureData__to_write;
    var _io__raw_header = new KaitaiStream(new ArrayBuffer(64));
    this._io.addChildStream(_io__raw_header)
    var _pos2 = this._io.pos
    this._io.seek(this._io.pos + (64))
    const handler = (parent) => {
      this._raw_header = _io__raw_header.toByteArray();
      if (this._raw_header.length != 64) {
        throw new KaitaiStream.ConsistencyError("raw(header)", this._raw_header.length, 64);
      }
      parent.writeBytes(this._raw_header)
      }
    _io__raw_header.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
    this.header._write__seq(_io__raw_header)
    this.modelData._write__seq(this._io)
  }

  Mdl.prototype._check = function() {
    if (this.header._root !== this._root) {
      throw new KaitaiStream.ConsistencyError("header", this.header._root, this._root);
    }
    if (this.header._parent !== this) {
      throw new KaitaiStream.ConsistencyError("header", this.header._parent, this);
    }
    if (this.modelData._root !== this._root) {
      throw new KaitaiStream.ConsistencyError("model_data", this.modelData._root, this._root);
    }
    if (this.modelData._parent !== this) {
      throw new KaitaiStream.ConsistencyError("model_data", this.modelData._parent, this);
    }
    }

  var SpriteHeader = Mdl.SpriteHeader = (function() {
    SpriteHeader.TextureFormat = Object.freeze({
      Dxt1: 0,
      Dxt2: 1,
      Dxt3: 2,
      Dxt4: 3,
      Dxt5: 4,
      Paletted: 8,
      Rgbx8: 24,
      Rgba8: 32,

      0: "Dxt1",
      1: "Dxt2",
      2: "Dxt3",
      3: "Dxt4",
      4: "Dxt5",
      8: "Paletted",
      24: "Rgbx8",
      32: "Rgba8",
    });

    function SpriteHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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

    SpriteHeader.prototype._fetchInstances = function() {
    }

    SpriteHeader.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU4le(this.spriteId);
      this._io.writeU2le(this.x);
      this._io.writeU2le(this.y);
      this._io.writeU2le(this.width);
      this._io.writeU2le(this.height);
      this._io.writeU1(this.format);
      this._io.writeU1(this.unknown0);
      this._io.writeU2le(this.importance);
      this._io.writeU4le(this.dataSize);
      this._io.writeU4le(this.allSize);
      this._io.writeBytes(this.pad)
      this._io.writeU1(this.unknown1);
      this._io.writeU1(this.unknown2);
      this._io.writeU2le(this.endMagic);
    }

    SpriteHeader.prototype._check = function() {
      if (this.pad.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad", this.pad.length, 4);
      }
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
   * Unknown original IDs for all properties.
   */

  var ClusterMapping = Mdl.ClusterMapping = (function() {
    function ClusterMapping(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    ClusterMapping.prototype._read = function() {
      this.sourceStartIndex = this._io.readU2le();
      this.targetStartIndex = this._io.readU2le();
      this.count = this._io.readU2le();
    }

    ClusterMapping.prototype._fetchInstances = function() {
    }

    ClusterMapping.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU2le(this.sourceStartIndex);
      this._io.writeU2le(this.targetStartIndex);
      this._io.writeU2le(this.count);
    }

    ClusterMapping.prototype._check = function() {
      }

    return ClusterMapping;
  })();

  var ClusterData = Mdl.ClusterData = (function() {
    function ClusterData(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    ClusterData.prototype._read = function() {
      this.vector = new S2Vector(this._io, this, this._root);
      this.vector._read();
      this.vertexIndex = this._io.readS2le();
    }

    ClusterData.prototype._fetchInstances = function() {
      this.vector._fetchInstances()
    }

    ClusterData.prototype._write__seq = function(io) {
      this._io = io;
      this.vector._write__seq(this._io)
      this._io.writeS2le(this.vertexIndex);
    }

    ClusterData.prototype._check = function() {
      if (this.vector._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("vector", this.vector._root, this._root);
      }
      if (this.vector._parent !== this) {
        throw new KaitaiStream.ConsistencyError("vector", this.vector._parent, this);
      }
      }

    return ClusterData;
  })();

  var TransparentPrimitiveHeader = Mdl.TransparentPrimitiveHeader = (function() {
    function TransparentPrimitiveHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    TransparentPrimitiveHeader.prototype._read = function() {
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

    TransparentPrimitiveHeader.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.unknownFloats0).length; i++) {
      }
      for (let i = 0; i < (this.unknownFloats1).length; i++) {
      }
    }

    TransparentPrimitiveHeader.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeBytes(this.pad0)
      this._io.writeU4le(this.textureIndexCount);
      this._io.writeU4le(this.textureIndexOffset);
      this._io.writeU4le(this.markerOffset);
      this._io.writeU4le(this.unknownCount);
      this._io.writeBytes(this.unknownSection0)
      this._io.writeU4le(this.pad1);
      for (let i = 0; i < (this.unknownFloats0).length; i++) {
        this._io.writeF4le(this.unknownFloats0[i]);
      }
      this._io.writeU4le(this.pad2);
      for (let i = 0; i < (this.unknownFloats1).length; i++) {
        this._io.writeF4le(this.unknownFloats1[i]);
      }
      this._io.writeBytes(this.unknownSection1)
      this._io.writeU4le(this.primitiveStartIndex);
      this._io.writeU4le(this.primitiveLength);
      this._io.writeU4le(this.primitiveIndex);
      this._io.writeU4le(this.textureIndex);
      this._io.writeBytes(this.pad3)
      this._io.writeBytes(this.marker)
    }

    TransparentPrimitiveHeader.prototype._check = function() {
      if (this.pad0.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad0", this.pad0.length, 4);
      }
      if (this.unknownSection0.length != 24) {
        throw new KaitaiStream.ConsistencyError("unknown_section0", this.unknownSection0.length, 24);
      }
      if (this.unknownFloats0.length != 3) {
        throw new KaitaiStream.ConsistencyError("unknown_floats0", this.unknownFloats0.length, 3);
      }
      for (let i = 0; i < (this.unknownFloats0).length; i++) {
      }
      if (this.unknownFloats1.length != 3) {
        throw new KaitaiStream.ConsistencyError("unknown_floats1", this.unknownFloats1.length, 3);
      }
      for (let i = 0; i < (this.unknownFloats1).length; i++) {
      }
      if (this.unknownSection1.length != 20) {
        throw new KaitaiStream.ConsistencyError("unknown_section1", this.unknownSection1.length, 20);
      }
      if (this.pad3.length != 12) {
        throw new KaitaiStream.ConsistencyError("pad3", this.pad3.length, 12);
      }
      if (this.marker.length != 4) {
        throw new KaitaiStream.ConsistencyError("marker", this.marker.length, 4);
      }
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

    return TransparentPrimitiveHeader;
  })();

  /**
   * Model container. All offsets are relative to the start of this header.
   */

  var Model = Mdl.Model = (function() {
    function Model(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._should_write_junkPadding = false;
      this.junkPadding__to_write = true;
      this._should_write_clusterNodeNormals = false;
      this.clusterNodeNormals__to_write = true;
      this._should_write_geometry = false;
      this.geometry__to_write = true;
      this._should_write_clusterNodes = false;
      this.clusterNodes__to_write = true;
      this._should_write_clusterMaps = false;
      this.clusterMaps__to_write = true;
      this._should_write_clusters = false;
      this.clusters__to_write = true;
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
      this.transparentPrimitiveHeadersCount = this._io.readU4le();
      this.transparentPrimitiveHeadersOffset = this._io.readU4le();
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
      this.transparentVertexCount = this._io.readU4le();
      this.transparentVertexDataOffset = this._io.readU4le();
      this.triangleIndexOffset = this._io.readU4le();
      this.transparentTriangleIndexOffset = this._io.readU4le();
      this.opaqueClusterMapCount = this._io.readU4le();
      this.transparentClusterMapCount = this._io.readU4le();
      this.clusterMapOffset = this._io.readU4le();
      this.pad0 = this._io.readBytes(12);
      this.initialMatrices = [];
      for (var i = 0; i < this.boneCount; i++) {
        var _t_initialMatrices = new TransformationMatrix(this._io, this, this._root);
        _t_initialMatrices._read();
        this.initialMatrices.push(_t_initialMatrices);
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
        var _t_bonePairs = new SkeletonPair(this._io, this, this._root);
        _t_bonePairs._read();
        this.bonePairs.push(_t_bonePairs);
      }
      if (KaitaiStream.mod((2 * this.bonePairsCount), 16) > 0) {
        this.pad2 = [];
        for (var i = 0; i < (16 - KaitaiStream.mod((2 * this.bonePairsCount), 16)); i++) {
          this.pad2.push(this._io.readU1());
        }
      }
      this.defaultPcmsMatrices = [];
      for (var i = 0; i < this.bonePairsCount; i++) {
        var _t_defaultPcmsMatrices = new TransformationMatrix(this._io, this, this._root);
        _t_defaultPcmsMatrices._read();
        this.defaultPcmsMatrices.push(_t_defaultPcmsMatrices);
      }
      if (this._root.header.textureCount > 0) {
        this.textureMetadata = new TextureMetadata(this._io, this, this._root);
        this.textureMetadata._read();
      }
    }

    Model.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.initialMatrices).length; i++) {
        this.initialMatrices[i]._fetchInstances()
      }
      for (let i = 0; i < (this.skeletonTree).length; i++) {
      }
      if (KaitaiStream.mod(this.boneCount, 16) > 0) {
        for (let i = 0; i < (this.pad1).length; i++) {
        }
      }
      for (let i = 0; i < (this.bonePairs).length; i++) {
        this.bonePairs[i]._fetchInstances()
      }
      if (KaitaiStream.mod((2 * this.bonePairsCount), 16) > 0) {
        for (let i = 0; i < (this.pad2).length; i++) {
        }
      }
      for (let i = 0; i < (this.defaultPcmsMatrices).length; i++) {
        this.defaultPcmsMatrices[i]._fetchInstances()
      }
      if (this._root.header.textureCount > 0) {
        this.textureMetadata._fetchInstances()
      }
      _ = this.junkPadding
      if (this.clusterNodesHaveNormals) {
        _ = this.clusterNodeNormals
        for (let i = 0; i < (this._m_clusterNodeNormals).length; i++) {
          this.clusterNodeNormals[i]._fetchInstances()
        }
      }
      _ = this.geometry
      this.geometry._fetchInstances()
      if (this.clusterNodeCount > 0) {
        _ = this.clusterNodes
        for (let i = 0; i < (this._m_clusterNodes).length; i++) {
          this.clusterNodes[i]._fetchInstances()
        }
      }
      _ = this.clusterMaps
      this.clusterMaps._fetchInstances()
      if (this.clusterCount > 0) {
        _ = this.clusters
        for (let i = 0; i < (this._m_clusters).length; i++) {
          this.clusters[i]._fetchInstances()
        }
      }
    }

    Model.prototype._write__seq = function(io) {
      this._io = io;
      this._should_write_junkPadding = this.junkPadding__to_write;
      this._should_write_clusterNodeNormals = this.clusterNodeNormals__to_write;
      this._should_write_geometry = this.geometry__to_write;
      this._should_write_clusterNodes = this.clusterNodes__to_write;
      this._should_write_clusterMaps = this.clusterMaps__to_write;
      this._should_write_clusters = this.clusters__to_write;
      this._io.writeBytes(this.magic)
      this._io.writeU4le(this.modelVersion);
      this._io.writeU4le(this.initialMatricesOffset);
      this._io.writeU4le(this.boneCount);
      this._io.writeU4le(this.skeletonDataOffset);
      this._io.writeU4le(this.bonePairsCount);
      this._io.writeU4le(this.bonePairsOffset);
      this._io.writeU4le(this.defaultPcmsOffset);
      this._io.writeU4le(this.primitiveHeadersCount);
      this._io.writeU4le(this.primitiveHeadersOffset);
      this._io.writeU4le(this.transparentPrimitiveHeadersCount);
      this._io.writeU4le(this.transparentPrimitiveHeadersOffset);
      this._io.writeU4le(this.textureBlocksCount);
      this._io.writeU4le(this.textureBlocksOffset);
      this._io.writeU4le(this.textureIdCount);
      this._io.writeU4le(this.textureIdOffset);
      this._io.writeU4le(this.junkPaddingOffset);
      this._io.writeU4le(this.clusterNodeCount);
      this._io.writeU4le(this.clusterNodeOffset);
      this._io.writeU4le(this.clusterCount);
      this._io.writeU4le(this.clusterOffset);
      this._io.writeU4le(this.funcDataCount);
      this._io.writeU4le(this.funcDataOffset);
      this._io.writeU4le(this.hitOffset);
      this._io.writeU4le(this.boxOffset);
      this._io.writeU4le(this.flag);
      this._io.writeU4le(this.relativeMatricesOffset);
      this._io.writeU4le(this.relativeTransOffset);
      this._io.writeBytes(this.reserved)
      this._io.writeU4le(this.vertexCount);
      this._io.writeU4le(this.vertexDataOffset);
      this._io.writeU4le(this.transparentVertexCount);
      this._io.writeU4le(this.transparentVertexDataOffset);
      this._io.writeU4le(this.triangleIndexOffset);
      this._io.writeU4le(this.transparentTriangleIndexOffset);
      this._io.writeU4le(this.opaqueClusterMapCount);
      this._io.writeU4le(this.transparentClusterMapCount);
      this._io.writeU4le(this.clusterMapOffset);
      this._io.writeBytes(this.pad0)
      for (let i = 0; i < (this.initialMatrices).length; i++) {
        this.initialMatrices[i]._write__seq(this._io)
      }
      for (let i = 0; i < (this.skeletonTree).length; i++) {
        this._io.writeU1(this.skeletonTree[i]);
      }
      if (KaitaiStream.mod(this.boneCount, 16) > 0) {
        for (let i = 0; i < (this.pad1).length; i++) {
          this._io.writeU1(this.pad1[i]);
        }
      }
      for (let i = 0; i < (this.bonePairs).length; i++) {
        this.bonePairs[i]._write__seq(this._io)
      }
      if (KaitaiStream.mod((2 * this.bonePairsCount), 16) > 0) {
        for (let i = 0; i < (this.pad2).length; i++) {
          this._io.writeU1(this.pad2[i]);
        }
      }
      for (let i = 0; i < (this.defaultPcmsMatrices).length; i++) {
        this.defaultPcmsMatrices[i]._write__seq(this._io)
      }
      if (this._root.header.textureCount > 0) {
        this.textureMetadata._write__seq(this._io)
      }
    }

    Model.prototype._check = function() {
      if (this.magic.length != 4) {
        throw new KaitaiStream.ConsistencyError("magic", this.magic.length, 4);
      }
      if (!((KaitaiStream.byteArrayCompare(this.magic, [3, 0, 255, 255]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([3, 0, 255, 255], this.magic, null, "/types/model/seq/0");
      }
      if (this.reserved.length != 16) {
        throw new KaitaiStream.ConsistencyError("reserved", this.reserved.length, 16);
      }
      if (this.pad0.length != 12) {
        throw new KaitaiStream.ConsistencyError("pad0", this.pad0.length, 12);
      }
      if (this.initialMatrices.length != this.boneCount) {
        throw new KaitaiStream.ConsistencyError("initial_matrices", this.initialMatrices.length, this.boneCount);
      }
      for (let i = 0; i < (this.initialMatrices).length; i++) {
        if (this.initialMatrices[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("initial_matrices", this.initialMatrices[i]._root, this._root);
        }
        if (this.initialMatrices[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("initial_matrices", this.initialMatrices[i]._parent, this);
        }
      }
      if (this.skeletonTree.length != this.boneCount) {
        throw new KaitaiStream.ConsistencyError("skeleton_tree", this.skeletonTree.length, this.boneCount);
      }
      for (let i = 0; i < (this.skeletonTree).length; i++) {
      }
      if (KaitaiStream.mod(this.boneCount, 16) > 0) {
        if (this.pad1.length != (16 - KaitaiStream.mod(this.boneCount, 16))) {
          throw new KaitaiStream.ConsistencyError("pad1", this.pad1.length, (16 - KaitaiStream.mod(this.boneCount, 16)));
        }
        for (let i = 0; i < (this.pad1).length; i++) {
        }
      }
      if (this.bonePairs.length != this.bonePairsCount) {
        throw new KaitaiStream.ConsistencyError("bone_pairs", this.bonePairs.length, this.bonePairsCount);
      }
      for (let i = 0; i < (this.bonePairs).length; i++) {
        if (this.bonePairs[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("bone_pairs", this.bonePairs[i]._root, this._root);
        }
        if (this.bonePairs[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("bone_pairs", this.bonePairs[i]._parent, this);
        }
      }
      if (KaitaiStream.mod((2 * this.bonePairsCount), 16) > 0) {
        if (this.pad2.length != (16 - KaitaiStream.mod((2 * this.bonePairsCount), 16))) {
          throw new KaitaiStream.ConsistencyError("pad2", this.pad2.length, (16 - KaitaiStream.mod((2 * this.bonePairsCount), 16)));
        }
        for (let i = 0; i < (this.pad2).length; i++) {
        }
      }
      if (this.defaultPcmsMatrices.length != this.bonePairsCount) {
        throw new KaitaiStream.ConsistencyError("default_pcms_matrices", this.defaultPcmsMatrices.length, this.bonePairsCount);
      }
      for (let i = 0; i < (this.defaultPcmsMatrices).length; i++) {
        if (this.defaultPcmsMatrices[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("default_pcms_matrices", this.defaultPcmsMatrices[i]._root, this._root);
        }
        if (this.defaultPcmsMatrices[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("default_pcms_matrices", this.defaultPcmsMatrices[i]._parent, this);
        }
      }
      if (this._root.header.textureCount > 0) {
        if (this.textureMetadata._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("texture_metadata", this.textureMetadata._root, this._root);
        }
        if (this.textureMetadata._parent !== this) {
          throw new KaitaiStream.ConsistencyError("texture_metadata", this.textureMetadata._parent, this);
        }
      }
      }

    /**
     * This is a helper, not part of the original mdl structure.
     */
    Object.defineProperty(Model.prototype, 'clusterNodePaddingAmount', {

      set: function(v) {
        this._m_clusterNodePaddingAmount = v;
      },
      get: function() {
        if (this._m_clusterNodePaddingAmount !== undefined)
          return this._m_clusterNodePaddingAmount;
        this._m_clusterNodePaddingAmount = (KaitaiStream.mod(this.clusterNodeCount, 8) != 0 ? (16 - KaitaiStream.mod((this.clusterNodeCount * 6), 16)) : 0);
        return this._m_clusterNodePaddingAmount;
      }
    });

    Model.prototype._invalidate_clusterNodePaddingAmount = function() {
    }
    Object.defineProperty(Model.prototype, 'junkPadding', {

      set: function(v) {
        this._m_junkPadding = v;
      },
      get: function() {
        if (this._should_write_junkPadding) {
          this._write_junkPadding()
        }
        if (this._m_junkPadding !== undefined)
          return this._m_junkPadding;
        var _pos = this._io.pos;
        this._io.seek((this.junkPaddingOffset + 64));
        this._m_junkPadding = this._io.readBytes((this.clusterNodeOffset - this.junkPaddingOffset));
        this._io.seek(_pos);
        return this._m_junkPadding;
      }
    });

    Model.prototype._write_junkPadding = function() {
      this._should_write_junkPadding = false;
      var _pos = this._io.pos;
      this._io.seek((this.junkPaddingOffset + 64));
      this._io.writeBytes(this.junkPadding)
      this._io.seek(_pos);
      }

    Model.prototype._check_junkPadding = function() {
      this._should_write_junkPadding = false;
      if (this.junkPadding.length != (this.clusterNodeOffset - this.junkPaddingOffset)) {
        throw new KaitaiStream.ConsistencyError("junk_padding", this.junkPadding.length, (this.clusterNodeOffset - this.junkPaddingOffset));
      }
      }
    Object.defineProperty(Model.prototype, 'clusterNodeNormals', {

      set: function(v) {
        this._m_clusterNodeNormals = v;
      },
      get: function() {
        if (this._should_write_clusterNodeNormals) {
          this._write_clusterNodeNormals()
        }
        if (this._m_clusterNodeNormals !== undefined)
          return this._m_clusterNodeNormals;
        if (this.clusterNodesHaveNormals) {
          var _pos = this._io.pos;
          this._io.seek((((this.clusterNodeOffset + (this.clusterNodeCount * 6)) + 64) + this.clusterNodePaddingAmount));
          this._m_clusterNodeNormals = [];
          for (var i = 0; i < this.clusterNodeCount; i++) {
            var _t__m_clusterNodeNormals = new S2Vector(this._io, this, this._root);
            _t__m_clusterNodeNormals._read();
            this._m_clusterNodeNormals.push(_t__m_clusterNodeNormals);
          }
          this._io.seek(_pos);
        }
        return this._m_clusterNodeNormals;
      }
    });

    Model.prototype._write_clusterNodeNormals = function() {
      this._should_write_clusterNodeNormals = false;
      if (this.clusterNodesHaveNormals) {
        var _pos = this._io.pos;
        this._io.seek((((this.clusterNodeOffset + (this.clusterNodeCount * 6)) + 64) + this.clusterNodePaddingAmount));
        for (let i = 0; i < (this._m_clusterNodeNormals).length; i++) {
          this.clusterNodeNormals[i]._write__seq(this._io)
        }
        this._io.seek(_pos);
      }
      }

    Model.prototype._check_clusterNodeNormals = function() {
      this._should_write_clusterNodeNormals = false;
      if (this.clusterNodesHaveNormals) {
        if (this.clusterNodeNormals.length != this.clusterNodeCount) {
          throw new KaitaiStream.ConsistencyError("cluster_node_normals", this.clusterNodeNormals.length, this.clusterNodeCount);
        }
        for (let i = 0; i < (this._m_clusterNodeNormals).length; i++) {
          if (this.clusterNodeNormals[i]._root !== this._root) {
            throw new KaitaiStream.ConsistencyError("cluster_node_normals", this.clusterNodeNormals[i]._root, this._root);
          }
          if (this.clusterNodeNormals[i]._parent !== this) {
            throw new KaitaiStream.ConsistencyError("cluster_node_normals", this.clusterNodeNormals[i]._parent, this);
          }
        }
      }
      }

    /**
     * The start of the geometry data.
     */
    Object.defineProperty(Model.prototype, 'geometry', {

      set: function(v) {
        this._m_geometry = v;
      },
      get: function() {
        if (this._should_write_geometry) {
          this._write_geometry()
        }
        if (this._m_geometry !== undefined)
          return this._m_geometry;
        var _pos = this._io.pos;
        this._io.seek((this.primitiveHeadersOffset + 64));
        this._m_geometry = new Geometry(this._io, this, this._root);
        this._m_geometry._read();
        this._io.seek(_pos);
        return this._m_geometry;
      }
    });

    Model.prototype._write_geometry = function() {
      this._should_write_geometry = false;
      var _pos = this._io.pos;
      this._io.seek((this.primitiveHeadersOffset + 64));
      this.geometry._write__seq(this._io)
      this._io.seek(_pos);
      }

    Model.prototype._check_geometry = function() {
      this._should_write_geometry = false;
      if (this.geometry._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("geometry", this.geometry._root, this._root);
      }
      if (this.geometry._parent !== this) {
        throw new KaitaiStream.ConsistencyError("geometry", this.geometry._parent, this);
      }
      }

    /**
     * This is a helper, not part of the original mdl structure.
     */
    Object.defineProperty(Model.prototype, 'clusterNodeNormalsOffset', {

      set: function(v) {
        this._m_clusterNodeNormalsOffset = v;
      },
      get: function() {
        if (this._m_clusterNodeNormalsOffset !== undefined)
          return this._m_clusterNodeNormalsOffset;
        this._m_clusterNodeNormalsOffset = (((this.clusterNodeOffset + (this.clusterNodeCount * 6)) + 64) + this.clusterNodePaddingAmount);
        return this._m_clusterNodeNormalsOffset;
      }
    });

    Model.prototype._invalidate_clusterNodeNormalsOffset = function() {
    }

    /**
     * Morph targets for facial animation.
     */
    Object.defineProperty(Model.prototype, 'clusterNodes', {

      set: function(v) {
        this._m_clusterNodes = v;
      },
      get: function() {
        if (this._should_write_clusterNodes) {
          this._write_clusterNodes()
        }
        if (this._m_clusterNodes !== undefined)
          return this._m_clusterNodes;
        if (this.clusterNodeCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this.clusterNodeOffset + 64));
          this._m_clusterNodes = [];
          for (var i = 0; i < this.clusterNodeCount; i++) {
            var _t__m_clusterNodes = new S2Vector(this._io, this, this._root);
            _t__m_clusterNodes._read();
            this._m_clusterNodes.push(_t__m_clusterNodes);
          }
          this._io.seek(_pos);
        }
        return this._m_clusterNodes;
      }
    });

    Model.prototype._write_clusterNodes = function() {
      this._should_write_clusterNodes = false;
      if (this.clusterNodeCount > 0) {
        var _pos = this._io.pos;
        this._io.seek((this.clusterNodeOffset + 64));
        for (let i = 0; i < (this._m_clusterNodes).length; i++) {
          this.clusterNodes[i]._write__seq(this._io)
        }
        this._io.seek(_pos);
      }
      }

    Model.prototype._check_clusterNodes = function() {
      this._should_write_clusterNodes = false;
      if (this.clusterNodeCount > 0) {
        if (this.clusterNodes.length != this.clusterNodeCount) {
          throw new KaitaiStream.ConsistencyError("cluster_nodes", this.clusterNodes.length, this.clusterNodeCount);
        }
        for (let i = 0; i < (this._m_clusterNodes).length; i++) {
          if (this.clusterNodes[i]._root !== this._root) {
            throw new KaitaiStream.ConsistencyError("cluster_nodes", this.clusterNodes[i]._root, this._root);
          }
          if (this.clusterNodes[i]._parent !== this) {
            throw new KaitaiStream.ConsistencyError("cluster_nodes", this.clusterNodes[i]._parent, this);
          }
        }
      }
      }

    /**
     * Unknown original name.
     */
    Object.defineProperty(Model.prototype, 'clusterMaps', {

      set: function(v) {
        this._m_clusterMaps = v;
      },
      get: function() {
        if (this._should_write_clusterMaps) {
          this._write_clusterMaps()
        }
        if (this._m_clusterMaps !== undefined)
          return this._m_clusterMaps;
        var _pos = this._io.pos;
        this._io.seek((this.clusterMapOffset + 64));
        this._m_clusterMaps = new ClusterMaps(this._io, this, this._root);
        this._m_clusterMaps._read();
        this._io.seek(_pos);
        return this._m_clusterMaps;
      }
    });

    Model.prototype._write_clusterMaps = function() {
      this._should_write_clusterMaps = false;
      var _pos = this._io.pos;
      this._io.seek((this.clusterMapOffset + 64));
      this.clusterMaps._write__seq(this._io)
      this._io.seek(_pos);
      }

    Model.prototype._check_clusterMaps = function() {
      this._should_write_clusterMaps = false;
      if (this.clusterMaps._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("cluster_maps", this.clusterMaps._root, this._root);
      }
      if (this.clusterMaps._parent !== this) {
        throw new KaitaiStream.ConsistencyError("cluster_maps", this.clusterMaps._parent, this);
      }
      }

    /**
     * This is a helper, not part of the original mdl structure.
     */
    Object.defineProperty(Model.prototype, 'clusterNodesHaveNormals', {

      set: function(v) {
        this._m_clusterNodesHaveNormals = v;
      },
      get: function() {
        if (this._m_clusterNodesHaveNormals !== undefined)
          return this._m_clusterNodesHaveNormals;
        this._m_clusterNodesHaveNormals = (((this.clusterNodeOffset + (this.clusterNodeCount * 6)) + 64) + this.clusterNodePaddingAmount) != (this.clusterOffset + 64);
        return this._m_clusterNodesHaveNormals;
      }
    });

    Model.prototype._invalidate_clusterNodesHaveNormals = function() {
    }
    Object.defineProperty(Model.prototype, 'clusters', {

      set: function(v) {
        this._m_clusters = v;
      },
      get: function() {
        if (this._should_write_clusters) {
          this._write_clusters()
        }
        if (this._m_clusters !== undefined)
          return this._m_clusters;
        if (this.clusterCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this.clusterOffset + 64));
          this._m_clusters = [];
          for (var i = 0; i < this.clusterCount; i++) {
            var _t__m_clusters = new Cluster(this._io, this, this._root);
            _t__m_clusters._read();
            this._m_clusters.push(_t__m_clusters);
          }
          this._io.seek(_pos);
        }
        return this._m_clusters;
      }
    });

    Model.prototype._write_clusters = function() {
      this._should_write_clusters = false;
      if (this.clusterCount > 0) {
        var _pos = this._io.pos;
        this._io.seek((this.clusterOffset + 64));
        for (let i = 0; i < (this._m_clusters).length; i++) {
          this.clusters[i]._write__seq(this._io)
        }
        this._io.seek(_pos);
      }
      }

    Model.prototype._check_clusters = function() {
      this._should_write_clusters = false;
      if (this.clusterCount > 0) {
        if (this.clusters.length != this.clusterCount) {
          throw new KaitaiStream.ConsistencyError("clusters", this.clusters.length, this.clusterCount);
        }
        for (let i = 0; i < (this._m_clusters).length; i++) {
          if (this.clusters[i]._root !== this._root) {
            throw new KaitaiStream.ConsistencyError("clusters", this.clusters[i]._root, this._root);
          }
          if (this.clusters[i]._parent !== this) {
            throw new KaitaiStream.ConsistencyError("clusters", this.clusters[i]._parent, this);
          }
        }
      }
      }

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
     * Number of bone pairs (for linear blend skinning).
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
     * Number of transparent primitive headers, used for separate parts such
     * as hair? On the PS2 version, this field is called "n_vu0_parts",
     * suggesting that these were handled by the VU0 coprocessor, while
     * the opaque primitive headers were handled by the VU1 coprocessor.
     */

    /**
     * Offset to transparent primitive headers, used for separate parts such
     * as hair? On the PS2 version, this field is called "n_vu0_parts",
     * suggesting that these were handled by the VU0 coprocessor, while
     * the opaque primitive headers were handled by the VU1 coprocessor.
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
     * Offset to func_data for this object. Purpose unknown.
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
     * Number of transparent vertices.
     */

    /**
     * Offset to transparent vertex data.
     */

    /**
     * Offset to triangle index data.
     */

    /**
     * Offset to transparent triangle index data.
     */

    /**
     * Unknown original name.
     */

    /**
     * Unknown original name.
     */

    /**
     * Unknown original name.
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
      this._root = _root;

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
      this.normals = [];
      for (var i = 0; i < 3; i++) {
        this.normals.push(this._io.readS2le());
      }
      this.alignment = this._io.readU2le();
      if (!(this.alignment == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.alignment, this._io, "/types/vertex_data/seq/8");
      }
      this.u = this._io.readF4le();
      this.v = this._io.readF4le();
      this.boneIndex0 = this._io.readU1();
      this.boneIndex1 = this._io.readU1();
      var _ = this.boneIndex1;
      if (!( ((this.boneIndex1 == 0) || (this.boneIndex1 == 255) || (this.boneWeight1 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex1, this._io, "/types/vertex_data/seq/12");
      }
      this.boneIndex2 = this._io.readU1();
      var _ = this.boneIndex2;
      if (!( ((this.boneIndex2 == 0) || (this.boneIndex2 == 255) || (this.boneWeight2 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex2, this._io, "/types/vertex_data/seq/13");
      }
      this.boneIndex3 = this._io.readU1();
      var _ = this.boneIndex3;
      if (!( ((this.boneIndex3 == 0) || (this.boneIndex3 == 255) || (this.boneWeight3 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex3, this._io, "/types/vertex_data/seq/14");
      }
    }

    VertexData.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.normals).length; i++) {
      }
    }

    VertexData.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeF4le(this.x);
      this._io.writeF4le(this.y);
      this._io.writeF4le(this.z);
      this._io.writeF4le(this.boneWeight0);
      this._io.writeF4le(this.boneWeight1);
      this._io.writeF4le(this.boneWeight2);
      this._io.writeF4le(this.boneWeight3);
      for (let i = 0; i < (this.normals).length; i++) {
        this._io.writeS2le(this.normals[i]);
      }
      this._io.writeU2le(this.alignment);
      this._io.writeF4le(this.u);
      this._io.writeF4le(this.v);
      this._io.writeU1(this.boneIndex0);
      this._io.writeU1(this.boneIndex1);
      this._io.writeU1(this.boneIndex2);
      this._io.writeU1(this.boneIndex3);
    }

    VertexData.prototype._check = function() {
      if (!(this.boneWeight0 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight0, null, "/types/vertex_data/seq/3");
      }
      if (!(this.boneWeight0 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight0, null, "/types/vertex_data/seq/3");
      }
      if (!(this.boneWeight1 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight1, null, "/types/vertex_data/seq/4");
      }
      if (!(this.boneWeight1 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight1, null, "/types/vertex_data/seq/4");
      }
      if (!(this.boneWeight2 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight2, null, "/types/vertex_data/seq/5");
      }
      if (!(this.boneWeight2 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight2, null, "/types/vertex_data/seq/5");
      }
      if (!(this.boneWeight3 >= 0)) {
        throw new KaitaiStream.ValidationLessThanError(0, this.boneWeight3, null, "/types/vertex_data/seq/6");
      }
      if (!(this.boneWeight3 <= 1)) {
        throw new KaitaiStream.ValidationGreaterThanError(1, this.boneWeight3, null, "/types/vertex_data/seq/6");
      }
      if (this.normals.length != 3) {
        throw new KaitaiStream.ConsistencyError("normals", this.normals.length, 3);
      }
      for (let i = 0; i < (this.normals).length; i++) {
      }
      if (!(this.alignment == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.alignment, null, "/types/vertex_data/seq/8");
      }
      var _ = this.boneIndex1;
      if (!( ((this.boneIndex1 == 0) || (this.boneIndex1 == 255) || (this.boneWeight1 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex1, null, "/types/vertex_data/seq/12");
      }
      var _ = this.boneIndex2;
      if (!( ((this.boneIndex2 == 0) || (this.boneIndex2 == 255) || (this.boneWeight2 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex2, null, "/types/vertex_data/seq/13");
      }
      var _ = this.boneIndex3;
      if (!( ((this.boneIndex3 == 0) || (this.boneIndex3 == 255) || (this.boneWeight3 > 0)) )) {
        throw new KaitaiStream.ValidationExprError(this.boneIndex3, null, "/types/vertex_data/seq/14");
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
      this._root = _root;

    }
    PrimitiveHeaderWrapper.prototype._read = function() {
      this.primitiveHeaderSize = this._io.readU4le();
      this._raw_body = this._io.readBytes((this.primitiveHeaderSize - 4));
      var _io__raw_body = new KaitaiStream(this._raw_body);
      this.body = new PrimitiveHeader(_io__raw_body, this, this._root);
      this.body._read();
    }

    PrimitiveHeaderWrapper.prototype._fetchInstances = function() {
      this.body._fetchInstances()
    }

    PrimitiveHeaderWrapper.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU4le(this.primitiveHeaderSize);
      var _io__raw_body = new KaitaiStream(new ArrayBuffer((this.primitiveHeaderSize - 4)));
      this._io.addChildStream(_io__raw_body)
      var _pos2 = this._io.pos
      this._io.seek(this._io.pos + ((this.primitiveHeaderSize - 4)))
      const handler = (parent) => {
        this._raw_body = _io__raw_body.toByteArray();
        if (this._raw_body.length != (this.primitiveHeaderSize - 4)) {
          throw new KaitaiStream.ConsistencyError("raw(body)", this._raw_body.length, (this.primitiveHeaderSize - 4));
        }
        parent.writeBytes(this._raw_body)
        }
      _io__raw_body.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
      this.body._write__seq(_io__raw_body)
    }

    PrimitiveHeaderWrapper.prototype._check = function() {
      if (this.body._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("body", this.body._root, this._root);
      }
      if (this.body._parent !== this) {
        throw new KaitaiStream.ConsistencyError("body", this.body._parent, this);
      }
      }

    return PrimitiveHeaderWrapper;
  })();

  var Cluster = Mdl.Cluster = (function() {
    function Cluster(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._should_write_data = false;
      this.data__to_write = true;
    }
    Cluster.prototype._read = function() {
      this.nodeCount = this._io.readU4le();
      this.offset = this._io.readU4le();
    }

    Cluster.prototype._fetchInstances = function() {
      _ = this.data
      this.data._fetchInstances()
    }

    Cluster.prototype._write__seq = function(io) {
      this._io = io;
      this._should_write_data = this.data__to_write;
      this._io.writeU4le(this.nodeCount);
      this._io.writeU4le(this.offset);
    }

    Cluster.prototype._check = function() {
      }
    Object.defineProperty(Cluster.prototype, 'data', {

      set: function(v) {
        this._m_data = v;
      },
      get: function() {
        if (this._should_write_data) {
          this._write_data()
        }
        if (this._m_data !== undefined)
          return this._m_data;
        var _pos = this._io.pos;
        this._io.seek((this.offset + 64));
        this._m_data = new ClusterDataList(this._io, this, this._root);
        this._m_data._read();
        this._io.seek(_pos);
        return this._m_data;
      }
    });

    Cluster.prototype._write_data = function() {
      this._should_write_data = false;
      var _pos = this._io.pos;
      this._io.seek((this.offset + 64));
      this.data._write__seq(this._io)
      this._io.seek(_pos);
      }

    Cluster.prototype._check_data = function() {
      this._should_write_data = false;
      if (this.data._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("data", this.data._root, this._root);
      }
      if (this.data._parent !== this) {
        throw new KaitaiStream.ConsistencyError("data", this.data._parent, this);
      }
      }

    return Cluster;
  })();

  var TextureMetadata = Mdl.TextureMetadata = (function() {
    function TextureMetadata(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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
        var _t_texturePairs = new TexturePair(this._io, this, this._root);
        _t_texturePairs._read();
        this.texturePairs.push(_t_texturePairs);
      }
    }

    TextureMetadata.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.mainTextureIds).length; i++) {
      }
      if (KaitaiStream.mod(this._parent.textureBlocksCount, 4) > 0) {
      }
      for (let i = 0; i < (this.texturePairs).length; i++) {
        this.texturePairs[i]._fetchInstances()
      }
    }

    TextureMetadata.prototype._write__seq = function(io) {
      this._io = io;
      for (let i = 0; i < (this.mainTextureIds).length; i++) {
        this._io.writeU4le(this.mainTextureIds[i]);
      }
      if (KaitaiStream.mod(this._parent.textureBlocksCount, 4) > 0) {
        this._io.writeBytes(this.pad)
      }
      for (let i = 0; i < (this.texturePairs).length; i++) {
        this.texturePairs[i]._write__seq(this._io)
      }
    }

    TextureMetadata.prototype._check = function() {
      if (this.mainTextureIds.length != this._parent.textureBlocksCount) {
        throw new KaitaiStream.ConsistencyError("main_texture_ids", this.mainTextureIds.length, this._parent.textureBlocksCount);
      }
      for (let i = 0; i < (this.mainTextureIds).length; i++) {
      }
      if (KaitaiStream.mod(this._parent.textureBlocksCount, 4) > 0) {
        if (this.pad.length != (16 - KaitaiStream.mod((4 * this._parent.textureBlocksCount), 16))) {
          throw new KaitaiStream.ConsistencyError("pad", this.pad.length, (16 - KaitaiStream.mod((4 * this._parent.textureBlocksCount), 16)));
        }
      }
      if (this.texturePairs.length != this._parent.textureIdCount) {
        throw new KaitaiStream.ConsistencyError("texture_pairs", this.texturePairs.length, this._parent.textureIdCount);
      }
      for (let i = 0; i < (this.texturePairs).length; i++) {
        if (this.texturePairs[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("texture_pairs", this.texturePairs[i]._root, this._root);
        }
        if (this.texturePairs[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("texture_pairs", this.texturePairs[i]._parent, this);
        }
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

  var S2Vector = Mdl.S2Vector = (function() {
    function S2Vector(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    S2Vector.prototype._read = function() {
      this.x = this._io.readS2le();
      this.y = this._io.readS2le();
      this.z = this._io.readS2le();
    }

    S2Vector.prototype._fetchInstances = function() {
    }

    S2Vector.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeS2le(this.x);
      this._io.writeS2le(this.y);
      this._io.writeS2le(this.z);
    }

    S2Vector.prototype._check = function() {
      }

    return S2Vector;
  })();

  /**
   * TODO
   */

  var TexturePair = Mdl.TexturePair = (function() {
    function TexturePair(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    TexturePair.prototype._read = function() {
      this.textureIndex = this._io.readU4le();
      this.spriteId = this._io.readU4le();
      if (!(this.spriteId >= 1)) {
        throw new KaitaiStream.ValidationLessThanError(1, this.spriteId, this._io, "/types/texture_pair/seq/1");
      }
    }

    TexturePair.prototype._fetchInstances = function() {
    }

    TexturePair.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU4le(this.textureIndex);
      this._io.writeU4le(this.spriteId);
    }

    TexturePair.prototype._check = function() {
      if (!(this.spriteId >= 1)) {
        throw new KaitaiStream.ValidationLessThanError(1, this.spriteId, null, "/types/texture_pair/seq/1");
      }
      }

    return TexturePair;
  })();

  var ClusterDataList = Mdl.ClusterDataList = (function() {
    function ClusterDataList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    ClusterDataList.prototype._read = function() {
      this.vertices = [];
      for (var i = 0; i < this._parent.nodeCount; i++) {
        var _t_vertices = new ClusterData(this._io, this, this._root);
        _t_vertices._read();
        this.vertices.push(_t_vertices);
      }
      if (KaitaiStream.mod(this._io.pos, 16) != 0) {
        this.alignment = this._io.readBytes((16 - KaitaiStream.mod(this._io.pos, 16)));
      }
      if (this._root.modelData.clusterNodesHaveNormals) {
        this.normals = [];
        for (var i = 0; i < this._parent.nodeCount; i++) {
          var _t_normals = new ClusterData(this._io, this, this._root);
          _t_normals._read();
          this.normals.push(_t_normals);
        }
      }
    }

    ClusterDataList.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.vertices).length; i++) {
        this.vertices[i]._fetchInstances()
      }
      if (KaitaiStream.mod(this._io.pos, 16) != 0) {
      }
      if (this._root.modelData.clusterNodesHaveNormals) {
        for (let i = 0; i < (this.normals).length; i++) {
          this.normals[i]._fetchInstances()
        }
      }
    }

    ClusterDataList.prototype._write__seq = function(io) {
      this._io = io;
      for (let i = 0; i < (this.vertices).length; i++) {
        this.vertices[i]._write__seq(this._io)
      }
      if (KaitaiStream.mod(this._io.pos, 16) != 0) {
        if (this.alignment.length != (16 - KaitaiStream.mod(this._io.pos, 16))) {
          throw new KaitaiStream.ConsistencyError("alignment", this.alignment.length, (16 - KaitaiStream.mod(this._io.pos, 16)));
        }
        this._io.writeBytes(this.alignment)
      }
      if (this._root.modelData.clusterNodesHaveNormals) {
        for (let i = 0; i < (this.normals).length; i++) {
          this.normals[i]._write__seq(this._io)
        }
      }
    }

    ClusterDataList.prototype._check = function() {
      if (this.vertices.length != this._parent.nodeCount) {
        throw new KaitaiStream.ConsistencyError("vertices", this.vertices.length, this._parent.nodeCount);
      }
      for (let i = 0; i < (this.vertices).length; i++) {
        if (this.vertices[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("vertices", this.vertices[i]._root, this._root);
        }
        if (this.vertices[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("vertices", this.vertices[i]._parent, this);
        }
      }
      if (this._root.modelData.clusterNodesHaveNormals) {
        if (this.normals.length != this._parent.nodeCount) {
          throw new KaitaiStream.ConsistencyError("normals", this.normals.length, this._parent.nodeCount);
        }
        for (let i = 0; i < (this.normals).length; i++) {
          if (this.normals[i]._root !== this._root) {
            throw new KaitaiStream.ConsistencyError("normals", this.normals[i]._root, this._root);
          }
          if (this.normals[i]._parent !== this) {
            throw new KaitaiStream.ConsistencyError("normals", this.normals[i]._parent, this);
          }
        }
      }
      }

    return ClusterDataList;
  })();

  /**
   * Description for a primitive, in the OpenGL sense of the word
   * "primitive". In this case, the primitives are triangle strips, but
   * the triangle list can contain degenerate triangles that are used to
   * separate strips.
   */

  var PrimitiveHeader = Mdl.PrimitiveHeader = (function() {
    PrimitiveHeader.MaterialType = Object.freeze({
      Unlit: 1,
      Matte: 2,
      MattePlus: 3,
      Glossy: 4,

      1: "Unlit",
      2: "Matte",
      3: "MattePlus",
      4: "Glossy",
    });

    function PrimitiveHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._should_write_bonePairIndices = false;
      this.bonePairIndices__to_write = true;
      this._should_write_textureIndices = false;
      this.textureIndices__to_write = true;
      this._should_write_samplerStates = false;
      this.samplerStates__to_write = true;
    }
    PrimitiveHeader.prototype._read = function() {
      this.pad0 = this._io.readBytes(4);
      this.boneCount = this._io.readU4le();
      this.boneIndicesOffset = this._io.readU4le();
      this.bonePairsCount = this._io.readU4le();
      this.bonePairsOffset = this._io.readU4le();
      this.textureIndexCount = this._io.readU4le();
      this.textureIndexOffset = this._io.readU4le();
      this.samplerStatesOffset = this._io.readU4le();
      this.materialType = this._io.readU1();
      this.unknownByte0 = this._io.readU1();
      this.poseIndex = this._io.readU1();
      this.unknownByte1 = this._io.readU1();
      this.backfaceCulling = this._io.readU4le();
      this.unknownFloat0 = this._io.readF4le();
      this.unknownFloat1 = this._io.readF4le();
      this.specularScale = this._io.readF4le();
      this.unknownSection0 = this._io.readBytes(8);
      this.pad1 = this._io.readBytes(4);
      this.diffuseColor = [];
      for (var i = 0; i < 3; i++) {
        this.diffuseColor.push(this._io.readF4le());
      }
      this.pad2 = this._io.readBytes(4);
      this.ambientColor = [];
      for (var i = 0; i < 3; i++) {
        this.ambientColor.push(this._io.readF4le());
      }
      this.pad3 = this._io.readBytes(4);
      this.specularColor = [];
      for (var i = 0; i < 3; i++) {
        this.specularColor.push(this._io.readF4le());
      }
      this.pad4 = this._io.readBytes(4);
      this.primitiveStartIndex = this._io.readU4le();
      this.primitiveLength = this._io.readU4le();
      this.pad5 = this._io.readBytes(4);
      this.boneIndices = [];
      for (var i = 0; i < this.boneCount; i++) {
        this.boneIndices.push(this._io.readU2le());
      }
    }

    PrimitiveHeader.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.diffuseColor).length; i++) {
      }
      for (let i = 0; i < (this.ambientColor).length; i++) {
      }
      for (let i = 0; i < (this.specularColor).length; i++) {
      }
      for (let i = 0; i < (this.boneIndices).length; i++) {
      }
      _ = this.bonePairIndices
      this.bonePairIndices._fetchInstances()
      _ = this.textureIndices
      this.textureIndices._fetchInstances()
      _ = this.samplerStates
      for (let i = 0; i < (this._m_samplerStates).length; i++) {
      }
    }

    PrimitiveHeader.prototype._write__seq = function(io) {
      this._io = io;
      this._should_write_bonePairIndices = this.bonePairIndices__to_write;
      this._should_write_textureIndices = this.textureIndices__to_write;
      this._should_write_samplerStates = this.samplerStates__to_write;
      this._io.writeBytes(this.pad0)
      this._io.writeU4le(this.boneCount);
      this._io.writeU4le(this.boneIndicesOffset);
      this._io.writeU4le(this.bonePairsCount);
      this._io.writeU4le(this.bonePairsOffset);
      this._io.writeU4le(this.textureIndexCount);
      this._io.writeU4le(this.textureIndexOffset);
      this._io.writeU4le(this.samplerStatesOffset);
      this._io.writeU1(this.materialType);
      this._io.writeU1(this.unknownByte0);
      this._io.writeU1(this.poseIndex);
      this._io.writeU1(this.unknownByte1);
      this._io.writeU4le(this.backfaceCulling);
      this._io.writeF4le(this.unknownFloat0);
      this._io.writeF4le(this.unknownFloat1);
      this._io.writeF4le(this.specularScale);
      this._io.writeBytes(this.unknownSection0)
      this._io.writeBytes(this.pad1)
      for (let i = 0; i < (this.diffuseColor).length; i++) {
        this._io.writeF4le(this.diffuseColor[i]);
      }
      this._io.writeBytes(this.pad2)
      for (let i = 0; i < (this.ambientColor).length; i++) {
        this._io.writeF4le(this.ambientColor[i]);
      }
      this._io.writeBytes(this.pad3)
      for (let i = 0; i < (this.specularColor).length; i++) {
        this._io.writeF4le(this.specularColor[i]);
      }
      this._io.writeBytes(this.pad4)
      this._io.writeU4le(this.primitiveStartIndex);
      this._io.writeU4le(this.primitiveLength);
      this._io.writeBytes(this.pad5)
      for (let i = 0; i < (this.boneIndices).length; i++) {
        this._io.writeU2le(this.boneIndices[i]);
      }
    }

    PrimitiveHeader.prototype._check = function() {
      if (this.pad0.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad0", this.pad0.length, 4);
      }
      if (this.unknownSection0.length != 8) {
        throw new KaitaiStream.ConsistencyError("unknown_section0", this.unknownSection0.length, 8);
      }
      if (this.pad1.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad1", this.pad1.length, 4);
      }
      if (this.diffuseColor.length != 3) {
        throw new KaitaiStream.ConsistencyError("diffuse_color", this.diffuseColor.length, 3);
      }
      for (let i = 0; i < (this.diffuseColor).length; i++) {
      }
      if (this.pad2.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad2", this.pad2.length, 4);
      }
      if (this.ambientColor.length != 3) {
        throw new KaitaiStream.ConsistencyError("ambient_color", this.ambientColor.length, 3);
      }
      for (let i = 0; i < (this.ambientColor).length; i++) {
      }
      if (this.pad3.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad3", this.pad3.length, 4);
      }
      if (this.specularColor.length != 3) {
        throw new KaitaiStream.ConsistencyError("specular_color", this.specularColor.length, 3);
      }
      for (let i = 0; i < (this.specularColor).length; i++) {
      }
      if (this.pad4.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad4", this.pad4.length, 4);
      }
      if (this.pad5.length != 4) {
        throw new KaitaiStream.ConsistencyError("pad5", this.pad5.length, 4);
      }
      if (this.boneIndices.length != this.boneCount) {
        throw new KaitaiStream.ConsistencyError("bone_indices", this.boneIndices.length, this.boneCount);
      }
      for (let i = 0; i < (this.boneIndices).length; i++) {
      }
      }

    /**
     * A list of bone pair indices. See bone_indices doc comment, a similar
     * concept applies.
     */
    Object.defineProperty(PrimitiveHeader.prototype, 'bonePairIndices', {

      set: function(v) {
        this._m_bonePairIndices = v;
      },
      get: function() {
        if (this._should_write_bonePairIndices) {
          this._write_bonePairIndices()
        }
        if (this._m_bonePairIndices !== undefined)
          return this._m_bonePairIndices;
        var _pos = this._io.pos;
        this._io.seek((this.bonePairsOffset - 4));
        this._raw__m_bonePairIndices = this._io.readBytes((this.bonePairsCount * 2));
        var _io__raw__m_bonePairIndices = new KaitaiStream(this._raw__m_bonePairIndices);
        this._m_bonePairIndices = new IndexList(_io__raw__m_bonePairIndices, this, this._root);
        this._m_bonePairIndices._read();
        this._io.seek(_pos);
        return this._m_bonePairIndices;
      }
    });

    PrimitiveHeader.prototype._write_bonePairIndices = function() {
      this._should_write_bonePairIndices = false;
      var _pos = this._io.pos;
      this._io.seek((this.bonePairsOffset - 4));
      var _io__raw__m_bonePairIndices = new KaitaiStream(new ArrayBuffer((this.bonePairsCount * 2)));
      this._io.addChildStream(_io__raw__m_bonePairIndices)
      var _pos2 = this._io.pos
      this._io.seek(this._io.pos + ((this.bonePairsCount * 2)))
      const handler = (parent) => {
        this._raw__m_bonePairIndices = _io__raw__m_bonePairIndices.toByteArray();
        if (this._raw__m_bonePairIndices.length != (this.bonePairsCount * 2)) {
          throw new KaitaiStream.ConsistencyError("raw(bone_pair_indices)", this._raw__m_bonePairIndices.length, (this.bonePairsCount * 2));
        }
        parent.writeBytes(this._raw__m_bonePairIndices)
        }
      _io__raw__m_bonePairIndices.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
      this.bonePairIndices._write__seq(_io__raw__m_bonePairIndices)
      this._io.seek(_pos);
      }

    PrimitiveHeader.prototype._check_bonePairIndices = function() {
      this._should_write_bonePairIndices = false;
      if (this.bonePairIndices._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("bone_pair_indices", this.bonePairIndices._root, this._root);
      }
      if (this.bonePairIndices._parent !== this) {
        throw new KaitaiStream.ConsistencyError("bone_pair_indices", this.bonePairIndices._parent, this);
      }
      }

    /**
     * A list of texture indices? TODO
     */
    Object.defineProperty(PrimitiveHeader.prototype, 'textureIndices', {

      set: function(v) {
        this._m_textureIndices = v;
      },
      get: function() {
        if (this._should_write_textureIndices) {
          this._write_textureIndices()
        }
        if (this._m_textureIndices !== undefined)
          return this._m_textureIndices;
        var _pos = this._io.pos;
        this._io.seek((this.textureIndexOffset - 4));
        this._raw__m_textureIndices = this._io.readBytes((this.textureIndexCount * 2));
        var _io__raw__m_textureIndices = new KaitaiStream(this._raw__m_textureIndices);
        this._m_textureIndices = new IndexList(_io__raw__m_textureIndices, this, this._root);
        this._m_textureIndices._read();
        this._io.seek(_pos);
        return this._m_textureIndices;
      }
    });

    PrimitiveHeader.prototype._write_textureIndices = function() {
      this._should_write_textureIndices = false;
      var _pos = this._io.pos;
      this._io.seek((this.textureIndexOffset - 4));
      var _io__raw__m_textureIndices = new KaitaiStream(new ArrayBuffer((this.textureIndexCount * 2)));
      this._io.addChildStream(_io__raw__m_textureIndices)
      var _pos2 = this._io.pos
      this._io.seek(this._io.pos + ((this.textureIndexCount * 2)))
      const handler = (parent) => {
        this._raw__m_textureIndices = _io__raw__m_textureIndices.toByteArray();
        if (this._raw__m_textureIndices.length != (this.textureIndexCount * 2)) {
          throw new KaitaiStream.ConsistencyError("raw(texture_indices)", this._raw__m_textureIndices.length, (this.textureIndexCount * 2));
        }
        parent.writeBytes(this._raw__m_textureIndices)
        }
      _io__raw__m_textureIndices.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
      this.textureIndices._write__seq(_io__raw__m_textureIndices)
      this._io.seek(_pos);
      }

    PrimitiveHeader.prototype._check_textureIndices = function() {
      this._should_write_textureIndices = false;
      if (this.textureIndices._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("texture_indices", this.textureIndices._root, this._root);
      }
      if (this.textureIndices._parent !== this) {
        throw new KaitaiStream.ConsistencyError("texture_indices", this.textureIndices._parent, this);
      }
      }
    Object.defineProperty(PrimitiveHeader.prototype, 'samplerStates', {

      set: function(v) {
        this._m_samplerStates = v;
      },
      get: function() {
        if (this._should_write_samplerStates) {
          this._write_samplerStates()
        }
        if (this._m_samplerStates !== undefined)
          return this._m_samplerStates;
        var _pos = this._io.pos;
        this._io.seek((this.samplerStatesOffset - 4));
        this._m_samplerStates = [];
        for (var i = 0; i < 4; i++) {
          this._m_samplerStates.push(this._io.readU1());
        }
        this._io.seek(_pos);
        return this._m_samplerStates;
      }
    });

    PrimitiveHeader.prototype._write_samplerStates = function() {
      this._should_write_samplerStates = false;
      var _pos = this._io.pos;
      this._io.seek((this.samplerStatesOffset - 4));
      for (let i = 0; i < (this._m_samplerStates).length; i++) {
        this._io.writeU1(this.samplerStates[i]);
      }
      this._io.seek(_pos);
      }

    PrimitiveHeader.prototype._check_samplerStates = function() {
      this._should_write_samplerStates = false;
      if (this.samplerStates.length != 4) {
        throw new KaitaiStream.ConsistencyError("sampler_states", this.samplerStates.length, 4);
      }
      for (let i = 0; i < (this._m_samplerStates).length; i++) {
      }
      }

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
     * From FF24, this is an offset to ADDRESSU, ADDRESSV, MAGFILTER and 
     * MINFILTER sampler states.
     */

    /**
     * See FrozenFish24's SH2MapTools/Sh2ModelMaterialEditor/Model.py#L75
     */

    /**
     * Possibly material-related, see `material_type`.
     */

    /**
     * If zero, this primitive is always visible. Otherwise, it may be
     * hidden and swapped out at various times, e.g. for James's hands.
     */

    /**
     * From FF24, reported to affect diffuse color somehow.
     */

    /**
     * From FF24, reported to affect ambient color somehow.
     */

    /**
     * From FF24, larger value = smaller specular.
     */

    /**
     * Unknown purpose.
     */

    /**
     * From FF24, this is the diffuse color.
     */

    /**
     * From FF24, this is the ambient color.
     */

    /**
     * From FF24, this is the specular color (range 0-128).
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

  var ClusterMaps = Mdl.ClusterMaps = (function() {
    function ClusterMaps(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    ClusterMaps.prototype._read = function() {
      this.opaque = [];
      for (var i = 0; i < this._root.modelData.opaqueClusterMapCount; i++) {
        var _t_opaque = new ClusterMapping(this._io, this, this._root);
        _t_opaque._read();
        this.opaque.push(_t_opaque);
      }
      this.transparent = [];
      for (var i = 0; i < this._root.modelData.transparentClusterMapCount; i++) {
        var _t_transparent = new ClusterMapping(this._io, this, this._root);
        _t_transparent._read();
        this.transparent.push(_t_transparent);
      }
    }

    ClusterMaps.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.opaque).length; i++) {
        this.opaque[i]._fetchInstances()
      }
      for (let i = 0; i < (this.transparent).length; i++) {
        this.transparent[i]._fetchInstances()
      }
    }

    ClusterMaps.prototype._write__seq = function(io) {
      this._io = io;
      for (let i = 0; i < (this.opaque).length; i++) {
        this.opaque[i]._write__seq(this._io)
      }
      for (let i = 0; i < (this.transparent).length; i++) {
        this.transparent[i]._write__seq(this._io)
      }
    }

    ClusterMaps.prototype._check = function() {
      if (this.opaque.length != this._root.modelData.opaqueClusterMapCount) {
        throw new KaitaiStream.ConsistencyError("opaque", this.opaque.length, this._root.modelData.opaqueClusterMapCount);
      }
      for (let i = 0; i < (this.opaque).length; i++) {
        if (this.opaque[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("opaque", this.opaque[i]._root, this._root);
        }
        if (this.opaque[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("opaque", this.opaque[i]._parent, this);
        }
      }
      if (this.transparent.length != this._root.modelData.transparentClusterMapCount) {
        throw new KaitaiStream.ConsistencyError("transparent", this.transparent.length, this._root.modelData.transparentClusterMapCount);
      }
      for (let i = 0; i < (this.transparent).length; i++) {
        if (this.transparent[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("transparent", this.transparent[i]._root, this._root);
        }
        if (this.transparent[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("transparent", this.transparent[i]._parent, this);
        }
      }
      }

    return ClusterMaps;
  })();

  /**
   * Represents a parent-child bone relationship.
   */

  var SkeletonPair = Mdl.SkeletonPair = (function() {
    function SkeletonPair(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    SkeletonPair.prototype._read = function() {
      this.parent = this._io.readU1();
      this.child = this._io.readU1();
    }

    SkeletonPair.prototype._fetchInstances = function() {
    }

    SkeletonPair.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU1(this.parent);
      this._io.writeU1(this.child);
    }

    SkeletonPair.prototype._check = function() {
      }

    return SkeletonPair;
  })();

  var TransparentPrimitiveHeaderWrapper = Mdl.TransparentPrimitiveHeaderWrapper = (function() {
    function TransparentPrimitiveHeaderWrapper(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    TransparentPrimitiveHeaderWrapper.prototype._read = function() {
      this.transparentPrimitiveHeaderSize = this._io.readU4le();
      this._raw_body = this._io.readBytes((this.transparentPrimitiveHeaderSize - 4));
      var _io__raw_body = new KaitaiStream(this._raw_body);
      this.body = new TransparentPrimitiveHeader(_io__raw_body, this, this._root);
      this.body._read();
    }

    TransparentPrimitiveHeaderWrapper.prototype._fetchInstances = function() {
      this.body._fetchInstances()
    }

    TransparentPrimitiveHeaderWrapper.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU4le(this.transparentPrimitiveHeaderSize);
      var _io__raw_body = new KaitaiStream(new ArrayBuffer((this.transparentPrimitiveHeaderSize - 4)));
      this._io.addChildStream(_io__raw_body)
      var _pos2 = this._io.pos
      this._io.seek(this._io.pos + ((this.transparentPrimitiveHeaderSize - 4)))
      const handler = (parent) => {
        this._raw_body = _io__raw_body.toByteArray();
        if (this._raw_body.length != (this.transparentPrimitiveHeaderSize - 4)) {
          throw new KaitaiStream.ConsistencyError("raw(body)", this._raw_body.length, (this.transparentPrimitiveHeaderSize - 4));
        }
        parent.writeBytes(this._raw_body)
        }
      _io__raw_body.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
      this.body._write__seq(_io__raw_body)
    }

    TransparentPrimitiveHeaderWrapper.prototype._check = function() {
      if (this.body._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("body", this.body._root, this._root);
      }
      if (this.body._parent !== this) {
        throw new KaitaiStream.ConsistencyError("body", this.body._parent, this);
      }
      }

    return TransparentPrimitiveHeaderWrapper;
  })();

  var TextureContainer = Mdl.TextureContainer = (function() {
    function TextureContainer(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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
        var _t_spriteHeaders = new SpriteHeader(this._io, this, this._root);
        _t_spriteHeaders._read();
        this.spriteHeaders.push(_t_spriteHeaders);
      }
      this.data = this._io.readBytes((this.spriteHeaders[0].format != 0 ? (this.width * this.height) : Math.floor((this.width * this.height) / 2)));
    }

    TextureContainer.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.spriteHeaders).length; i++) {
        this.spriteHeaders[i]._fetchInstances()
      }
    }

    TextureContainer.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU4le(this.textureId);
      this._io.writeU2le(this.width);
      this._io.writeU2le(this.height);
      this._io.writeU2le(this.width2);
      this._io.writeU2le(this.height2);
      this._io.writeU2le(this.spriteCount);
      this._io.writeBytes(this.unknownSection)
      for (let i = 0; i < (this.spriteHeaders).length; i++) {
        this.spriteHeaders[i]._write__seq(this._io)
      }
      this._io.writeBytes(this.data)
    }

    TextureContainer.prototype._check = function() {
      if (this.unknownSection.length != 18) {
        throw new KaitaiStream.ConsistencyError("unknown_section", this.unknownSection.length, 18);
      }
      if (this.spriteHeaders.length != this.spriteCount) {
        throw new KaitaiStream.ConsistencyError("sprite_headers", this.spriteHeaders.length, this.spriteCount);
      }
      for (let i = 0; i < (this.spriteHeaders).length; i++) {
        if (this.spriteHeaders[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("sprite_headers", this.spriteHeaders[i]._root, this._root);
        }
        if (this.spriteHeaders[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("sprite_headers", this.spriteHeaders[i]._parent, this);
        }
      }
      if (this.data.length != (this.spriteHeaders[0].format != 0 ? (this.width * this.height) : Math.floor((this.width * this.height) / 2))) {
        throw new KaitaiStream.ConsistencyError("data", this.data.length, (this.spriteHeaders[0].format != 0 ? (this.width * this.height) : Math.floor((this.width * this.height) / 2)));
      }
      }

    return TextureContainer;
  })();

  var IndexList = Mdl.IndexList = (function() {
    function IndexList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    IndexList.prototype._read = function() {
      this.array = [];
      var i = 0;
      while (!this._io.isEof()) {
        this.array.push(this._io.readU2le());
        i++;
      }
    }

    IndexList.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.array).length; i++) {
      }
    }

    IndexList.prototype._write__seq = function(io) {
      this._io = io;
      for (let i = 0; i < (this.array).length; i++) {
        if (this._io.isEof()) {
          throw new KaitaiStream.ConsistencyError("array", this._io.size - this._io.pos, 0);
        }
        this._io.writeU2le(this.array[i]);
      }
      if ((this._io.isEof() === false)) {
        throw new KaitaiStream.ConsistencyError("array", this._io.size - this._io.pos, 0);
      }
    }

    IndexList.prototype._check = function() {
      for (let i = 0; i < (this.array).length; i++) {
      }
      }

    return IndexList;
  })();

  var TransparentVertexData = Mdl.TransparentVertexData = (function() {
    function TransparentVertexData(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    TransparentVertexData.prototype._read = function() {
      this.x = this._io.readF4le();
      this.y = this._io.readF4le();
      this.z = this._io.readF4le();
      this.w = this._io.readF4le();
      if (!(this.w == 1)) {
        throw new KaitaiStream.ValidationNotEqualError(1, this.w, this._io, "/types/transparent_vertex_data/seq/3");
      }
      this.boneWeights = [];
      for (var i = 0; i < 4; i++) {
        this.boneWeights.push(this._io.readF4le());
      }
      this.normalX = this._io.readF4le();
      this.normalY = this._io.readF4le();
      this.normalZ = this._io.readF4le();
      var _ = this.normalZ;
      if (!(((((this.normalX * this.normalX) + (this.normalY * this.normalY)) + (this.normalZ * this.normalZ)) - 1.0) < 0.05)) {
        throw new KaitaiStream.ValidationExprError(this.normalZ, this._io, "/types/transparent_vertex_data/seq/7");
      }
      this.unknown1 = this._io.readBytes(4);
      this.u = this._io.readF4le();
      this.v = this._io.readF4le();
      this.unknown2 = this._io.readBytes(8);
      this.boneIndex = this._io.readU1();
      this.unknown3 = this._io.readU1();
      this.bonePairIndex0 = this._io.readU1();
      this.unknown4 = this._io.readU1();
      this.bonePairIndex1 = this._io.readU1();
      this.unknown5 = this._io.readU1();
      this.bonePairIndex2 = this._io.readU1();
      this.unknown6 = this._io.readU1();
    }

    TransparentVertexData.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.boneWeights).length; i++) {
      }
    }

    TransparentVertexData.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeF4le(this.x);
      this._io.writeF4le(this.y);
      this._io.writeF4le(this.z);
      this._io.writeF4le(this.w);
      for (let i = 0; i < (this.boneWeights).length; i++) {
        this._io.writeF4le(this.boneWeights[i]);
      }
      this._io.writeF4le(this.normalX);
      this._io.writeF4le(this.normalY);
      this._io.writeF4le(this.normalZ);
      this._io.writeBytes(this.unknown1)
      this._io.writeF4le(this.u);
      this._io.writeF4le(this.v);
      this._io.writeBytes(this.unknown2)
      this._io.writeU1(this.boneIndex);
      this._io.writeU1(this.unknown3);
      this._io.writeU1(this.bonePairIndex0);
      this._io.writeU1(this.unknown4);
      this._io.writeU1(this.bonePairIndex1);
      this._io.writeU1(this.unknown5);
      this._io.writeU1(this.bonePairIndex2);
      this._io.writeU1(this.unknown6);
    }

    TransparentVertexData.prototype._check = function() {
      if (!(this.w == 1)) {
        throw new KaitaiStream.ValidationNotEqualError(1, this.w, null, "/types/transparent_vertex_data/seq/3");
      }
      if (this.boneWeights.length != 4) {
        throw new KaitaiStream.ConsistencyError("bone_weights", this.boneWeights.length, 4);
      }
      for (let i = 0; i < (this.boneWeights).length; i++) {
      }
      var _ = this.normalZ;
      if (!(((((this.normalX * this.normalX) + (this.normalY * this.normalY)) + (this.normalZ * this.normalZ)) - 1.0) < 0.05)) {
        throw new KaitaiStream.ValidationExprError(this.normalZ, null, "/types/transparent_vertex_data/seq/7");
      }
      if (this.unknown1.length != 4) {
        throw new KaitaiStream.ConsistencyError("unknown1", this.unknown1.length, 4);
      }
      if (this.unknown2.length != 8) {
        throw new KaitaiStream.ConsistencyError("unknown2", this.unknown2.length, 8);
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

    return TransparentVertexData;
  })();

  var FileHeader = Mdl.FileHeader = (function() {
    function FileHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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

    FileHeader.prototype._fetchInstances = function() {
    }

    FileHeader.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeU1(this.noTextureId);
      this._io.writeBytes(this.padding)
      this._io.writeU4le(this.characterId);
      this._io.writeU4le(this.textureCount);
      this._io.writeU4le(this.textureHeaderOffset);
      this._io.writeU4le(this.modelHeaderOffset);
      this._io.writeU4le(this.kg1HeaderOffset);
    }

    FileHeader.prototype._check = function() {
      if (this.padding.length != 3) {
        throw new KaitaiStream.ConsistencyError("padding", this.padding.length, 3);
      }
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
      this._root = _root;

      this._should_write_vertexList = false;
      this.vertexList__to_write = true;
      this._should_write_transparentPrimitiveHeaders = false;
      this.transparentPrimitiveHeaders__to_write = true;
      this._should_write_transparentTriangleIndices = false;
      this.transparentTriangleIndices__to_write = true;
      this._should_write_transparentVertexList = false;
      this.transparentVertexList__to_write = true;
    }
    Geometry.prototype._read = function() {
      this.primitiveHeaders = [];
      for (var i = 0; i < this._root.modelData.primitiveHeadersCount; i++) {
        var _t_primitiveHeaders = new PrimitiveHeaderWrapper(this._io, this, this._root);
        _t_primitiveHeaders._read();
        this.primitiveHeaders.push(_t_primitiveHeaders);
      }
      this._raw_triangleIndices = this._io.readBytes(((this._root.modelData.vertexDataOffset > this._root.modelData.transparentPrimitiveHeadersOffset ? this._root.modelData.transparentPrimitiveHeadersOffset : this._root.modelData.vertexDataOffset) - this._root.modelData.triangleIndexOffset));
      var _io__raw_triangleIndices = new KaitaiStream(this._raw_triangleIndices);
      this.triangleIndices = new IndexList(_io__raw_triangleIndices, this, this._root);
      this.triangleIndices._read();
    }

    Geometry.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.primitiveHeaders).length; i++) {
        this.primitiveHeaders[i]._fetchInstances()
      }
      this.triangleIndices._fetchInstances()
      _ = this.vertexList
      for (let i = 0; i < (this._m_vertexList).length; i++) {
        this.vertexList[i]._fetchInstances()
      }
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        _ = this.transparentPrimitiveHeaders
        for (let i = 0; i < (this._m_transparentPrimitiveHeaders).length; i++) {
          this.transparentPrimitiveHeaders[i]._fetchInstances()
        }
      }
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        _ = this.transparentTriangleIndices
        this.transparentTriangleIndices._fetchInstances()
      }
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        _ = this.transparentVertexList
        for (let i = 0; i < (this._m_transparentVertexList).length; i++) {
          this.transparentVertexList[i]._fetchInstances()
        }
      }
    }

    Geometry.prototype._write__seq = function(io) {
      this._io = io;
      this._should_write_vertexList = this.vertexList__to_write;
      this._should_write_transparentPrimitiveHeaders = this.transparentPrimitiveHeaders__to_write;
      this._should_write_transparentTriangleIndices = this.transparentTriangleIndices__to_write;
      this._should_write_transparentVertexList = this.transparentVertexList__to_write;
      for (let i = 0; i < (this.primitiveHeaders).length; i++) {
        this.primitiveHeaders[i]._write__seq(this._io)
      }
      var _io__raw_triangleIndices = new KaitaiStream(new ArrayBuffer(((this._root.modelData.vertexDataOffset > this._root.modelData.transparentPrimitiveHeadersOffset ? this._root.modelData.transparentPrimitiveHeadersOffset : this._root.modelData.vertexDataOffset) - this._root.modelData.triangleIndexOffset)));
      this._io.addChildStream(_io__raw_triangleIndices)
      var _pos2 = this._io.pos
      this._io.seek(this._io.pos + (((this._root.modelData.vertexDataOffset > this._root.modelData.transparentPrimitiveHeadersOffset ? this._root.modelData.transparentPrimitiveHeadersOffset : this._root.modelData.vertexDataOffset) - this._root.modelData.triangleIndexOffset)))
      const handler = (parent) => {
        this._raw_triangleIndices = _io__raw_triangleIndices.toByteArray();
        if (this._raw_triangleIndices.length != ((this._root.modelData.vertexDataOffset > this._root.modelData.transparentPrimitiveHeadersOffset ? this._root.modelData.transparentPrimitiveHeadersOffset : this._root.modelData.vertexDataOffset) - this._root.modelData.triangleIndexOffset)) {
          throw new KaitaiStream.ConsistencyError("raw(triangle_indices)", this._raw_triangleIndices.length, ((this._root.modelData.vertexDataOffset > this._root.modelData.transparentPrimitiveHeadersOffset ? this._root.modelData.transparentPrimitiveHeadersOffset : this._root.modelData.vertexDataOffset) - this._root.modelData.triangleIndexOffset));
        }
        parent.writeBytes(this._raw_triangleIndices)
        }
      _io__raw_triangleIndices.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
      this.triangleIndices._write__seq(_io__raw_triangleIndices)
    }

    Geometry.prototype._check = function() {
      if (this.primitiveHeaders.length != this._root.modelData.primitiveHeadersCount) {
        throw new KaitaiStream.ConsistencyError("primitive_headers", this.primitiveHeaders.length, this._root.modelData.primitiveHeadersCount);
      }
      for (let i = 0; i < (this.primitiveHeaders).length; i++) {
        if (this.primitiveHeaders[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("primitive_headers", this.primitiveHeaders[i]._root, this._root);
        }
        if (this.primitiveHeaders[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("primitive_headers", this.primitiveHeaders[i]._parent, this);
        }
      }
      if (this.triangleIndices._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("triangle_indices", this.triangleIndices._root, this._root);
      }
      if (this.triangleIndices._parent !== this) {
        throw new KaitaiStream.ConsistencyError("triangle_indices", this.triangleIndices._parent, this);
      }
      }
    Object.defineProperty(Geometry.prototype, 'vertexList', {

      set: function(v) {
        this._m_vertexList = v;
      },
      get: function() {
        if (this._should_write_vertexList) {
          this._write_vertexList()
        }
        if (this._m_vertexList !== undefined)
          return this._m_vertexList;
        var _pos = this._io.pos;
        this._io.seek((this._root.modelData.vertexDataOffset + 64));
        this._m_vertexList = [];
        for (var i = 0; i < this._root.modelData.vertexCount; i++) {
          var _t__m_vertexList = new VertexData(this._io, this, this._root);
          _t__m_vertexList._read();
          this._m_vertexList.push(_t__m_vertexList);
        }
        this._io.seek(_pos);
        return this._m_vertexList;
      }
    });

    Geometry.prototype._write_vertexList = function() {
      this._should_write_vertexList = false;
      var _pos = this._io.pos;
      this._io.seek((this._root.modelData.vertexDataOffset + 64));
      for (let i = 0; i < (this._m_vertexList).length; i++) {
        this.vertexList[i]._write__seq(this._io)
      }
      this._io.seek(_pos);
      }

    Geometry.prototype._check_vertexList = function() {
      this._should_write_vertexList = false;
      if (this.vertexList.length != this._root.modelData.vertexCount) {
        throw new KaitaiStream.ConsistencyError("vertex_list", this.vertexList.length, this._root.modelData.vertexCount);
      }
      for (let i = 0; i < (this._m_vertexList).length; i++) {
        if (this.vertexList[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("vertex_list", this.vertexList[i]._root, this._root);
        }
        if (this.vertexList[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("vertex_list", this.vertexList[i]._parent, this);
        }
      }
      }
    Object.defineProperty(Geometry.prototype, 'transparentPrimitiveHeaders', {

      set: function(v) {
        this._m_transparentPrimitiveHeaders = v;
      },
      get: function() {
        if (this._should_write_transparentPrimitiveHeaders) {
          this._write_transparentPrimitiveHeaders()
        }
        if (this._m_transparentPrimitiveHeaders !== undefined)
          return this._m_transparentPrimitiveHeaders;
        if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this._root.modelData.transparentPrimitiveHeadersOffset + 64));
          this._m_transparentPrimitiveHeaders = [];
          for (var i = 0; i < this._root.modelData.transparentPrimitiveHeadersCount; i++) {
            var _t__m_transparentPrimitiveHeaders = new TransparentPrimitiveHeaderWrapper(this._io, this, this._root);
            _t__m_transparentPrimitiveHeaders._read();
            this._m_transparentPrimitiveHeaders.push(_t__m_transparentPrimitiveHeaders);
          }
          this._io.seek(_pos);
        }
        return this._m_transparentPrimitiveHeaders;
      }
    });

    Geometry.prototype._write_transparentPrimitiveHeaders = function() {
      this._should_write_transparentPrimitiveHeaders = false;
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        var _pos = this._io.pos;
        this._io.seek((this._root.modelData.transparentPrimitiveHeadersOffset + 64));
        for (let i = 0; i < (this._m_transparentPrimitiveHeaders).length; i++) {
          this.transparentPrimitiveHeaders[i]._write__seq(this._io)
        }
        this._io.seek(_pos);
      }
      }

    Geometry.prototype._check_transparentPrimitiveHeaders = function() {
      this._should_write_transparentPrimitiveHeaders = false;
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        if (this.transparentPrimitiveHeaders.length != this._root.modelData.transparentPrimitiveHeadersCount) {
          throw new KaitaiStream.ConsistencyError("transparent_primitive_headers", this.transparentPrimitiveHeaders.length, this._root.modelData.transparentPrimitiveHeadersCount);
        }
        for (let i = 0; i < (this._m_transparentPrimitiveHeaders).length; i++) {
          if (this.transparentPrimitiveHeaders[i]._root !== this._root) {
            throw new KaitaiStream.ConsistencyError("transparent_primitive_headers", this.transparentPrimitiveHeaders[i]._root, this._root);
          }
          if (this.transparentPrimitiveHeaders[i]._parent !== this) {
            throw new KaitaiStream.ConsistencyError("transparent_primitive_headers", this.transparentPrimitiveHeaders[i]._parent, this);
          }
        }
      }
      }

    /**
     * List of vertex indices, which represent triangle strips.
     */
    Object.defineProperty(Geometry.prototype, 'transparentTriangleIndices', {

      set: function(v) {
        this._m_transparentTriangleIndices = v;
      },
      get: function() {
        if (this._should_write_transparentTriangleIndices) {
          this._write_transparentTriangleIndices()
        }
        if (this._m_transparentTriangleIndices !== undefined)
          return this._m_transparentTriangleIndices;
        if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this._root.modelData.transparentTriangleIndexOffset + 64));
          this._raw__m_transparentTriangleIndices = this._io.readBytes((this._root.modelData.transparentVertexDataOffset - this._root.modelData.transparentTriangleIndexOffset));
          var _io__raw__m_transparentTriangleIndices = new KaitaiStream(this._raw__m_transparentTriangleIndices);
          this._m_transparentTriangleIndices = new IndexList(_io__raw__m_transparentTriangleIndices, this, this._root);
          this._m_transparentTriangleIndices._read();
          this._io.seek(_pos);
        }
        return this._m_transparentTriangleIndices;
      }
    });

    Geometry.prototype._write_transparentTriangleIndices = function() {
      this._should_write_transparentTriangleIndices = false;
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        var _pos = this._io.pos;
        this._io.seek((this._root.modelData.transparentTriangleIndexOffset + 64));
        var _io__raw__m_transparentTriangleIndices = new KaitaiStream(new ArrayBuffer((this._root.modelData.transparentVertexDataOffset - this._root.modelData.transparentTriangleIndexOffset)));
        this._io.addChildStream(_io__raw__m_transparentTriangleIndices)
        var _pos2 = this._io.pos
        this._io.seek(this._io.pos + ((this._root.modelData.transparentVertexDataOffset - this._root.modelData.transparentTriangleIndexOffset)))
        const handler = (parent) => {
          this._raw__m_transparentTriangleIndices = _io__raw__m_transparentTriangleIndices.toByteArray();
          if (this._raw__m_transparentTriangleIndices.length != (this._root.modelData.transparentVertexDataOffset - this._root.modelData.transparentTriangleIndexOffset)) {
            throw new KaitaiStream.ConsistencyError("raw(transparent_triangle_indices)", this._raw__m_transparentTriangleIndices.length, (this._root.modelData.transparentVertexDataOffset - this._root.modelData.transparentTriangleIndexOffset));
          }
          parent.writeBytes(this._raw__m_transparentTriangleIndices)
          }
        _io__raw__m_transparentTriangleIndices.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
        this.transparentTriangleIndices._write__seq(_io__raw__m_transparentTriangleIndices)
        this._io.seek(_pos);
      }
      }

    Geometry.prototype._check_transparentTriangleIndices = function() {
      this._should_write_transparentTriangleIndices = false;
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        if (this.transparentTriangleIndices._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("transparent_triangle_indices", this.transparentTriangleIndices._root, this._root);
        }
        if (this.transparentTriangleIndices._parent !== this) {
          throw new KaitaiStream.ConsistencyError("transparent_triangle_indices", this.transparentTriangleIndices._parent, this);
        }
      }
      }
    Object.defineProperty(Geometry.prototype, 'transparentVertexList', {

      set: function(v) {
        this._m_transparentVertexList = v;
      },
      get: function() {
        if (this._should_write_transparentVertexList) {
          this._write_transparentVertexList()
        }
        if (this._m_transparentVertexList !== undefined)
          return this._m_transparentVertexList;
        if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
          var _pos = this._io.pos;
          this._io.seek((this._root.modelData.transparentVertexDataOffset + 64));
          this._m_transparentVertexList = [];
          for (var i = 0; i < this._root.modelData.transparentVertexCount; i++) {
            var _t__m_transparentVertexList = new TransparentVertexData(this._io, this, this._root);
            _t__m_transparentVertexList._read();
            this._m_transparentVertexList.push(_t__m_transparentVertexList);
          }
          this._io.seek(_pos);
        }
        return this._m_transparentVertexList;
      }
    });

    Geometry.prototype._write_transparentVertexList = function() {
      this._should_write_transparentVertexList = false;
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        var _pos = this._io.pos;
        this._io.seek((this._root.modelData.transparentVertexDataOffset + 64));
        for (let i = 0; i < (this._m_transparentVertexList).length; i++) {
          this.transparentVertexList[i]._write__seq(this._io)
        }
        this._io.seek(_pos);
      }
      }

    Geometry.prototype._check_transparentVertexList = function() {
      this._should_write_transparentVertexList = false;
      if (this._root.modelData.transparentPrimitiveHeadersCount > 0) {
        if (this.transparentVertexList.length != this._root.modelData.transparentVertexCount) {
          throw new KaitaiStream.ConsistencyError("transparent_vertex_list", this.transparentVertexList.length, this._root.modelData.transparentVertexCount);
        }
        for (let i = 0; i < (this._m_transparentVertexList).length; i++) {
          if (this.transparentVertexList[i]._root !== this._root) {
            throw new KaitaiStream.ConsistencyError("transparent_vertex_list", this.transparentVertexList[i]._root, this._root);
          }
          if (this.transparentVertexList[i]._parent !== this) {
            throw new KaitaiStream.ConsistencyError("transparent_vertex_list", this.transparentVertexList[i]._parent, this);
          }
        }
      }
      }

    /**
     * List of vertex indices, which represent triangle strips.
     */

    return Geometry;
  })();

  var TextureData = Mdl.TextureData = (function() {
    function TextureData(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

    }
    TextureData.prototype._read = function() {
      this.magic = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [1, 9, 153, 25]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([1, 9, 153, 25], this.magic, this._io, "/types/texture_data/seq/0");
      }
      this.unknown = this._io.readBytes(12);
      this.textures = [];
      for (var i = 0; i < this._root.header.textureCount; i++) {
        var _t_textures = new TextureContainer(this._io, this, this._root);
        _t_textures._read();
        this.textures.push(_t_textures);
      }
    }

    TextureData.prototype._fetchInstances = function() {
      for (let i = 0; i < (this.textures).length; i++) {
        this.textures[i]._fetchInstances()
      }
    }

    TextureData.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeBytes(this.magic)
      this._io.writeBytes(this.unknown)
      for (let i = 0; i < (this.textures).length; i++) {
        this.textures[i]._write__seq(this._io)
      }
    }

    TextureData.prototype._check = function() {
      if (this.magic.length != 4) {
        throw new KaitaiStream.ConsistencyError("magic", this.magic.length, 4);
      }
      if (!((KaitaiStream.byteArrayCompare(this.magic, [1, 9, 153, 25]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([1, 9, 153, 25], this.magic, null, "/types/texture_data/seq/0");
      }
      if (this.unknown.length != 12) {
        throw new KaitaiStream.ConsistencyError("unknown", this.unknown.length, 12);
      }
      if (this.textures.length != this._root.header.textureCount) {
        throw new KaitaiStream.ConsistencyError("textures", this.textures.length, this._root.header.textureCount);
      }
      for (let i = 0; i < (this.textures).length; i++) {
        if (this.textures[i]._root !== this._root) {
          throw new KaitaiStream.ConsistencyError("textures", this.textures[i]._root, this._root);
        }
        if (this.textures[i]._parent !== this) {
          throw new KaitaiStream.ConsistencyError("textures", this.textures[i]._parent, this);
        }
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
      this._root = _root;

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

    TransformationMatrix.prototype._fetchInstances = function() {
    }

    TransformationMatrix.prototype._write__seq = function(io) {
      this._io = io;
      this._io.writeF4le(this.rotation00);
      this._io.writeF4le(this.rotation10);
      this._io.writeF4le(this.rotation20);
      this._io.writeF4le(this.pad0);
      this._io.writeF4le(this.rotation01);
      this._io.writeF4le(this.rotation11);
      this._io.writeF4le(this.rotation21);
      this._io.writeF4le(this.pad1);
      this._io.writeF4le(this.rotation02);
      this._io.writeF4le(this.rotation12);
      this._io.writeF4le(this.rotation22);
      this._io.writeF4le(this.pad2);
      this._io.writeF4le(this.translationX);
      this._io.writeF4le(this.translationY);
      this._io.writeF4le(this.translationZ);
      this._io.writeF4le(this.translationW);
    }

    TransformationMatrix.prototype._check = function() {
      if (!(this.pad0 == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.pad0, null, "/types/transformation_matrix/seq/3");
      }
      if (!(this.pad1 == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.pad1, null, "/types/transformation_matrix/seq/7");
      }
      if (!(this.pad2 == 0)) {
        throw new KaitaiStream.ValidationNotEqualError(0, this.pad2, null, "/types/transformation_matrix/seq/11");
      }
      if (!(this.translationW == 1)) {
        throw new KaitaiStream.ValidationNotEqualError(1, this.translationW, null, "/types/transformation_matrix/seq/15");
      }
      }

    return TransformationMatrix;
  })();
  Object.defineProperty(Mdl.prototype, 'textureData', {

    set: function(v) {
      this._m_textureData = v;
    },
    get: function() {
      if (this._should_write_textureData) {
        this._write_textureData()
      }
      if (this._m_textureData !== undefined)
        return this._m_textureData;
      if ( ((this._root.header.textureCount > 0) && (this._root.header.noTextureId == 0)) ) {
        var _pos = this._io.pos;
        this._io.seek(this._root.header.textureHeaderOffset);
        this._raw__m_textureData = this._io.readBytesFull();
        var _io__raw__m_textureData = new KaitaiStream(this._raw__m_textureData);
        this._m_textureData = new TextureData(_io__raw__m_textureData, this, this._root);
        this._m_textureData._read();
        this._io.seek(_pos);
      }
      return this._m_textureData;
    }
  });

  Mdl.prototype._write_textureData = function() {
    this._should_write_textureData = false;
    if ( ((this._root.header.textureCount > 0) && (this._root.header.noTextureId == 0)) ) {
      var _pos = this._io.pos;
      this._io.seek(this._root.header.textureHeaderOffset);
      var _io__raw__m_textureData = new KaitaiStream(new ArrayBuffer(this._io.size - this._io.pos));
      this._io.addChildStream(_io__raw__m_textureData)
      var _pos2 = this._io.pos
      this._io.seek(this._io.pos + (this._io.size - this._io.pos))
      const handler = (parent) => {
        this._raw__m_textureData = _io__raw__m_textureData.toByteArray();
        parent.writeBytes(this._raw__m_textureData)
        if ((parent.isEof() === false)) {
          throw new KaitaiStream.ConsistencyError("raw(texture_data)", parent.size - parent.pos, 0);
        }
        }
      _io__raw__m_textureData.writeBackHandler = KaitaiStream.WriteBackHandler(_pos2, handler)
      this.textureData._write__seq(_io__raw__m_textureData)
      this._io.seek(_pos);
    }
    }

  Mdl.prototype._check_textureData = function() {
    this._should_write_textureData = false;
    if ( ((this._root.header.textureCount > 0) && (this._root.header.noTextureId == 0)) ) {
      if (this.textureData._root !== this._root) {
        throw new KaitaiStream.ConsistencyError("texture_data", this.textureData._root, this._root);
      }
      if (this.textureData._parent !== this) {
        throw new KaitaiStream.ConsistencyError("texture_data", this.textureData._parent, this);
      }
    }
    }

  return Mdl;
})();
export default Mdl;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = exports.primaries = exports.matrixCoefficients = exports.transferCharacteristics = exports.color = exports.trackUID = exports.trackNumber = exports.tags = exports.tagSegment = exports.flagLacing = exports.displayUnit = exports.displayHeight = exports.displayWidth = exports.bitDepth = exports.interlaced = exports.alphaMode = exports.channels = exports.samplingFrequency = exports.tagTrackUidType = exports.titleType = exports.infoType = exports.writingApp = exports.timestampScale = exports.duration = exports.muxingApp = exports.heightType = exports.widthType = exports.trackType = exports.codecID = exports.voidHeader = exports.seekHead = exports.seek = exports.seekPosition = exports.maxCache = exports.minCache = exports._name = exports.seekId = exports.matroskaHeader = exports.docTypeReadVersion = exports.docTypeVersion = exports.docType = exports.ebmlMaxSizeLength = exports.ebmlMaxIdLength = exports.ebmlReadVersion = exports.ebmlVersion = exports.getSegmentName = exports.knownIdsWithThreeLength = exports.knownIdsWithTwoLength = exports.knownIdsWithOneLength = exports.matroskaElements = void 0;
exports.ebmlMap = exports.tagStringType = exports.tagNameType = exports.simpleTagType = exports.targetsType = exports.cluster = exports.segment = exports.blockGroup = exports.simpleBlock = exports.block = exports.timestampEntry = exports.tracks = exports.trackEntry = exports.trackTimestampScale = exports.codecName = exports.blockElement = exports.blockDurationSegment = exports.referenceBlock = exports.flagDefault = exports.videoSegment = exports.audioSegment = exports.maxBlockAdditionIdSegment = exports.blockAdditionsSegment = exports.codecPrivate = exports.defaultDuration = exports.language = exports.ChromaSitingVert = exports.ChromaSitingHorz = void 0;
exports.matroskaElements = {
    Header: '0x1a45dfa3',
    EBMLMaxIDLength: '0x42f2',
    EBMLVersion: '0x4286',
    EBMLReadVersion: '0x42f7',
    EBMLMaxSizeLength: '0x42f3',
    DocType: '0x4282',
    DocTypeVersion: '0x4287',
    DocTypeReadVersion: '0x4285',
    Segment: '0x18538067',
    SeekHead: '0x114d9b74',
    Seek: '0x4dbb',
    SeekID: '0x53ab',
    SeekPosition: '0x53ac',
    Info: '0x1549a966',
    SegmentUUID: '0x73a4',
    SegmentFilename: '0x7384',
    PrevUUID: '0x3cb923',
    PrevFilename: '0x3c83ab',
    NextUUID: '0x3eb923',
    NextFilename: '0x3e83bb',
    SegmentFamily: '0x4444',
    ChapterTranslate: '0x6924',
    ChapterTranslateID: '0x69a5',
    ChapterTranslateCodec: '0x69bf',
    ChapterTranslateEditionUID: '0x69fc',
    TimestampScale: '0x2ad7b1',
    Duration: '0x4489',
    DateUTC: '0x4461',
    Title: '0x7ba9',
    MuxingApp: '0x4d80',
    WritingApp: '0x5741',
    Cluster: '0x1f43b675',
    Timestamp: '0xe7',
    SilentTracks: '0x5854',
    SilentTrackNumber: '0x58d7',
    Position: '0xa7',
    PrevSize: '0xab',
    SimpleBlock: '0xa3',
    BlockGroup: '0xa0',
    Block: '0xa1',
    BlockVirtual: '0xa2',
    BlockAdditions: '0x75a1',
    BlockMore: '0xa6',
    BlockAdditional: '0xa5',
    BlockAddID: '0xee',
    BlockDuration: '0x9b',
    ReferencePriority: '0xfa',
    ReferenceBlock: '0xfb',
    ReferenceVirtual: '0xfd',
    CodecState: '0xa4',
    DiscardPadding: '0x75a2',
    Slices: '0x8e',
    TimeSlice: '0xe8',
    LaceNumber: '0xcc',
    FrameNumber: '0xcd',
    BlockAdditionID: '0xcb',
    Delay: '0xce',
    SliceDuration: '0xcf',
    ReferenceFrame: '0xc8',
    ReferenceOffset: '0xc9',
    ReferenceTimestamp: '0xca',
    EncryptedBlock: '0xaf',
    Tracks: '0x1654ae6b',
    TrackEntry: '0xae',
    TrackNumber: '0xd7',
    TrackUID: '0x73c5',
    TrackType: '0x83',
    FlagEnabled: '0xb9',
    FlagDefault: '0x88',
    FlagForced: '0x55aa',
    FlagHearingImpaired: '0x55ab',
    FlagVisualImpaired: '0x55ac',
    FlagTextDescriptions: '0x55ad',
    FlagOriginal: '0x55ae',
    FlagCommentary: '0x55af',
    FlagLacing: '0x9c',
    MinCache: '0x6de7',
    MaxCache: '0x6df8',
    DefaultDuration: '0x23e383',
    DefaultDecodedFieldDuration: '0x234e7a',
    TrackTimestampScale: '0x23314f',
    TrackOffset: '0x537f',
    MaxBlockAdditionID: '0x55ee',
    BlockAdditionMapping: '0x41e4',
    BlockAddIDValue: '0x41f0',
    BlockAddIDName: '0x41a4',
    BlockAddIDType: '0x41e7',
    BlockAddIDExtraData: '0x41ed',
    Name: '0x536e',
    Language: '0x22b59c',
    LanguageBCP47: '0x22b59d',
    CodecID: '0x86',
    CodecPrivate: '0x63a2',
    CodecName: '0x258688',
    AttachmentLink: '0x7446',
    CodecSettings: '0x3a9697',
    CodecInfoURL: '0x3b4040',
    CodecDownloadURL: '0x26b240',
    CodecDecodeAll: '0xaa',
    TrackOverlay: '0x6fab',
    CodecDelay: '0x56aa',
    SeekPreRoll: '0x56bb',
    TrackTranslate: '0x6624',
    TrackTranslateTrackID: '0x66a5',
    TrackTranslateCodec: '0x66bf',
    TrackTranslateEditionUID: '0x66fc',
    Video: '0xe0',
    FlagInterlaced: '0x9a',
    FieldOrder: '0x9d',
    StereoMode: '0x53b8',
    AlphaMode: '0x53c0',
    OldStereoMode: '0x53b9',
    PixelWidth: '0xb0',
    PixelHeight: '0xba',
    PixelCropBottom: '0x54aa',
    PixelCropTop: '0x54bb',
    PixelCropLeft: '0x54cc',
    PixelCropRight: '0x54dd',
    DisplayWidth: '0x54b0',
    DisplayHeight: '0x54ba',
    DisplayUnit: '0x54b2',
    AspectRatioType: '0x54b3',
    UncompressedFourCC: '0x2eb524',
    GammaValue: '0x2fb523',
    FrameRate: '0x2383e3',
    Colour: '0x55b0',
    MatrixCoefficients: '0x55b1',
    BitsPerChannel: '0x55b2',
    ChromaSubsamplingHorz: '0x55b3',
    ChromaSubsamplingVert: '0x55b4',
    CbSubsamplingHorz: '0x55b5',
    CbSubsamplingVert: '0x55b6',
    ChromaSitingHorz: '0x55b7',
    ChromaSitingVert: '0x55b8',
    Range: '0x55b9',
    TransferCharacteristics: '0x55ba',
    Primaries: '0x55bb',
    MaxCLL: '0x55bc',
    MaxFALL: '0x55bd',
    MasteringMetadata: '0x55d0',
    PrimaryRChromaticityX: '0x55d1',
    PrimaryRChromaticityY: '0x55d2',
    PrimaryGChromaticityX: '0x55d3',
    PrimaryGChromaticityY: '0x55d4',
    PrimaryBChromaticityX: '0x55d5',
    PrimaryBChromaticityY: '0x55d6',
    WhitePointChromaticityX: '0x55d7',
    WhitePointChromaticityY: '0x55d8',
    LuminanceMax: '0x55d9',
    LuminanceMin: '0x55da',
    Projection: '0x7670',
    ProjectionType: '0x7671',
    ProjectionPrivate: '0x7672',
    ProjectionPoseYaw: '0x7673',
    ProjectionPosePitch: '0x7674',
    ProjectionPoseRoll: '0x7675',
    Audio: '0xe1',
    SamplingFrequency: '0xb5',
    OutputSamplingFrequency: '0x78b5',
    Channels: '0x9f',
    ChannelPositions: '0x7d7b',
    BitDepth: '0x6264',
    Emphasis: '0x52f1',
    TrackOperation: '0xe2',
    TrackCombinePlanes: '0xe3',
    TrackPlane: '0xe4',
    TrackPlaneUID: '0xe5',
    TrackPlaneType: '0xe6',
    TrackJoinBlocks: '0xe9',
    TrackJoinUID: '0xed',
    TrickTrackUID: '0xc0',
    TrickTrackSegmentUID: '0xc1',
    TrickTrackFlag: '0xc6',
    TrickMasterTrackUID: '0xc7',
    TrickMasterTrackSegmentUID: '0xc4',
    ContentEncodings: '0x6d80',
    ContentEncoding: '0x6240',
    ContentEncodingOrder: '0x5031',
    ContentEncodingScope: '0x5032',
    ContentEncodingType: '0x5033',
    ContentCompression: '0x5034',
    ContentCompAlgo: '0x4254',
    ContentCompSettings: '0x4255',
    ContentEncryption: '0x5035',
    ContentEncAlgo: '0x47e1',
    ContentEncKeyID: '0x47e2',
    ContentEncAESSettings: '0x47e7',
    AESSettingsCipherMode: '0x47e8',
    ContentSignature: '0x47e3',
    ContentSigKeyID: '0x47e4',
    ContentSigAlgo: '0x47e5',
    ContentSigHashAlgo: '0x47e6',
    Cues: '0x1c53bb6b',
    CuePoint: '0xbb',
    CueTime: '0xb3',
    CueTrackPositions: '0xb7',
    CueTrack: '0xf7',
    CueClusterPosition: '0xf1',
    CueRelativePosition: '0xf0',
    CueDuration: '0xb2',
    CueBlockNumber: '0x5378',
    CueCodecState: '0xea',
    CueReference: '0xdb',
    CueRefTime: '0x96',
    CueRefCluster: '0x97',
    CueRefNumber: '0x535f',
    CueRefCodecState: '0xeb',
    Attachments: '0x1941a469',
    AttachedFile: '0x61a7',
    FileDescription: '0x467e',
    FileName: '0x466e',
    FileMediaType: '0x4660',
    FileData: '0x465c',
    FileUID: '0x46ae',
    FileReferral: '0x4675',
    FileUsedStartTime: '0x4661',
    FileUsedEndTime: '0x4662',
    Chapters: '0x1043a770',
    EditionEntry: '0x45b9',
    EditionUID: '0x45bc',
    EditionFlagHidden: '0x45bd',
    EditionFlagDefault: '0x45db',
    EditionFlagOrdered: '0x45dd',
    EditionDisplay: '0x4520',
    EditionString: '0x4521',
    EditionLanguageIETF: '0x45e4',
    ChapterAtom: '0xb6',
    ChapterUID: '0x73c4',
    ChapterStringUID: '0x5654',
    ChapterTimeStart: '0x91',
    ChapterTimeEnd: '0x92',
    ChapterFlagHidden: '0x98',
    ChapterFlagEnabled: '0x4598',
    ChapterSegmentUUID: '0x6e67',
    ChapterSkipType: '0x4588',
    ChapterSegmentEditionUID: '0x6ebc',
    ChapterPhysicalEquiv: '0x63c3',
    ChapterTrack: '0x8f',
    ChapterTrackUID: '0x89',
    ChapterDisplay: '0x80',
    ChapString: '0x85',
    ChapLanguage: '0x437c',
    ChapLanguageBCP47: '0x437d',
    ChapCountry: '0x437e',
    ChapProcess: '0x6944',
    ChapProcessCodecID: '0x6955',
    ChapProcessPrivate: '0x450d',
    ChapProcessCommand: '0x6911',
    ChapProcessTime: '0x6922',
    ChapProcessData: '0x6933',
    Tags: '0x1254c367',
    Tag: '0x7373',
    Targets: '0x63c0',
    TargetTypeValue: '0x68ca',
    TargetType: '0x63ca',
    TagTrackUID: '0x63c5',
    TagEditionUID: '0x63c9',
    TagChapterUID: '0x63c4',
    TagAttachmentUID: '0x63c6',
    SimpleTag: '0x67c8',
    TagName: '0x45a3',
    TagLanguage: '0x447a',
    TagLanguageBCP47: '0x447b',
    TagDefault: '0x4484',
    TagDefaultBogus: '0x44b4',
    TagString: '0x4487',
    TagBinary: '0x4485',
    Void: '0xec',
    Crc32: '0xbf',
};
const matroskaIds = Object.values(exports.matroskaElements);
exports.knownIdsWithOneLength = matroskaIds.filter((id) => id.length === 4);
exports.knownIdsWithTwoLength = matroskaIds.filter((id) => id.length === 6);
exports.knownIdsWithThreeLength = matroskaIds.filter((id) => id.length === 8);
const getSegmentName = (id) => {
    var _a;
    return (_a = Object.entries(exports.matroskaElements).find(([, value]) => value === id)) === null || _a === void 0 ? void 0 : _a[0];
};
exports.getSegmentName = getSegmentName;
exports.ebmlVersion = {
    name: 'EBMLVersion',
    type: 'uint',
};
exports.ebmlReadVersion = {
    name: 'EBMLReadVersion',
    type: 'uint',
};
exports.ebmlMaxIdLength = {
    name: 'EBMLMaxIDLength',
    type: 'uint',
};
exports.ebmlMaxSizeLength = {
    name: 'EBMLMaxSizeLength',
    type: 'uint',
};
exports.docType = {
    name: 'DocType',
    type: 'string',
};
exports.docTypeVersion = {
    name: 'DocTypeVersion',
    type: 'uint',
};
exports.docTypeReadVersion = {
    name: 'DocTypeReadVersion',
    type: 'uint',
};
const voidEbml = {
    name: 'Void',
    type: 'uint8array',
};
exports.matroskaHeader = {
    name: 'Header',
    type: 'children',
};
exports.seekId = {
    name: 'SeekID',
    type: 'hex-string',
};
exports._name = {
    name: 'Name',
    type: 'string',
};
exports.minCache = {
    name: 'MinCache',
    type: 'uint',
};
exports.maxCache = {
    name: 'MaxCache',
    type: 'uint',
};
exports.seekPosition = {
    name: 'SeekPosition',
    type: 'uint',
};
exports.seek = {
    name: 'Seek',
    type: 'children',
};
exports.seekHead = {
    name: 'SeekHead',
    type: 'children',
};
exports.voidHeader = {
    name: 'Void',
    type: 'uint8array',
};
exports.codecID = {
    name: 'CodecID',
    type: 'string',
};
exports.trackType = {
    name: 'TrackType',
    type: 'uint',
};
exports.widthType = {
    name: 'PixelWidth',
    type: 'uint',
};
exports.heightType = {
    name: 'PixelHeight',
    type: 'uint',
};
exports.muxingApp = {
    name: 'MuxingApp',
    type: 'string',
};
exports.duration = {
    name: 'Duration',
    type: 'float',
};
exports.timestampScale = {
    name: 'TimestampScale',
    type: 'uint',
};
exports.writingApp = {
    name: 'WritingApp',
    type: 'string',
};
exports.infoType = {
    name: 'Info',
    type: 'children',
};
exports.titleType = {
    name: 'Title',
    type: 'string',
};
exports.tagTrackUidType = {
    name: 'TagTrackUID',
    type: 'hex-string',
};
exports.samplingFrequency = {
    name: 'SamplingFrequency',
    type: 'float',
};
exports.channels = {
    name: 'Channels',
    type: 'uint',
};
exports.alphaMode = {
    name: 'AlphaMode',
    type: 'uint',
};
exports.interlaced = {
    name: 'FlagInterlaced',
    type: 'uint',
};
exports.bitDepth = {
    name: 'BitDepth',
    type: 'uint',
};
exports.displayWidth = {
    name: 'DisplayWidth',
    type: 'uint',
};
exports.displayHeight = {
    name: 'DisplayHeight',
    type: 'uint',
};
exports.displayUnit = {
    name: 'DisplayUnit',
    type: 'uint',
};
exports.flagLacing = {
    name: 'FlagLacing',
    type: 'uint',
};
exports.tagSegment = {
    name: 'Tag',
    type: 'children',
};
exports.tags = {
    name: 'Tags',
    type: 'children',
};
exports.trackNumber = {
    name: 'TrackNumber',
    type: 'uint',
};
exports.trackUID = {
    name: 'TrackUID',
    type: 'hex-string',
};
exports.color = {
    name: 'Colour',
    type: 'children',
};
exports.transferCharacteristics = {
    name: 'TransferCharacteristics',
    type: 'uint',
};
exports.matrixCoefficients = {
    name: 'MatrixCoefficients',
    type: 'uint',
};
exports.primaries = {
    name: 'Primaries',
    type: 'uint',
};
exports.range = {
    name: 'Range',
    type: 'uint',
};
exports.ChromaSitingHorz = {
    name: 'ChromaSitingHorz',
    type: 'uint',
};
exports.ChromaSitingVert = {
    name: 'ChromaSitingVert',
    type: 'uint',
};
exports.language = {
    name: 'Language',
    type: 'string',
};
exports.defaultDuration = {
    name: 'DefaultDuration',
    type: 'uint',
};
exports.codecPrivate = {
    name: 'CodecPrivate',
    type: 'uint8array',
};
exports.blockAdditionsSegment = {
    name: 'BlockAdditions',
    type: 'uint8array',
};
exports.maxBlockAdditionIdSegment = {
    name: 'MaxBlockAdditionID',
    type: 'uint',
};
exports.audioSegment = {
    name: 'Audio',
    type: 'children',
};
exports.videoSegment = {
    name: 'Video',
    type: 'children',
};
exports.flagDefault = {
    name: 'FlagDefault',
    type: 'uint',
};
exports.referenceBlock = {
    name: 'ReferenceBlock',
    type: 'uint',
};
exports.blockDurationSegment = {
    name: 'BlockDuration',
    type: 'uint',
};
exports.blockElement = {
    name: 'Block',
    type: 'uint8array',
};
exports.codecName = {
    name: 'CodecName',
    type: 'string',
};
exports.trackTimestampScale = {
    name: 'TrackTimestampScale',
    type: 'float',
};
exports.trackEntry = {
    name: 'TrackEntry',
    type: 'children',
};
exports.tracks = {
    name: 'Tracks',
    type: 'children',
};
exports.timestampEntry = {
    name: 'Timestamp',
    type: 'uint',
};
exports.block = {
    name: 'Block',
    type: 'uint8array',
};
exports.simpleBlock = {
    name: 'SimpleBlock',
    type: 'uint8array',
};
exports.blockGroup = {
    name: 'BlockGroup',
    type: 'children',
};
exports.segment = {
    name: 'Segment',
    type: 'children',
};
exports.cluster = {
    name: 'Cluster',
    type: 'children',
};
exports.targetsType = {
    name: 'Targets',
    type: 'children',
};
exports.simpleTagType = {
    name: 'SimpleTag',
    type: 'children',
};
exports.tagNameType = {
    name: 'TagName',
    type: 'string',
};
exports.tagStringType = {
    name: 'TagString',
    type: 'string',
};
exports.ebmlMap = {
    [exports.matroskaElements.Header]: exports.matroskaHeader,
    [exports.matroskaElements.DocType]: exports.docType,
    [exports.matroskaElements.Targets]: exports.targetsType,
    [exports.matroskaElements.SimpleTag]: exports.simpleTagType,
    [exports.matroskaElements.TagName]: exports.tagNameType,
    [exports.matroskaElements.TagString]: exports.tagStringType,
    [exports.matroskaElements.DocTypeVersion]: exports.docTypeVersion,
    [exports.matroskaElements.DocTypeReadVersion]: exports.docTypeReadVersion,
    [exports.matroskaElements.EBMLVersion]: exports.ebmlVersion,
    [exports.matroskaElements.EBMLReadVersion]: exports.ebmlReadVersion,
    [exports.matroskaElements.EBMLMaxIDLength]: exports.ebmlMaxIdLength,
    [exports.matroskaElements.EBMLMaxSizeLength]: exports.ebmlMaxSizeLength,
    [exports.matroskaElements.Void]: voidEbml,
    [exports.matroskaElements.Cues]: {
        name: 'Cues',
        type: 'children',
    },
    [exports.matroskaElements.CuePoint]: {
        name: 'CuePoint',
        type: 'children',
    },
    [exports.matroskaElements.CueTime]: {
        name: 'CueTime',
        type: 'uint',
    },
    [exports.matroskaElements.CueTrackPositions]: {
        name: 'CueTrackPositions',
        type: 'children',
    },
    [exports.matroskaElements.CueClusterPosition]: {
        name: 'CueClusterPosition',
        type: 'uint',
    },
    [exports.matroskaElements.CueRelativePosition]: {
        name: 'CueRelativePosition',
        type: 'uint',
    },
    [exports.matroskaElements.CueBlockNumber]: {
        name: 'CueBlockNumber',
        type: 'uint',
    },
    [exports.matroskaElements.CueTrack]: {
        name: 'CueTrack',
        type: 'uint',
    },
    [exports.matroskaElements.DateUTC]: {
        name: 'DateUTC',
        type: 'uint8array',
    },
    [exports.matroskaElements.TrackTimestampScale]: exports.trackTimestampScale,
    [exports.matroskaElements.CodecDelay]: {
        name: 'CodecDelay',
        type: 'uint8array',
    },
    [exports.matroskaElements.SeekPreRoll]: {
        name: 'SeekPreRoll',
        type: 'uint8array',
    },
    [exports.matroskaElements.DiscardPadding]: {
        name: 'DiscardPadding',
        type: 'uint8array',
    },
    [exports.matroskaElements.OutputSamplingFrequency]: {
        name: 'OutputSamplingFrequency',
        type: 'uint8array',
    },
    [exports.matroskaElements.CodecName]: exports.codecName,
    [exports.matroskaElements.Position]: {
        name: 'Position',
        type: 'uint8array',
    },
    [exports.matroskaElements.SliceDuration]: {
        name: 'SliceDuration',
        type: 'uint8array',
    },
    [exports.matroskaElements.TagTrackUID]: exports.tagTrackUidType,
    [exports.matroskaElements.SeekHead]: exports.seekHead,
    [exports.matroskaElements.Seek]: exports.seek,
    [exports.matroskaElements.SeekID]: exports.seekId,
    [exports.matroskaElements.Name]: exports._name,
    [exports.matroskaElements.MinCache]: exports.minCache,
    [exports.matroskaElements.MaxCache]: exports.maxCache,
    [exports.matroskaElements.SeekPosition]: exports.seekPosition,
    [exports.matroskaElements.Crc32]: {
        name: 'Crc32',
        type: 'uint8array',
    },
    [exports.matroskaElements.MuxingApp]: exports.muxingApp,
    [exports.matroskaElements.WritingApp]: {
        name: 'WritingApp',
        type: 'string',
    },
    [exports.matroskaElements.SegmentUUID]: {
        name: 'SegmentUUID',
        type: 'string',
    },
    [exports.matroskaElements.Duration]: exports.duration,
    [exports.matroskaElements.CodecID]: {
        name: 'CodecID',
        type: 'string',
    },
    [exports.matroskaElements.TrackType]: exports.trackType,
    [exports.matroskaElements.PixelWidth]: exports.widthType,
    [exports.matroskaElements.PixelHeight]: exports.heightType,
    [exports.matroskaElements.TimestampScale]: exports.timestampScale,
    [exports.matroskaElements.Info]: exports.infoType,
    [exports.matroskaElements.Title]: exports.titleType,
    [exports.matroskaElements.SamplingFrequency]: exports.samplingFrequency,
    [exports.matroskaElements.Channels]: exports.channels,
    [exports.matroskaElements.AlphaMode]: exports.alphaMode,
    [exports.matroskaElements.FlagInterlaced]: exports.interlaced,
    [exports.matroskaElements.BitDepth]: exports.bitDepth,
    [exports.matroskaElements.DisplayHeight]: exports.displayHeight,
    [exports.matroskaElements.DisplayWidth]: exports.displayWidth,
    [exports.matroskaElements.DisplayUnit]: exports.displayUnit,
    [exports.matroskaElements.FlagLacing]: exports.flagLacing,
    [exports.matroskaElements.Tags]: exports.tags,
    [exports.matroskaElements.Tag]: exports.tagSegment,
    [exports.matroskaElements.TrackNumber]: exports.trackNumber,
    [exports.matroskaElements.TrackUID]: exports.trackUID,
    [exports.matroskaElements.Colour]: exports.color,
    [exports.matroskaElements.Language]: exports.language,
    [exports.matroskaElements.DefaultDuration]: exports.defaultDuration,
    [exports.matroskaElements.CodecPrivate]: exports.codecPrivate,
    [exports.matroskaElements.BlockDuration]: exports.blockDurationSegment,
    [exports.matroskaElements.BlockAdditions]: exports.blockAdditionsSegment,
    [exports.matroskaElements.MaxBlockAdditionID]: exports.maxBlockAdditionIdSegment,
    [exports.matroskaElements.Audio]: exports.audioSegment,
    [exports.matroskaElements.Video]: exports.videoSegment,
    [exports.matroskaElements.FlagDefault]: exports.flagDefault,
    [exports.matroskaElements.ReferenceBlock]: exports.referenceBlock,
    [exports.matroskaElements.TrackEntry]: exports.trackEntry,
    [exports.matroskaElements.Timestamp]: {
        name: 'Timestamp',
        type: 'uint',
    },
    [exports.matroskaElements.Tracks]: exports.tracks,
    [exports.matroskaElements.Block]: exports.block,
    [exports.matroskaElements.SimpleBlock]: exports.simpleBlock,
    [exports.matroskaElements.BlockGroup]: exports.blockGroup,
    [exports.matroskaElements.Segment]: {
        name: 'Segment',
        type: 'children',
    },
    [exports.matroskaElements.Cluster]: {
        name: 'Cluster',
        type: 'children',
    },
    [exports.matroskaElements.TransferCharacteristics]: exports.transferCharacteristics,
    [exports.matroskaElements.MatrixCoefficients]: exports.matrixCoefficients,
    [exports.matroskaElements.Primaries]: exports.primaries,
    [exports.matroskaElements.Range]: exports.range,
    [exports.matroskaElements.ChromaSitingHorz]: exports.ChromaSitingHorz,
    [exports.matroskaElements.ChromaSitingVert]: exports.ChromaSitingVert,
};

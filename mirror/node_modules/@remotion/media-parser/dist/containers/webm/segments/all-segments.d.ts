import type { Prettify } from '../parse-ebml';
export declare const matroskaElements: {
    readonly Header: "0x1a45dfa3";
    readonly EBMLMaxIDLength: "0x42f2";
    readonly EBMLVersion: "0x4286";
    readonly EBMLReadVersion: "0x42f7";
    readonly EBMLMaxSizeLength: "0x42f3";
    readonly DocType: "0x4282";
    readonly DocTypeVersion: "0x4287";
    readonly DocTypeReadVersion: "0x4285";
    readonly Segment: "0x18538067";
    readonly SeekHead: "0x114d9b74";
    readonly Seek: "0x4dbb";
    readonly SeekID: "0x53ab";
    readonly SeekPosition: "0x53ac";
    readonly Info: "0x1549a966";
    readonly SegmentUUID: "0x73a4";
    readonly SegmentFilename: "0x7384";
    readonly PrevUUID: "0x3cb923";
    readonly PrevFilename: "0x3c83ab";
    readonly NextUUID: "0x3eb923";
    readonly NextFilename: "0x3e83bb";
    readonly SegmentFamily: "0x4444";
    readonly ChapterTranslate: "0x6924";
    readonly ChapterTranslateID: "0x69a5";
    readonly ChapterTranslateCodec: "0x69bf";
    readonly ChapterTranslateEditionUID: "0x69fc";
    readonly TimestampScale: "0x2ad7b1";
    readonly Duration: "0x4489";
    readonly DateUTC: "0x4461";
    readonly Title: "0x7ba9";
    readonly MuxingApp: "0x4d80";
    readonly WritingApp: "0x5741";
    readonly Cluster: "0x1f43b675";
    readonly Timestamp: "0xe7";
    readonly SilentTracks: "0x5854";
    readonly SilentTrackNumber: "0x58d7";
    readonly Position: "0xa7";
    readonly PrevSize: "0xab";
    readonly SimpleBlock: "0xa3";
    readonly BlockGroup: "0xa0";
    readonly Block: "0xa1";
    readonly BlockVirtual: "0xa2";
    readonly BlockAdditions: "0x75a1";
    readonly BlockMore: "0xa6";
    readonly BlockAdditional: "0xa5";
    readonly BlockAddID: "0xee";
    readonly BlockDuration: "0x9b";
    readonly ReferencePriority: "0xfa";
    readonly ReferenceBlock: "0xfb";
    readonly ReferenceVirtual: "0xfd";
    readonly CodecState: "0xa4";
    readonly DiscardPadding: "0x75a2";
    readonly Slices: "0x8e";
    readonly TimeSlice: "0xe8";
    readonly LaceNumber: "0xcc";
    readonly FrameNumber: "0xcd";
    readonly BlockAdditionID: "0xcb";
    readonly Delay: "0xce";
    readonly SliceDuration: "0xcf";
    readonly ReferenceFrame: "0xc8";
    readonly ReferenceOffset: "0xc9";
    readonly ReferenceTimestamp: "0xca";
    readonly EncryptedBlock: "0xaf";
    readonly Tracks: "0x1654ae6b";
    readonly TrackEntry: "0xae";
    readonly TrackNumber: "0xd7";
    readonly TrackUID: "0x73c5";
    readonly TrackType: "0x83";
    readonly FlagEnabled: "0xb9";
    readonly FlagDefault: "0x88";
    readonly FlagForced: "0x55aa";
    readonly FlagHearingImpaired: "0x55ab";
    readonly FlagVisualImpaired: "0x55ac";
    readonly FlagTextDescriptions: "0x55ad";
    readonly FlagOriginal: "0x55ae";
    readonly FlagCommentary: "0x55af";
    readonly FlagLacing: "0x9c";
    readonly MinCache: "0x6de7";
    readonly MaxCache: "0x6df8";
    readonly DefaultDuration: "0x23e383";
    readonly DefaultDecodedFieldDuration: "0x234e7a";
    readonly TrackTimestampScale: "0x23314f";
    readonly TrackOffset: "0x537f";
    readonly MaxBlockAdditionID: "0x55ee";
    readonly BlockAdditionMapping: "0x41e4";
    readonly BlockAddIDValue: "0x41f0";
    readonly BlockAddIDName: "0x41a4";
    readonly BlockAddIDType: "0x41e7";
    readonly BlockAddIDExtraData: "0x41ed";
    readonly Name: "0x536e";
    readonly Language: "0x22b59c";
    readonly LanguageBCP47: "0x22b59d";
    readonly CodecID: "0x86";
    readonly CodecPrivate: "0x63a2";
    readonly CodecName: "0x258688";
    readonly AttachmentLink: "0x7446";
    readonly CodecSettings: "0x3a9697";
    readonly CodecInfoURL: "0x3b4040";
    readonly CodecDownloadURL: "0x26b240";
    readonly CodecDecodeAll: "0xaa";
    readonly TrackOverlay: "0x6fab";
    readonly CodecDelay: "0x56aa";
    readonly SeekPreRoll: "0x56bb";
    readonly TrackTranslate: "0x6624";
    readonly TrackTranslateTrackID: "0x66a5";
    readonly TrackTranslateCodec: "0x66bf";
    readonly TrackTranslateEditionUID: "0x66fc";
    readonly Video: "0xe0";
    readonly FlagInterlaced: "0x9a";
    readonly FieldOrder: "0x9d";
    readonly StereoMode: "0x53b8";
    readonly AlphaMode: "0x53c0";
    readonly OldStereoMode: "0x53b9";
    readonly PixelWidth: "0xb0";
    readonly PixelHeight: "0xba";
    readonly PixelCropBottom: "0x54aa";
    readonly PixelCropTop: "0x54bb";
    readonly PixelCropLeft: "0x54cc";
    readonly PixelCropRight: "0x54dd";
    readonly DisplayWidth: "0x54b0";
    readonly DisplayHeight: "0x54ba";
    readonly DisplayUnit: "0x54b2";
    readonly AspectRatioType: "0x54b3";
    readonly UncompressedFourCC: "0x2eb524";
    readonly GammaValue: "0x2fb523";
    readonly FrameRate: "0x2383e3";
    readonly Colour: "0x55b0";
    readonly MatrixCoefficients: "0x55b1";
    readonly BitsPerChannel: "0x55b2";
    readonly ChromaSubsamplingHorz: "0x55b3";
    readonly ChromaSubsamplingVert: "0x55b4";
    readonly CbSubsamplingHorz: "0x55b5";
    readonly CbSubsamplingVert: "0x55b6";
    readonly ChromaSitingHorz: "0x55b7";
    readonly ChromaSitingVert: "0x55b8";
    readonly Range: "0x55b9";
    readonly TransferCharacteristics: "0x55ba";
    readonly Primaries: "0x55bb";
    readonly MaxCLL: "0x55bc";
    readonly MaxFALL: "0x55bd";
    readonly MasteringMetadata: "0x55d0";
    readonly PrimaryRChromaticityX: "0x55d1";
    readonly PrimaryRChromaticityY: "0x55d2";
    readonly PrimaryGChromaticityX: "0x55d3";
    readonly PrimaryGChromaticityY: "0x55d4";
    readonly PrimaryBChromaticityX: "0x55d5";
    readonly PrimaryBChromaticityY: "0x55d6";
    readonly WhitePointChromaticityX: "0x55d7";
    readonly WhitePointChromaticityY: "0x55d8";
    readonly LuminanceMax: "0x55d9";
    readonly LuminanceMin: "0x55da";
    readonly Projection: "0x7670";
    readonly ProjectionType: "0x7671";
    readonly ProjectionPrivate: "0x7672";
    readonly ProjectionPoseYaw: "0x7673";
    readonly ProjectionPosePitch: "0x7674";
    readonly ProjectionPoseRoll: "0x7675";
    readonly Audio: "0xe1";
    readonly SamplingFrequency: "0xb5";
    readonly OutputSamplingFrequency: "0x78b5";
    readonly Channels: "0x9f";
    readonly ChannelPositions: "0x7d7b";
    readonly BitDepth: "0x6264";
    readonly Emphasis: "0x52f1";
    readonly TrackOperation: "0xe2";
    readonly TrackCombinePlanes: "0xe3";
    readonly TrackPlane: "0xe4";
    readonly TrackPlaneUID: "0xe5";
    readonly TrackPlaneType: "0xe6";
    readonly TrackJoinBlocks: "0xe9";
    readonly TrackJoinUID: "0xed";
    readonly TrickTrackUID: "0xc0";
    readonly TrickTrackSegmentUID: "0xc1";
    readonly TrickTrackFlag: "0xc6";
    readonly TrickMasterTrackUID: "0xc7";
    readonly TrickMasterTrackSegmentUID: "0xc4";
    readonly ContentEncodings: "0x6d80";
    readonly ContentEncoding: "0x6240";
    readonly ContentEncodingOrder: "0x5031";
    readonly ContentEncodingScope: "0x5032";
    readonly ContentEncodingType: "0x5033";
    readonly ContentCompression: "0x5034";
    readonly ContentCompAlgo: "0x4254";
    readonly ContentCompSettings: "0x4255";
    readonly ContentEncryption: "0x5035";
    readonly ContentEncAlgo: "0x47e1";
    readonly ContentEncKeyID: "0x47e2";
    readonly ContentEncAESSettings: "0x47e7";
    readonly AESSettingsCipherMode: "0x47e8";
    readonly ContentSignature: "0x47e3";
    readonly ContentSigKeyID: "0x47e4";
    readonly ContentSigAlgo: "0x47e5";
    readonly ContentSigHashAlgo: "0x47e6";
    readonly Cues: "0x1c53bb6b";
    readonly CuePoint: "0xbb";
    readonly CueTime: "0xb3";
    readonly CueTrackPositions: "0xb7";
    readonly CueTrack: "0xf7";
    readonly CueClusterPosition: "0xf1";
    readonly CueRelativePosition: "0xf0";
    readonly CueDuration: "0xb2";
    readonly CueBlockNumber: "0x5378";
    readonly CueCodecState: "0xea";
    readonly CueReference: "0xdb";
    readonly CueRefTime: "0x96";
    readonly CueRefCluster: "0x97";
    readonly CueRefNumber: "0x535f";
    readonly CueRefCodecState: "0xeb";
    readonly Attachments: "0x1941a469";
    readonly AttachedFile: "0x61a7";
    readonly FileDescription: "0x467e";
    readonly FileName: "0x466e";
    readonly FileMediaType: "0x4660";
    readonly FileData: "0x465c";
    readonly FileUID: "0x46ae";
    readonly FileReferral: "0x4675";
    readonly FileUsedStartTime: "0x4661";
    readonly FileUsedEndTime: "0x4662";
    readonly Chapters: "0x1043a770";
    readonly EditionEntry: "0x45b9";
    readonly EditionUID: "0x45bc";
    readonly EditionFlagHidden: "0x45bd";
    readonly EditionFlagDefault: "0x45db";
    readonly EditionFlagOrdered: "0x45dd";
    readonly EditionDisplay: "0x4520";
    readonly EditionString: "0x4521";
    readonly EditionLanguageIETF: "0x45e4";
    readonly ChapterAtom: "0xb6";
    readonly ChapterUID: "0x73c4";
    readonly ChapterStringUID: "0x5654";
    readonly ChapterTimeStart: "0x91";
    readonly ChapterTimeEnd: "0x92";
    readonly ChapterFlagHidden: "0x98";
    readonly ChapterFlagEnabled: "0x4598";
    readonly ChapterSegmentUUID: "0x6e67";
    readonly ChapterSkipType: "0x4588";
    readonly ChapterSegmentEditionUID: "0x6ebc";
    readonly ChapterPhysicalEquiv: "0x63c3";
    readonly ChapterTrack: "0x8f";
    readonly ChapterTrackUID: "0x89";
    readonly ChapterDisplay: "0x80";
    readonly ChapString: "0x85";
    readonly ChapLanguage: "0x437c";
    readonly ChapLanguageBCP47: "0x437d";
    readonly ChapCountry: "0x437e";
    readonly ChapProcess: "0x6944";
    readonly ChapProcessCodecID: "0x6955";
    readonly ChapProcessPrivate: "0x450d";
    readonly ChapProcessCommand: "0x6911";
    readonly ChapProcessTime: "0x6922";
    readonly ChapProcessData: "0x6933";
    readonly Tags: "0x1254c367";
    readonly Tag: "0x7373";
    readonly Targets: "0x63c0";
    readonly TargetTypeValue: "0x68ca";
    readonly TargetType: "0x63ca";
    readonly TagTrackUID: "0x63c5";
    readonly TagEditionUID: "0x63c9";
    readonly TagChapterUID: "0x63c4";
    readonly TagAttachmentUID: "0x63c6";
    readonly SimpleTag: "0x67c8";
    readonly TagName: "0x45a3";
    readonly TagLanguage: "0x447a";
    readonly TagLanguageBCP47: "0x447b";
    readonly TagDefault: "0x4484";
    readonly TagDefaultBogus: "0x44b4";
    readonly TagString: "0x4487";
    readonly TagBinary: "0x4485";
    readonly Void: "0xec";
    readonly Crc32: "0xbf";
};
export declare const knownIdsWithOneLength: string[];
export declare const knownIdsWithTwoLength: string[];
export declare const knownIdsWithThreeLength: string[];
export declare const getSegmentName: (id: string) => string | undefined;
export type MatroskaKey = keyof typeof matroskaElements;
export type MatroskaElement = (typeof matroskaElements)[MatroskaKey];
type EbmlType = 'string';
export type EbmlWithChildren = {
    name: MatroskaKey;
    type: 'children';
};
export type EbmlWithUint = {
    name: MatroskaKey;
    type: 'uint';
};
export type EbmlWithHexString = {
    name: MatroskaKey;
    type: 'hex-string';
};
export type EbmlWithString = {
    name: MatroskaKey;
    type: EbmlType;
};
export type EbmlWithFloat = {
    name: MatroskaKey;
    type: 'float';
};
export type EbmlWithUint8Array = {
    name: MatroskaKey;
    type: 'uint8array';
};
export type Ebml = EbmlWithString | EbmlWithUint | EbmlWithChildren | EbmlWithFloat | EbmlWithHexString | EbmlWithUint8Array;
export declare const ebmlVersion: {
    name: "EBMLVersion";
    type: "uint";
};
export declare const ebmlReadVersion: {
    name: "EBMLReadVersion";
    type: "uint";
};
export declare const ebmlMaxIdLength: {
    readonly name: "EBMLMaxIDLength";
    readonly type: "uint";
};
export declare const ebmlMaxSizeLength: {
    name: "EBMLMaxSizeLength";
    type: "uint";
};
export declare const docType: {
    name: "DocType";
    type: "string";
};
export declare const docTypeVersion: {
    name: "DocTypeVersion";
    type: "uint";
};
export declare const docTypeReadVersion: {
    name: "DocTypeReadVersion";
    type: "uint";
};
export type EmblTypes = {
    uint: number;
    float: number;
    string: string;
    children: Ebml[];
    void: undefined;
    'hex-string': string;
    uint8array: Uint8Array;
};
export declare const matroskaHeader: {
    readonly name: "Header";
    readonly type: "children";
};
export declare const seekId: {
    readonly name: "SeekID";
    readonly type: "hex-string";
};
export declare const _name: {
    readonly name: "Name";
    readonly type: "string";
};
export declare const minCache: {
    readonly name: "MinCache";
    readonly type: "uint";
};
export declare const maxCache: {
    readonly name: "MaxCache";
    readonly type: "uint";
};
export declare const seekPosition: {
    readonly name: "SeekPosition";
    readonly type: "uint";
};
export declare const seek: {
    readonly name: "Seek";
    readonly type: "children";
};
export declare const seekHead: {
    readonly name: "SeekHead";
    readonly type: "children";
};
export type SeekHeadSegment = EbmlParsed<typeof seekHead>;
export declare const voidHeader: {
    readonly name: "Void";
    readonly type: "uint8array";
};
export declare const codecID: {
    readonly name: "CodecID";
    readonly type: "string";
};
export declare const trackType: {
    readonly name: "TrackType";
    readonly type: "uint";
};
export declare const widthType: {
    readonly name: "PixelWidth";
    readonly type: "uint";
};
export declare const heightType: {
    readonly name: "PixelHeight";
    readonly type: "uint";
};
export declare const muxingApp: {
    readonly name: "MuxingApp";
    readonly type: "string";
};
export declare const duration: {
    readonly name: "Duration";
    readonly type: "float";
};
export declare const timestampScale: {
    readonly name: "TimestampScale";
    readonly type: "uint";
};
export declare const writingApp: {
    readonly name: "WritingApp";
    readonly type: "string";
};
export declare const infoType: {
    readonly name: "Info";
    readonly type: "children";
};
export declare const titleType: {
    readonly name: "Title";
    readonly type: "string";
};
export declare const tagTrackUidType: {
    readonly name: "TagTrackUID";
    readonly type: "hex-string";
};
export declare const samplingFrequency: {
    readonly name: "SamplingFrequency";
    readonly type: "float";
};
export declare const channels: {
    readonly name: "Channels";
    readonly type: "uint";
};
export declare const alphaMode: {
    readonly name: "AlphaMode";
    readonly type: "uint";
};
export declare const interlaced: {
    readonly name: "FlagInterlaced";
    readonly type: "uint";
};
export declare const bitDepth: {
    readonly name: "BitDepth";
    readonly type: "uint";
};
export declare const displayWidth: {
    readonly name: "DisplayWidth";
    readonly type: "uint";
};
export declare const displayHeight: {
    readonly name: "DisplayHeight";
    readonly type: "uint";
};
export declare const displayUnit: {
    readonly name: "DisplayUnit";
    readonly type: "uint";
};
export declare const flagLacing: {
    readonly name: "FlagLacing";
    readonly type: "uint";
};
export declare const tagSegment: {
    readonly name: "Tag";
    readonly type: "children";
};
export declare const tags: {
    readonly name: "Tags";
    readonly type: "children";
};
export declare const trackNumber: {
    readonly name: "TrackNumber";
    readonly type: "uint";
};
export declare const trackUID: {
    readonly name: "TrackUID";
    readonly type: "hex-string";
};
export declare const color: {
    readonly name: "Colour";
    readonly type: "children";
};
export declare const transferCharacteristics: {
    readonly name: "TransferCharacteristics";
    readonly type: "uint";
};
export declare const matrixCoefficients: {
    readonly name: "MatrixCoefficients";
    readonly type: "uint";
};
export declare const primaries: {
    readonly name: "Primaries";
    readonly type: "uint";
};
export declare const range: {
    readonly name: "Range";
    readonly type: "uint";
};
export declare const ChromaSitingHorz: {
    readonly name: "ChromaSitingHorz";
    readonly type: "uint";
};
export declare const ChromaSitingVert: {
    readonly name: "ChromaSitingVert";
    readonly type: "uint";
};
export declare const language: {
    readonly name: "Language";
    readonly type: "string";
};
export declare const defaultDuration: {
    readonly name: "DefaultDuration";
    readonly type: "uint";
};
export declare const codecPrivate: {
    readonly name: "CodecPrivate";
    readonly type: "uint8array";
};
export declare const blockAdditionsSegment: {
    readonly name: "BlockAdditions";
    readonly type: "uint8array";
};
export declare const maxBlockAdditionIdSegment: {
    readonly name: "MaxBlockAdditionID";
    readonly type: "uint";
};
export declare const audioSegment: {
    readonly name: "Audio";
    readonly type: "children";
};
export declare const videoSegment: {
    readonly name: "Video";
    readonly type: "children";
};
export declare const flagDefault: {
    readonly name: "FlagDefault";
    readonly type: "uint";
};
export declare const referenceBlock: {
    readonly name: "ReferenceBlock";
    readonly type: "uint";
};
export declare const blockDurationSegment: {
    readonly name: "BlockDuration";
    readonly type: "uint";
};
export declare const blockElement: {
    readonly name: "Block";
    readonly type: "uint8array";
};
export declare const codecName: {
    readonly name: "CodecName";
    readonly type: "string";
};
export declare const trackTimestampScale: {
    readonly name: "TrackTimestampScale";
    readonly type: "float";
};
export declare const trackEntry: {
    readonly name: "TrackEntry";
    readonly type: "children";
};
export declare const tracks: {
    readonly name: "Tracks";
    readonly type: "children";
};
export declare const timestampEntry: {
    readonly name: "Timestamp";
    readonly type: "uint";
};
export declare const block: {
    readonly name: "Block";
    readonly type: "uint8array";
};
export declare const simpleBlock: {
    readonly name: "SimpleBlock";
    readonly type: "uint8array";
};
export declare const blockGroup: {
    readonly name: "BlockGroup";
    readonly type: "children";
};
export declare const segment: {
    readonly name: "Segment";
    readonly type: "children";
};
export declare const cluster: {
    readonly name: "Cluster";
    readonly type: "children";
};
export declare const targetsType: {
    readonly name: "Targets";
    readonly type: "children";
};
export declare const simpleTagType: {
    readonly name: "SimpleTag";
    readonly type: "children";
};
export declare const tagNameType: {
    readonly name: "TagName";
    readonly type: "string";
};
export declare const tagStringType: {
    readonly name: "TagString";
    readonly type: "string";
};
export type CodecIdSegment = EbmlParsed<typeof codecID>;
export type ColourSegment = EbmlParsed<typeof color>;
export type TransferCharacteristicsSegment = EbmlParsed<typeof transferCharacteristics>;
export type PrimariesSegment = EbmlParsed<typeof primaries>;
export type RangeSegment = EbmlParsed<typeof range>;
export type MatrixCoefficientsSegment = EbmlParsed<typeof matrixCoefficients>;
export type TrackTypeSegment = EbmlParsed<typeof trackType>;
export type WidthSegment = EbmlParsed<typeof widthType>;
export type HeightSegment = EbmlParsed<typeof heightType>;
export type TimestampScaleSegment = EbmlParsed<typeof timestampScale>;
export type DurationSegment = EbmlParsed<typeof duration>;
export type DisplayWidthSegment = EbmlParsed<typeof displayWidth>;
export type DisplayHeightSegment = EbmlParsed<typeof displayHeight>;
export type TrackNumberSegment = EbmlParsed<typeof trackNumber>;
export type AudioSegment = EbmlParsed<typeof audioSegment>;
export type VideoSegment = EbmlParsed<typeof videoSegment>;
export type TrackEntry = EbmlParsed<typeof trackEntry>;
export type BlockSegment = EbmlParsed<typeof block>;
export type SimpleBlockSegment = EbmlParsed<typeof simpleBlock>;
export type MainSegment = EbmlParsed<typeof segment>;
export type ClusterSegment = EbmlParsed<typeof cluster>;
export type Tracks = EbmlParsed<typeof tracks>;
export type FloatWithSize = {
    value: number;
    size: '32' | '64';
};
export type UintWithSize = {
    value: number;
    byteLength: number | null;
};
export type EbmlValue<T extends Ebml, Child = PossibleEbml> = T extends EbmlWithUint ? UintWithSize : T extends EbmlWithString ? string : T extends EbmlWithFloat ? FloatWithSize : T extends EbmlWithHexString ? string : T extends EbmlWithUint8Array ? Uint8Array : T extends EbmlWithChildren ? Child[] : never;
export type EbmlParsed<T extends Ebml> = {
    type: T['name'];
    value: EbmlValue<T>;
    minVintWidth: number | null;
};
export declare const ebmlMap: {
    readonly "0x1a45dfa3": {
        readonly name: "Header";
        readonly type: "children";
    };
    readonly "0x4282": {
        name: "DocType";
        type: "string";
    };
    readonly "0x63c0": {
        readonly name: "Targets";
        readonly type: "children";
    };
    readonly "0x67c8": {
        readonly name: "SimpleTag";
        readonly type: "children";
    };
    readonly "0x45a3": {
        readonly name: "TagName";
        readonly type: "string";
    };
    readonly "0x4487": {
        readonly name: "TagString";
        readonly type: "string";
    };
    readonly "0x4287": {
        name: "DocTypeVersion";
        type: "uint";
    };
    readonly "0x4285": {
        name: "DocTypeReadVersion";
        type: "uint";
    };
    readonly "0x4286": {
        name: "EBMLVersion";
        type: "uint";
    };
    readonly "0x42f7": {
        name: "EBMLReadVersion";
        type: "uint";
    };
    readonly "0x42f2": {
        readonly name: "EBMLMaxIDLength";
        readonly type: "uint";
    };
    readonly "0x42f3": {
        name: "EBMLMaxSizeLength";
        type: "uint";
    };
    readonly "0xec": {
        name: "Void";
        type: "uint8array";
    };
    readonly "0x1c53bb6b": {
        readonly name: "Cues";
        readonly type: "children";
    };
    readonly "0xbb": {
        readonly name: "CuePoint";
        readonly type: "children";
    };
    readonly "0xb3": {
        readonly name: "CueTime";
        readonly type: "uint";
    };
    readonly "0xb7": {
        readonly name: "CueTrackPositions";
        readonly type: "children";
    };
    readonly "0xf1": {
        readonly name: "CueClusterPosition";
        readonly type: "uint";
    };
    readonly "0xf0": {
        readonly name: "CueRelativePosition";
        readonly type: "uint";
    };
    readonly "0x5378": {
        readonly name: "CueBlockNumber";
        readonly type: "uint";
    };
    readonly "0xf7": {
        readonly name: "CueTrack";
        readonly type: "uint";
    };
    readonly "0x4461": {
        readonly name: "DateUTC";
        readonly type: "uint8array";
    };
    readonly "0x23314f": {
        readonly name: "TrackTimestampScale";
        readonly type: "float";
    };
    readonly "0x56aa": {
        readonly name: "CodecDelay";
        readonly type: "uint8array";
    };
    readonly "0x56bb": {
        readonly name: "SeekPreRoll";
        readonly type: "uint8array";
    };
    readonly "0x75a2": {
        readonly name: "DiscardPadding";
        readonly type: "uint8array";
    };
    readonly "0x78b5": {
        readonly name: "OutputSamplingFrequency";
        readonly type: "uint8array";
    };
    readonly "0x258688": {
        readonly name: "CodecName";
        readonly type: "string";
    };
    readonly "0xa7": {
        readonly name: "Position";
        readonly type: "uint8array";
    };
    readonly "0xcf": {
        readonly name: "SliceDuration";
        readonly type: "uint8array";
    };
    readonly "0x63c5": {
        readonly name: "TagTrackUID";
        readonly type: "hex-string";
    };
    readonly "0x114d9b74": {
        readonly name: "SeekHead";
        readonly type: "children";
    };
    readonly "0x4dbb": {
        readonly name: "Seek";
        readonly type: "children";
    };
    readonly "0x53ab": {
        readonly name: "SeekID";
        readonly type: "hex-string";
    };
    readonly "0x536e": {
        readonly name: "Name";
        readonly type: "string";
    };
    readonly "0x6de7": {
        readonly name: "MinCache";
        readonly type: "uint";
    };
    readonly "0x6df8": {
        readonly name: "MaxCache";
        readonly type: "uint";
    };
    readonly "0x53ac": {
        readonly name: "SeekPosition";
        readonly type: "uint";
    };
    readonly "0xbf": {
        readonly name: "Crc32";
        readonly type: "uint8array";
    };
    readonly "0x4d80": {
        readonly name: "MuxingApp";
        readonly type: "string";
    };
    readonly "0x5741": {
        readonly name: "WritingApp";
        readonly type: "string";
    };
    readonly "0x73a4": {
        readonly name: "SegmentUUID";
        readonly type: "string";
    };
    readonly "0x4489": {
        readonly name: "Duration";
        readonly type: "float";
    };
    readonly "0x86": {
        readonly name: "CodecID";
        readonly type: "string";
    };
    readonly "0x83": {
        readonly name: "TrackType";
        readonly type: "uint";
    };
    readonly "0xb0": {
        readonly name: "PixelWidth";
        readonly type: "uint";
    };
    readonly "0xba": {
        readonly name: "PixelHeight";
        readonly type: "uint";
    };
    readonly "0x2ad7b1": {
        readonly name: "TimestampScale";
        readonly type: "uint";
    };
    readonly "0x1549a966": {
        readonly name: "Info";
        readonly type: "children";
    };
    readonly "0x7ba9": {
        readonly name: "Title";
        readonly type: "string";
    };
    readonly "0xb5": {
        readonly name: "SamplingFrequency";
        readonly type: "float";
    };
    readonly "0x9f": {
        readonly name: "Channels";
        readonly type: "uint";
    };
    readonly "0x53c0": {
        readonly name: "AlphaMode";
        readonly type: "uint";
    };
    readonly "0x9a": {
        readonly name: "FlagInterlaced";
        readonly type: "uint";
    };
    readonly "0x6264": {
        readonly name: "BitDepth";
        readonly type: "uint";
    };
    readonly "0x54ba": {
        readonly name: "DisplayHeight";
        readonly type: "uint";
    };
    readonly "0x54b0": {
        readonly name: "DisplayWidth";
        readonly type: "uint";
    };
    readonly "0x54b2": {
        readonly name: "DisplayUnit";
        readonly type: "uint";
    };
    readonly "0x9c": {
        readonly name: "FlagLacing";
        readonly type: "uint";
    };
    readonly "0x1254c367": {
        readonly name: "Tags";
        readonly type: "children";
    };
    readonly "0x7373": {
        readonly name: "Tag";
        readonly type: "children";
    };
    readonly "0xd7": {
        readonly name: "TrackNumber";
        readonly type: "uint";
    };
    readonly "0x73c5": {
        readonly name: "TrackUID";
        readonly type: "hex-string";
    };
    readonly "0x55b0": {
        readonly name: "Colour";
        readonly type: "children";
    };
    readonly "0x22b59c": {
        readonly name: "Language";
        readonly type: "string";
    };
    readonly "0x23e383": {
        readonly name: "DefaultDuration";
        readonly type: "uint";
    };
    readonly "0x63a2": {
        readonly name: "CodecPrivate";
        readonly type: "uint8array";
    };
    readonly "0x9b": {
        readonly name: "BlockDuration";
        readonly type: "uint";
    };
    readonly "0x75a1": {
        readonly name: "BlockAdditions";
        readonly type: "uint8array";
    };
    readonly "0x55ee": {
        readonly name: "MaxBlockAdditionID";
        readonly type: "uint";
    };
    readonly "0xe1": {
        readonly name: "Audio";
        readonly type: "children";
    };
    readonly "0xe0": {
        readonly name: "Video";
        readonly type: "children";
    };
    readonly "0x88": {
        readonly name: "FlagDefault";
        readonly type: "uint";
    };
    readonly "0xfb": {
        readonly name: "ReferenceBlock";
        readonly type: "uint";
    };
    readonly "0xae": {
        readonly name: "TrackEntry";
        readonly type: "children";
    };
    readonly "0xe7": {
        readonly name: "Timestamp";
        readonly type: "uint";
    };
    readonly "0x1654ae6b": {
        readonly name: "Tracks";
        readonly type: "children";
    };
    readonly "0xa1": {
        readonly name: "Block";
        readonly type: "uint8array";
    };
    readonly "0xa3": {
        readonly name: "SimpleBlock";
        readonly type: "uint8array";
    };
    readonly "0xa0": {
        readonly name: "BlockGroup";
        readonly type: "children";
    };
    readonly "0x18538067": {
        readonly name: "Segment";
        readonly type: "children";
    };
    readonly "0x1f43b675": {
        readonly name: "Cluster";
        readonly type: "children";
    };
    readonly "0x55ba": {
        readonly name: "TransferCharacteristics";
        readonly type: "uint";
    };
    readonly "0x55b1": {
        readonly name: "MatrixCoefficients";
        readonly type: "uint";
    };
    readonly "0x55bb": {
        readonly name: "Primaries";
        readonly type: "uint";
    };
    readonly "0x55b9": {
        readonly name: "Range";
        readonly type: "uint";
    };
    readonly "0x55b7": {
        readonly name: "ChromaSitingHorz";
        readonly type: "uint";
    };
    readonly "0x55b8": {
        readonly name: "ChromaSitingVert";
        readonly type: "uint";
    };
};
export type PossibleEbml = Prettify<{
    [key in keyof typeof ebmlMap]: EbmlParsed<(typeof ebmlMap)[key]>;
}[keyof typeof ebmlMap]>;
export {};

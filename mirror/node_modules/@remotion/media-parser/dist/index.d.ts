import type { MatroskaSegment } from './containers/webm/segments';
import type { Ebml, EbmlValue, FloatWithSize, MainSegment, MatroskaElement, PossibleEbml, TrackEntry, UintWithSize } from './containers/webm/segments/all-segments';
import type { SamplePosition } from './get-sample-positions';
import type { MediaParserLogLevel } from './log';
import type { ParseMediaCallbacks } from './options';
export type { ParseMedia, ParseMediaCallbacks } from './options';
export { parseMedia } from './parse-media';
export { hasBeenAborted, IsAnImageError, IsAnUnsupportedFileTypeError, IsAPdfError, MediaParserAbortError, } from './errors';
export type { MediaParserAdvancedColor, MediaParserAudioCodec, MediaParserAudioTrack, MediaParserOtherTrack, MediaParserTrack, MediaParserVideoCodec, MediaParserVideoTrack, } from './get-tracks';
export type { MediaParserMatrixCoefficients, MediaParserPrimaries, MediaParserTransferCharacteristics, } from './containers/avc/color';
export type { MediaParserMetadataEntry } from './metadata/get-metadata';
export type { MediaParserKeyframe, ParseMediaSrc } from './options';
export type { MediaParserEmbeddedImage } from './state/images';
export { downloadAndParseMedia } from './download-and-parse-media';
export type { Options, ParseMediaFields } from './fields';
export type { M3uPlaylistContext, MediaParserContainer, ParseMediaCallbacksMandatory, ParseMediaMandatoryOptions, ParseMediaOnProgress, ParseMediaOnWorkerOptions, ParseMediaOptions, ParseMediaProgress, ParseMediaResult, SerializeableOptionalParseMediaParams, } from './options';
export type { MediaParserAudioSample, MediaParserOnAudioSample, MediaParserOnAudioTrack, MediaParserOnAudioTrackParams, MediaParserOnVideoSample, MediaParserOnVideoTrack, MediaParserOnVideoTrackParams, MediaParserVideoSample, } from './webcodec-sample-types';
export type { MediaParserCodecData } from './codec-data';
export type { MediaParserDimensions } from './get-dimensions';
export type { MediaParserLocation } from './get-location';
/**
 * @deprecated This type is not stable.
 */
export type { MediaParserReaderInterface } from './readers/reader';
import type { CreateContent, Writer, WriterInterface } from './writers/writer';
export type { AllOptions } from './fields';
export type { SeekingHints } from './seeking-hints';
export type { CreateContent, Ebml, FloatWithSize, MatroskaElement, PossibleEbml, SamplePosition, UintWithSize, Writer, WriterInterface, };
/**
 * @deprecated Dont use these yet.
 */
export declare const MediaParserInternals: {
    Log: {
        trace: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
        verbose: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
        info: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
        warn: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
        error: (message?: any, ...optionalParams: any[]) => void;
    };
    createAacCodecPrivate: ({ audioObjectType, sampleRate, channelConfiguration, codecPrivate, }: {
        audioObjectType: number;
        sampleRate: number;
        channelConfiguration: number;
        codecPrivate: Uint8Array | null;
    }) => Uint8Array<ArrayBufferLike>;
    matroskaElements: {
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
    ebmlMap: {
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
    parseTkhd: ({ iterator, offset, size, }: {
        iterator: import("./iterator/buffer-iterator").BufferIterator;
        offset: number;
        size: number;
    }) => import("./containers/iso-base-media/tkhd").TkhdBox;
    getArrayBufferIterator: ({ initialData, maxBytes, logLevel, }: {
        initialData: Uint8Array;
        maxBytes: number;
        logLevel: MediaParserLogLevel;
    }) => {
        startReadingBits: () => void;
        stopReadingBits: () => void;
        skipTo: (offset: number) => void;
        addData: (newData: Uint8Array) => void;
        counter: {
            getOffset: () => number;
            discardBytes: (bytes: number) => void;
            increment: (bytes: number) => void;
            getDiscardedBytes: () => number;
            setDiscardedOffset: (bytes: number) => void;
            getDiscardedOffset: () => number;
            decrement: (bytes: number) => void;
        };
        peekB: (length: number) => void;
        peekD: (length: number) => void;
        getBits: (bits: number) => number;
        bytesRemaining: () => number;
        leb128: () => number;
        removeBytesRead: (force: boolean, mode: import("./options").ParseMediaMode) => {
            bytesRemoved: number;
            removedData: Uint8Array<ArrayBuffer> | null;
        };
        discard: (length: number) => void;
        getEightByteNumber: (littleEndian?: boolean) => number;
        getFourByteNumber: () => number;
        getSlice: (amount: number) => Uint8Array<ArrayBuffer>;
        getAtom: () => string;
        detectFileType: () => import("./file-types/detect-file-type").FileType;
        getPaddedFourByteNumber: () => number;
        getMatroskaSegmentId: () => string | null;
        getVint: () => number | null;
        getUint8: () => number;
        getEBML: () => number;
        getInt8: () => number;
        getUint16: () => number;
        getUint16Le: () => number;
        getUint24: () => number;
        getInt24: () => number;
        getInt16: () => number;
        getUint32: () => number;
        getUint64: (littleEndian?: boolean) => bigint;
        getInt64: (littleEndian?: boolean) => bigint;
        getFixedPointUnsigned1616Number: () => number;
        getFixedPointSigned1616Number: () => number;
        getFixedPointSigned230Number: () => number;
        getPascalString: () => number[];
        getUint(length: number): number;
        getByteString(length: number, trimTrailingZeroes: boolean): string;
        planBytes: (size: number) => {
            discardRest: () => Uint8Array<ArrayBuffer>;
        };
        getFloat64: () => number;
        readUntilNullTerminator: () => string;
        getFloat32: () => number;
        getUint32Le: () => number;
        getInt32Le: () => number;
        getInt32: () => number;
        destroy: () => void;
        startBox: (size: number) => {
            discardRest: () => void;
            expectNoMoreBytes: () => void;
        };
        readExpGolomb: () => number;
        startCheckpoint: () => {
            returnToCheckpoint: () => void;
        };
        getFlacCodecNumber: () => number;
        readUntilLineEnd: () => string | null;
        getSyncSafeInt32: () => number;
        replaceData: (newData: Uint8Array, seekTo: number) => void;
    };
    parseStsd: ({ offset, size, iterator, logLevel, contentLength, }: {
        offset: number;
        size: number;
        iterator: import("./iterator/buffer-iterator").BufferIterator;
        logLevel: MediaParserLogLevel;
        contentLength: number;
    }) => Promise<import("./containers/iso-base-media/stsd/stsd").StsdBox>;
    makeParserState: ({ hasAudioTrackHandlers, hasVideoTrackHandlers, controller, onAudioTrack, onVideoTrack, contentLength, logLevel, mode, src, readerInterface, onDiscardedData, selectM3uStreamFn, selectM3uAssociatedPlaylistsFn, m3uPlaylistContext, contentType, name, callbacks, fieldsInReturnValue, mimeType, initialReaderInstance, makeSamplesStartAtZero, prefetchCache, }: {
        hasAudioTrackHandlers: boolean;
        hasVideoTrackHandlers: boolean;
        controller: import("./controller/media-parser-controller").MediaParserController;
        onAudioTrack: import("./webcodec-sample-types").MediaParserOnAudioTrack | null;
        onVideoTrack: import("./webcodec-sample-types").MediaParserOnVideoTrack | null;
        contentLength: number;
        logLevel: MediaParserLogLevel;
        mode: import("./options").ParseMediaMode;
        src: import("./options").ParseMediaSrc;
        readerInterface: import("./readers/reader").MediaParserReaderInterface;
        onDiscardedData: import("./options").OnDiscardedData | null;
        selectM3uStreamFn: import("./containers/m3u/select-stream").SelectM3uStreamFn;
        selectM3uAssociatedPlaylistsFn: import("./containers/m3u/select-stream").SelectM3uAssociatedPlaylistsFn;
        m3uPlaylistContext: import("./options").M3uPlaylistContext | null;
        contentType: string | null;
        name: string;
        callbacks: ParseMediaCallbacks;
        fieldsInReturnValue: import("./fields").Options<import("./fields").ParseMediaFields>;
        mimeType: string | null;
        initialReaderInstance: import("./readers/reader").Reader;
        makeSamplesStartAtZero: boolean;
        prefetchCache: import("./fetch").PrefetchCache;
    }) => {
        riff: {
            getAvcProfile: () => import("./state/parser-state").SpsAndPps | null;
            onProfile: (profile: import("./state/parser-state").SpsAndPps) => Promise<void>;
            registerOnAvcProfileCallback: (callback: (profile: import("./state/parser-state").SpsAndPps) => Promise<void>) => void;
            getNextTrackIndex: () => number;
            queuedBFrames: {
                addFrame: ({ frame, maxFramesInBuffer, trackId, timescale, }: {
                    frame: import("./state/riff/queued-frames").QueuedVideoSample;
                    trackId: number;
                    maxFramesInBuffer: number;
                    timescale: number;
                }) => void;
                flush: () => void;
                getReleasedFrame: () => {
                    sample: import("./state/riff/queued-frames").QueuedVideoSample;
                    trackId: number;
                    timescale: number;
                } | null;
                hasReleasedFrames: () => boolean;
                clear: () => void;
            };
            incrementNextTrackIndex: () => void;
            lazyIdx1: {
                triggerLoad: (position: number) => Promise<{
                    entries: import("./containers/riff/riff-box").Idx1Entry[];
                    videoTrackIndex: number | null;
                }>;
                getLoadedIdx1: () => Promise<{
                    entries: import("./containers/riff/riff-box").Idx1Entry[];
                    videoTrackIndex: number | null;
                } | null>;
                getIfAlreadyLoaded: () => {
                    entries: import("./containers/riff/riff-box").Idx1Entry[];
                    videoTrackIndex: number | null;
                } | null;
                setFromSeekingHints: (hints: import("./containers/riff/seeking-hints").RiffSeekingHints) => void;
                waitForLoaded: () => Promise<{
                    entries: import("./containers/riff/riff-box").Idx1Entry[];
                    videoTrackIndex: number | null;
                }> | Promise<null>;
            };
            sampleCounter: {
                onAudioSample: (trackId: number, audioSample: import("./webcodec-sample-types").MediaParserAudioSample) => void;
                onVideoSample: ({ trackId, videoSample, }: {
                    videoSample: import("./webcodec-sample-types").MediaParserVideoSample;
                    trackId: number;
                }) => void;
                getSampleCountForTrack: ({ trackId }: {
                    trackId: number;
                }) => number;
                setSamplesFromSeek: (samples: Record<number, number>) => void;
                riffKeys: {
                    addKeyframe: (keyframe: import("./state/riff/riff-keyframes").RiffKeyframe) => void;
                    getKeyframes: () => import("./state/riff/riff-keyframes").RiffKeyframe[];
                    setFromSeekingHints: (keyframesFromHints: import("./state/riff/riff-keyframes").RiffKeyframe[]) => void;
                };
                setPocAtKeyframeOffset: ({ keyframeOffset, poc, }: {
                    keyframeOffset: number;
                    poc: number;
                }) => void;
                getPocAtKeyframeOffset: ({ keyframeOffset, }: {
                    keyframeOffset: number;
                }) => number[];
                getKeyframeAtOffset: (sample: import("./state/riff/queued-frames").QueuedVideoSample) => number | null;
            };
        };
        transportStream: {
            nextPesHeaderStore: {
                setNextPesHeader: (pesHeader: import("./containers/transport-stream/parse-pes").PacketPes) => void;
                getNextPesHeader: () => import("./containers/transport-stream/parse-pes").PacketPes;
            };
            observedPesHeaders: {
                pesHeaders: import("./containers/transport-stream/parse-pes").PacketPes[];
                addPesHeader: (pesHeader: import("./containers/transport-stream/parse-pes").PacketPes) => void;
                markPtsAsKeyframe: (pts: number) => void;
                getPesKeyframeHeaders: () => import("./containers/transport-stream/parse-pes").PacketPes[];
                setPesKeyframesFromSeekingHints: (hints: import("./seeking-hints").TransportStreamSeekingHints) => void;
            };
            streamBuffers: Map<number, import("./containers/transport-stream/process-stream-buffers").TransportStreamPacketBuffer>;
            startOffset: {
                getOffset: (trackId: number) => number;
                setOffset: ({ newOffset, trackId }: {
                    trackId: number;
                    newOffset: number;
                }) => void;
            };
            resetBeforeSeek: () => void;
            lastEmittedSample: {
                setLastEmittedSample: (sample: import("./webcodec-sample-types").MediaParserAudioSample | import("./webcodec-sample-types").MediaParserVideoSample) => void;
                getLastEmittedSample: () => import("./webcodec-sample-types").MediaParserVideoSample | import("./webcodec-sample-types").MediaParserAudioSample | null;
                resetLastEmittedSample: () => void;
            };
        };
        webm: {
            cues: {
                triggerLoad: (position: number, segmentOffset: number) => Promise<import("./containers/webm/seek/format-cues").MatroskaCue[] | null>;
                getLoadedCues: () => Promise<{
                    cues: import("./containers/webm/seek/format-cues").MatroskaCue[];
                    segmentOffset: number;
                } | null>;
                getIfAlreadyLoaded: () => {
                    cues: import("./containers/webm/seek/format-cues").MatroskaCue[];
                    segmentOffset: number;
                } | null;
                setFromSeekingHints: (hints: import("./seeking-hints").WebmSeekingHints) => void;
            };
            onTrackEntrySegment: import("./containers/webm/segments").OnTrackEntrySegment;
            getTrackInfoByNumber: (id: number) => import("./containers/webm/segments/track-entry").TrackInfo;
            setTimestampOffset: (byteOffset: number, timestamp: number) => void;
            getTimestampOffsetForByteOffset: (byteOffset: number) => number | undefined;
            getTimeStampMapForSeekingHints: () => Map<number, number>;
            setTimeStampMapForSeekingHints: (newTimestampMap: Map<number, number>) => void;
            getTimescale: () => number;
            setTimescale: (newTimescale: number) => void;
            addSegment: (seg: Omit<import("./state/matroska/webm").SegmentSection, "index">) => void;
            addCluster: (cluster: import("./state/matroska/webm").ClusterSection) => void;
            getFirstCluster: () => import("./state/matroska/webm").ClusterSection | undefined;
            isInsideSegment: (iterator: import("./iterator/buffer-iterator").BufferIterator) => import("./state/matroska/webm").SegmentSection | null;
            isInsideCluster: (offset: number) => import("./state/matroska/webm").ClusterSection | null;
            setAvcProfileForTrackNumber: (trackNumber: number, avcProfile: import("./containers/avc/parse-avc").AvcProfileInfo) => void;
            getAvcProfileForTrackNumber: (trackNumber: number) => import("./containers/avc/parse-avc").AvcProfileInfo | null;
        };
        iso: {
            flatSamples: {
                getSamples: (mdatStart: number) => {
                    trackId: number;
                    samplePositions: SamplePosition[];
                }[] | null;
                setSamples: (mdatStart: number, samples: {
                    trackId: number;
                    samplePositions: SamplePosition[];
                }[]) => void;
                setCurrentSampleIndex: (mdatStart: number, trackId: number, index: number) => void;
                getCurrentSampleIndices: (mdatStart: number) => Record<number, number>;
                updateAfterSeek: (seekedByte: number) => void;
            };
            moov: {
                setMoovBox: (moov: {
                    moovBox: import("./containers/iso-base-media/moov/moov").MoovBox;
                    precomputed: boolean;
                }) => void;
                getMoovBoxAndPrecomputed: () => {
                    moovBox: import("./containers/iso-base-media/moov/moov").MoovBox;
                    precomputed: boolean;
                } | null;
            };
            mfra: {
                triggerLoad: () => Promise<import("./containers/iso-base-media/base-media-box").IsoBaseMediaBox[] | null>;
                getIfAlreadyLoaded: () => import("./containers/iso-base-media/base-media-box").IsoBaseMediaBox[] | null;
                setFromSeekingHints: (hints: import("./seeking-hints").IsoBaseMediaSeekingHints) => void;
            };
            moof: {
                getMoofBoxes: () => import("./state/iso-base-media/precomputed-moof").MoofBox[];
                setMoofBoxes: (boxes: import("./state/iso-base-media/precomputed-moof").MoofBox[]) => void;
            };
            tfra: {
                getTfraBoxes: () => import("./containers/iso-base-media/mfra/tfra").TfraBox[];
                setTfraBoxes: (boxes: import("./containers/iso-base-media/mfra/tfra").TfraBox[]) => void;
            };
            movieTimeScale: {
                getTrackTimescale: () => number | null;
                setTrackTimescale: (timescale: number) => void;
            };
        };
        mp3: {
            getMp3Info: () => import("./state/mp3").Mp3Info | null;
            setMp3Info: (info: import("./state/mp3").Mp3Info) => void;
            getMp3BitrateInfo: () => import("./state/mp3").Mp3BitrateInfo | null;
            setMp3BitrateInfo: (info: import("./state/mp3").Mp3BitrateInfo) => void;
            audioSamples: {
                addSample: (audioSampleOffset: import("./state/audio-sample-map").AudioSampleOffset) => void;
                getSamples: () => import("./state/audio-sample-map").AudioSampleOffset[];
                setFromSeekingHints: (newMap: import("./state/audio-sample-map").AudioSampleOffset[]) => void;
            };
        };
        aac: {
            addSample: ({ offset, size }: {
                offset: number;
                size: number;
            }) => {
                offset: number;
                index: number;
                size: number;
            };
            getSamples: () => {
                offset: number;
                index: number;
                size: number;
            }[];
            audioSamples: {
                addSample: (audioSampleOffset: import("./state/audio-sample-map").AudioSampleOffset) => void;
                getSamples: () => import("./state/audio-sample-map").AudioSampleOffset[];
                setFromSeekingHints: (newMap: import("./state/audio-sample-map").AudioSampleOffset[]) => void;
            };
        };
        flac: {
            setBlockingBitStrategy: (strategy: number) => void;
            getBlockingBitStrategy: () => number | undefined;
            audioSamples: {
                addSample: (audioSampleOffset: import("./state/audio-sample-map").AudioSampleOffset) => void;
                getSamples: () => import("./state/audio-sample-map").AudioSampleOffset[];
                setFromSeekingHints: (newMap: import("./state/audio-sample-map").AudioSampleOffset[]) => void;
            };
        };
        m3u: {
            setSelectedMainPlaylist: (stream: import("./state/m3u-state").M3uStreamOrInitialUrl) => void;
            getSelectedMainPlaylist: () => import("./state/m3u-state").M3uStreamOrInitialUrl | null;
            setHasEmittedVideoTrack: (src: string, callback: import("./webcodec-sample-types").MediaParserOnVideoSample | null) => void;
            hasEmittedVideoTrack: (src: string) => false | import("./webcodec-sample-types").MediaParserOnVideoSample | null;
            setHasEmittedAudioTrack: (src: string, callback: import("./webcodec-sample-types").MediaParserOnAudioSample | null) => void;
            hasEmittedAudioTrack: (src: string) => false | import("./webcodec-sample-types").MediaParserOnAudioSample | null;
            setHasEmittedDoneWithTracks: (src: string) => void;
            hasEmittedDoneWithTracks: (src: string) => boolean;
            setReadyToIterateOverM3u: () => void;
            isReadyToIterateOverM3u: () => boolean;
            setAllChunksProcessed: (src: string) => void;
            clearAllChunksProcessed: () => void;
            getAllChunksProcessedForPlaylist: (src: string) => boolean;
            getAllChunksProcessedOverall: () => boolean;
            setHasFinishedManifest: () => void;
            hasFinishedManifest: () => boolean;
            setM3uStreamRun: (playlistUrl: string, run: import("./state/m3u-state").M3uRun | null) => void;
            setTracksDone: (playlistUrl: string) => boolean;
            getTrackDone: (playlistUrl: string) => boolean;
            clearTracksDone: () => void;
            getM3uStreamRun: (playlistUrl: string) => import("./state/m3u-state").M3uRun;
            abortM3UStreamRuns: () => void;
            setAssociatedPlaylists: (playlists: import("./containers/m3u/get-streams").M3uAssociatedPlaylist[]) => void;
            getAssociatedPlaylists: () => import("./containers/m3u/get-streams").M3uAssociatedPlaylist[] | null;
            getSelectedPlaylists: () => string[];
            sampleSorter: {
                clearSamples: () => void;
                addToStreamWithTrack: (src: string) => void;
                addVideoStreamToConsider: (src: string, callback: import("./webcodec-sample-types").MediaParserOnVideoSample) => void;
                addAudioStreamToConsider: (src: string, callback: import("./webcodec-sample-types").MediaParserOnAudioSample) => void;
                hasAudioStreamToConsider: (src: string) => boolean;
                hasVideoStreamToConsider: (src: string) => boolean;
                addAudioSample: (src: string, sample: import("./webcodec-sample-types").MediaParserAudioSample) => Promise<void>;
                addVideoSample: (src: string, sample: import("./webcodec-sample-types").MediaParserVideoSample) => Promise<void>;
                getNextStreamToRun: (streams: string[]) => string;
            };
            setMp4HeaderSegment: (playlistUrl: string, structure: import("./parse-result").IsoBaseMediaStructure) => void;
            getMp4HeaderSegment: (playlistUrl: string) => import("./parse-result").IsoBaseMediaStructure;
            setSeekToSecondsToProcess: (playlistUrl: string, m3uSeek: {
                targetTime: number;
            } | null) => void;
            getSeekToSecondsToProcess: (playlistUrl: string) => {
                targetTime: number;
            } | null;
            setNextSeekShouldSubtractChunks: (playlistUrl: string, chunks: number) => void;
            getNextSeekShouldSubtractChunks: (playlistUrl: string) => number;
        };
        timings: {
            timeIterating: number;
            timeReadingData: number;
            timeSeeking: number;
            timeCheckingIfDone: number;
            timeFreeingData: number;
            timeInParseLoop: number;
        };
        callbacks: {
            registerVideoSampleCallback: (id: number, callback: import("./webcodec-sample-types").MediaParserOnVideoSample | null) => Promise<void>;
            onAudioSample: ({ audioSample, trackId, }: {
                trackId: number;
                audioSample: import("./webcodec-sample-types").MediaParserAudioSample;
            }) => Promise<void>;
            onVideoSample: ({ trackId, videoSample, }: {
                trackId: number;
                videoSample: import("./webcodec-sample-types").MediaParserVideoSample;
            }) => Promise<void>;
            canSkipTracksState: {
                doFieldsNeedTracks: () => boolean;
                canSkipTracks: () => boolean;
            };
            registerAudioSampleCallback: (id: number, callback: import("./webcodec-sample-types").MediaParserOnAudioSample | null) => Promise<void>;
            tracks: {
                hasAllTracks: () => boolean;
                getIsDone: () => boolean;
                setIsDone: (logLevel: MediaParserLogLevel) => void;
                addTrack: (track: import("./get-tracks").MediaParserTrack) => void;
                getTracks: () => import("./get-tracks").MediaParserTrack[];
                ensureHasTracksAtEnd: (fields: import("./fields").Options<import("./fields").ParseMediaFields>) => void;
            };
            audioSampleCallbacks: Record<number, import("./webcodec-sample-types").MediaParserOnAudioSample>;
            videoSampleCallbacks: Record<number, import("./webcodec-sample-types").MediaParserOnVideoSample>;
            hasAudioTrackHandlers: boolean;
            hasVideoTrackHandlers: boolean;
            callTracksDoneCallback: () => Promise<void>;
        };
        getInternalStats: () => import("./state/parser-state").InternalStats;
        getSkipBytes: () => number;
        increaseSkippedBytes: (bytes: number) => void;
        keyframes: {
            addKeyframe: (keyframe: import("./options").MediaParserKeyframe) => void;
            getKeyframes: () => import("./options").MediaParserKeyframe[];
            setFromSeekingHints: (keyframesFromHints: import("./options").MediaParserKeyframe[]) => void;
        };
        structure: {
            getStructureOrNull: () => import("./parse-result").MediaParserStructureUnstable | null;
            getStructure: () => import("./parse-result").MediaParserStructureUnstable;
            setStructure: (value: import("./parse-result").MediaParserStructureUnstable) => void;
            getFlacStructure: () => import("./containers/flac/types").FlacStructure;
            getIsoStructure: () => import("./parse-result").IsoBaseMediaStructure;
            getMp3Structure: () => import("./parse-result").Mp3Structure;
            getM3uStructure: () => import("./containers/m3u/types").M3uStructure;
            getRiffStructure: () => import("./containers/riff/riff-box").RiffStructure;
            getTsStructure: () => import("./parse-result").TransportStreamStructure;
            getWavStructure: () => import("./containers/wav/types").WavStructure;
            getMatroskaStructure: () => import("./parse-result").MatroskaStructure;
        };
        onAudioTrack: import("./webcodec-sample-types").MediaParserOnAudioTrack | null;
        onVideoTrack: import("./webcodec-sample-types").MediaParserOnVideoTrack | null;
        emittedFields: import("./fields").AllOptions<import("./fields").ParseMediaFields>;
        fields: Partial<import("./fields").AllOptions<import("./fields").ParseMediaFields>>;
        samplesObserved: {
            addVideoSample: (videoSample: import("./webcodec-sample-types").MediaParserVideoSample) => void;
            addAudioSample: (audioSample: import("./webcodec-sample-types").MediaParserAudioSample) => void;
            getSlowDurationInSeconds: () => number;
            getFps: () => number;
            getSlowNumberOfFrames: () => number;
            getAudioBitrate: () => number | null;
            getVideoBitrate: () => number | null;
            getLastSampleObserved: () => boolean;
            setLastSampleObserved: () => void;
            getAmountOfSamplesObserved: () => number;
        };
        contentLength: number;
        images: {
            images: import("./state/images").MediaParserEmbeddedImage[];
            addImage: (image: import("./state/images").MediaParserEmbeddedImage) => void;
        };
        mediaSection: {
            addMediaSection: (section: import("./state/video-section").MediaSection) => void;
            getMediaSections: () => import("./state/video-section").MediaSection[];
            isCurrentByteInMediaSection: (iterator: import("./iterator/buffer-iterator").BufferIterator) => "no-section-defined" | "in-section" | "outside-section";
            isByteInMediaSection: ({ position, mediaSections, }: {
                position: number;
                mediaSections: import("./state/video-section").MediaSection[];
            }) => "no-section-defined" | "in-section" | "outside-section";
            getCurrentMediaSection: ({ offset, mediaSections, }: {
                offset: number;
                mediaSections: import("./state/video-section").MediaSection[];
            }) => import("./state/video-section").MediaSection | null;
            getMediaSectionAssertOnlyOne: () => import("./state/video-section").MediaSection;
            mediaSections: import("./state/video-section").MediaSection[];
        };
        logLevel: "trace" | "verbose" | "info" | "warn" | "error";
        iterator: {
            startReadingBits: () => void;
            stopReadingBits: () => void;
            skipTo: (offset: number) => void;
            addData: (newData: Uint8Array) => void;
            counter: {
                getOffset: () => number;
                discardBytes: (bytes: number) => void;
                increment: (bytes: number) => void;
                getDiscardedBytes: () => number;
                setDiscardedOffset: (bytes: number) => void;
                getDiscardedOffset: () => number;
                decrement: (bytes: number) => void;
            };
            peekB: (length: number) => void;
            peekD: (length: number) => void;
            getBits: (bits: number) => number;
            bytesRemaining: () => number;
            leb128: () => number;
            removeBytesRead: (force: boolean, mode: import("./options").ParseMediaMode) => {
                bytesRemoved: number;
                removedData: Uint8Array<ArrayBuffer> | null;
            };
            discard: (length: number) => void;
            getEightByteNumber: (littleEndian?: boolean) => number;
            getFourByteNumber: () => number;
            getSlice: (amount: number) => Uint8Array<ArrayBuffer>;
            getAtom: () => string;
            detectFileType: () => import("./file-types/detect-file-type").FileType;
            getPaddedFourByteNumber: () => number;
            getMatroskaSegmentId: () => string | null;
            getVint: () => number | null;
            getUint8: () => number;
            getEBML: () => number;
            getInt8: () => number;
            getUint16: () => number;
            getUint16Le: () => number;
            getUint24: () => number;
            getInt24: () => number;
            getInt16: () => number;
            getUint32: () => number;
            getUint64: (littleEndian?: boolean) => bigint;
            getInt64: (littleEndian?: boolean) => bigint;
            getFixedPointUnsigned1616Number: () => number;
            getFixedPointSigned1616Number: () => number;
            getFixedPointSigned230Number: () => number;
            getPascalString: () => number[];
            getUint(length: number): number;
            getByteString(length: number, trimTrailingZeroes: boolean): string;
            planBytes: (size: number) => {
                discardRest: () => Uint8Array<ArrayBuffer>;
            };
            getFloat64: () => number;
            readUntilNullTerminator: () => string;
            getFloat32: () => number;
            getUint32Le: () => number;
            getInt32Le: () => number;
            getInt32: () => number;
            destroy: () => void;
            startBox: (size: number) => {
                discardRest: () => void;
                expectNoMoreBytes: () => void;
            };
            readExpGolomb: () => number;
            startCheckpoint: () => {
                returnToCheckpoint: () => void;
            };
            getFlacCodecNumber: () => number;
            readUntilLineEnd: () => string | null;
            getSyncSafeInt32: () => number;
            replaceData: (newData: Uint8Array, seekTo: number) => void;
        };
        controller: import("./controller/media-parser-controller").MediaParserController;
        mode: import("./options").ParseMediaMode;
        src: import("./options").ParseMediaSrc;
        readerInterface: import("./readers/reader").MediaParserReaderInterface;
        discardReadBytes: (force: boolean) => Promise<void>;
        selectM3uStreamFn: import("./containers/m3u/select-stream").SelectM3uStreamFn;
        selectM3uAssociatedPlaylistsFn: import("./containers/m3u/select-stream").SelectM3uAssociatedPlaylistsFn;
        m3uPlaylistContext: import("./options").M3uPlaylistContext | null;
        contentType: string | null;
        name: string;
        returnValue: {
            dimensions: import("./get-dimensions").MediaParserDimensions | null;
            durationInSeconds: number | null;
            slowDurationInSeconds: number;
            slowNumberOfFrames: number;
            slowFps: number;
            slowStructure: import("./parse-result").MediaParserStructureUnstable;
            fps: number | null;
            videoCodec: import("./get-tracks").MediaParserVideoCodec | null;
            audioCodec: import("./get-tracks").MediaParserAudioCodec | null;
            tracks: import("./get-tracks").MediaParserTrack[];
            rotation: number | null;
            unrotatedDimensions: import("./get-dimensions").MediaParserDimensions | null;
            internalStats: import("./state/parser-state").InternalStats;
            size: number | null;
            name: string;
            container: import("./options").MediaParserContainer;
            isHdr: boolean;
            metadata: import("./metadata/get-metadata").MediaParserMetadataEntry[];
            location: import("./get-location").MediaParserLocation | null;
            mimeType: string | null;
            keyframes: import("./options").MediaParserKeyframe[] | null;
            slowKeyframes: import("./options").MediaParserKeyframe[];
            images: import("./state/images").MediaParserEmbeddedImage[];
            sampleRate: number | null;
            numberOfAudioChannels: number | null;
            slowVideoBitrate: number | null;
            slowAudioBitrate: number | null;
            m3uStreams: import("./containers/m3u/get-streams").M3uStream[] | null;
        };
        callbackFunctions: Partial<import("./options").ParseMediaCallbacksMandatory>;
        fieldsInReturnValue: Partial<import("./fields").AllOptions<import("./fields").ParseMediaFields>>;
        mimeType: string | null;
        errored: Error | null;
        currentReader: {
            getCurrent: () => import("./readers/reader").Reader;
            setCurrent: (newReader: import("./readers/reader").Reader) => void;
        };
        seekInfiniteLoop: {
            registerSeek: (byte: number) => void;
            reset: () => void;
        };
        makeSamplesStartAtZero: boolean;
        prefetchCache: import("./fetch").PrefetchCache;
        avc: {
            getPrevPicOrderCntLsb(): number;
            getPrevPicOrderCntMsb(): number;
            setPrevPicOrderCntLsb(value: number): void;
            setPrevPicOrderCntMsb(value: number): void;
            setSps(value: import("./containers/avc/parse-avc").SpsInfo): void;
            getSps(): import("./containers/avc/parse-avc").SpsInfo | null;
            getMaxFramesInBuffer(): number | null;
            clear(): void;
        };
    };
    processSample: ({ iterator, logLevel, contentLength, }: {
        iterator: import("./iterator/buffer-iterator").BufferIterator;
        logLevel: MediaParserLogLevel;
        contentLength: number;
    }) => Promise<{
        sample: import("./containers/iso-base-media/stsd/samples").Sample | null;
    }>;
    parseFtyp: ({ iterator, size, offset, }: {
        iterator: import("./iterator/buffer-iterator").BufferIterator;
        size: number;
        offset: number;
    }) => import("./containers/iso-base-media/ftyp").FtypBox;
    parseEbml: (iterator: import("./iterator/buffer-iterator").BufferIterator, statesForProcessing: import("./containers/webm/state-for-processing").WebmRequiredStatesForProcessing | null, logLevel: MediaParserLogLevel) => Promise<import("./containers/webm/parse-ebml").Prettify<PossibleEbml> | null>;
    parseMvhd: ({ iterator, offset, size, }: {
        iterator: import("./iterator/buffer-iterator").BufferIterator;
        offset: number;
        size: number;
    }) => import("./containers/iso-base-media/moov/mvhd").MvhdBox;
    internalParseMedia: import("./options").InternalParseMedia;
    fieldsNeedSamplesMap: Record<keyof import("./fields").AllOptions<import("./fields").ParseMediaFields>, boolean>;
};
export type { MediaParserLogLevel };
export { M3uAssociatedPlaylist, M3uStream } from './containers/m3u/get-streams';
export { defaultSelectM3uAssociatedPlaylists, defaultSelectM3uStreamFn, SelectM3uAssociatedPlaylistsFn, SelectM3uStreamFn, SelectM3uStreamFnOptions, } from './containers/m3u/select-stream';
export { mediaParserController, MediaParserController, } from './controller/media-parser-controller';
export { VERSION } from './version';
export { WEBCODECS_TIMESCALE } from './webcodecs-timescale';
export type { SeekResolution } from './work-on-seek-request';
export type { MediaParserSampleAspectRatio } from './get-tracks';
/**
 * @deprecated Dont use these yet.
 */
export type MediaParserInternalTypes = {
    SamplePosition: SamplePosition;
    MatroskaSegment: MatroskaSegment;
    MatroskaElement: MatroskaElement;
    WriterInterface: WriterInterface;
    CreateContent: CreateContent;
    Writer: Writer;
    Ebml: Ebml;
    FloatWithSize: FloatWithSize;
    MainSegment: MainSegment;
    PossibleEbml: PossibleEbml;
    TrackEntry: TrackEntry;
    UintWithSize: UintWithSize;
    ParseMediaCallbacks: ParseMediaCallbacks;
};
/**
 * @deprecated Dont use this yet.
 */
type _InternalEbmlValue<T extends Ebml, Child = PossibleEbml> = EbmlValue<T, Child>;
export { _InternalEbmlValue };

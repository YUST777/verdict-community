import type { AvcPPs, AvcProfileInfo } from '../containers/avc/parse-avc';
import type { SelectM3uAssociatedPlaylistsFn, SelectM3uStreamFn } from '../containers/m3u/select-stream';
import type { MediaParserController } from '../controller/media-parser-controller';
import type { PrefetchCache } from '../fetch';
import type { Options, ParseMediaFields } from '../fields';
import { type BufferIterator } from '../iterator/buffer-iterator';
import { type MediaParserLogLevel } from '../log';
import type { M3uPlaylistContext, OnDiscardedData, ParseMediaCallbacks, ParseMediaMode, ParseMediaSrc } from '../options';
import type { MediaParserReaderInterface, Reader } from '../readers/reader';
import type { MediaParserOnAudioTrack, MediaParserOnVideoTrack } from '../webcodec-sample-types';
export type InternalStats = {
    skippedBytes: number;
    finalCursorOffset: number;
};
export type SpsAndPps = {
    sps: AvcProfileInfo;
    pps: AvcPPs;
};
export declare const makeParserState: ({ hasAudioTrackHandlers, hasVideoTrackHandlers, controller, onAudioTrack, onVideoTrack, contentLength, logLevel, mode, src, readerInterface, onDiscardedData, selectM3uStreamFn, selectM3uAssociatedPlaylistsFn, m3uPlaylistContext, contentType, name, callbacks, fieldsInReturnValue, mimeType, initialReaderInstance, makeSamplesStartAtZero, prefetchCache, }: {
    hasAudioTrackHandlers: boolean;
    hasVideoTrackHandlers: boolean;
    controller: MediaParserController;
    onAudioTrack: MediaParserOnAudioTrack | null;
    onVideoTrack: MediaParserOnVideoTrack | null;
    contentLength: number;
    logLevel: MediaParserLogLevel;
    mode: ParseMediaMode;
    src: ParseMediaSrc;
    readerInterface: MediaParserReaderInterface;
    onDiscardedData: OnDiscardedData | null;
    selectM3uStreamFn: SelectM3uStreamFn;
    selectM3uAssociatedPlaylistsFn: SelectM3uAssociatedPlaylistsFn;
    m3uPlaylistContext: M3uPlaylistContext | null;
    contentType: string | null;
    name: string;
    callbacks: ParseMediaCallbacks;
    fieldsInReturnValue: Options<ParseMediaFields>;
    mimeType: string | null;
    initialReaderInstance: Reader;
    makeSamplesStartAtZero: boolean;
    prefetchCache: PrefetchCache;
}) => {
    riff: {
        getAvcProfile: () => SpsAndPps | null;
        onProfile: (profile: SpsAndPps) => Promise<void>;
        registerOnAvcProfileCallback: (callback: (profile: SpsAndPps) => Promise<void>) => void;
        getNextTrackIndex: () => number;
        queuedBFrames: {
            addFrame: ({ frame, maxFramesInBuffer, trackId, timescale, }: {
                frame: import("./riff/queued-frames").QueuedVideoSample;
                trackId: number;
                maxFramesInBuffer: number;
                timescale: number;
            }) => void;
            flush: () => void;
            getReleasedFrame: () => {
                sample: import("./riff/queued-frames").QueuedVideoSample;
                trackId: number;
                timescale: number;
            } | null;
            hasReleasedFrames: () => boolean;
            clear: () => void;
        };
        incrementNextTrackIndex: () => void;
        lazyIdx1: {
            triggerLoad: (position: number) => Promise<{
                entries: import("../containers/riff/riff-box").Idx1Entry[];
                videoTrackIndex: number | null;
            }>;
            getLoadedIdx1: () => Promise<{
                entries: import("../containers/riff/riff-box").Idx1Entry[];
                videoTrackIndex: number | null;
            } | null>;
            getIfAlreadyLoaded: () => {
                entries: import("../containers/riff/riff-box").Idx1Entry[];
                videoTrackIndex: number | null;
            } | null;
            setFromSeekingHints: (hints: import("../containers/riff/seeking-hints").RiffSeekingHints) => void;
            waitForLoaded: () => Promise<{
                entries: import("../containers/riff/riff-box").Idx1Entry[];
                videoTrackIndex: number | null;
            }> | Promise<null>;
        };
        sampleCounter: {
            onAudioSample: (trackId: number, audioSample: import("../webcodec-sample-types").MediaParserAudioSample) => void;
            onVideoSample: ({ trackId, videoSample, }: {
                videoSample: import("../webcodec-sample-types").MediaParserVideoSample;
                trackId: number;
            }) => void;
            getSampleCountForTrack: ({ trackId }: {
                trackId: number;
            }) => number;
            setSamplesFromSeek: (samples: Record<number, number>) => void;
            riffKeys: {
                addKeyframe: (keyframe: import("./riff/riff-keyframes").RiffKeyframe) => void;
                getKeyframes: () => import("./riff/riff-keyframes").RiffKeyframe[];
                setFromSeekingHints: (keyframesFromHints: import("./riff/riff-keyframes").RiffKeyframe[]) => void;
            };
            setPocAtKeyframeOffset: ({ keyframeOffset, poc, }: {
                keyframeOffset: number;
                poc: number;
            }) => void;
            getPocAtKeyframeOffset: ({ keyframeOffset, }: {
                keyframeOffset: number;
            }) => number[];
            getKeyframeAtOffset: (sample: import("./riff/queued-frames").QueuedVideoSample) => number | null;
        };
    };
    transportStream: {
        nextPesHeaderStore: {
            setNextPesHeader: (pesHeader: import("../containers/transport-stream/parse-pes").PacketPes) => void;
            getNextPesHeader: () => import("../containers/transport-stream/parse-pes").PacketPes;
        };
        observedPesHeaders: {
            pesHeaders: import("../containers/transport-stream/parse-pes").PacketPes[];
            addPesHeader: (pesHeader: import("../containers/transport-stream/parse-pes").PacketPes) => void;
            markPtsAsKeyframe: (pts: number) => void;
            getPesKeyframeHeaders: () => import("../containers/transport-stream/parse-pes").PacketPes[];
            setPesKeyframesFromSeekingHints: (hints: import("../seeking-hints").TransportStreamSeekingHints) => void;
        };
        streamBuffers: Map<number, import("../containers/transport-stream/process-stream-buffers").TransportStreamPacketBuffer>;
        startOffset: {
            getOffset: (trackId: number) => number;
            setOffset: ({ newOffset, trackId }: {
                trackId: number;
                newOffset: number;
            }) => void;
        };
        resetBeforeSeek: () => void;
        lastEmittedSample: {
            setLastEmittedSample: (sample: import("../webcodec-sample-types").MediaParserAudioSample | import("../webcodec-sample-types").MediaParserVideoSample) => void;
            getLastEmittedSample: () => import("../webcodec-sample-types").MediaParserVideoSample | import("../webcodec-sample-types").MediaParserAudioSample | null;
            resetLastEmittedSample: () => void;
        };
    };
    webm: {
        cues: {
            triggerLoad: (position: number, segmentOffset: number) => Promise<import("../containers/webm/seek/format-cues").MatroskaCue[] | null>;
            getLoadedCues: () => Promise<{
                cues: import("../containers/webm/seek/format-cues").MatroskaCue[];
                segmentOffset: number;
            } | null>;
            getIfAlreadyLoaded: () => {
                cues: import("../containers/webm/seek/format-cues").MatroskaCue[];
                segmentOffset: number;
            } | null;
            setFromSeekingHints: (hints: import("../seeking-hints").WebmSeekingHints) => void;
        };
        onTrackEntrySegment: import("../containers/webm/segments").OnTrackEntrySegment;
        getTrackInfoByNumber: (id: number) => import("../containers/webm/segments/track-entry").TrackInfo;
        setTimestampOffset: (byteOffset: number, timestamp: number) => void;
        getTimestampOffsetForByteOffset: (byteOffset: number) => number | undefined;
        getTimeStampMapForSeekingHints: () => Map<number, number>;
        setTimeStampMapForSeekingHints: (newTimestampMap: Map<number, number>) => void;
        getTimescale: () => number;
        setTimescale: (newTimescale: number) => void;
        addSegment: (seg: Omit<import("./matroska/webm").SegmentSection, "index">) => void;
        addCluster: (cluster: import("./matroska/webm").ClusterSection) => void;
        getFirstCluster: () => import("./matroska/webm").ClusterSection | undefined;
        isInsideSegment: (iterator: BufferIterator) => import("./matroska/webm").SegmentSection | null;
        isInsideCluster: (offset: number) => import("./matroska/webm").ClusterSection | null;
        setAvcProfileForTrackNumber: (trackNumber: number, avcProfile: AvcProfileInfo) => void;
        getAvcProfileForTrackNumber: (trackNumber: number) => AvcProfileInfo | null;
    };
    iso: {
        flatSamples: {
            getSamples: (mdatStart: number) => {
                trackId: number;
                samplePositions: import("..").SamplePosition[];
            }[] | null;
            setSamples: (mdatStart: number, samples: {
                trackId: number;
                samplePositions: import("..").SamplePosition[];
            }[]) => void;
            setCurrentSampleIndex: (mdatStart: number, trackId: number, index: number) => void;
            getCurrentSampleIndices: (mdatStart: number) => Record<number, number>;
            updateAfterSeek: (seekedByte: number) => void;
        };
        moov: {
            setMoovBox: (moov: {
                moovBox: import("../containers/iso-base-media/moov/moov").MoovBox;
                precomputed: boolean;
            }) => void;
            getMoovBoxAndPrecomputed: () => {
                moovBox: import("../containers/iso-base-media/moov/moov").MoovBox;
                precomputed: boolean;
            } | null;
        };
        mfra: {
            triggerLoad: () => Promise<import("../containers/iso-base-media/base-media-box").IsoBaseMediaBox[] | null>;
            getIfAlreadyLoaded: () => import("../containers/iso-base-media/base-media-box").IsoBaseMediaBox[] | null;
            setFromSeekingHints: (hints: import("../seeking-hints").IsoBaseMediaSeekingHints) => void;
        };
        moof: {
            getMoofBoxes: () => import("./iso-base-media/precomputed-moof").MoofBox[];
            setMoofBoxes: (boxes: import("./iso-base-media/precomputed-moof").MoofBox[]) => void;
        };
        tfra: {
            getTfraBoxes: () => import("../containers/iso-base-media/mfra/tfra").TfraBox[];
            setTfraBoxes: (boxes: import("../containers/iso-base-media/mfra/tfra").TfraBox[]) => void;
        };
        movieTimeScale: {
            getTrackTimescale: () => number | null;
            setTrackTimescale: (timescale: number) => void;
        };
    };
    mp3: {
        getMp3Info: () => import("./mp3").Mp3Info | null;
        setMp3Info: (info: import("./mp3").Mp3Info) => void;
        getMp3BitrateInfo: () => import("./mp3").Mp3BitrateInfo | null;
        setMp3BitrateInfo: (info: import("./mp3").Mp3BitrateInfo) => void;
        audioSamples: {
            addSample: (audioSampleOffset: import("./audio-sample-map").AudioSampleOffset) => void;
            getSamples: () => import("./audio-sample-map").AudioSampleOffset[];
            setFromSeekingHints: (newMap: import("./audio-sample-map").AudioSampleOffset[]) => void;
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
            addSample: (audioSampleOffset: import("./audio-sample-map").AudioSampleOffset) => void;
            getSamples: () => import("./audio-sample-map").AudioSampleOffset[];
            setFromSeekingHints: (newMap: import("./audio-sample-map").AudioSampleOffset[]) => void;
        };
    };
    flac: {
        setBlockingBitStrategy: (strategy: number) => void;
        getBlockingBitStrategy: () => number | undefined;
        audioSamples: {
            addSample: (audioSampleOffset: import("./audio-sample-map").AudioSampleOffset) => void;
            getSamples: () => import("./audio-sample-map").AudioSampleOffset[];
            setFromSeekingHints: (newMap: import("./audio-sample-map").AudioSampleOffset[]) => void;
        };
    };
    m3u: {
        setSelectedMainPlaylist: (stream: import("./m3u-state").M3uStreamOrInitialUrl) => void;
        getSelectedMainPlaylist: () => import("./m3u-state").M3uStreamOrInitialUrl | null;
        setHasEmittedVideoTrack: (src: string, callback: import("../webcodec-sample-types").MediaParserOnVideoSample | null) => void;
        hasEmittedVideoTrack: (src: string) => false | import("../webcodec-sample-types").MediaParserOnVideoSample | null;
        setHasEmittedAudioTrack: (src: string, callback: import("../webcodec-sample-types").MediaParserOnAudioSample | null) => void;
        hasEmittedAudioTrack: (src: string) => false | import("../webcodec-sample-types").MediaParserOnAudioSample | null;
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
        setM3uStreamRun: (playlistUrl: string, run: import("./m3u-state").M3uRun | null) => void;
        setTracksDone: (playlistUrl: string) => boolean;
        getTrackDone: (playlistUrl: string) => boolean;
        clearTracksDone: () => void;
        getM3uStreamRun: (playlistUrl: string) => import("./m3u-state").M3uRun;
        abortM3UStreamRuns: () => void;
        setAssociatedPlaylists: (playlists: import("..").M3uAssociatedPlaylist[]) => void;
        getAssociatedPlaylists: () => import("..").M3uAssociatedPlaylist[] | null;
        getSelectedPlaylists: () => string[];
        sampleSorter: {
            clearSamples: () => void;
            addToStreamWithTrack: (src: string) => void;
            addVideoStreamToConsider: (src: string, callback: import("../webcodec-sample-types").MediaParserOnVideoSample) => void;
            addAudioStreamToConsider: (src: string, callback: import("../webcodec-sample-types").MediaParserOnAudioSample) => void;
            hasAudioStreamToConsider: (src: string) => boolean;
            hasVideoStreamToConsider: (src: string) => boolean;
            addAudioSample: (src: string, sample: import("../webcodec-sample-types").MediaParserAudioSample) => Promise<void>;
            addVideoSample: (src: string, sample: import("../webcodec-sample-types").MediaParserVideoSample) => Promise<void>;
            getNextStreamToRun: (streams: string[]) => string;
        };
        setMp4HeaderSegment: (playlistUrl: string, structure: import("../parse-result").IsoBaseMediaStructure) => void;
        getMp4HeaderSegment: (playlistUrl: string) => import("../parse-result").IsoBaseMediaStructure;
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
        registerVideoSampleCallback: (id: number, callback: import("../webcodec-sample-types").MediaParserOnVideoSample | null) => Promise<void>;
        onAudioSample: ({ audioSample, trackId, }: {
            trackId: number;
            audioSample: import("../webcodec-sample-types").MediaParserAudioSample;
        }) => Promise<void>;
        onVideoSample: ({ trackId, videoSample, }: {
            trackId: number;
            videoSample: import("../webcodec-sample-types").MediaParserVideoSample;
        }) => Promise<void>;
        canSkipTracksState: {
            doFieldsNeedTracks: () => boolean;
            canSkipTracks: () => boolean;
        };
        registerAudioSampleCallback: (id: number, callback: import("../webcodec-sample-types").MediaParserOnAudioSample | null) => Promise<void>;
        tracks: {
            hasAllTracks: () => boolean;
            getIsDone: () => boolean;
            setIsDone: (logLevel: MediaParserLogLevel) => void;
            addTrack: (track: import("..").MediaParserTrack) => void;
            getTracks: () => import("..").MediaParserTrack[];
            ensureHasTracksAtEnd: (fields: Options<ParseMediaFields>) => void;
        };
        audioSampleCallbacks: Record<number, import("../webcodec-sample-types").MediaParserOnAudioSample>;
        videoSampleCallbacks: Record<number, import("../webcodec-sample-types").MediaParserOnVideoSample>;
        hasAudioTrackHandlers: boolean;
        hasVideoTrackHandlers: boolean;
        callTracksDoneCallback: () => Promise<void>;
    };
    getInternalStats: () => InternalStats;
    getSkipBytes: () => number;
    increaseSkippedBytes: (bytes: number) => void;
    keyframes: {
        addKeyframe: (keyframe: import("../options").MediaParserKeyframe) => void;
        getKeyframes: () => import("../options").MediaParserKeyframe[];
        setFromSeekingHints: (keyframesFromHints: import("../options").MediaParserKeyframe[]) => void;
    };
    structure: {
        getStructureOrNull: () => import("../parse-result").MediaParserStructureUnstable | null;
        getStructure: () => import("../parse-result").MediaParserStructureUnstable;
        setStructure: (value: import("../parse-result").MediaParserStructureUnstable) => void;
        getFlacStructure: () => import("../containers/flac/types").FlacStructure;
        getIsoStructure: () => import("../parse-result").IsoBaseMediaStructure;
        getMp3Structure: () => import("../parse-result").Mp3Structure;
        getM3uStructure: () => import("../containers/m3u/types").M3uStructure;
        getRiffStructure: () => import("../containers/riff/riff-box").RiffStructure;
        getTsStructure: () => import("../parse-result").TransportStreamStructure;
        getWavStructure: () => import("../containers/wav/types").WavStructure;
        getMatroskaStructure: () => import("../parse-result").MatroskaStructure;
    };
    onAudioTrack: MediaParserOnAudioTrack | null;
    onVideoTrack: MediaParserOnVideoTrack | null;
    emittedFields: import("../fields").AllOptions<ParseMediaFields>;
    fields: Partial<import("../fields").AllOptions<ParseMediaFields>>;
    samplesObserved: {
        addVideoSample: (videoSample: import("../webcodec-sample-types").MediaParserVideoSample) => void;
        addAudioSample: (audioSample: import("../webcodec-sample-types").MediaParserAudioSample) => void;
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
        images: import("./images").MediaParserEmbeddedImage[];
        addImage: (image: import("./images").MediaParserEmbeddedImage) => void;
    };
    mediaSection: {
        addMediaSection: (section: import("./video-section").MediaSection) => void;
        getMediaSections: () => import("./video-section").MediaSection[];
        isCurrentByteInMediaSection: (iterator: BufferIterator) => "no-section-defined" | "in-section" | "outside-section";
        isByteInMediaSection: ({ position, mediaSections, }: {
            position: number;
            mediaSections: import("./video-section").MediaSection[];
        }) => "no-section-defined" | "in-section" | "outside-section";
        getCurrentMediaSection: ({ offset, mediaSections, }: {
            offset: number;
            mediaSections: import("./video-section").MediaSection[];
        }) => import("./video-section").MediaSection | null;
        getMediaSectionAssertOnlyOne: () => import("./video-section").MediaSection;
        mediaSections: import("./video-section").MediaSection[];
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
        removeBytesRead: (force: boolean, mode: ParseMediaMode) => {
            bytesRemoved: number;
            removedData: Uint8Array<ArrayBuffer> | null;
        };
        discard: (length: number) => void;
        getEightByteNumber: (littleEndian?: boolean) => number;
        getFourByteNumber: () => number;
        getSlice: (amount: number) => Uint8Array<ArrayBuffer>;
        getAtom: () => string;
        detectFileType: () => import("../file-types/detect-file-type").FileType;
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
    controller: MediaParserController;
    mode: ParseMediaMode;
    src: ParseMediaSrc;
    readerInterface: MediaParserReaderInterface;
    discardReadBytes: (force: boolean) => Promise<void>;
    selectM3uStreamFn: SelectM3uStreamFn;
    selectM3uAssociatedPlaylistsFn: SelectM3uAssociatedPlaylistsFn;
    m3uPlaylistContext: M3uPlaylistContext | null;
    contentType: string | null;
    name: string;
    returnValue: {
        dimensions: import("..").MediaParserDimensions | null;
        durationInSeconds: number | null;
        slowDurationInSeconds: number;
        slowNumberOfFrames: number;
        slowFps: number;
        slowStructure: import("../parse-result").MediaParserStructureUnstable;
        fps: number | null;
        videoCodec: import("..").MediaParserVideoCodec | null;
        audioCodec: import("..").MediaParserAudioCodec | null;
        tracks: import("..").MediaParserTrack[];
        rotation: number | null;
        unrotatedDimensions: import("..").MediaParserDimensions | null;
        internalStats: InternalStats;
        size: number | null;
        name: string;
        container: import("../options").MediaParserContainer;
        isHdr: boolean;
        metadata: import("..").MediaParserMetadataEntry[];
        location: import("..").MediaParserLocation | null;
        mimeType: string | null;
        keyframes: import("../options").MediaParserKeyframe[] | null;
        slowKeyframes: import("../options").MediaParserKeyframe[];
        images: import("./images").MediaParserEmbeddedImage[];
        sampleRate: number | null;
        numberOfAudioChannels: number | null;
        slowVideoBitrate: number | null;
        slowAudioBitrate: number | null;
        m3uStreams: import("..").M3uStream[] | null;
    };
    callbackFunctions: Partial<import("../options").ParseMediaCallbacksMandatory>;
    fieldsInReturnValue: Partial<import("../fields").AllOptions<ParseMediaFields>>;
    mimeType: string | null;
    errored: Error | null;
    currentReader: {
        getCurrent: () => Reader;
        setCurrent: (newReader: Reader) => void;
    };
    seekInfiniteLoop: {
        registerSeek: (byte: number) => void;
        reset: () => void;
    };
    makeSamplesStartAtZero: boolean;
    prefetchCache: PrefetchCache;
    avc: {
        getPrevPicOrderCntLsb(): number;
        getPrevPicOrderCntMsb(): number;
        setPrevPicOrderCntLsb(value: number): void;
        setPrevPicOrderCntMsb(value: number): void;
        setSps(value: import("../containers/avc/parse-avc").SpsInfo): void;
        getSps(): import("../containers/avc/parse-avc").SpsInfo | null;
        getMaxFramesInBuffer(): number | null;
        clear(): void;
    };
};
export type ParserState = ReturnType<typeof makeParserState>;

import type { AvcProfileInfo } from '../../containers/avc/parse-avc';
import type { OnTrackEntrySegment } from '../../containers/webm/segments';
import type { TrackInfo } from '../../containers/webm/segments/track-entry';
import type { MediaParserController } from '../../controller/media-parser-controller';
import type { PrefetchCache } from '../../fetch';
import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../log';
import type { ParseMediaSrc } from '../../options';
import type { MediaParserReaderInterface } from '../../readers/reader';
export type SegmentSection = {
    start: number;
    size: number;
    index: number;
};
export type ClusterSection = {
    start: number;
    size: number;
    segment: number;
};
export declare const webmState: ({ controller, logLevel, readerInterface, src, prefetchCache, }: {
    controller: MediaParserController;
    logLevel: MediaParserLogLevel;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    prefetchCache: PrefetchCache;
}) => {
    cues: {
        triggerLoad: (position: number, segmentOffset: number) => Promise<import("../../containers/webm/seek/format-cues").MatroskaCue[] | null>;
        getLoadedCues: () => Promise<{
            cues: import("../../containers/webm/seek/format-cues").MatroskaCue[];
            segmentOffset: number;
        } | null>;
        getIfAlreadyLoaded: () => {
            cues: import("../../containers/webm/seek/format-cues").MatroskaCue[];
            segmentOffset: number;
        } | null;
        setFromSeekingHints: (hints: import("../../seeking-hints").WebmSeekingHints) => void;
    };
    onTrackEntrySegment: OnTrackEntrySegment;
    getTrackInfoByNumber: (id: number) => TrackInfo;
    setTimestampOffset: (byteOffset: number, timestamp: number) => void;
    getTimestampOffsetForByteOffset: (byteOffset: number) => number | undefined;
    getTimeStampMapForSeekingHints: () => Map<number, number>;
    setTimeStampMapForSeekingHints: (newTimestampMap: Map<number, number>) => void;
    getTimescale: () => number;
    setTimescale: (newTimescale: number) => void;
    addSegment: (seg: Omit<SegmentSection, "index">) => void;
    addCluster: (cluster: ClusterSection) => void;
    getFirstCluster: () => ClusterSection | undefined;
    isInsideSegment: (iterator: BufferIterator) => SegmentSection | null;
    isInsideCluster: (offset: number) => ClusterSection | null;
    setAvcProfileForTrackNumber: (trackNumber: number, avcProfile: AvcProfileInfo) => void;
    getAvcProfileForTrackNumber: (trackNumber: number) => AvcProfileInfo | null;
};
export type WebmState = ReturnType<typeof webmState>;

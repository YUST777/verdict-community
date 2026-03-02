import type { MediaParserController } from '../../controller/media-parser-controller';
import type { PrefetchCache } from '../../fetch';
import type { MediaParserLogLevel } from '../../log';
import type { ParseMediaSrc } from '../../options';
import type { MediaParserReaderInterface } from '../../readers/reader';
export declare const isoBaseMediaState: ({ contentLength, controller, readerInterface, src, logLevel, prefetchCache, }: {
    contentLength: number;
    controller: MediaParserController;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    logLevel: MediaParserLogLevel;
    prefetchCache: PrefetchCache;
}) => {
    flatSamples: {
        getSamples: (mdatStart: number) => {
            trackId: number;
            samplePositions: import("../..").SamplePosition[];
        }[] | null;
        setSamples: (mdatStart: number, samples: {
            trackId: number;
            samplePositions: import("../..").SamplePosition[];
        }[]) => void;
        setCurrentSampleIndex: (mdatStart: number, trackId: number, index: number) => void;
        getCurrentSampleIndices: (mdatStart: number) => Record<number, number>;
        updateAfterSeek: (seekedByte: number) => void;
    };
    moov: {
        setMoovBox: (moov: {
            moovBox: import("../../containers/iso-base-media/moov/moov").MoovBox;
            precomputed: boolean;
        }) => void;
        getMoovBoxAndPrecomputed: () => {
            moovBox: import("../../containers/iso-base-media/moov/moov").MoovBox;
            precomputed: boolean;
        } | null;
    };
    mfra: {
        triggerLoad: () => Promise<import("../../containers/iso-base-media/base-media-box").IsoBaseMediaBox[] | null>;
        getIfAlreadyLoaded: () => import("../../containers/iso-base-media/base-media-box").IsoBaseMediaBox[] | null;
        setFromSeekingHints: (hints: import("../../seeking-hints").IsoBaseMediaSeekingHints) => void;
    };
    moof: {
        getMoofBoxes: () => import("./precomputed-moof").MoofBox[];
        setMoofBoxes: (boxes: import("./precomputed-moof").MoofBox[]) => void;
    };
    tfra: {
        getTfraBoxes: () => import("../../containers/iso-base-media/mfra/tfra").TfraBox[];
        setTfraBoxes: (boxes: import("../../containers/iso-base-media/mfra/tfra").TfraBox[]) => void;
    };
    movieTimeScale: {
        getTrackTimescale: () => number | null;
        setTrackTimescale: (timescale: number) => void;
    };
};
export type IsoBaseMediaState = ReturnType<typeof isoBaseMediaState>;

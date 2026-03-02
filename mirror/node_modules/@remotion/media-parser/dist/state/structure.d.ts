import type { MediaParserStructureUnstable } from '../parse-result';
export declare const structureState: () => {
    getStructureOrNull: () => MediaParserStructureUnstable | null;
    getStructure: () => MediaParserStructureUnstable;
    setStructure: (value: MediaParserStructureUnstable) => void;
    getFlacStructure: () => import("../containers/flac/types").FlacStructure;
    getIsoStructure: () => import("../parse-result").IsoBaseMediaStructure;
    getMp3Structure: () => import("../parse-result").Mp3Structure;
    getM3uStructure: () => import("../containers/m3u/types").M3uStructure;
    getRiffStructure: () => import("../containers/riff/riff-box").RiffStructure;
    getTsStructure: () => import("../parse-result").TransportStreamStructure;
    getWavStructure: () => import("../containers/wav/types").WavStructure;
    getMatroskaStructure: () => import("../parse-result").MatroskaStructure;
};
export type StructureState = ReturnType<typeof structureState>;

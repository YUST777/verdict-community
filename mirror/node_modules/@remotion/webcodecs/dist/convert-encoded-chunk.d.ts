import type { MediaParserAudioSample, MediaParserVideoSample } from '@remotion/media-parser';
export declare const convertEncodedChunk: <T extends MediaParserAudioSample | MediaParserVideoSample>(chunk: EncodedAudioChunk | EncodedVideoChunk) => T;

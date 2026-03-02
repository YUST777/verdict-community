import type { MediaParserCodecData } from '../../codec-data';
import type { MediaParserAudioCodec } from '../../get-tracks';
type AudioDecoderConfig = {
    numberOfChannels: number;
    sampleRate: number;
    codecPrivate: MediaParserCodecData | null;
};
export declare const getActualDecoderParameters: ({ audioCodec, codecPrivate, numberOfChannels, sampleRate, }: {
    audioCodec: MediaParserAudioCodec;
    codecPrivate: MediaParserCodecData | null;
    numberOfChannels: number;
    sampleRate: number;
}) => AudioDecoderConfig;
export {};

import type { ParserState } from '../../../state/parser-state';
import type { MediaParserAudioSample } from '../../../webcodec-sample-types';
export declare const getAudioSampleFromCbr: ({ bitrateInKbit, initialOffset, layer, sampleRate, samplesPerFrame, data, state, }: {
    bitrateInKbit: number;
    layer: number;
    samplesPerFrame: number;
    sampleRate: number;
    initialOffset: number;
    data: Uint8Array;
    state: ParserState;
}) => {
    audioSample: MediaParserAudioSample;
    timeInSeconds: number;
    durationInSeconds: number;
};
export type AudioSampleFromCbr = ReturnType<typeof getAudioSampleFromCbr>;

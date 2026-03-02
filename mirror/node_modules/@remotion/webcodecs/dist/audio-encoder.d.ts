import { type MediaParserLogLevel } from '@remotion/media-parser';
import type { ConvertMediaAudioCodec } from './get-available-audio-codecs';
import type { IoSynchronizer } from './io-manager/io-synchronizer';
import type { WebCodecsController } from './webcodecs-controller';
export type WebCodecsAudioEncoder = {
    encode: (audioData: AudioData) => void;
    waitForFinish: () => Promise<void>;
    close: () => void;
    flush: () => Promise<void>;
    ioSynchronizer: IoSynchronizer;
};
export type AudioEncoderInit = {
    onChunk: (chunk: EncodedAudioChunk) => Promise<void>;
    onError: (error: Error) => void;
    codec: ConvertMediaAudioCodec;
    controller: WebCodecsController;
    config: AudioEncoderConfig;
    logLevel: MediaParserLogLevel;
    onNewAudioSampleRate: (sampleRate: number) => void;
};
export declare const createAudioEncoder: ({ onChunk, onError, codec, controller, config: audioEncoderConfig, logLevel, onNewAudioSampleRate, }: AudioEncoderInit) => WebCodecsAudioEncoder;

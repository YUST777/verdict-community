export declare const getSampleRateFromSampleFrequencyIndex: (samplingFrequencyIndex: number) => 96000 | 88200 | 64000 | 48000 | 44100 | 32000 | 24000 | 22050 | 16000 | 12000 | 11025 | 8000 | 7350;
export declare const createAacCodecPrivate: ({ audioObjectType, sampleRate, channelConfiguration, codecPrivate, }: {
    audioObjectType: number;
    sampleRate: number;
    channelConfiguration: number;
    codecPrivate: Uint8Array | null;
}) => Uint8Array<ArrayBufferLike>;
export declare const parseAacCodecPrivate: (bytes: Uint8Array) => {
    audioObjectType: number;
    sampleRate: number;
    channelConfiguration: number;
};
export declare const mapAudioObjectTypeToCodecString: (audioObjectType: number) => "mp4a.40.2" | "mp4a.40.5" | "mp4a.40.29" | "mp4a.40.1" | "mp4a.40.3" | "mp4a.40.4" | "mp4a.40.17" | "mp4a.40.23";

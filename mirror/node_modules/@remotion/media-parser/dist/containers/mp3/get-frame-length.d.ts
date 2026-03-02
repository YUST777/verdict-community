export declare const getAverageMpegFrameLength: ({ samplesPerFrame, bitrateKbit, samplingFrequency, layer, }: {
    samplesPerFrame: number;
    bitrateKbit: number;
    samplingFrequency: number;
    layer: number;
}) => number;
export declare const getMpegFrameLength: ({ samplesPerFrame, bitrateKbit, samplingFrequency, padding, layer, }: {
    samplesPerFrame: number;
    bitrateKbit: number;
    samplingFrequency: number;
    padding: boolean;
    layer: number;
}) => number;

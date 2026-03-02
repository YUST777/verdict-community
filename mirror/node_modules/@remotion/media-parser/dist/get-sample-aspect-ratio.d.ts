import type { Av1CBox } from './containers/iso-base-media/stsd/av1c';
import type { AvccBox } from './containers/iso-base-media/stsd/avcc';
import type { ColorParameterBox } from './containers/iso-base-media/stsd/colr';
import type { HvccBox } from './containers/iso-base-media/stsd/hvcc';
import type { PaspBox } from './containers/iso-base-media/stsd/pasp';
import type { VideoSample } from './containers/iso-base-media/stsd/samples';
import type { VpccBox } from './containers/iso-base-media/stsd/vpcc';
import type { TkhdBox } from './containers/iso-base-media/tkhd';
import type { TrakBox } from './containers/iso-base-media/trak/trak';
import type { MediaParserDimensions } from './get-dimensions';
type AspectRatio = {
    numerator: number;
    denominator: number;
};
export declare const getStsdVideoConfig: (trakBox: TrakBox) => VideoSample | null;
export declare const getAvccBox: (trakBox: TrakBox) => AvccBox | null;
export declare const getVpccBox: (trakBox: TrakBox) => VpccBox | null;
export declare const getAv1CBox: (trakBox: TrakBox) => Av1CBox | null;
export declare const getPaspBox: (trakBox: TrakBox) => PaspBox | null;
export declare const getHvccBox: (trakBox: TrakBox) => HvccBox | null;
export declare const getSampleAspectRatio: (trakBox: TrakBox) => AspectRatio;
export declare const getColrBox: (videoSample: VideoSample) => ColorParameterBox | null;
export declare const applyTkhdBox: (aspectRatioApplied: MediaParserDimensions, tkhdBox: TkhdBox) => {
    displayAspectWidth: number;
    displayAspectHeight: number;
    width: number;
    height: number;
    rotation: number;
};
export declare const applyAspectRatios: ({ dimensions, sampleAspectRatio, displayAspectRatio, }: {
    dimensions: MediaParserDimensions;
    sampleAspectRatio: AspectRatio;
    displayAspectRatio: AspectRatio;
}) => MediaParserDimensions;
export declare const getDisplayAspectRatio: ({ sampleAspectRatio, nativeDimensions, }: {
    sampleAspectRatio: AspectRatio;
    nativeDimensions: MediaParserDimensions;
}) => AspectRatio;
export {};

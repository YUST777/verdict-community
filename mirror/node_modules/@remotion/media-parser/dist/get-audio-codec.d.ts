import type { MediaParserCodecData } from './codec-data';
import type { TrakBox } from './containers/iso-base-media/trak/trak';
import { type MediaParserAudioCodec } from './get-tracks';
import type { ParserState } from './state/parser-state';
export declare const getAudioCodec: (parserState: ParserState) => MediaParserAudioCodec | null;
export declare const hasAudioCodec: (state: ParserState) => boolean;
type AudioCodecInfo = {
    format: string;
    primarySpecificator: number | null;
    secondarySpecificator: number | null;
    description: Uint8Array | undefined;
};
export declare const getCodecPrivateFromTrak: (trakBox: TrakBox) => MediaParserCodecData | null;
export declare const getNumberOfChannelsFromTrak: (trak: TrakBox) => number | null;
export declare const getSampleRate: (trak: TrakBox) => number | null;
export declare const getAudioCodecFromTrak: (trak: TrakBox) => AudioCodecInfo | null;
export declare const isLpcmAudioCodec: (trak: TrakBox) => boolean;
export declare const isIn24AudioCodec: (trak: TrakBox) => boolean;
export declare const isTwosAudioCodec: (trak: TrakBox) => boolean;
export declare const getAudioCodecStringFromTrak: (trak: TrakBox) => {
    codecString: string;
    description: MediaParserCodecData | undefined;
};
export declare const getAudioCodecFromTrack: (track: TrakBox) => MediaParserAudioCodec;
export {};

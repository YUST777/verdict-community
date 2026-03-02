import type { ParserState } from './state/parser-state';
export type MediaParserLocation = {
    latitude: number;
    longitude: number;
    altitude: number | null;
    horizontalAccuracy: number | null;
};
export declare function parseLocation(locationString: string): {
    latitude: number;
    longitude: number;
    altitude: number | null;
} | null;
export declare const getLocation: (state: ParserState) => MediaParserLocation | null;

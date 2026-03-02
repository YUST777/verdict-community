import type { MediaParserVideoTrack } from './get-tracks';
import type { SpsAndPps } from './state/parser-state';
export declare const addAvcProfileToTrack: (track: MediaParserVideoTrack, avc1Profile: SpsAndPps | null) => MediaParserVideoTrack;

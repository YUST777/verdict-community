import type { MediaParserAudioTrack, MediaParserOtherTrack, MediaParserVideoTrack } from '../../get-tracks';
import type { TrakBox } from './trak/trak';
export declare const makeBaseMediaTrack: (trakBox: TrakBox, startTimeInSeconds: number) => MediaParserVideoTrack | MediaParserAudioTrack | MediaParserOtherTrack | null;

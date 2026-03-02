import type { Mp3BitrateInfo, Mp3Info } from '../../../state/mp3';
import type { MediaSection } from '../../../state/video-section';
export declare const getApproximateByteFromBitrate: ({ mp3BitrateInfo, timeInSeconds, mp3Info, mediaSection, contentLength, }: {
    mp3BitrateInfo: Mp3BitrateInfo;
    mp3Info: Mp3Info;
    timeInSeconds: number;
    mediaSection: MediaSection;
    contentLength: number;
}) => number | null;

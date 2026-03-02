import type { Mp3Info, VariableMp3BitrateInfo } from '../../../state/mp3';
import type { AudioSampleFromCbr } from './audio-sample-from-cbr';
export declare const getAudioSampleFromVbr: ({ info, position, mp3Info, data, }: {
    position: number;
    info: VariableMp3BitrateInfo;
    mp3Info: Mp3Info | null;
    data: Uint8Array;
}) => AudioSampleFromCbr;

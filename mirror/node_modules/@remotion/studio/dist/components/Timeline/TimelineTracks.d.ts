import React from 'react';
import type { TrackWithHash } from '../../helpers/get-timeline-sequence-sort-key';
export declare const TimelineTracks: React.FC<{
    readonly timeline: TrackWithHash[];
    readonly hasBeenCut: boolean;
}>;

import React from 'react';
type ExpandedTracksContextValue = {
    readonly expandedTracks: Record<string, boolean>;
    readonly toggleTrack: (id: string) => void;
};
export declare const ExpandedTracksContext: React.Context<ExpandedTracksContextValue>;
export declare const ExpandedTracksProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export {};

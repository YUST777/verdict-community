import type { M3uAssociatedPlaylist, M3uStream } from './get-streams';
export type SelectM3uStreamFnOptions = {
    streams: M3uStream[];
};
export type SelectM3uStreamFn = (options: SelectM3uStreamFnOptions) => number | Promise<number>;
export type SelectM3uAssociatedPlaylistsFnOptions = {
    associatedPlaylists: M3uAssociatedPlaylist[];
};
export type SelectM3uAssociatedPlaylistsFn = (options: SelectM3uAssociatedPlaylistsFnOptions) => M3uAssociatedPlaylist[] | Promise<M3uAssociatedPlaylist[]>;
export declare const selectAssociatedPlaylists: ({ playlists, fn, skipAudioTracks, }: {
    playlists: M3uAssociatedPlaylist[];
    fn: SelectM3uAssociatedPlaylistsFn;
    skipAudioTracks: boolean;
}) => Promise<M3uAssociatedPlaylist[]>;
export declare const defaultSelectM3uAssociatedPlaylists: SelectM3uAssociatedPlaylistsFn;
export declare const selectStream: ({ streams, fn, }: {
    streams: M3uStream[];
    fn: SelectM3uStreamFn;
}) => Promise<M3uStream>;
export declare const defaultSelectM3uStreamFn: SelectM3uStreamFn;

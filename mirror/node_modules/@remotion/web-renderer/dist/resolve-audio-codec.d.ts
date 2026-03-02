import { type Quality } from 'mediabunny';
import type { CanRenderIssue } from './can-render-types';
import { type WebRendererAudioCodec, type WebRendererContainer } from './mediabunny-mappings';
export type ResolveAudioCodecResult = {
    codec: WebRendererAudioCodec | null;
    issues: CanRenderIssue[];
};
export declare const resolveAudioCodec: (options: {
    container: WebRendererContainer;
    requestedCodec: WebRendererAudioCodec | null | undefined;
    userSpecifiedAudioCodec: boolean;
    bitrate: number | Quality;
}) => Promise<ResolveAudioCodecResult>;

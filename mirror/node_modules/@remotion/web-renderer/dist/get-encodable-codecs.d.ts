import { type WebRendererAudioCodec, type WebRendererContainer, type WebRendererQuality, type WebRendererVideoCodec } from './mediabunny-mappings';
export type GetEncodableVideoCodecsOptions = {
    videoBitrate?: number | WebRendererQuality;
};
export type GetEncodableAudioCodecsOptions = {
    audioBitrate?: number | WebRendererQuality;
};
export declare const getEncodableVideoCodecs: (container: WebRendererContainer, options?: GetEncodableVideoCodecsOptions | undefined) => Promise<WebRendererVideoCodec[]>;
export declare const getEncodableAudioCodecs: (container: WebRendererContainer, options?: GetEncodableAudioCodecsOptions | undefined) => Promise<WebRendererAudioCodec[]>;

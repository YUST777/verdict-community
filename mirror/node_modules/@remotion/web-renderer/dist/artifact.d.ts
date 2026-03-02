import type { DownloadBehavior, TRenderAsset } from 'remotion';
export type EmittedArtifact = {
    filename: string;
    content: string | Uint8Array;
    frame: number;
    downloadBehavior: DownloadBehavior | null;
};
export declare const onlyArtifact: ({ assets, frameBuffer, }: {
    assets: TRenderAsset[];
    frameBuffer: Blob | OffscreenCanvas | null;
}) => Promise<EmittedArtifact[]>;
export type WebRendererOnArtifact = (asset: EmittedArtifact) => void;
export type ArtifactsRef = React.RefObject<{
    collectAssets: () => TRenderAsset[];
} | null>;
export declare const handleArtifacts: () => {
    handle: ({ imageData, frame, assets: artifactAssets, onArtifact, }: {
        imageData: Blob | OffscreenCanvas | null;
        frame: number;
        assets: TRenderAsset[];
        onArtifact: WebRendererOnArtifact;
    }) => Promise<void>;
};

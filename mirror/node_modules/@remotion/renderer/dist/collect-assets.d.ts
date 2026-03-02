import type { ArtifactAsset } from 'remotion/no-react';
import type { Page } from './browser/BrowserPage';
export declare const collectAssets: ({ frame, freePage, timeoutInMilliseconds, }: {
    frame: number;
    freePage: Page;
    timeoutInMilliseconds: number;
}) => Promise<(import("remotion/no-react").AudioOrVideoAsset | import("remotion/no-react").InlineAudioAsset | ArtifactAsset)[]>;

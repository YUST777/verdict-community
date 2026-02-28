import type { Scene } from './ExplainerComposition';

export interface VideoScript {
    title: string;
    description?: string;
    scenes: Scene[];
}

export type { Scene };
export { default as VideoExplainerModal } from './VideoExplainerModal';
export * from './ExplainerComposition';

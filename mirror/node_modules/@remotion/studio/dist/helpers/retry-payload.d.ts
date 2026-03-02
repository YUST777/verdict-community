import type { RenderJob } from '@remotion/studio-shared';
import type { ClientStillRenderJob, ClientVideoRenderJob } from '../components/RenderQueue/client-side-render-types';
import type { RenderModalState, WebRenderModalState } from '../state/modals';
export declare const makeRetryPayload: (job: RenderJob) => RenderModalState;
export declare const makeClientRetryPayload: (job: ClientStillRenderJob | ClientVideoRenderJob) => WebRenderModalState;

import type { CompletedClientRender, RenderJob } from '@remotion/studio-shared';
import React from 'react';
import { type AddClientStillJobParams, type AddClientVideoJobParams, type CompositionRef } from './client-render-queue';
import type { ClientRenderJob, ClientRenderJobProgress, GetBlobCallback } from './client-side-render-types';
declare global {
    interface Window {
        remotion_initialRenderQueue: RenderJob[] | null;
        remotion_initialClientRenders: CompletedClientRender[] | null;
    }
}
export type AnyRenderJob = RenderJob | ClientRenderJob;
export declare const isClientRenderJob: (job: AnyRenderJob) => job is ClientRenderJob;
type RenderQueueContextType = {
    jobs: AnyRenderJob[];
    serverJobs: RenderJob[];
    clientJobs: ClientRenderJob[];
    addClientStillJob: (params: AddClientStillJobParams, compositionRef: CompositionRef) => string;
    addClientVideoJob: (params: AddClientVideoJobParams, compositionRef: CompositionRef) => string;
    updateClientJobProgress: (jobId: string, progress: ClientRenderJobProgress) => void;
    markClientJobSaving: (jobId: string) => void;
    markClientJobDone: (jobId: string, metadata: CompletedClientRender['metadata'], getBlob?: GetBlobCallback) => void;
    markClientJobFailed: (jobId: string, error: Error) => void;
    markClientJobCancelled: (jobId: string) => void;
    removeClientJob: (jobId: string) => void;
    cancelClientJob: (jobId: string) => void;
    setProcessJobCallback: (callback: ((job: ClientRenderJob) => Promise<void>) | null) => void;
    getAbortController: (jobId: string) => AbortController;
    getCompositionForJob: (jobId: string) => CompositionRef | undefined;
};
export declare const RenderQueueContext: React.Context<RenderQueueContextType>;
export declare const renderJobsRef: React.RefObject<{
    updateRenderJobs: (jobs: RenderJob[]) => void;
    updateClientRenders: (renders: CompletedClientRender[]) => void;
} | null>;
export declare const RenderQueueContextProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export {};

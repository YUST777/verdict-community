import type { _InternalTypes } from 'remotion';
import type { HardwareAccelerationOption } from './client';
import type { Codec } from './codec';
import type { FfmpegOverrideFn } from './ffmpeg-override';
import type { VideoImageFormat } from './image-format';
import type { LogLevel } from './log-level';
import type { CancelSignal } from './make-cancel-signal';
import type { ColorSpace } from './options/color-space';
import type { X264Preset } from './options/x264-preset';
import type { PixelFormat } from './pixel-format';
type RunningStatus = {
    type: 'running';
} | {
    type: 'quit-successfully';
    stderr: string;
} | {
    type: 'quit-with-error';
    exitCode: number;
    signal: NodeJS.Signals | null;
    stderr: string;
};
type PreStitcherOptions = {
    fps: number;
    width: number;
    height: number;
    outputLocation: string;
    pixelFormat: PixelFormat | undefined;
    codec: Codec | undefined;
    crf: number | null | undefined;
    x264Preset: X264Preset | null;
    onProgress: (progress: number) => void;
    proResProfile: _InternalTypes['ProResProfile'] | undefined;
    logLevel: LogLevel;
    imageFormat: VideoImageFormat;
    ffmpegOverride: FfmpegOverrideFn;
    signal: CancelSignal;
    videoBitrate: string | null;
    encodingMaxRate: string | null;
    encodingBufferSize: string | null;
    indent: boolean;
    colorSpace: ColorSpace | null;
    binariesDirectory: string | null;
    hardwareAcceleration: HardwareAccelerationOption;
};
export declare const prespawnFfmpeg: (options: PreStitcherOptions) => {
    task: import("execa").ExecaChildProcess<string>;
    getLogs: () => string;
    getExitStatus: () => RunningStatus;
};
export {};

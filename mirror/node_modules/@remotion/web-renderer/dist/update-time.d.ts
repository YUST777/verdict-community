import React from 'react';
import type { LogLevel } from 'remotion';
export type TimeUpdaterRef = {
    update: (frame: number) => void;
};
export declare const UpdateTime: React.FC<{
    readonly children: React.ReactNode;
    readonly audioEnabled: boolean;
    readonly videoEnabled: boolean;
    readonly logLevel: LogLevel;
    readonly compId: string;
    readonly initialFrame: number;
    readonly timeUpdater: React.RefObject<TimeUpdaterRef | null>;
}>;

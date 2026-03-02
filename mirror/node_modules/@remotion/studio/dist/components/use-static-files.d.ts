import React from 'react';
import { type StaticFile } from '../api/get-static-files';
export declare const StaticFilesProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export declare const useStaticFiles: () => StaticFile[];

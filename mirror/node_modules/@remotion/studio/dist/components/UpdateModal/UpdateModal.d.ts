import React from 'react';
import type { Bug, UpdateInfo } from '../UpdateCheck';
export declare const UpdateModal: React.FC<{
    readonly info: UpdateInfo;
    readonly knownBugs: Bug[];
}>;

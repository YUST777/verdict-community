import React from 'react';
export declare const EnvInput: React.FC<{
    readonly onEnvKeyChange: (index: number, newValue: string) => void;
    readonly onEnvValChange: (index: number, newValue: string) => void;
    readonly envKey: string;
    readonly envVal: string;
    readonly onDelete: (index: number) => void;
    readonly index: number;
    readonly autoFocus: boolean;
    readonly isDuplicate: boolean;
}>;

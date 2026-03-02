import type { SVGProps } from 'react';
import React from 'react';
export declare const WarningTriangle: React.FC<SVGProps<SVGSVGElement>>;
export declare const ValidationMessage: React.FC<{
    readonly message: string;
    readonly align: 'flex-start' | 'flex-end';
    readonly type: 'warning' | 'error';
}>;

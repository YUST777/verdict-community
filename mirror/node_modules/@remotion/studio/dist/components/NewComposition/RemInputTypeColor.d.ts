import React from 'react';
import type { RemInputStatus } from './RemInput';
type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    readonly status: RemInputStatus;
    readonly name: string;
};
export declare const RemInputTypeColor: React.ForwardRefExoticComponent<Omit<Props, "ref"> & React.RefAttributes<HTMLInputElement>>;
export {};

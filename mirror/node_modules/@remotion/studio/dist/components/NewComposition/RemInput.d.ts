import type { PropsWithChildren } from 'react';
import React from 'react';
export type RemInputStatus = 'error' | 'warning' | 'ok';
type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    readonly status: RemInputStatus;
    readonly rightAlign: boolean;
};
export declare const INPUT_HORIZONTAL_PADDING = 8;
export declare const RightAlignInput: React.FC<PropsWithChildren>;
export declare const inputBaseStyle: React.CSSProperties;
export declare const getInputBorderColor: ({ status, isFocused, isHovered, }: {
    status: "error" | "ok" | "warning";
    isFocused: boolean;
    isHovered: boolean;
}) => "#f1c40f" | "#ff3232" | "hsla(0, 0%, 100%, 0.15)" | "rgba(0, 0, 0, 0.6)" | "rgba(255, 255, 255, 0.05)";
export declare const RemotionInput: React.ForwardRefExoticComponent<Omit<Props, "ref"> & React.RefAttributes<HTMLInputElement>>;
export {};

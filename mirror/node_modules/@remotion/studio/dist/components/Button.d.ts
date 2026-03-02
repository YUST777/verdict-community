import React from 'react';
export type ButtonProps = {
    readonly onClick: () => void;
    readonly disabled?: boolean;
    readonly children: React.ReactNode;
    readonly style?: React.CSSProperties;
    readonly buttonContainerStyle?: React.CSSProperties;
    readonly autoFocus?: boolean;
    readonly title?: string;
    readonly id?: string;
};
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

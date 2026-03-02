import React from 'react';
type Props = {
    readonly existence: boolean;
    readonly inputStyle: React.CSSProperties;
    readonly outName: string;
    readonly onValueChange: React.ChangeEventHandler<HTMLInputElement>;
    readonly validationMessage: string | null;
    readonly label: string;
};
export declare const RenderModalOutputName: ({ existence, inputStyle, outName, onValueChange, validationMessage, label: labelText, }: Props) => import("react/jsx-runtime").JSX.Element;
export {};

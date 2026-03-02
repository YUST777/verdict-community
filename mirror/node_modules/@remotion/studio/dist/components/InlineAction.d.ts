import React from 'react';
export type RenderInlineAction = (color: string) => React.ReactNode;
export type InlineActionProps = {
    readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
    readonly disabled?: boolean;
    readonly renderAction: RenderInlineAction;
    readonly title?: string;
};
export declare const InlineAction: ({ renderAction, onClick, disabled, title, }: InlineActionProps) => import("react/jsx-runtime").JSX.Element;

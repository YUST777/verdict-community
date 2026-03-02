import React from 'react';
export declare const Checkbox: React.FC<{
    readonly checked: boolean;
    readonly onChange: React.ChangeEventHandler<HTMLInputElement>;
    readonly name: string;
    readonly rounded?: boolean;
    readonly disabled?: boolean;
}>;

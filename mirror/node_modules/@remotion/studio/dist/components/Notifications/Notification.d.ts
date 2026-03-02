import React from 'react';
export declare const Notification: React.FC<{
    readonly children: React.ReactNode;
    readonly created: number;
    readonly duration: number | null;
    readonly id: string;
    readonly onRemove: (id: string) => void;
}>;

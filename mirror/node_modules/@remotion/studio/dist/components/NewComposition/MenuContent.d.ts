import React from 'react';
import type { ComboboxValue } from './ComboBox';
export declare const MenuContent: React.FC<{
    readonly values: ComboboxValue[];
    readonly onHide: () => void;
    readonly onNextMenu: () => void;
    readonly onPreviousMenu: () => void;
    readonly leaveLeftSpace: boolean;
    readonly preselectIndex: false | number;
    readonly topItemCanBeUnselected: boolean;
    readonly fixedHeight: number | null;
}>;

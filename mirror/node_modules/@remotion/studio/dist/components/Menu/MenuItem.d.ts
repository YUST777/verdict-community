import type { SetStateAction } from 'react';
import React from 'react';
import type { ComboboxValue } from '../NewComposition/ComboBox';
export type MenuId = 'remotion' | 'file' | 'view' | 'install' | 'tools' | 'help';
export type Menu = {
    id: MenuId;
    label: React.ReactNode;
    items: ComboboxValue[];
    leaveLeftPadding: boolean;
};
export declare const MenuItem: React.FC<{
    readonly label: React.ReactNode;
    readonly id: MenuId;
    readonly selected: boolean;
    readonly onItemSelected: (s: SetStateAction<string | null>) => void;
    readonly onItemHovered: (id: MenuId) => void;
    readonly onItemQuit: () => void;
    readonly onPreviousMenu: () => void;
    readonly onNextMenu: () => void;
    readonly menu: Menu;
    readonly leaveLeftPadding: boolean;
}>;

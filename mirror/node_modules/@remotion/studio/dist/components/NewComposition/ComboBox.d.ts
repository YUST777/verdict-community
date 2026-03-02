import React from 'react';
type DividerItem = {
    type: 'divider';
    id: string;
};
export type SubMenu = {
    preselectIndex: number | false;
    leaveLeftSpace: boolean;
    items: ComboboxValue[];
};
export type SelectionItem = {
    type: 'item';
    id: string;
    label: React.ReactNode;
    value: string | number;
    onClick: (id: string, e: React.PointerEvent | null) => void;
    keyHint: string | null;
    leftItem: React.ReactNode;
    subMenu: SubMenu | null;
    quickSwitcherLabel: string | null;
    disabled?: boolean;
};
export type ComboboxValue = DividerItem | SelectionItem;
export declare const Combobox: React.FC<{
    readonly values: ComboboxValue[];
    readonly selectedId: string | number;
    readonly style?: React.CSSProperties;
    readonly title: string;
}>;
export {};

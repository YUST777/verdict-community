import React from 'react';
type OptionsSidebarPanel = 'input-props' | 'renders' | 'visual-controls';
export declare const persistSelectedOptionsSidebarPanel: (panel: OptionsSidebarPanel) => void;
export declare const optionsSidebarTabs: React.RefObject<{
    selectRendersPanel: () => void;
} | null>;
export declare const OptionsPanel: React.FC<{
    readonly readOnlyStudio: boolean;
}>;
export {};

import React from 'react';
import type { SubMenu } from '../NewComposition/ComboBox';
import type { SubMenuActivated } from './MenuSubItem';
export declare const SubMenuComponent: React.FC<{
    readonly portalStyle: React.CSSProperties;
    readonly subMenu: SubMenu;
    readonly onQuitFullMenu: () => void;
    readonly onQuitSubMenu: () => void;
    readonly subMenuActivated: SubMenuActivated;
}>;

import { type InlineActionProps } from './InlineAction';
import type { ComboboxValue } from './NewComposition/ComboBox';
export declare const InlineDropdown: ({ values, ...props }: Omit<InlineActionProps, "onClick"> & {
    readonly values: ComboboxValue[];
}) => import("react/jsx-runtime").JSX.Element;

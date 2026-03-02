import React from 'react';
type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & {
    readonly status: 'error' | 'warning' | 'ok';
};
export declare const RemTextarea: React.ForwardRefExoticComponent<Omit<Props, "ref"> & React.RefAttributes<HTMLTextAreaElement>>;
export {};

import React from 'react';
export declare class ErrorBoundary extends React.Component<{
    onError: (error: Error) => void;
    children: React.ReactNode;
    errorFallback: (info: {
        error: Error;
    }) => React.ReactNode;
}, {
    hasError: Error | null;
}> {
    state: {
        hasError: null;
    };
    static getDerivedStateFromError(error: Error): {
        hasError: Error;
    };
    componentDidCatch(error: Error): void;
    render(): string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | Iterable<React.ReactNode> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | React.ReactPortal | null | undefined> | null | undefined;
}

export type FastRefreshContextType = {
    fastRefreshes: number;
    manualRefreshes: number;
    increaseManualRefreshes: () => void;
};
export declare const FastRefreshContext: import("react").Context<FastRefreshContextType>;

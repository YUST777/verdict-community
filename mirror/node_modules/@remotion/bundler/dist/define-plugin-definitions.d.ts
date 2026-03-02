export declare const getDefinePluginDefinitions: ({ maxTimelineTracks, askAIEnabled, keyboardShortcutsEnabled, bufferStateDelayInMilliseconds, experimentalClientSideRenderingEnabled, experimentalVisualModeEnabled, }: {
    maxTimelineTracks: number | null;
    askAIEnabled: boolean;
    keyboardShortcutsEnabled: boolean;
    bufferStateDelayInMilliseconds: number | null;
    experimentalClientSideRenderingEnabled: boolean;
    experimentalVisualModeEnabled: boolean;
}) => {
    'process.env.MAX_TIMELINE_TRACKS': number | null;
    'process.env.ASK_AI_ENABLED': boolean;
    'process.env.KEYBOARD_SHORTCUTS_ENABLED': boolean;
    'process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS': number | null;
    'process.env.EXPERIMENTAL_CLIENT_SIDE_RENDERING_ENABLED': boolean;
    'process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED': boolean;
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAudioData = void 0;
const react_1 = require("react");
const remotion_1 = require("remotion");
const get_audio_data_1 = require("./get-audio-data");
/*
 * @description Wraps the getAudioData() function into a hook and does three things: keeps the audio data in a state, wraps the function in a delayRender() / continueRender() pattern, and handles the case where the component gets unmounted while fetching is in progress to prevent React errors.
 * @see [Documentation](https://www.remotion.dev/docs/use-audio-data)
 */
const useAudioData = (src) => {
    if (!src) {
        throw new TypeError("useAudioData requires a 'src' parameter");
    }
    const mountState = (0, react_1.useRef)({ isMounted: true });
    (0, react_1.useEffect)(() => {
        const { current } = mountState;
        current.isMounted = true;
        return () => {
            current.isMounted = false;
        };
    }, []);
    const [metadata, setMetadata] = (0, react_1.useState)(null);
    const { delayRender, continueRender } = (0, remotion_1.useDelayRender)();
    const fetchMetadata = (0, react_1.useCallback)(async () => {
        const handle = delayRender(`Waiting for audio metadata with src="${src}" to be loaded`);
        try {
            const data = await (0, get_audio_data_1.getAudioData)(src);
            if (mountState.current.isMounted) {
                setMetadata(data);
            }
        }
        catch (err) {
            (0, remotion_1.cancelRender)(err);
        }
        continueRender(handle);
    }, [src, delayRender, continueRender]);
    (0, react_1.useLayoutEffect)(() => {
        fetchMetadata();
    }, [fetchMetadata]);
    return metadata;
};
exports.useAudioData = useAudioData;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalKeybindings = void 0;
const react_1 = require("react");
const use_keybinding_1 = require("../helpers/use-keybinding");
const checkerboard_1 = require("../state/checkerboard");
const modals_1 = require("../state/modals");
const AskAiModal_1 = require("./AskAiModal");
const CompositionSelector_1 = require("./CompositionSelector");
const NotificationCenter_1 = require("./Notifications/NotificationCenter");
const GlobalKeybindings = () => {
    const keybindings = (0, use_keybinding_1.useKeybinding)();
    const { setSelectedModal } = (0, react_1.useContext)(modals_1.ModalsContext);
    const { setCheckerboard } = (0, react_1.useContext)(checkerboard_1.CheckerboardContext);
    const { navigateToNextComposition, navigateToPreviousComposition } = (0, CompositionSelector_1.useCompositionNavigation)();
    (0, react_1.useEffect)(() => {
        const nKey = keybindings.registerKeybinding({
            event: 'keypress',
            key: 'n',
            callback: () => {
                (0, NotificationCenter_1.showNotification)(`To make a new composition, right-click an existing one and select "Duplicate"`, 5000);
            },
            commandCtrlKey: false,
            preventDefault: true,
            triggerIfInputFieldFocused: false,
            keepRegisteredWhenNotHighestContext: false,
        });
        const cmdKKey = keybindings.registerKeybinding({
            event: 'keydown',
            key: 'k',
            callback: () => {
                setSelectedModal({
                    type: 'quick-switcher',
                    mode: 'compositions',
                    invocationTimestamp: Date.now(),
                });
            },
            triggerIfInputFieldFocused: true,
            keepRegisteredWhenNotHighestContext: false,
            commandCtrlKey: true,
            preventDefault: true,
        });
        const cmdIKey = process.env.ASK_AI_ENABLED
            ? keybindings.registerKeybinding({
                event: 'keydown',
                key: 'i',
                callback: () => {
                    var _a;
                    (_a = AskAiModal_1.askAiModalRef.current) === null || _a === void 0 ? void 0 : _a.toggle();
                },
                triggerIfInputFieldFocused: true,
                keepRegisteredWhenNotHighestContext: true,
                commandCtrlKey: true,
                preventDefault: true,
            })
            : null;
        const cKey = keybindings.registerKeybinding({
            event: 'keypress',
            key: 't',
            callback: () => {
                setCheckerboard((c) => !c);
            },
            commandCtrlKey: false,
            preventDefault: true,
            triggerIfInputFieldFocused: false,
            keepRegisteredWhenNotHighestContext: false,
        });
        const questionMark = keybindings.registerKeybinding({
            event: 'keypress',
            key: '?',
            callback: () => {
                setSelectedModal({
                    type: 'quick-switcher',
                    mode: 'docs',
                    invocationTimestamp: Date.now(),
                });
            },
            commandCtrlKey: false,
            preventDefault: true,
            triggerIfInputFieldFocused: false,
            keepRegisteredWhenNotHighestContext: false,
        });
        const pageDown = keybindings.registerKeybinding({
            event: 'keydown',
            key: 'PageDown',
            callback: navigateToNextComposition,
            commandCtrlKey: false,
            preventDefault: true,
            triggerIfInputFieldFocused: false,
            keepRegisteredWhenNotHighestContext: false,
        });
        const pageUp = keybindings.registerKeybinding({
            event: 'keydown',
            key: 'PageUp',
            callback: navigateToPreviousComposition,
            commandCtrlKey: false,
            preventDefault: true,
            triggerIfInputFieldFocused: false,
            keepRegisteredWhenNotHighestContext: false,
        });
        return () => {
            nKey.unregister();
            cKey.unregister();
            questionMark.unregister();
            cmdKKey.unregister();
            cmdIKey === null || cmdIKey === void 0 ? void 0 : cmdIKey.unregister();
            pageDown.unregister();
            pageUp.unregister();
        };
    }, [
        keybindings,
        setCheckerboard,
        setSelectedModal,
        navigateToNextComposition,
        navigateToPreviousComposition,
    ]);
    return null;
};
exports.GlobalKeybindings = GlobalKeybindings;

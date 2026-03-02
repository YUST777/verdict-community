"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeIoSynchronizer = void 0;
const event_emitter_1 = require("../create/event-emitter");
const with_resolvers_1 = require("../create/with-resolvers");
const log_1 = require("../log");
const make_timeout_promise_1 = require("./make-timeout-promise");
const makeIoSynchronizer = ({ logLevel, label, controller, }) => {
    const eventEmitter = new event_emitter_1.IoEventEmitter();
    let lastInput = 0;
    let lastOutput = 0;
    let inputsSinceLastOutput = 0;
    let inputs = [];
    let resolvers = [];
    const getQueuedItems = () => {
        inputs = inputs.filter(
        // In chrome, the last output sometimes shifts the timestamp by 1 macrosecond - allowing this to happen
        (input) => Math.floor(input) > Math.floor(lastOutput) + 1);
        return inputs.length;
    };
    const printState = (prefix) => {
        log_1.Log.trace(logLevel, `[${label}] ${prefix}, state: Last input = ${lastInput} Last output = ${lastOutput} Inputs since last output = ${inputsSinceLastOutput}, Queue = ${getQueuedItems()}`);
    };
    const inputItem = (timestamp) => {
        lastInput = timestamp;
        inputsSinceLastOutput++;
        inputs.push(timestamp);
        eventEmitter.dispatchEvent('input', {
            timestamp,
        });
        printState('Input item');
    };
    const onOutput = (timestamp) => {
        lastOutput = timestamp;
        inputsSinceLastOutput = 0;
        eventEmitter.dispatchEvent('output', {
            timestamp,
        });
        printState('Got output');
    };
    const waitForOutput = () => {
        const { promise, resolve } = (0, with_resolvers_1.withResolvers)();
        const on = () => {
            eventEmitter.removeEventListener('output', on);
            resolve();
            resolvers = resolvers.filter((resolver) => resolver !== resolve);
        };
        eventEmitter.addEventListener('output', on);
        resolvers.push(resolve);
        return promise;
    };
    const makeErrorBanner = () => {
        return [
            `Waited too long for ${label} to finish:`,
            `${getQueuedItems()} queued items`,
            `inputs: ${JSON.stringify(inputs)}`,
            `last output: ${lastOutput}`,
        ];
    };
    const waitForQueueSize = async (queueSize) => {
        if (getQueuedItems() <= queueSize) {
            return Promise.resolve();
        }
        const { timeoutPromise, clear } = (0, make_timeout_promise_1.makeTimeoutPromise)({
            label: () => [
                ...makeErrorBanner(),
                `wanted: <${queueSize} queued items`,
                `Report this at https://remotion.dev/report`,
            ].join('\n'),
            ms: 10000,
            controller,
        });
        if (controller) {
            controller._internals._mediaParserController._internals.signal.addEventListener('abort', clear);
        }
        await Promise.race([
            timeoutPromise,
            (async () => {
                while (getQueuedItems() > queueSize) {
                    await waitForOutput();
                }
            })(),
        ]).finally(() => clear());
        if (controller) {
            controller._internals._mediaParserController._internals.signal.removeEventListener('abort', clear);
        }
    };
    const clearQueue = () => {
        inputs.length = 0;
        lastInput = 0;
        lastOutput = 0;
        inputsSinceLastOutput = 0;
        resolvers.forEach((resolver) => {
            return resolver();
        });
        resolvers.length = 0;
        inputs.length = 0;
    };
    return {
        inputItem,
        onOutput,
        waitForQueueSize,
        clearQueue,
    };
};
exports.makeIoSynchronizer = makeIoSynchronizer;

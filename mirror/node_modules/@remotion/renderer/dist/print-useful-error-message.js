"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printUsefulErrorMessage = void 0;
const logger_1 = require("./logger");
const truthy_1 = require("./truthy");
let alreadyPrintedCache = [];
const printUsefulErrorMessage = (err, logLevel, indent) => {
    var _a, _b, _c;
    const errorStack = err.stack;
    if (errorStack && alreadyPrintedCache.includes(errorStack)) {
        return;
    }
    if (errorStack) {
        alreadyPrintedCache.push(errorStack);
        alreadyPrintedCache = alreadyPrintedCache.slice(-10);
    }
    if (err.message.includes('Could not play video with')) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '💡 Get help for this issue at https://remotion.dev/docs/media-playback-error');
    }
    if (err.message.includes('A delayRender()') &&
        err.message.includes('was called but not cleared after')) {
        logger_1.Log.info({ indent, logLevel });
        if (err.message.includes('/proxy')) {
            logger_1.Log.info({ indent, logLevel }, '💡 Get help for this issue at https://remotion.dev/docs/troubleshooting/delay-render-proxy');
        }
        logger_1.Log.info({ indent, logLevel }, '💡 Get help for this issue at https://remotion.dev/docs/timeout');
    }
    if (err.message.includes('Target closed')) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '💡 Get help for this issue at https://remotion.dev/docs/target-closed');
    }
    if (err.message.includes('Timed out evaluating')) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '💡 Get help for this issue at https://remotion.dev/docs/troubleshooting/timed-out-page-function');
    }
    if (err.message.includes('ENAMETOOLONG')) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '💡 Get help for this issue at https://remotion.dev/docs/enametoolong');
    }
    if (err.message.includes('Member must have value less than or equal to 3008')) {
        logger_1.Log.warn({ indent, logLevel });
        logger_1.Log.warn({ indent, logLevel }, '💡 This error indicates that you have a AWS account on the free or basic tier or have been limited by your organization.');
        logger_1.Log.warn({ indent, logLevel }, 'Often times this can be solved by adding a credit card, or if already done, by contacting AWS support.');
        logger_1.Log.warn({
            indent,
            logLevel,
        }, 'Alternatively, you can decrease the memory size of your Lambda function to a value below 3008 MB. See: https://www.remotion.dev/docs/lambda/runtime#core-count--vcpus');
        logger_1.Log.warn({ indent, logLevel }, 'See also: https://repost.aws/questions/QUKruWYNDYTSmP17jCnIz6IQ/questions/QUKruWYNDYTSmP17jCnIz6IQ/unable-to-set-lambda-memory-over-3008mb');
    }
    if (((_a = err.stack) === null || _a === void 0 ? void 0 : _a.includes('TooManyRequestsException: Rate Exceeded.')) ||
        ((_b = err.message) === null || _b === void 0 ? void 0 : _b.includes('ConcurrentInvocationLimitExceeded'))) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '💡 This error indicates that your Lambda concurrency limit is too low. See: https://www.remotion.dev/docs/lambda/troubleshooting/rate-limit');
    }
    if (err.message.includes('Error creating WebGL context')) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.warn({
            indent,
            logLevel,
        }, '💡 You might need to set the OpenGL renderer to "angle". Learn why at https://www.remotion.dev/docs/three');
        logger_1.Log.warn({
            indent,
            logLevel,
        }, "💡 Check how it's done at https://www.remotion.dev/docs/chromium-flags#--gl");
    }
    if (err.message.includes('The bucket does not allow ACLs')) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '💡 Fix for this issue: https://remotion.dev/docs/lambda/troubleshooting/bucket-disallows-acl');
    }
    if (err.message.includes('Minified React error #306')) {
        const componentName = (_c = err.message.match(/<\w+>/)) === null || _c === void 0 ? void 0 : _c[0];
        logger_1.Log.info({ indent, logLevel }, [
            '💡 This error indicates that the component',
            componentName ? `(${componentName})` : null,
            'you are trying to render is not imported correctly.',
        ]
            .filter(truthy_1.truthy)
            .join(' '));
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '   Check the root file and ensure that the component is not undefined.');
        logger_1.Log.info({ indent, logLevel }, '   Oftentimes, this happens if the component is missing the `export` keyword');
        logger_1.Log.info({ indent, logLevel }, '   or if the component was renamed and the import statement not properly adjusted.');
    }
    if (err.message.includes('GLIBC_')) {
        logger_1.Log.info({ indent, logLevel }, '💡 Remotion requires at least Libc 2.35.');
        logger_1.Log.info({ indent, logLevel }, '💡 Get help for this issue: https://github.com/remotion-dev/remotion/issues/2439');
    }
    if (err.message.includes('EBADF')) {
        logger_1.Log.info({ indent, logLevel }, '💡 This error might be fixed by changing your Node version:');
        logger_1.Log.info({ indent, logLevel }, '   https://github.com/remotion-dev/remotion/issues/2452');
    }
    if (err.message.includes('routines::unsupported')) {
        logger_1.Log.info({ indent, logLevel }, '💡 This error might happen if using Cloud Run with credentials that have a newline at the end or are otherwise badly encoded.');
        logger_1.Log.info({ indent, logLevel }, '   https://github.com/remotion-dev/remotion/issues/3864');
    }
    if (err.message.includes('Failed to fetch')) {
        logger_1.Log.info({ indent, logLevel }, '💡 On Lambda, one reason this could happen is that Chrome is rejecting an asset to be loaded when it is running low on disk space.');
        logger_1.Log.info({ indent, logLevel }, 'Try increasing the disk size of your Lambda function.');
    }
    if (err.message.includes('Invalid value specified for cpu')) {
        logger_1.Log.info({ indent, logLevel });
        logger_1.Log.info({ indent, logLevel }, '💡 This error indicates that your GCP account does have a limit. Try setting `--maxInstances=5` / `maxInstances: 5` when deploying this service.');
        logger_1.Log.info({
            indent,
            logLevel,
        });
    }
};
exports.printUsefulErrorMessage = printUsefulErrorMessage;

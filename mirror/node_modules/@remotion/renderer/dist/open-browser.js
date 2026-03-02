"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openBrowser = exports.internalOpenBrowser = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const browser_download_progress_bar_1 = require("./browser/browser-download-progress-bar");
const Launcher_1 = require("./browser/Launcher");
const ensure_browser_1 = require("./ensure-browser");
const get_local_browser_executable_1 = require("./get-local-browser-executable");
const get_video_threads_flag_1 = require("./get-video-threads-flag");
const logger_1 = require("./logger");
const gl_1 = require("./options/gl");
const featuresToEnable = (option) => {
    const renderer = option !== null && option !== void 0 ? option : gl_1.DEFAULT_OPENGL_RENDERER;
    const enableAlways = ['NetworkService', 'NetworkServiceInProcess'];
    if (renderer === 'vulkan') {
        return [...enableAlways, 'Vulkan', 'UseSkiaRenderer'];
    }
    if (renderer === 'angle-egl') {
        return [...enableAlways, 'VaapiVideoDecoder'];
    }
    return enableAlways;
};
const getOpenGlRenderer = (option) => {
    const renderer = option !== null && option !== void 0 ? option : gl_1.DEFAULT_OPENGL_RENDERER;
    (0, gl_1.validateOpenGlRenderer)(renderer);
    if (renderer === 'swangle') {
        return ['--use-gl=angle', '--use-angle=swiftshader'];
    }
    if (renderer === 'angle-egl') {
        return ['--use-gl=angle', '--use-angle=gl-egl'];
    }
    if (renderer === 'vulkan') {
        return [
            '--use-angle=vulkan',
            '--use-vulkan=native',
            '--disable-vulkan-fallback-to-gl-for-testing',
            '--disable-vulkan-surface',
            '--ignore-gpu-blocklist',
            '--enable-gpu',
        ];
    }
    if (renderer === null) {
        return [];
    }
    return [`--use-gl=${renderer}`];
};
const internalOpenBrowser = async ({ browser, browserExecutable, chromiumOptions, forceDeviceScaleFactor, indent, viewport, logLevel, onBrowserDownload, chromeMode, }) => {
    var _a;
    var _b, _c, _d;
    // @ts-expect-error Firefox
    if (browser === 'firefox') {
        throw new TypeError('Firefox supported is not yet turned on. Stay tuned for the future.');
    }
    logger_1.Log.verbose({ indent, logLevel }, 'Ensuring browser executable');
    await (0, ensure_browser_1.internalEnsureBrowser)({
        browserExecutable,
        logLevel,
        indent,
        onBrowserDownload,
        chromeMode,
    });
    logger_1.Log.verbose({ indent, logLevel }, 'Ensured browser is available.');
    const executablePath = (0, get_local_browser_executable_1.getLocalBrowserExecutable)({
        preferredBrowserExecutable: browserExecutable,
        logLevel,
        indent,
        chromeMode,
    });
    const customGlRenderer = getOpenGlRenderer((_b = chromiumOptions.gl) !== null && _b !== void 0 ? _b : null);
    const enableMultiProcessOnLinux = (_c = chromiumOptions.enableMultiProcessOnLinux) !== null && _c !== void 0 ? _c : true;
    logger_1.Log.verbose({ indent, logLevel, tag: 'openBrowser()' }, `Opening browser: gl = ${chromiumOptions.gl}, executable = ${executablePath}, enableMultiProcessOnLinux = ${enableMultiProcessOnLinux}`);
    if (chromiumOptions.userAgent) {
        logger_1.Log.verbose({ indent, logLevel, tag: 'openBrowser()' }, `Using custom user agent: ${chromiumOptions.userAgent}`);
    }
    const userDataDir = await node_fs_1.default.promises.mkdtemp(node_path_1.default.join(node_os_1.default.tmpdir(), 'puppeteer_dev_chrome_profile-'));
    const browserInstance = await (0, Launcher_1.launchChrome)({
        executablePath,
        logLevel,
        indent,
        userDataDir,
        timeout: 25000,
        args: [
            'about:blank',
            '--allow-pre-commit-input',
            '--disable-background-networking',
            `--enable-features=${featuresToEnable(chromiumOptions.gl).join(',')}`,
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-extensions-with-background-pages',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--no-proxy-server',
            "--proxy-server='direct://'",
            '--proxy-bypass-list=*',
            '--force-gpu-mem-available-mb=4096',
            '--disable-hang-monitor',
            '--disable-extensions',
            '--allow-chrome-scheme-url',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-sync',
            '--force-color-profile=srgb',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
            `--video-threads=${(0, get_video_threads_flag_1.getIdealVideoThreadsFlag)(logLevel)}`,
            '--enable-automation',
            '--password-store=basic',
            '--use-mock-keychain',
            '--enable-blink-features=IdleDetection',
            '--export-tagged-pdf',
            '--intensive-wake-up-throttling-policy=0',
            ((_d = chromiumOptions.headless) !== null && _d !== void 0 ? _d : true)
                ? chromeMode === 'chrome-for-testing'
                    ? '--headless=new'
                    : '--headless=old'
                : null,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            ...customGlRenderer,
            '--disable-background-media-suspend',
            process.platform === 'linux' &&
                chromiumOptions.gl !== 'vulkan' &&
                !enableMultiProcessOnLinux
                ? '--single-process'
                : null,
            '--allow-running-insecure-content', // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
            '--disable-component-update', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableComponentUpdate&ss=chromium
            '--disable-domain-reliability', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableDomainReliability&ss=chromium
            '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process,Translate,BackForwardCache,AvoidUnnecessaryBeforeUnloadCheckSync,IntensiveWakeUpThrottling,LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
            '--disable-print-preview', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisablePrintPreview&ss=chromium
            '--disable-site-isolation-trials', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSiteIsolation&ss=chromium
            '--disk-cache-size=268435456', // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
            '--hide-scrollbars', // https://source.chromium.org/search?q=lang:cpp+symbol:kHideScrollbars&ss=chromium
            '--no-default-browser-check', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoDefaultBrowserCheck&ss=chromium
            '--no-pings', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoPings&ss=chromium
            '--font-render-hinting=none',
            '--no-zygote', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoZygote&ss=chromium,
            '--ignore-gpu-blocklist',
            '--enable-unsafe-webgpu',
            typeof forceDeviceScaleFactor === 'undefined'
                ? null
                : `--force-device-scale-factor=${forceDeviceScaleFactor}`,
            chromiumOptions.ignoreCertificateErrors
                ? '--ignore-certificate-errors'
                : null,
            ...((chromiumOptions === null || chromiumOptions === void 0 ? void 0 : chromiumOptions.disableWebSecurity)
                ? ['--disable-web-security']
                : []),
            (chromiumOptions === null || chromiumOptions === void 0 ? void 0 : chromiumOptions.userAgent)
                ? `--user-agent="${chromiumOptions.userAgent}"`
                : null,
            '--remote-debugging-port=0',
            `--user-data-dir=${userDataDir}`,
        ].filter(Boolean),
        defaultViewport: viewport !== null && viewport !== void 0 ? viewport : {
            height: 720,
            width: 1280,
            deviceScaleFactor: 1,
        },
    });
    const pages = await browserInstance.pages();
    await ((_a = pages[0]) === null || _a === void 0 ? void 0 : _a.close());
    return browserInstance;
};
exports.internalOpenBrowser = internalOpenBrowser;
/*
 * @description Opens a Chrome or Chromium browser instance. By reusing an instance across various rendering and compositional API calls, significant time can be saved by avoiding the repeated opening and closing of browsers.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/open-browser)
 */
const openBrowser = (browser, options) => {
    var _a, _b;
    const { browserExecutable, chromiumOptions, forceDeviceScaleFactor } = options !== null && options !== void 0 ? options : {};
    const indent = false;
    const logLevel = (_a = options === null || options === void 0 ? void 0 : options.logLevel) !== null && _a !== void 0 ? _a : ((options === null || options === void 0 ? void 0 : options.shouldDumpIo) ? 'verbose' : 'info');
    return (0, exports.internalOpenBrowser)({
        browser,
        browserExecutable: browserExecutable !== null && browserExecutable !== void 0 ? browserExecutable : null,
        chromiumOptions: chromiumOptions !== null && chromiumOptions !== void 0 ? chromiumOptions : {},
        forceDeviceScaleFactor,
        indent,
        viewport: null,
        logLevel,
        onBrowserDownload: (0, browser_download_progress_bar_1.defaultBrowserDownloadProgress)({
            indent,
            logLevel,
            api: 'openBrowser()',
        }),
        chromeMode: (_b = options === null || options === void 0 ? void 0 : options.chromeMode) !== null && _b !== void 0 ? _b : 'headless-shell',
    });
};
exports.openBrowser = openBrowser;

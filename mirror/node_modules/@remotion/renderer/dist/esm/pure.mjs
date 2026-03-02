// src/is-audio-codec.ts
var isAudioCodec = (codec) => {
  return codec === "mp3" || codec === "aac" || codec === "wav";
};

// src/codec-supports-media.ts
var support = {
  "h264-mkv": {
    audio: true,
    video: true
  },
  aac: {
    audio: true,
    video: false
  },
  gif: {
    video: true,
    audio: false
  },
  h264: {
    video: true,
    audio: true
  },
  "h264-ts": {
    video: true,
    audio: true
  },
  h265: {
    video: true,
    audio: true
  },
  mp3: {
    audio: true,
    video: false
  },
  prores: {
    audio: true,
    video: true
  },
  vp8: {
    audio: true,
    video: true
  },
  vp9: {
    audio: true,
    video: true
  },
  wav: {
    audio: true,
    video: false
  }
};
var codecSupportsMedia = (codec) => {
  return support[codec];
};

// src/get-duration-from-frame-range.ts
var getFramesToRender = (frameRange, everyNthFrame) => {
  if (everyNthFrame === 0) {
    throw new Error("everyNthFrame cannot be 0");
  }
  return new Array(frameRange[1] - frameRange[0] + 1).fill(true).map((_, index) => {
    return index + frameRange[0];
  }).filter((index) => {
    return index % everyNthFrame === 0;
  });
};

// src/codec.ts
var validCodecs = [
  "h264",
  "h265",
  "vp8",
  "vp9",
  "mp3",
  "aac",
  "wav",
  "prores",
  "h264-mkv",
  "h264-ts",
  "gif"
];

// src/file-extensions.ts
var defaultFileExtensionMap = {
  "h264-mkv": {
    default: "mkv",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv"], default: "mkv" },
      mp3: { possible: ["mkv"], default: "mkv" }
    }
  },
  "h264-ts": {
    default: "ts",
    forAudioCodec: {
      "pcm-16": { possible: ["ts"], default: "ts" },
      aac: { possible: ["ts"], default: "ts" }
    }
  },
  aac: {
    default: "aac",
    forAudioCodec: {
      aac: {
        possible: ["aac", "3gp", "m4a", "m4b", "mpg", "mpeg"],
        default: "aac"
      },
      "pcm-16": {
        possible: ["wav"],
        default: "wav"
      }
    }
  },
  gif: {
    default: "gif",
    forAudioCodec: {}
  },
  h264: {
    default: "mp4",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv", "mov"], default: "mkv" },
      aac: { possible: ["mp4", "mkv", "mov"], default: "mp4" },
      mp3: { possible: ["mp4", "mkv", "mov"], default: "mp4" }
    }
  },
  h265: {
    default: "mp4",
    forAudioCodec: {
      aac: { possible: ["mp4", "mkv", "hevc"], default: "mp4" },
      "pcm-16": { possible: ["mkv"], default: "mkv" }
    }
  },
  mp3: {
    default: "mp3",
    forAudioCodec: {
      mp3: { possible: ["mp3"], default: "mp3" },
      "pcm-16": { possible: ["wav"], default: "wav" }
    }
  },
  prores: {
    default: "mov",
    forAudioCodec: {
      aac: { possible: ["mov", "mkv", "mxf"], default: "mov" },
      "pcm-16": { possible: ["mov", "mkv", "mxf"], default: "mov" }
    }
  },
  vp8: {
    default: "webm",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv"], default: "mkv" },
      opus: { possible: ["webm"], default: "webm" }
    }
  },
  vp9: {
    default: "webm",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv"], default: "mkv" },
      opus: { possible: ["webm"], default: "webm" }
    }
  },
  wav: {
    default: "wav",
    forAudioCodec: {
      "pcm-16": { possible: ["wav"], default: "wav" }
    }
  }
};

// src/get-extension-from-codec.ts
var getFileExtensionFromCodec = (codec, audioCodec) => {
  if (!validCodecs.includes(codec)) {
    throw new Error(`Codec must be one of the following: ${validCodecs.join(", ")}, but got ${codec}`);
  }
  const map = defaultFileExtensionMap[codec];
  if (audioCodec === null) {
    return map.default;
  }
  const typedAudioCodec = audioCodec;
  if (!(typedAudioCodec in map.forAudioCodec)) {
    throw new Error(`Audio codec ${typedAudioCodec} is not supported for codec ${codec}`);
  }
  return map.forAudioCodec[audioCodec].default;
};

// src/path-normalize.ts
var SLASH = 47;
var DOT = 46;
var assertPath = (path) => {
  const t = typeof path;
  if (t !== "string") {
    throw new TypeError(`Expected a string, got a ${t}`);
  }
};
var posixNormalize = (path, allowAboveRoot) => {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code;
  for (let i = 0;i <= path.length; ++i) {
    if (i < path.length) {
      code = path.charCodeAt(i);
    } else if (code === SLASH) {
      break;
    } else {
      code = SLASH;
    }
    if (code === SLASH) {
      if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== DOT || res.charCodeAt(res.length - 2) !== DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) {
            res += "/..";
          } else {
            res = "..";
          }
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += "/" + path.slice(lastSlash + 1, i);
        } else {
          res = path.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
};
var decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
var pathNormalize = (p) => {
  assertPath(p);
  let path = p;
  if (path.length === 0) {
    return ".";
  }
  const isAbsolute = path.charCodeAt(0) === SLASH;
  const trailingSeparator = path.charCodeAt(path.length - 1) === SLASH;
  path = decode(path);
  path = posixNormalize(path, !isAbsolute);
  if (path.length === 0 && !isAbsolute) {
    path = ".";
  }
  if (path.length > 0 && trailingSeparator) {
    path += "/";
  }
  if (isAbsolute) {
    return "/" + path;
  }
  return path;
};

// src/get-extension-of-filename.ts
var getExtensionOfFilename = (filename) => {
  if (filename === null) {
    return null;
  }
  const filenameArr = pathNormalize(filename).split(".");
  const hasExtension = filenameArr.length >= 2;
  const filenameArrLength = filenameArr.length;
  const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
  return extension;
};

// src/options/separate-audio.tsx
var DEFAULT = null;
var cliFlag = "separate-audio-to";
var separateAudioOption = {
  cliFlag,
  description: () => `If set, the audio will not be included in the main output but rendered as a separate file at the location you pass. It is recommended to use an absolute path. If a relative path is passed, it is relative to the Remotion Root.`,
  docLink: "https://remotion.dev/docs/renderer/render-media",
  getValue: ({ commandLine }) => {
    if (commandLine[cliFlag]) {
      return {
        source: "cli",
        value: commandLine[cliFlag]
      };
    }
    return {
      source: "default",
      value: DEFAULT
    };
  },
  name: "Separate audio to",
  setConfig: () => {
    throw new Error("Not implemented");
  },
  ssrName: "separateAudioTo",
  type: "string",
  id: cliFlag
};

// src/options/audio-codec.tsx
var validAudioCodecs = ["pcm-16", "aac", "mp3", "opus"];
var supportedAudioCodecs = {
  h264: ["aac", "pcm-16", "mp3"],
  "h264-mkv": ["pcm-16", "mp3"],
  "h264-ts": ["pcm-16", "aac"],
  aac: ["aac", "pcm-16"],
  avi: [],
  gif: [],
  h265: ["aac", "pcm-16"],
  mp3: ["mp3", "pcm-16"],
  prores: ["aac", "pcm-16"],
  vp8: ["opus", "pcm-16"],
  vp9: ["opus", "pcm-16"],
  wav: ["pcm-16"]
};
var _satisfies = supportedAudioCodecs;
if (_satisfies) {}
var cliFlag2 = "audio-codec";
var ssrName = "audioCodec";
var defaultAudioCodecs = {
  "h264-mkv": {
    lossless: "pcm-16",
    compressed: "pcm-16"
  },
  "h264-ts": {
    lossless: "pcm-16",
    compressed: "aac"
  },
  aac: {
    lossless: "pcm-16",
    compressed: "aac"
  },
  gif: {
    lossless: null,
    compressed: null
  },
  h264: {
    lossless: "pcm-16",
    compressed: "aac"
  },
  h265: {
    lossless: "pcm-16",
    compressed: "aac"
  },
  mp3: {
    lossless: "pcm-16",
    compressed: "mp3"
  },
  prores: {
    lossless: "pcm-16",
    compressed: "pcm-16"
  },
  vp8: {
    lossless: "pcm-16",
    compressed: "opus"
  },
  vp9: {
    lossless: "pcm-16",
    compressed: "opus"
  },
  wav: {
    lossless: "pcm-16",
    compressed: "pcm-16"
  }
};
var extensionMap = {
  aac: "aac",
  mp3: "mp3",
  opus: "opus",
  "pcm-16": "wav"
};
var resolveAudioCodec = ({
  codec,
  setting,
  preferLossless,
  separateAudioTo
}) => {
  let derivedFromSeparateAudioToExtension = null;
  if (separateAudioTo) {
    const extension = separateAudioTo.split(".").pop();
    for (const [key, value] of Object.entries(extensionMap)) {
      if (value === extension) {
        derivedFromSeparateAudioToExtension = key;
        if (!supportedAudioCodecs[codec].includes(derivedFromSeparateAudioToExtension) && derivedFromSeparateAudioToExtension) {
          throw new Error(`The codec is ${codec} but the audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}. The only supported codecs are: ${supportedAudioCodecs[codec].join(", ")}`);
        }
      }
    }
  }
  if (preferLossless) {
    const selected = getDefaultAudioCodec({ codec, preferLossless });
    if (derivedFromSeparateAudioToExtension && selected !== derivedFromSeparateAudioToExtension) {
      throw new Error(`The audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from the "Prefer lossless" option (${selected}). Remove any conflicting options.`);
    }
    return selected;
  }
  if (setting === null) {
    if (derivedFromSeparateAudioToExtension) {
      return derivedFromSeparateAudioToExtension;
    }
    return getDefaultAudioCodec({ codec, preferLossless });
  }
  if (derivedFromSeparateAudioToExtension !== setting && derivedFromSeparateAudioToExtension) {
    throw new Error(`The audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from your ${audioCodecOption.name} setting (${setting}). Remove any conflicting options.`);
  }
  return setting;
};
var getDefaultAudioCodec = ({
  codec,
  preferLossless
}) => {
  return defaultAudioCodecs[codec][preferLossless ? "lossless" : "compressed"];
};
var _audioCodec = null;
var audioCodecOption = {
  cliFlag: cliFlag2,
  setConfig: (audioCodec) => {
    if (audioCodec === null) {
      _audioCodec = null;
      return;
    }
    if (!validAudioCodecs.includes(audioCodec)) {
      throw new Error(`Audio codec must be one of the following: ${validAudioCodecs.join(", ")}, but got ${audioCodec}`);
    }
    _audioCodec = audioCodec;
  },
  getValue: ({ commandLine }) => {
    if (commandLine[cliFlag2]) {
      const codec = commandLine[cliFlag2];
      if (!validAudioCodecs.includes(commandLine[cliFlag2])) {
        throw new Error(`Audio codec must be one of the following: ${validAudioCodecs.join(", ")}, but got ${codec}`);
      }
      return {
        source: "cli",
        value: commandLine[cliFlag2]
      };
    }
    if (_audioCodec !== null) {
      return {
        source: "config",
        value: _audioCodec
      };
    }
    return {
      source: "default",
      value: null
    };
  },
  description: () => `Set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format. See the table in the docs to see possible combinations.`,
  docLink: "https://www.remotion.dev/docs/encoding/#audio-codec",
  name: "Audio Codec",
  ssrName,
  type: "aac",
  id: cliFlag2
};

// src/validate-output-filename.ts
var validateOutputFilename = ({
  codec,
  audioCodecSetting,
  extension,
  preferLossless,
  separateAudioTo
}) => {
  if (!defaultFileExtensionMap[codec]) {
    throw new TypeError(`The codec "${codec}" is not supported. Supported codecs are: ${Object.keys(defaultFileExtensionMap).join(", ")}`);
  }
  const map = defaultFileExtensionMap[codec];
  const resolvedAudioCodec = resolveAudioCodec({
    codec,
    preferLossless,
    setting: audioCodecSetting,
    separateAudioTo
  });
  if (resolvedAudioCodec === null) {
    if (extension !== map.default) {
      throw new TypeError(`When using the ${codec} codec, the output filename must end in .${map.default}.`);
    }
    return;
  }
  if (!(resolvedAudioCodec in map.forAudioCodec)) {
    throw new Error(`Audio codec ${resolvedAudioCodec} is not supported for codec ${codec}`);
  }
  const acceptableExtensions = map.forAudioCodec[resolvedAudioCodec].possible;
  if (!acceptableExtensions.includes(extension) && !separateAudioTo) {
    throw new TypeError(`When using the ${codec} codec with the ${resolvedAudioCodec} audio codec, the output filename must end in one of the following: ${acceptableExtensions.join(", ")}.`);
  }
};

// src/pure.ts
var NoReactAPIs = {
  getExtensionOfFilename,
  getFileExtensionFromCodec,
  validateOutputFilename,
  getFramesToRender,
  codecSupportsMedia,
  isAudioCodec
};
export {
  NoReactAPIs
};
